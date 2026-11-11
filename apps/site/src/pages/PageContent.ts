import { use } from 'react';
import type { DocumentationEntry } from '../documentation/DocumentationTypes';
import { moduleRegistry } from '../loading/ModuleRegistry';
import { keepPageParts } from '../loading/RecordedSizes';

/** Records the sizes a page's content brings (keepPageParts) and returns the content. */
const kept = (content: DocumentationEntry) => {
  keepPageParts(content);
  return content;
};

const contentFiles = import.meta.glob<DocumentationEntry>('/src/generated/pages/*.json', {
  import: 'default',
});

/**
 * Each page's content, in a file of its own that loads with the page (moduleRegistry). In
 * development, a file asked for again after a failure is asked for as a module: Vite serves JSON
 * as a module only under `import` with a query that ends in `.json`. Its default export is the
 * content.
 */
const contents = moduleRegistry(
  Object.fromEntries(
    Object.entries(contentFiles).map(([path, load]) => [path, () => load().then(kept)]),
  ),
  {
    query: 'import&lang.json',
    // A JSON module's default export is its parsed content.
    pick: (module) => kept((module as { default: DocumentationEntry }).default),
  },
);

const contentPath = (id: string) => `/src/generated/pages/${id}.json`;

/**
 * A page's content, loaded once and kept (loadOnce): as the site starts, for the page it opens on,
 * and as a link to a page is about to be followed (preloadPage).
 */
export function loadDocument(id: string) {
  if (!contents.has(contentPath(id))) throw new Error(`No content for the page ${id}`);
  return contents.load(contentPath(id));
}

/** Drops a page's content that failed to load, so the page's next render loads it again. */
export const retryDocument = (id: string) => contents.retry(contentPath(id));

/** A page's content, suspending the page until it has loaded. */
export const useDocument = (summary: { id: string }) => use(loadDocument(summary.id));
