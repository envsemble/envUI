import type { DocumentationMetadata } from '../documentation/DocumentationTypes';
import { routeHref } from '../routes/Address';
import { pageHref, groupedPages, routeOfDocument } from '../routes/SiteRoutes';
import { documents } from '../routes/PageModel';
import { ownsFrame, tilePictureOf, type TilePicture } from '../tiles/TilePictures';

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
  ownFrame: boolean;
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
        ownFrame: ownsFrame(page?.document.id),
      };
    }
    const document = documents.find((item) => item.id === see);
    return {
      key: `page:${see}`,
      name: document?.title ?? see ?? '',
      href: see && relatedHref(see),
      picture: document && tilePictureOf(document),
      line: text,
      ownFrame: ownsFrame(see),
    };
  });
}
