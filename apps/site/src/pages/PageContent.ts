import { use } from 'react';
import type { DocumentationEntry } from '../shared/DocumentationTypes';
import { loadOnce } from '../template/LoadOnce';

/** Each page's content, in a file of its own that loads with the page. */
const contents = import.meta.glob<DocumentationEntry>('../generated/pages/*.json', {
  import: 'default',
});
const loads = new Map<string, Promise<DocumentationEntry>>();

/**
 * A page's content, loaded once and kept (loadOnce): as the site starts, for the page it opens on,
 * and as a link to a page is about to be followed (preloadPage).
 */
export function loadDocument(id: string) {
  const loader = contents[`../generated/pages/${id}.json`];
  if (!loader) throw new Error(`No content for the page ${id}`);
  return loadOnce(loads, id, loader);
}

/** A page's content, suspending the page until it has loaded. */
export const useDocument = (summary: { id: string }) => use(loadDocument(summary.id));
