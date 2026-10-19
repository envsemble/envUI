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
  /** A file in apps/catalogue/src/examples/<page>/<name>.tsx, under its ### heading. */
  | { kind: 'example'; name: string; heading: string }
  /**
   * A template's screen, the file apps/catalogue/src/examples/<page>/<name>.tsx, rendered in frames of
   * the frame route; app renders it inside the app frame template, none on its own.
   */
  | { kind: 'template'; name: string; heading: string; frame: 'app' | 'none' }
  /** A catalogue-only specimen in apps/catalogue/src/specimens/<page>/<name>.tsx. */
  | { kind: 'specimen'; name: string };

export type TemplateSectionId =
  | 'overview'
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
  /** Where a template page's screens render: inside the app frame, or on their own. */
  frame?: 'app' | 'none';
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
  /** The sections of a page on the template; absent on pages not on it, such as guides. */
  sections?: DocumentationSection[];
  /** The exports a template page documents, with namespaces expanded to their parts. */
  props?: Record<string, ExportEntry>;
}
