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
 * The windows of the tiles of wide components, in rem, larger than the tiles' 10 by 7.5 and drawn
 * smaller, by page id.
 */
export const tileWindows: Readonly<Record<string, { width: number; height: number }>> = {
  toast: { width: 16, height: 12 },
};

/** The tile of a page, by its id, where it has one of its own. */
export const tileOf = (page: string): ComponentType | undefined =>
  tiles.get(`./${pascal(page)}.tsx`);
