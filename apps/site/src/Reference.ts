import { documents } from './generated/Documentation';

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
