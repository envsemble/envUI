import { useState, type ComponentProps, type PointerEvent } from 'react';
import { NavigationDrawer } from '@envsemble/envui';
import { drawerWidthKey } from '../theme/DisplayStorage';
import type { Area } from './SiteRoutes';

/**
 * Each part's drawer at the start of a wide window: the width it starts at and its bounds, in rem.
 * The Docs' drawer holds the wordmark and search on its first row, so it starts wider.
 */
const drawerWidths: Record<Area, { defaultWidth: number; minWidth: number; maxWidth: number }> = {
  catalogue: { defaultWidth: 16, minWidth: 13, maxWidth: 24 },
  docs: { defaultWidth: 21, minWidth: 18, maxWidth: 30 },
};

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
 * the next visit; read before the first render, so nothing moves as the page loads. The drawer in
 * the sheet of a narrower window takes the sheet's width and isn't resizable.
 */
function useDrawerWidth(
  area: Area,
  inSheet: boolean,
): Partial<ComponentProps<typeof NavigationDrawer>> {
  const [width, setWidth] = useState(() => storedDrawerWidth(area));
  if (inSheet) return {};
  return {
    resizable: true,
    ...drawerWidths[area],
    width,
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
