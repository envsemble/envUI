import { lazy, type ComponentType } from 'react';
import { loadModule } from '../template/LoadBoundary';

/*
 * The tiles' own previews: for a component or pattern, a small live picture written for its tile
 * in the galleries and in Related, apps/site/src/tiles/<Page>.tsx, named after the page's id in
 * PascalCase (segmented-control is SegmentedControl.tsx), with a default-exported component. It
 * shows the component alone, large and centred, with as little else as it needs to be recognised,
 * and its animation, a timeline (useTimeline in motion/Motion.tsx) that plays on hover from that
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
 * The windows of the tiles whose component doesn't fit the tiles' 14 by 10.5 rem, by page id: a
 * larger one, drawn smaller, such as a calendar's. Every other tile shares the one window, so
 * components show at one scale across the galleries, about their own size; only the drawings of
 * the layout pages take a smaller one, drawn larger, as a drawing has no size of its own.
 */
export const tileWindows: Readonly<Record<string, { width: number; height: number }>> = {
  // The layout drawings, each drawn about as large as LineArt's, whose lines they share.
  'line-art': { width: 10, height: 7.5 },
  box: { width: 9.4, height: 7.05 },
  row: { width: 7.2, height: 5.4 },
  column: { width: 9.5, height: 7.125 },
  grid: { width: 8.8, height: 6.6 },
  accordion: { width: 15, height: 11.25 },
  'navigation-drawer': { width: 17, height: 12.75 },
  tabs: { width: 15, height: 11.25 },
  breadcrumbs: { width: 15, height: 11.25 },
  // A dialog with a field is taller than a tile's window: it lays out whole in a taller one.
  dialog: { width: 14, height: 13 },
  // A sheet of a title and a filter is as tall as its window: lower than a tile's, it shows whole.
  sheet: { width: 14, height: 7 },
  'confirm-dialog': { width: 15, height: 11.25 },
  'date-picker': { width: 20, height: 15 },
  'time-picker': { width: 24, height: 18 },
  'month-picker': { width: 27, height: 20.25 },
  table: { width: 16, height: 12 },
  list: { width: 16, height: 12 },
  'key-figures': { width: 18, height: 13.5 },
  loading: { width: 17, height: 12.75 },
  'empty-states': { width: 18, height: 13.5 },
  feedback: { width: 18, height: 16 },
  'progressive-disclosure': { width: 16, height: 12 },
  forms: { width: 20, height: 15 },
  settings: { width: 17, height: 12.75 },
  'destructive-actions': { width: 20, height: 17 },
  'file-upload': { width: 19, height: 14.25 },
  filtering: { width: 20, height: 15 },
  conversation: { width: 19, height: 14.25 },
  'data-tables': { width: 19, height: 14.25 },
  'account-and-organizations': { width: 19, height: 14.25 },
  'app-frame': { width: 18, height: 13.5 },
  navigation: { width: 15, height: 11.25 },
};

/**
 * About the widths at which the components' gallery stands two to a row (Gallery.css), whose
 * stages are too narrow for a popup beside its button: there a tile opens it below.
 */
export const narrowGallery = '(width < 29rem)';

/**
 * Starts loading a page's tile, where it has one, well before it nears the view, so it is drawn as
 * it comes in rather than after.
 */
export const preloadTile = (page: string) =>
  void loaders[`./${pascal(page)}.tsx`]?.().catch(() => undefined);

/** The tile of a page, by its id, where it has one of its own. */
export const tileOf = (page: string): ComponentType | undefined =>
  tiles.get(`./${pascal(page)}.tsx`);
