import { headingSlug } from '../../shared/SearchAnchors';
import { pagesOf, type RoutePage } from '../../navigation/SiteRoutes';

/** A foundation as the page of all foundations shows it. */
export interface Foundation {
  id: string;
  title: string;
  summary: string;
  path: string;
  /** The topics its page opens with, under Options and Behaviour, each with its heading's id. */
  topics: { title: string; id: string }[];
}

/** The titled blocks under a page's Options and Behaviour, read from its Markdown. */
function topicsOf(markdown: string) {
  const topics: Foundation['topics'] = [];
  let shown = false;
  for (const line of markdown.split('\n')) {
    const section = /^## (.+)$/.exec(line)?.[1];
    if (section) shown = section === 'Options' || section === 'Behaviour';
    const topic = shown && /^### (.+)$/.exec(line)?.[1];
    if (topic) topics.push({ title: topic, id: headingSlug(topic) });
  }
  return topics;
}

const foundationOf = (page: RoutePage): Foundation => ({
  id: page.document!.id,
  title: page.title,
  summary: page.summary ?? '',
  path: page.path,
  topics: topicsOf(page.document!.markdown),
});

/** Every foundation, in the catalogue's order. */
export const foundations: Foundation[] = pagesOf('catalogue')
  .filter((page) => page.kind === 'foundation' && page.document)
  .map(foundationOf);
