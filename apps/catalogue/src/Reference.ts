import { documents } from './generated/Documentation';

export { documents };
export const componentGroups = [
  'Layout & surfaces',
  'Actions',
  'Forms & selection',
  'Navigation',
  'Content & guidance',
  'Feedback & overlays',
] as const;
export type ComponentGroup = (typeof componentGroups)[number];
/** The id of a component group's heading on the overview, such as components-layout-surfaces. */
export const componentGroupId = (group: string) =>
  `components-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`;
export type Documentation = (typeof documents)[number];
export type Reference = Omit<Documentation, 'group'> & {
  group: ComponentGroup | 'Foundations';
};
export const foundations = documents.filter(
  (document): document is Reference => document.group === 'Foundations',
);
export const references = documents.filter((document): document is Reference =>
  componentGroups.some((group) => group === document.group),
);
