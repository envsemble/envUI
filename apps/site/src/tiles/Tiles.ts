import { lazy, type ComponentType } from 'react';
import { loadModule } from '../template/LoadBoundary';

/*
 * The tiles' own previews: for a component or pattern, a small live picture written for its tile
 * in the galleries and in Related, apps/site/src/tiles/<Page>.tsx, named after the page's id in
 * PascalCase (segmented-control is SegmentedControl.tsx), with a default-exported component. It
 * shows the component alone, large and centred, with as little else as it needs to be recognised,
 * and its animation, a timeline (useTimeline in previews/Motion.tsx) that plays on hover from that
 * still. A page without one shows the example its tile picks (Gallery.tsx, Related.tsx).
 */
const loaders = import.meta.glob<{ default: ComponentType }>('./*.tsx');
const tiles = new Map(
  Object.entries(loaders).map(([path, load]) => [path, lazy(loadModule(load))]),
);

/** A page's id in PascalCase, as its tile's file is named: segmented-control, SegmentedControl. */
const pascal = (id: string) =>
  id.replace(/(^|-)([a-z\d])/g, (_, __: string, letter: string) => letter.toUpperCase());

/**
 * The windows of the tiles of components too wide or tall for the tiles' 10 by 7.5 rem, such as a
 * toolbar or a menu open below its button, drawn smaller, by page id.
 */
export const tileWindows: Readonly<Record<string, { width: number; height: number }>> = {
  toast: { width: 16, height: 12 },
  toolbar: { width: 12, height: 9 },
  menu: { width: 14, height: 10.5 },
  menubar: { width: 14, height: 10.5 },
  'command-palette': { width: 20, height: 15 },
};

/** The tile of a page, by its id, where it has one of its own. */
export const tileOf = (page: string): ComponentType | undefined =>
  tiles.get(`./${pascal(page)}.tsx`);
