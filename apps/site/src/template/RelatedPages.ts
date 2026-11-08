/*
 * The pages a page relates to, for its Related tiles and the galleries: which page documents a
 * component, the address of a related page, and and what a tile shows: an example, or a foundation's tile.
 */
import type { ComponentType } from 'react';
import type { DocumentationMetadata, StageFill } from '@docs-model/DocumentationTypes';
import { routeHref } from '../routes/Address';
import { pageHref, groupedPages, routeOfDocument } from '../routes/SiteRoutes';
import { documents, type DocumentSummary } from '../pages/PageModel';
import { hasFoundationTile } from '../tiles/foundations/FoundationTiles';
import {
  memberTileOf,
  memberTileWindow,
  tileOf,
  tileWindows,
  type TileWindow,
} from '../tiles/Tiles';

/**
 * The page that documents a component, for the components a page relates to and the exports a
 * pattern combines: a part such as Menu.Item is documented on the page of its namespace, and an
 * export such as Icon on the foundation's page that names it.
 */
export function pageOf(component: string) {
  const namespace = component.split('.')[0];
  return groupedPages.find((page) =>
    (page.document.metadata?.components ?? page.document.components)?.includes(namespace),
  );
}

/** The address of a related page: a component's or foundation's page, or any other page's route. */
function relatedHref(id: string) {
  const page = groupedPages.find((item) => item.document.id === id);
  if (page) return pageHref(page);
  const route = routeOfDocument(id);
  return route && routeHref(route);
}

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
   * A composition drawn for the tile instead of an example: the page's own tile (tiles/Tiles.ts).
   */
  composition?: ComponentType;
  /** Whether the composition is the page's own tile, drawn in the tiles' window (Tile.css). */
  tile?: boolean;
  /** The window a tile lays out in, in rem, where it needs a larger one than the tiles'. */
  window?: TileWindow;
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
      composition: tile,
      tile: true,
      window: tileWindows[document.id],
    };
  // An export documented on another's page, such as SearchField on TextField's, with a tile of its
  // own (tiles/members/): that tile, as a page's own is shown.
  const memberTile = own && component ? memberTileOf(component) : undefined;
  if (memberTile && component)
    return {
      page: document.id,
      name: component,
      open: true,
      composition: memberTile,
      tile: true,
      window: memberTileWindow(component),
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

/** One component or page a page relates to, with when to pick it instead. */
export interface Alternative {
  key: string;
  name: string;
  href?: string;
  picture?: TilePicture;
  line: string;
  /**
   * How its tile is framed, as a gallery's is (Gallery.tsx): a component at its own size, a
   * pattern's scene at a legible scale.
   */
  frame?: 'own' | 'legible';
}

/** How a page's tile is framed, by its document's id, in a gallery and in Related (`frame`). */
export function frameOf(id?: string): Alternative['frame'] {
  if (groupedPages.some((page) => page.document.id === id && page.section === 'Components'))
    return 'own';
  return documents.some((document) => document.id === id && document.group === 'Patterns')
    ? 'legible'
    : undefined;
}

/**
 * The page's related components and pages, from its `avoidWhen`, one for each export or page it
 * names, in its order.
 */
export function alternativesOf(metadata: DocumentationMetadata): Alternative[] {
  return metadata.avoidWhen.map(({ text, use, see }) => {
    if (use) {
      const page = pageOf(use);
      return {
        key: use,
        name: use,
        href: page && pageHref(page),
        picture: page && tilePictureOf(page.document, use),
        line: text,
        frame: frameOf(page?.document.id),
      };
    }
    const document = documents.find((item) => item.id === see);
    return {
      key: `page:${see}`,
      name: document?.title ?? see ?? '',
      href: see && relatedHref(see),
      picture: document && tilePictureOf(document),
      line: text,
      frame: frameOf(see),
    };
  });
}
