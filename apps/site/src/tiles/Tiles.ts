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

/** A tile's window, in rem, and the least scale its open popup is drawn at, where not a popup's. */
export interface TileWindow {
  width: number;
  height: number;
  /**
   * The least its popup is drawn at to show whole, in place of `--catalogue-own-popup-least`
   * (Gallery.css): for a modal whose least whole size is taller than a tile's stage at that scale.
   */
  popupLeast?: number;
}

/**
 * The windows of the tiles whose component doesn't fit the tiles' 14 by 10.5 rem, by page id: a
 * larger one, drawn smaller, such as a calendar's. Every other tile shares the one window, so
 * components show at one scale across the galleries, about their own size; only the drawings of
 * the layout pages take a smaller one, drawn larger, as a drawing has no size of its own.
 */
export const tileWindows: Readonly<Record<string, TileWindow>> = {
  // The layout drawings, each drawn about as large as LineArt's, whose lines they share.
  'line-art': { width: 10, height: 7.5 },
  box: { width: 8.4, height: 6.3 },
  row: { width: 7.2, height: 5.4 },
  column: { width: 8.5, height: 6.375 },
  grid: { width: 7.9, height: 5.925 },
  accordion: { width: 15, height: 11.25 },
  'navigation-drawer': { width: 17, height: 12.75 },
  tabs: { width: 15, height: 11.25 },
  breadcrumbs: { width: 15, height: 11.25 },
  // A dialog with a field is taller than a tile's window: it lays out whole in a taller one, and
  // its title, field and actions show whole drawn smaller than a popup's least.
  dialog: { width: 14, height: 13, popupLeast: 0.56 },
  // A sheet of a title and a filter is as tall as its window: lower than a tile's, it shows whole.
  sheet: { width: 14, height: 7 },
  // A confirm dialog with its button beside it is wider than a tile's stage at a popup's least.
  'confirm-dialog': { width: 15, height: 11.25, popupLeast: 0.56 },
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
  loaders[`./${pascal(page)}.tsx`]?.().catch(() => undefined);

/** The tile of a page, by its id, where it has one of its own. */
export const tileOf = (page: string): ComponentType | undefined =>
  tiles.get(`./${pascal(page)}.tsx`);

/*
 * The tiles of the exports documented on another's page, for the Related cards that name them,
 * apps/site/src/tiles/members/<Export>.tsx, such as SearchField.tsx on the TextField page's: a
 * small live picture of the export alone, written as a page's own tile is, where the page's
 * examples show it in a larger scene than a card holds whole, or hold still where it acts.
 */
const memberLoaders = import.meta.glob<{ default: ComponentType }>('./members/*.tsx');
const memberTiles = new Map(
  Object.entries(memberLoaders).map(([path, load]) => [path, lazy(loadModule(load))]),
);

/** The exports a page's own tile already shows alone, by the id of that page. */
const shownByPageTile: Readonly<Record<string, string>> = {
  RichTextEditor: 'rich-text',
  CodeBlock: 'code',
};

/** The windows of the member tiles that need a larger one than the tiles', by export. */
export const memberTileWindows: Readonly<Record<string, { width: number; height: number }>> = {
  MarkdownEditor: { width: 16, height: 12 },
  PageHeader: { width: 16, height: 12 },
};

/** The tile of an export documented on another's page, where it has one. */
export const memberTileOf = (component: string): ComponentType | undefined => {
  const page = shownByPageTile[component];
  return page ? tileOf(page) : memberTiles.get(`./members/${component}.tsx`);
};

/** The window of an export's tile, where it needs another than the tiles'. */
export const memberTileWindow = (component: string) =>
  shownByPageTile[component]
    ? tileWindows[shownByPageTile[component]]
    : memberTileWindows[component];
