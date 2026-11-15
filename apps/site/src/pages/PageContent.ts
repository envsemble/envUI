import { use } from 'react';
import type { DocumentationEntry } from '../documentation/DocumentationTypes';
import { moduleRegistry } from '../loading/ModuleRegistry';
import { keepPageParts } from '../loading/RecordedSizes';

const kept = (content: DocumentationEntry) => {
  keepPageParts(content);
  return content;
};

const contentFiles = import.meta.glob<DocumentationEntry>('/src/generated/pages/*.json', {
  import: 'default',
});

const contents = moduleRegistry(
  Object.fromEntries(
    Object.entries(contentFiles).map(([path, load]) => [path, () => load().then(kept)]),
  ),
  {
    query: 'import&lang.json',
    pick: (module) => kept((module as { default: DocumentationEntry }).default),
  },
);

const contentPath = (id: string) => `/src/generated/pages/${id}.json`;

export function loadDocument(id: string) {
  if (!contents.has(contentPath(id))) throw new Error(`No content for the page ${id}`);
  return contents.load(contentPath(id));
}

export const retryDocument = (id: string) => contents.retry(contentPath(id));

export const useDocument = (summary: { id: string }) => use(loadDocument(summary.id));
