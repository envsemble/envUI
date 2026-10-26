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

/** A fill a figure's stage takes instead of the canvas recessed from the page or the band. */
export type StageFill = 'shaded';

export type DocumentationBlock =
  | { kind: 'markdown'; markdown: string }
  /**
   * A file in apps/catalogue/src/examples/<page>/<name>.tsx, placed as a figure: a live example, a
   * do or a don't figure, an anatomy figure or a variants figure.
   */
  | {
      kind: 'example';
      name: string;
      heading: string;
      /** A do or don't figure, an anatomy or a variants figure; a live example without it. */
      role?: 'do' | 'dont' | 'anatomy' | 'variants';
      /** One sentence under the figure; a do or don't figure's verdict. */
      caption?: string;
      /** The widths, in rem, of the frames an example is shown in, one to a row. */
      widths?: number[];
      /**
       * The width, in rem, an anatomy figure's subject needs to show its parts, such as panes side
       * by side: on a narrower stage it is drawn smaller to fit.
       */
      width?: number;
      /** The component of docs/generated/parts.json an anatomy figure without a legend numbers. */
      of?: string;
      /** Whether the figure shows the example's overlays open, contained in its stage. */
      open?: boolean;
      /** Whether an anatomy figure shows its subject half as large again where its stage has room. */
      enlarge?: boolean;
      /** Whether an example stands alone across the column, rather than beside text or other figures. */
      wide?: boolean;
      /** The stage's fill where the page's own would hide the subject: `raised` or `shaded`. */
      stage?: StageFill;
      /**
       * An anatomy figure's legend: each numbered part by its class name, and what it is; a variants
       * figure's: each variant's name, and the item it labels.
       */
      legend?: AnatomyLegendItem[];
    }
  /**
   * A foundation's figure: one of the catalogue's own, from its page's
   * preview (previews/foundations), by name, with the legend that follows it, each mark's or
   * picture's name and what it means.
   */
  | {
      kind: 'figure';
      name: string;
      heading: string;
      role?: string;
      caption?: string;
      legend?: { name: string; text: string }[];
    }
  /** A catalogue-only specimen in apps/catalogue/src/specimens/<page>/<name>.tsx. */
  | { kind: 'specimen'; name: string }
  /**
   * An example file of the page shown as code, not live, in "## Compose", the developer part that
   * the page in the Docs shows.
   */
  | { kind: 'source'; name: string };

/** One numbered part of an anatomy figure. */
export interface AnatomyLegendItem {
  /** The part, by its class name, such as env-card-header, or a selector of env-* class names. */
  part: string;
  /**
   * The legend's Markdown, which names the part; an item that holds only the part's class name
   * takes its description from docs/generated/parts.json.
   */
  text: string;
  /** In an anatomy figure, the part's name, its bold start, which is all the catalogue shows of it. */
  name?: string;
  /**
   * In a variants figure, the variant's name, shown on its callout; the item it labels is the part,
   * or else the example's item in the legend's order.
   */
  label?: string;
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
  /** The ids of the section's headings, as the catalogue renders them, numbered across the page. */
  anchors?: string[];
}

/** A component or pattern page's frontmatter beyond its title, summary and category. */
export interface DocumentationMetadata {
  /** A component's or a pattern's; a foundation has none. */
  status?: 'experimental' | 'beta' | 'stable' | 'deprecated';
  /** The status of an export that differs from the page's. */
  statuses?: Record<string, 'experimental' | 'beta' | 'stable' | 'deprecated'>;
  since?: string;
  aliases: string[];
  useWhen: string[];
  /** Situations that call for something else, with the component to use or the page to read. */
  avoidWhen: { text: string; use?: string; see?: string }[];
  /** The exports a component page documents; none on a pattern page. */
  components: string[];
  /** What people are doing, which groups a pattern page. */
  intent?: string;
  /** The exports a pattern page combines. */
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
  /** The exports a guide documents, such as LinkProvider on setup's. */
  components?: string[];
  /**
   * The sections of a component, pattern or foundation page, in the one-file structure; absent on
   * guides.
   */
  sections?: DocumentationSection[];
  /** The exports a component page documents, with namespaces expanded to their parts. */
  props?: Record<string, ExportEntry>;
}
