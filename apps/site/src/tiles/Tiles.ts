import type { ComponentType } from 'react';
import { moduleRegistry } from '../loading/ModuleRegistry';

/*
 * The tiles' own pictures. A component or pattern page can have a small live picture written for
 * its tile in the galleries and in Related: apps/site/src/tiles/<Page>.tsx, named after the page's
 * id in PascalCase (segmented-control is SegmentedControl.tsx). The file default-exports the
 * picture's component, and exports `tileWindow` where the tile needs another window than the
 * tiles' (TileWindow). The picture shows the component alone, large and centred, with as little
 * else as it needs to be recognised. Its animation is a timeline (useTimeline in
 * motion/Timeline.ts) that plays from that still on hover. A page without a tile of its own shows
 * the example its tile picks (Gallery.tsx, Related.tsx).
 */

/** What a tile's file exports: its picture, and its window where it isn't the tiles'. */
export interface TileModule {
  default: ComponentType;
  tileWindow?: TileWindow;
}

const tiles = moduleRegistry(import.meta.glob<TileModule>('/src/tiles/*.tsx'));

/** A page's id in PascalCase, as its tile's file is named: segmented-control, SegmentedControl. */
const pascal = (id: string) =>
  id.replace(/(^|-)([a-z\d])/g, (_, __: string, letter: string) => letter.toUpperCase());

const tilePath = (id: string) => `/src/tiles/${pascal(id)}.tsx`;

/**
 * A tile's window, the box it lays out in, where it differs from the tiles' one window, whose size
 * Tile.css sets. Every tile shares that window unless it declares its own, so components show at
 * one scale across the galleries, about their own size. A component too large for it, such as a
 * calendar, declares a larger window, drawn smaller; a drawing declares a smaller one, drawn
 * larger, as a drawing has no size of its own. Sizes are in rem.
 */
export interface TileWindow {
  width?: number;
  height?: number;
  /**
   * The least scale its popup is drawn at to show whole, in place of `--catalogue-own-popup-least`
   * (Gallery.css): for a modal whose least whole size is taller than a tile's stage at that scale.
   */
  popupLeast?: number;
  /**
   * Whether it is an overlay, such as a notification, a popover, a sheet or a dialog. An overlay
   * lays out at its window's width at every stage's width, so it is drawn as it is in an
   * application. It is drawn at the overlays' one scale, `--catalogue-overlay-scale` (Gallery.css),
   * or smaller only where it doesn't show whole at that scale, so the overlays read as one row.
   */
  overlay?: boolean;
  /**
   * Whether it is a piece of an application's frame, such as a Scaffold or a top bar. It fills its
   * card's picture as the application fills its window (TileStage.tsx), rather than floating small
   * in it. It lays out as wide as the picture at its own size, or no narrower than `least` rem,
   * such as panes that stand side by side only in a medium window, cut off at the card's end.
   */
  app?: { least?: number };
}

/**
 * About the widths at which the components' gallery stands two to a row (Gallery.css), whose
 * stages are too narrow for a popup beside its button: there a tile opens it below.
 */
export const narrowGallery = '(width < 29rem)';

/**
 * Starts loading a page's tile, where it has one, well before it nears the view, so it is drawn as
 * it comes in rather than after.
 */
export const preloadTile = (page: string) => tiles.preload(tilePath(page));

/** A page's own tile, by the page's id, where it has one: what loads its file, once. */
export const tileOf = (page: string) =>
  tiles.has(tilePath(page)) ? () => tiles.load(tilePath(page)) : undefined;

/*
 * The tiles of the exports documented on another's page, for the Related cards that name them,
 * apps/site/src/tiles/members/<Export>.tsx, such as SearchField.tsx on the TextField page's: a
 * small live picture of the export alone, written as a page's own tile is, where the page's
 * examples show it in a larger scene than a card holds whole, or hold still where it acts.
 */
const memberTiles = moduleRegistry(import.meta.glob<TileModule>('/src/tiles/members/*.tsx'));

/** The exports a page's own tile already shows alone, by the id of that page. */
const shownByPageTile: Readonly<Record<string, string>> = {
  RichTextEditor: 'rich-text',
  CodeBlock: 'code',
};

/** The tile of an export documented on another's page, where it has one: what loads its file. */
export const memberTileOf = (component: string) => {
  const page = shownByPageTile[component];
  if (page) return tileOf(page);
  const path = `/src/tiles/members/${component}.tsx`;
  return memberTiles.has(path) ? () => memberTiles.load(path) : undefined;
};
