/*
 * The pages a page relates to, for its Related tiles and the galleries: which page documents a
 * component, the address of a related page, and the example or specimen a tile shows.
 */
import type { ComponentType } from 'react';
import type { DocumentationMetadata, StageFill } from '../shared/DocumentationTypes';
import { routeHref } from '../navigation/Address';
import { pageHref, groupedPages, routeOfDocument } from '../navigation/SiteRoutes';
import { documents, type DocumentSummary } from '../pages/PageModel';
import { hasPageSpecimen } from '../figures/PageSpecimens';
import { tileOf, tileWindows, type TileWindow } from '../tiles/Tiles';

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

/** The example a tile previews: a page's file, and whether its overlays are shown open. */
export interface Preview {
  page: string;
  name: string;
  open: boolean;
  /** The fill its figure's stage takes, where the page's would hide it. */
  stage?: StageFill;
  /** A page without an example, such as a foundation's: the id of its specimen (PageSpecimens.tsx). */
  specimen?: string;
  /**
   * A composition drawn for the tile instead of an example: the page's own tile (tiles/Tiles.ts).
   */
  composition?: ComponentType;
  /** Whether the composition is the page's own tile, drawn in the tiles' window (Related.css). */
  tile?: boolean;
  /** The window a tile lays out in, in rem, where it needs a larger one than the tiles'. */
  window?: TileWindow;
}

/** Letters alone, lower case, to match an export's name with a figure's heading or file. */
const squash = (text: string) => text.toLowerCase().replace(/[^a-z\d]/g, '');

/**
 * The example that shows an export documented on another's page, where no example is named after
 * it: the first that renders it, so its tile shows the export itself, not the page's lead.
 */
const memberExamples: Record<string, string> = {
  SearchField: 'SearchInSidebar',
  Textarea: 'TextareaSizing',
  IconButton: 'Icons',
  ConfirmButton: 'ConfirmInPlace',
  CopyButton: 'CopyValue',
  ButtonGroup: 'ConnectedButtons',
  DiffStat: 'ChangeSize',
  MarkdownEditor: 'EditDescription',
};

/**
 * What a tile shows of a page: its own tile, where it has one (tiles/Tiles.ts); else where its
 * component floats over the page, such as a dialog or a menu, its anatomy figure, which shows it
 * open; else the Overview's first example, its lead example. For an export that isn't the page's
 * first, such as SearchField on the TextField page, the example that renders it (memberExamples),
 * else the first named after it, where there is one. A page without one, such as a foundation's,
 * shows its specimen.
 */
export function previewOf(document: DocumentSummary, component?: string): Preview | undefined {
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
    return hasPageSpecimen(document.id)
      ? { page: document.id, name: document.id, open: false, specimen: document.id }
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
  preview?: Preview;
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
        preview: page && previewOf(page.document, use),
        line: text,
        frame: frameOf(page?.document.id),
      };
    }
    const document = documents.find((item) => item.id === see);
    return {
      key: `page:${see}`,
      name: document?.title ?? see ?? '',
      href: see && relatedHref(see),
      preview: document && previewOf(document),
      line: text,
      frame: frameOf(see),
    };
  });
}
