import { useLayoutEffect, useState, type ComponentProps, type PointerEvent } from 'react';
import { NavigationDrawer } from '@envsemble/envui';
import { useHydrated } from '../shared/useHydrated';
import { drawerWidthKey, drawerWidths, storedDrawerWidthProperty } from '../display/DisplayStorage';
import type { Area } from '../routes/SiteRoutes';

function readStoredWidth(area: Area) {
  try {
    return Number.parseFloat(localStorage.getItem(drawerWidthKey(area)) ?? '');
  } catch {
    return Number.NaN;
  }
}

function storedDrawerWidth(area: Area) {
  const { defaultWidth, minWidth, maxWidth } = drawerWidths[area];
  const stored = readStoredWidth(area);
  return Number.isFinite(stored) ? Math.min(maxWidth, Math.max(minWidth, stored)) : defaultWidth;
}

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
        return;
      }
    },
  };
}

export function SiteDrawer({
  area,
  inSheet,
  ...props
}: { area: Area; inSheet: boolean } & ComponentProps<typeof NavigationDrawer>) {
  const drawerWidth = useDrawerWidth(area, inSheet);
  return (
    <NavigationDrawer
      {...props}
      {...drawerWidth}
      onPointerOver={inSheet ? titleCutLabel : undefined}
    />
  );
}

function titleCutLabel(event: PointerEvent<HTMLElement>) {
  if (!(event.target instanceof Element)) return;
  const label = event.target.closest<HTMLElement>('.env-navigation-drawer-label');
  if (!label) return;
  if (label.scrollWidth > label.clientWidth) label.title = label.textContent ?? '';
  else label.removeAttribute('title');
}
