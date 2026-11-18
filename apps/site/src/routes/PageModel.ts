import { componentGroups, type ComponentGroup } from '../documentation/DocumentationTypes';
import { documents } from '../generated/Documentation';

export { componentGroups, documents };
export const componentGroupId = (group: string) =>
  `components-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`;
export type DocumentSummary = (typeof documents)[number];
export type GroupedDocument = Omit<DocumentSummary, 'group'> & {
  group: ComponentGroup | 'Foundations';
};
export const foundations = documents.filter(
  (document): document is GroupedDocument => document.group === 'Foundations',
);
export const componentDocuments = documents.filter((document): document is GroupedDocument =>
  componentGroups.some((group) => group === document.group),
);
