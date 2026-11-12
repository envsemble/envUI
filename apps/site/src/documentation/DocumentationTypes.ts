/**
 * The shape of the generated documentation data, written by scripts/docs/GenerateDocumentation.ts
 * from docs/ and docs/generated/props.json: every page's summary
 * (apps/site/src/generated/Documentation.ts) and each page's content
 * (apps/site/src/generated/pages/<id>.json). The site and the documentation scripts both read it.
 */

/** One prop of a component, as scripts/docs/ExtractProps.ts reads it from the TypeScript source. */
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

/** A fill a figure's stage takes instead of the canvas recessed from the page. */
export type StageFill = 'shaded';
/**
 * The device a page's figure is drawn in, at its real width: a phone, portrait, or a desktop
 * browser's window (figures/DeviceFrame.tsx).
 */
export type DeviceKind = 'phone' | 'window';

export type DocumentationBlock =
  | { kind: 'markdown'; markdown: string }
  /**
   * A file in apps/site/src/examples/<page>/<name>.tsx, placed as a figure: a live example, a
   * do or a don't figure, an anatomy figure or a variants figure.
   */
  | {
      kind: 'example';
      name: string;
      heading: string;
      /** A do or don't figure, an anatomy or a variants figure; a live example without it. */
      role?: 'do' | 'dont' | 'caution' | 'anatomy' | 'variants';
      /** One sentence under the figure; a do or don't figure's verdict. */
      caption?: string;
      /** The widths, in rem, of the frames an example is shown in, one to a row. */
      widths?: number[];
      /**
       * Whether the example is shown in one frame whose width sweeps between `widths`, the first
       * its still, and back, rather than a frame of each.
       */
      sweep?: boolean;
      /** Whether that frame's ruler names the window class of its width too. */
      classes?: boolean;
      /**
       * Whether that frame is drawn smaller where it must to reach its widest width on the stage,
       * for an example that changes only at a width wider than the column.
       */
      fit?: boolean;
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
      /**
       * Whether the catalogue plays the example in its place: its animated specimen of the same
       * name, which uses it as a person would (apps/site/src/specimens/<page>/<Name>.tsx).
       */
      motion?: boolean;
      /**
       * Whether an anatomy figure numbers the parts of its specimen of the same name, which holds
       * the example in a moment its parts show apart (apps/site/src/specimens/<page>/<Name>.tsx).
       */
      specimen?: boolean;
      /** The stage's fill where the page's own would hide the subject: `raised` or `shaded`. */
      stage?: StageFill;
      /** The device an example is drawn in on the page, at its real width, filling its screen. */
      device?: DeviceKind;
      /**
       * An anatomy figure's legend: each numbered part by its class name, and what it is; a variants
       * figure's: each variant's name, and the item it labels.
       */
      legend?: AnatomyLegendItem[];
    }
  /**
   * A foundation's figure: one of the catalogue's own, from its page's
   * preview (figures/foundations), by name, with the legend that follows it, each mark's or
   * picture's name and what it means.
   */
  | {
      kind: 'figure';
      name: string;
      heading: string;
      role?: string;
      caption?: string;
      legend?: { name: string; text: string }[];
      /**
       * Whether it has an example file of its name, apps/site/src/examples/<page>/<name>.tsx: the
       * code an application writes for what it shows, under the figure in a Code disclosure.
       */
      code?: boolean;
    }
  /** A catalogue-only specimen in apps/site/src/specimens/<page>/<name>.tsx. */
  | { kind: 'specimen'; name: string }
  /**
   * An example file of the page shown as code, not live, in "## Compose", the developer part that
   * the page in the Docs shows.
   */
  | { kind: 'source'; name: string };

