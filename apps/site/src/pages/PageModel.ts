import { use } from 'react';
import { documents } from '../generated/Documentation';
import type { DocumentationEntry } from '../shared/DocumentationTypes';
import { loadOnce } from '../template/LoadOnce';

export { documents };
export const componentGroups = [
  'Actions',
  'Forms & selection',
  'Navigation',
  'Data display',
  'Text & content',
  'Feedback',
  'Overlays',
  'App frame & layout',
] as const;
export type ComponentGroup = (typeof componentGroups)[number];
/** The id of a component group's heading on the overview, such as components-app-frame-layout. */
export const componentGroupId = (group: string) =>
  `components-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`;
/** A page of docs/ as the whole site knows it, before its content loads. */
export type DocumentSummary = (typeof documents)[number];
/** A page of docs/ with its content, which loads with the page (useDocument). */
export type Documentation = DocumentationEntry;
/** A component's or foundation's page of docs/: its group is a component group or Foundations. */
export type GroupedDocument = Omit<DocumentSummary, 'group'> & {
  group: ComponentGroup | 'Foundations';
};
export const foundations = documents.filter(
  (document): document is GroupedDocument => document.group === 'Foundations',
);
export const componentDocuments = documents.filter((document): document is GroupedDocument =>
  componentGroups.some((group) => group === document.group),
);

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
