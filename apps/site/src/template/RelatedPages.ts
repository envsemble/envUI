import type { DocumentationMetadata } from '../documentation/DocumentationTypes';
import { routeHref } from '../routes/Address';
import { pageHref, groupedPages, routeOfDocument } from '../routes/SiteRoutes';
import { documents } from '../routes/PageModel';
import { frameOf, tilePictureOf, type TileFrame, type TilePicture } from '../tiles/TilePictures';

function pageOf(component: string) {
  const namespace = component.split('.')[0];
  return groupedPages.find((page) =>
    (page.document.metadata?.components ?? page.document.components)?.includes(namespace),
  );
}

function relatedHref(id: string) {
  const page = groupedPages.find((item) => item.document.id === id);
  if (page) return pageHref(page);
  const route = routeOfDocument(id);
  return route && routeHref(route);
}

export interface Alternative {
  key: string;
  name: string;
  href?: string;
  picture?: TilePicture;
  line: string;
  frame?: TileFrame;
}

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
