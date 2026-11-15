export interface PropEntry {
  name: string;
  type: string;
  required: boolean;
  requiredWhen?: string;
  default?: string;
  defaultBuiltIn?: boolean;
  description: string;
  deprecated?: string | boolean;
  source?: 'base-ui';
}

interface ExportBase {
  source: string;
  description: string;
  entries: string[];
}

export type ExportEntry =
  | (ExportBase & {
      kind: 'component';
      props: PropEntry[];
      native: string[];
    })
  | (ExportBase & { kind: 'namespace'; parts: string[] })
  | (ExportBase & { kind: 'function'; signature: string });

type Rem = number;

export type StageFill = 'shaded';
export type DeviceKind = 'phone' | 'window';

export type DocumentationBlock =
  | { kind: 'markdown'; markdown: string }
  | {
      kind: 'example';
      name: string;
      heading: string;
      role?: 'do' | 'dont' | 'caution' | 'anatomy' | 'variants';
      caption?: string;
      widths?: Rem[];
      sweep?: boolean;
      classes?: boolean;
      fit?: boolean;
      width?: Rem;
      of?: string;
      open?: boolean;
      enlarge?: boolean;
      wide?: boolean;
      motion?: boolean;
      specimen?: boolean;
      stage?: StageFill;
      device?: DeviceKind;
      legend?: AnatomyLegendItem[];
    }
  | {
      kind: 'figure';
      name: string;
      heading: string;
      role?: string;
      caption?: string;
      legend?: { name: string; text: string }[];
      code?: boolean;
    }
  | { kind: 'specimen'; name: string }
  | { kind: 'source'; name: string };

export type ExampleBlock = Extract<DocumentationBlock, { kind: 'example' }>;
export type FoundationFigureBlock = Extract<DocumentationBlock, { kind: 'figure' }>;
export type PlacedBlock = ExampleBlock | FoundationFigureBlock;

export interface AnatomyLegendItem {
  part: string;
  text: string;
  name?: string;
  label?: string;
}

type TemplateSectionId =
  | 'overview'
  | 'usage'
  | 'width'
  | 'anatomy'
  | 'variants'
  | 'states'
  | 'content'
  | 'do-and-dont'
  | 'accessibility'
  | 'code'
  | 'examples'
  | 'rules'
  | 'behaviour'
  | 'words'
  | 'changelog';

export interface DocumentationSection {
  id: TemplateSectionId;
  title: string;
  blocks: DocumentationBlock[];
  anchors?: string[];
}

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

export const pageStatuses = ['alpha', 'beta', 'stable', 'deprecated'] as const;
export type PageStatus = (typeof pageStatuses)[number];

export interface DocumentationMetadata {
  status?: PageStatus;
  statuses?: Record<string, PageStatus>;
  since?: string;
  aliases: string[];
  useWhen: string[];
  avoidWhen: { text: string; use?: string; see?: string }[];
  components: string[];
}

type ExampleOutline = Pick<ExampleBlock, 'name' | 'heading' | 'role' | 'widths' | 'open' | 'stage'>;

interface SectionOutline {
  id: TemplateSectionId;
  anchors: string[];
  examples: ExampleOutline[];
}

export interface DocumentationSummary {
  id: string;
  title: string;
  group: string;
  path: string;
  summary: string;
  related: string[];
  metadata?: Omit<DocumentationMetadata, 'aliases' | 'useWhen' | 'avoidWhen'>;
  components?: string[];
  status?: PageStatus;
  outline?: SectionOutline[];
  members?: PageMember[];
}

interface PageMember {
  name: string;
  catalogue?: string;
  docs: string;
}

export interface DocumentationEntry extends Omit<DocumentationSummary, 'outline' | 'metadata'> {
  partSizes?: Record<string, [widthRem: number, heightRem: number]>;
  exampleLines?: Record<string, number>;
  metadata?: DocumentationMetadata;
  markdown?: string;
  sections?: DocumentationSection[];
  props?: Record<string, ExportEntry>;
  strings?: DocumentationString[];
}

interface DocumentationString {
  namespace: string;
  key: string;
  value: string;
  description: string;
}
