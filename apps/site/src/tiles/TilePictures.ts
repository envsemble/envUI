/*
 * What a page's tile shows, in a gallery and in Related: its own tile, an export's (members/), an
 * example, or a foundation's tile; and how it is framed.
 */
import type { StageFill } from '@docs-model/DocumentationTypes';
import { groupedPages } from '../routes/SiteRoutes';
import { documents, type DocumentSummary } from '../routes/PageModel';
import { hasFoundationTile } from './foundations/FoundationTiles';
import { memberTileOf, tileOf, type TileModule } from './Tiles';

/** What a tile shows of a page: its example's file, and whether its overlays are shown open. */
export interface TilePicture {
  page: string;
  name: string;
  open: boolean;
  /** The fill its figure's stage takes, where the page's would hide it. */
  stage?: StageFill;
  /** A foundation's page, without an example: its id, for its tile (tiles/foundations/FoundationTiles.tsx). */
  foundation?: string;
  /**
   * A tile drawn instead of an example, a page's own or an export's (tiles/Tiles.ts): what loads
   * its file, which holds its picture and the window it lays out in.
   */
  tile?: () => Promise<TileModule>;
}

/** Letters alone, lower case, to match an export's name with a figure's heading or file. */
const squash = (text: string) => text.toLowerCase().replace(/[^a-z\d]/g, '');

/**
 * The example that shows an export documented on another's page, where no example is named after
 * it and no tile of its own (tiles/members/): the first that renders it, so its tile shows the
 * export itself, not the page's lead.
 */
const memberExamples: Record<string, string> = {
  IconButton: 'Icons',
  CopyButton: 'CopyValue',
};

/**
 * What a tile shows of a page: its own tile, where it has one (tiles/Tiles.ts); else where its
 * component floats over the page, such as a dialog or a menu, its anatomy figure, which shows it
 * open; else the Overview's first example, its lead example. For an export that isn't the page's
 * first, such as SearchField on the TextField page, its own tile (tiles/members/), else the example
 * that renders it (memberExamples), else the first named after it, where there is one. A page
 * without one, such as a foundation's, shows its foundation tile.
 */
export function tilePictureOf(
  document: DocumentSummary,
  component?: string,
): TilePicture | undefined {
  const own = component && document.metadata?.components[0] !== component.split('.')[0];
  const tile = !own && tileOf(document.id);
  const blocks = (document.outline ?? []).flatMap((section) => section.examples);
  const lead = document.outline
    ?.find((section) => section.id === 'overview')
    ?.examples.find((block) => !block.role);
  // A tile's popups, such as a menu it opens as it plays, open inside its canvas. Every tile sits
  // on the one stage fill, a whole window too, which sets itself apart by its own surfaces, so no
  // card reads as one under the pointer.
  if (tile)
    return {
      page: document.id,
      name: document.id,
      open: true,
      tile,
    };
  // An export documented on another's page, such as SearchField on TextField's, with a tile of its
  // own (tiles/members/): that tile, as a page's own is shown.
  const memberTile = own && component ? memberTileOf(component) : undefined;
  if (memberTile && component)
    return {
      page: document.id,
      name: component,
      open: true,
      tile: memberTile,
    };
  const anatomy = blocks.find((block) => block.role === 'anatomy');
  const member = own && component ? memberExamples[component] : undefined;
  const named =
    own &&
    (blocks.find((block) => !block.role && block.name === member) ??
      blocks.find(
        (block) =>
          !block.role &&
          !block.widths &&
          [block.name, block.heading].some((text) => squash(text).includes(squash(component))),
      ));
  const chosen = named || (!own && anatomy?.open ? anatomy : lead);
  if (!chosen)
    return hasFoundationTile(document.id)
      ? { page: document.id, name: document.id, open: false, foundation: document.id }
      : undefined;
  return {
    page: document.id,
    name: chosen.name,
    open: Boolean(chosen.open),
    stage: chosen.stage,
  };
}

/**
 * How a tile is framed, as a gallery's is (Gallery.tsx): a component at its own size, a pattern's
 * scene at a legible scale.
 */
export type TileFrame = 'own' | 'legible';

/** How a page's tile is framed, by its document's id, in a gallery and in Related. */
export function frameOf(id?: string): TileFrame | undefined {
  if (groupedPages.some((page) => page.document.id === id && page.section === 'Components'))
    return 'own';
  return documents.some((document) => document.id === id && document.group === 'Patterns')
    ? 'legible'
    : undefined;
}
