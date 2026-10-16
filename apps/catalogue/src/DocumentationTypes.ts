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
}

/** A component page's frontmatter beyond its title, summary and category. */
export interface DocumentationMetadata {
  status: 'experimental' | 'beta' | 'stable' | 'deprecated';
  since: string;
  aliases: string[];
  useWhen: string[];
  /** Situations that call for something else, with the component to use instead. */
  avoidWhen: { text: string; use?: string }[];
  components: string[];
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
  /** The sections of a page on the template; absent on pages not converted yet. */
  sections?: DocumentationSection[];
  /** The exports a template page documents, with namespaces expanded to their parts. */
  props?: Record<string, ExportEntry>;
}
