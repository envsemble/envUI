import { useLayoutEffect, useState, type ComponentProps, type PointerEvent } from 'react';
import { NavigationDrawer } from '@envsemble/envui';
import { useHydrated } from '@envui-internal/internal/react/useHydrated';
import { drawerWidthKey, drawerWidths, storedDrawerWidthProperty } from '../display/DisplayStorage';
import type { Area } from '../routes/SiteRoutes';

/** The width the reader gave the area's drawer on an earlier visit, within its bounds. */
function storedDrawerWidth(area: Area) {
  const { defaultWidth, minWidth, maxWidth } = drawerWidths[area];
  let stored: number | undefined;
  try {
    stored = Number.parseFloat(localStorage.getItem(drawerWidthKey(area)) ?? '');
  } catch {
    // Storage the browser refuses, as in some private windows, keeps the default.
  }
  return stored !== undefined && Number.isFinite(stored)
    ? Math.min(maxWidth, Math.max(minWidth, stored))
    : defaultWidth;
}

/**
 * The resizable drawer of a wide window, whose width the reader drags and the catalogue keeps for
 * the next visit; read before the first render, so nothing moves as the page loads. A pre-rendered
 * page renders the default width on the server and as it hydrates, while the drawer takes the
 * stored width the head's script set on the root (Shell.css); once hydrated, the drawer has it
 * itself and the root's goes. The drawer in the sheet of a narrower window takes the sheet's width
 * and isn't resizable.
 */
function useDrawerWidth(
  area: Area,
  inSheet: boolean,
): Partial<ComponentProps<typeof NavigationDrawer>> {
  const [width, setWidth] = useState(() => storedDrawerWidth(area));
  const hydrated = useHydrated();
  useLayoutEffect(() => {
    if (hydrated) document.documentElement.style.removeProperty(storedDrawerWidthProperty(area));
  }, [hydrated, area]);
  if (inSheet) return {};
  return {
    resizable: true,
    ...drawerWidths[area],
    width: hydrated ? width : drawerWidths[area].defaultWidth,
    onWidthChange: (next, { committed }) => {
      setWidth(next);
      if (!committed) return;
      try {
        localStorage.setItem(drawerWidthKey(area), String(next));
      } catch {
        // The width holds for this visit only.
      }
    },
  };
}

/**
 * A part's NavigationDrawer, with the width the reader drags (useDrawerWidth) kept here, so a drag
 * renders the drawer alone on each move, not the navigation around it, whose destinations stay the
 * same array and leave the drawer's rows as they are.
 */
export function SiteDrawer({
  area,
  inSheet,
  ...props
}: { area: Area; inSheet: boolean } & ComponentProps<typeof NavigationDrawer>) {
  const drawerWidth = useDrawerWidth(area, inSheet);
  // The sheet's drawer isn't resizable, so its labels would wrap, breaking a long name such as
  // ThemeMenuRadioGroup mid-word: they keep to one line there too (Shell.css), and one cut short
  // with an ellipsis gives its full name as its title as the pointer reaches it.
  return (
    <NavigationDrawer
      {...props}
      {...drawerWidth}
      onPointerOver={inSheet ? titleCutLabel : undefined}
    />
  );
}

/** Gives a drawer label cut short with an ellipsis its full name as its title. */
function titleCutLabel(event: PointerEvent<HTMLElement>) {
  if (!(event.target instanceof Element)) return;
  const label = event.target.closest<HTMLElement>('.env-navigation-drawer-label');
  if (!label) return;
  if (label.scrollWidth > label.clientWidth) label.title = label.textContent ?? '';
  else label.removeAttribute('title');
}
