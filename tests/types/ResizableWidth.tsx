import { NavigationDrawer, Sheet } from '@envsemble/envui';

declare const kept: number;
declare const keep: (width: number) => void;

export const drawer = (
  <NavigationDrawer
    destinations={[]}
    resizable
    width={kept}
    minWidth={12}
    maxWidth={32}
    onWidthChange={(width, { committed }) => {
      if (committed) keep(width);
    }}
  />
);
export const uncontrolled = <NavigationDrawer destinations={[]} resizable defaultWidth={18} />;
// @ts-expect-error
export const drawerWidthIsRem = <NavigationDrawer destinations={[]} resizable width="18rem" />;
export const reportedWidthIsANumber = (
  <NavigationDrawer
    destinations={[]}
    resizable
    // @ts-expect-error
    onWidthChange={(width: string) => width}
  />
);

export const sheet = (
  <Sheet
    title="Details"
    side="start"
    resizable
    width={kept}
    onWidthChange={(width) => keep(width)}
  />
);
export const namedWidthWithResizableDefault = (
  <Sheet title="Details" width="lg" resizable defaultWidth={40} />
);
export const css = <Sheet title="Details" width="min(20rem, 100%)" />;
// @ts-expect-error
export const defaultWidthIsRem = <Sheet title="Details" resizable defaultWidth="24rem" />;
