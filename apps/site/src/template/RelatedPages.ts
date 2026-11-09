/*
 * The pages a page relates to, for its Related section: which page documents a component, the
 * address of a related page, and its tile (tiles/TilePictures.ts).
 */
import type { DocumentationMetadata } from '@docs-model/DocumentationTypes';
import { routeHref } from '../routes/Address';
import { pageHref, groupedPages, routeOfDocument } from '../routes/SiteRoutes';
import { documents } from '../routes/PageModel';
import { frameOf, tilePictureOf, type TileFrame, type TilePicture } from '../tiles/TilePictures';

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

/** One component or page a page relates to, with when to pick it instead. */
export interface Alternative {
  key: string;
  name: string;
  href?: string;
  picture?: TilePicture;
  line: string;
  /** How its tile is framed, as a gallery's is. */
  frame?: TileFrame;
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
