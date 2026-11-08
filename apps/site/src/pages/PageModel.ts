import { documents } from '../generated/Documentation';
import type { DocumentationEntry } from '../../../../scripts/docs/model/DocumentationTypes';

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
/** A page of docs/ with its content, which loads with the page (PageContent.ts). */
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