/** An example file placed as a figure. */
export type ExampleBlock = Extract<DocumentationBlock, { kind: 'example' }>;
/** A foundation's figure, one of the catalogue's own. */
export type FoundationFigureBlock = Extract<DocumentationBlock, { kind: 'figure' }>;
/** A block a page places as a figure: an example or a foundation's figure. */
export type PlacedBlock = ExampleBlock | FoundationFigureBlock;

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
  /** The ids of the section's headings, as the catalogue renders them, numbered across the page. */
  anchors?: string[];
}

/** The index's component groups, in its order; a component page's category is one of them. */
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
/** A component group of the index, such as Overlays. */
export type ComponentGroup = (typeof componentGroups)[number];

/** A page's or an export's status, a ladder from alpha to stable, then deprecated. */
export const pageStatuses = ['alpha', 'beta', 'stable', 'deprecated'] as const;
/** A page's or an export's status: alpha, beta, stable or deprecated. */
export type PageStatus = (typeof pageStatuses)[number];

/** A component or pattern page's frontmatter beyond its title, summary and category. */
export interface DocumentationMetadata {
  /** A component's or a pattern's; a foundation has none. */
  status?: PageStatus;
  /** The status of an export that differs from the page's. */
  statuses?: Record<string, PageStatus>;
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

/** An example figure a section places, as a page's tile picks one. */
type ExampleOutline = Pick<ExampleBlock, 'name' | 'heading' | 'role' | 'widths' | 'open' | 'stage'>;

/** A section of a page as the site knows it before the page loads. */
interface SectionOutline {
  id: TemplateSectionId;
  /** The ids of the section's headings, as the catalogue renders them, numbered across the page. */
  anchors: string[];
  examples: ExampleOutline[];
}

/**
 * What the site knows of every page from its start (generated/Documentation.ts): enough for the
 * navigation, the galleries' tiles, Related and the routes. A page's content loads with the page
 * (DocumentationEntry, generated/pages/<id>.json).
 */
export interface DocumentationSummary {
  id: string;
  title: string;
  group: string;
  path: string;
  summary: string;
  related: string[];
  /** The page's metadata but its lists for the page itself, when to use it and its aliases. */
  metadata?: Omit<DocumentationMetadata, 'aliases' | 'useWhen' | 'avoidWhen'>;
  /** The exports a guide documents, such as LinkProvider on setup's. */
  components?: string[];
  /** A guide's status, where it has one, such as alpha. */
  status?: PageStatus;
  /** The sections of a component, pattern or foundation page, outlined; absent on guides. */
  outline?: SectionOutline[];
  /**
   * The components a page documents besides the one it is named after, such as IconButton on
   * Button's, which the navigation lists under the page.
   */
  members?: PageMember[];
}

/** A component a page documents besides its own, and the headings that lead to it. */
interface PageMember {
  name: string;
  /** The id of the catalogue's heading that first names it, on a component page. */
  catalogue?: string;
  /** The id of the Docs' heading that shows it: its props, or a guide's heading that names it. */
  docs: string;
}

/** A page with its content, which loads with the page. */
export interface DocumentationEntry extends Omit<DocumentationSummary, 'outline' | 'metadata'> {
  /**
   * The recorded sizes of the page's examples and specimens and its examples' lines of code, which
   * their skeletons keep: the build adds them (scripts/site/SiteData.ts).
   */
  partSizes?: Record<string, [number, number]>;
  exampleLines?: Record<string, number>;
  metadata?: DocumentationMetadata;
  /** A guide's Markdown after its title; the other pages show their sections. */
  markdown?: string;
  /**
   * The sections of a component, pattern or foundation page, in the one-file structure; absent on
   * guides.
   */
  sections?: DocumentationSection[];
  /** The exports a component page documents, with namespaces expanded to their parts. */
  props?: Record<string, ExportEntry>;
  /** The built-in strings the page's exports show, which EnvUIProvider's `messages` overrides. */
  strings?: DocumentationString[];
}

/** One of envUI's built-in strings: its namespace and key, its English default and what it names. */
interface DocumentationString {
  namespace: string;
  key: string;
  value: string;
  description: string;
}
