/**
 * The shape of the generated documentation data (generated/Documentation.ts), written by
 * scripts/GenerateDocumentation.mjs from docs/ and docs/generated/props.json.
 */

/** One prop of a component, as scripts/ExtractProps.mjs reads it from the TypeScript source. */
export interface PropEntry {
  name: string;
  type: string;
  required: boolean;
  /** For a prop required in only some forms of a union, what selects those forms. */
  requiredWhen?: string;
  default?: string;
  /** The prop has a default that can't be shown as a value, such as a built-in toolbar. */
  defaultBuiltIn?: boolean;
  description: string;
  deprecated?: string | boolean;
  /** Declared by Base UI and passed through to it. */
  source?: 'base-ui';
}

interface ExportBase {
  source: string;
  description: string;
  /** The module specifiers that export it, such as @envsemble/envui. */
  entries: string[];
}

export type ExportEntry =
  | (ExportBase & {
      kind: 'component';
      props: PropEntry[];
      /** Elements whose native props it also accepts, such as button; element for any HTML. */
      native: string[];
    })
  | (ExportBase & { kind: 'namespace'; parts: string[] })
  | (ExportBase & { kind: 'function'; signature: string });

export type DocumentationBlock =
  | { kind: 'markdown'; markdown: string }
  /**
   * A file in apps/catalogue/src/examples/<page>/<name>.tsx, under its ### heading. On a page of
   * exchanges it is a figure: a live example, a do or a don't figure, or an anatomy figure.
   */
  | {
      kind: 'example';
      name: string;
      heading: string;
      /** A do or don't figure, or an anatomy figure; a live example without it. */
      role?: 'do' | 'dont' | 'anatomy';
      /** One sentence under the figure; a do or don't figure's verdict. */
      caption?: string;
      /** The widths, in rem, of the frames an example is shown in side by side. */
      widths?: number[];
      /** The component of docs/generated/parts.json an anatomy figure without a legend numbers. */
      of?: string;
      /** An anatomy figure's legend: each numbered part by its class name, and what it is. */
      legend?: AnatomyLegendItem[];
    }
  /** The question an exchange of a page of exchanges answers, shown as a Message. */
  | { kind: 'question'; text: string }
  /** A catalogue-only specimen in apps/catalogue/src/specimens/<page>/<name>.tsx. */
  | { kind: 'specimen'; name: string };

/** One numbered part of an anatomy figure. */
export interface AnatomyLegendItem {
  /** The part, by its class name, such as env-card-header, or a selector of env-* class names. */
  part: string;
  /**
   * The legend's Markdown, which names the part; an item that holds only the part's class name
   * takes its description from docs/generated/parts.json.
   */
  text: string;
}

export type TemplateSectionId =
  | 'overview'
  | 'usage'
  | 'width'
  | 'anatomy'
  | 'variants'
  | 'states'
  | 'content'
  | 'do-and-dont'
  | 'accessibility'
  | 'examples'
  | 'changelog';

export interface DocumentationSection {
  id: TemplateSectionId;
  title: string;
  blocks: DocumentationBlock[];
  /** The ids of the section's headings, as the catalogue renders them, numbered across the page. */
  anchors?: string[];
}

/** A component, pattern or template page's frontmatter beyond its title, summary and category. */
export interface DocumentationMetadata {
  status: 'experimental' | 'beta' | 'stable' | 'deprecated';
  /** The status of an export that differs from the page's. */
  statuses?: Record<string, 'experimental' | 'beta' | 'stable' | 'deprecated'>;
  since: string;
  aliases: string[];
  useWhen: string[];
  /** Situations that call for something else, with the component to use or the page to read. */
  avoidWhen: { text: string; use?: string; see?: string }[];
  /** The exports a component page documents; none on a pattern or template page. */
  components: string[];
  /** What people are doing, which groups a pattern page. */
  intent?: string;
  /** The exports a pattern or template page combines. */
  composes?: string[];
}

export interface DocumentationEntry {
  id: string;
  title: string;
  group: string;
  path: string;
  summary: string;
  related: string[];
  /** The page's Markdown after its title. */
  markdown: string;
  metadata?: DocumentationMetadata;
  /** A component page written as exchanges: a question and its answer per section. */
  format?: 'exchanges';
  /** The sections of a page on the template; absent on pages not on it, such as guides. */
  sections?: DocumentationSection[];
  /** The exports a template page documents, with namespaces expanded to their parts. */
  props?: Record<string, ExportEntry>;
}
