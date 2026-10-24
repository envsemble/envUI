// Type tests: a resizable Drawer and side Sheet take their width in rem, a number, and report each
// new width with whether it is committed. Each expected error below must occur; the other lines
// must type-check.
import { Drawer, Sheet } from '@envsemble/envui';

declare const kept: number;
declare const keep: (width: number) => void;

export const drawer = (
  <Drawer
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
export const uncontrolled = <Drawer destinations={[]} resizable defaultWidth={18} />;
// @ts-expect-error A Drawer's width is a number of rem, not a CSS length.
export const length = <Drawer destinations={[]} resizable width="18rem" />;
// @ts-expect-error The width it reports is a number.
export const text = <Drawer destinations={[]} resizable onWidthChange={(width: string) => width} />;

export const sheet = (
  <Sheet
    title="Details"
    side="start"
    resizable
    width={kept}
    onWidthChange={(width) => keep(width)}
  />
);
// A named or CSS width still applies, and a resizable sheet starts from defaultWidth.
export const named = <Sheet title="Details" width="lg" resizable defaultWidth={40} />;
export const css = <Sheet title="Details" width="min(20rem, 100%)" />;
// @ts-expect-error defaultWidth is a number of rem.
export const defaultLength = <Sheet title="Details" resizable defaultWidth="24rem" />;
