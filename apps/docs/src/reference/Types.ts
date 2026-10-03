export const componentGroups = [
  'Layout & surfaces',
  'Actions',
  'Forms & selection',
  'Navigation',
  'Content & guidance',
  'Feedback & overlays',
] as const;

export type ComponentGroup = (typeof componentGroups)[number];

export type Reference = {
  id: string;
  title: string;
  group: ComponentGroup | 'Foundations';
  /** Include only when it adds a useful choice or behavior beyond the title. */
  summary?: string;
  example: string;
  props: [string, string][];
  guidelines: string[];
  related?: string[];
  /** Small contracts stay on one page; guides use prose and complete examples. */
  presentation?: 'compact' | 'guide';
  usage?: {
    title: string;
    example: string;
    props: [string, string][];
  }[];
  sections?: {
    title: string;
    paragraphs: string[];
    example?: string;
  }[];
};
