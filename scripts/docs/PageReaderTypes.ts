// The types of PageReader.ts: what it reads a page with, and what it keeps as it reads the page's
// Markdown tokens in order, which the figures and legends it places read and add to.
import type { Token } from 'marked';
import type { PlacedBlock } from '../../apps/site/src/documentation/DocumentationTypes.ts';
import type { ExampleEntry, PageSection, PageSectionDefinition } from './PageStructure.ts';

/** A section of a page as readPage builds it: its blocks, and in Compose its tokens. */
export interface ReadSection extends PageSection {
  tokens: Token[];
}

/** The part names readPartNames finds: every class, and each component's parts. */
export interface PartNames {
  classes: Set<string>;
  components: Record<string, string[]>;
}

/** The page readPage reads: its id, the path its problems name, and its title. */
export interface PageInput {
  id: string;
  path: string;
  title: string;
}

/**
 * What readPage checks a page against: its kind, the examples its frontmatter lists, the example
 * and specimen files of its folder, and the part names its legends may name.
 */
export interface PageContext {
  kind: string;
  catalog: Record<string, ExampleEntry>;
  examples: Set<string>;
  specimens: Set<string>;
  partNames: PartNames;
}

/** What readPage keeps as it reads a page's tokens in order. */
export interface PageReading {
  document: PageInput;
  context: PageContext;
  foundation: boolean;
  /** The sections the page's kind takes, in their order, with their titles on this kind. */
  structure: PageSectionDefinition[];
  codeTitle: string;
  /** The figures placed so far, by name. */
  placed: Set<string>;
  sections: ReadSection[];
  problems: string[];
  current: ReadSection | undefined;
  subheading: string | undefined;
  /** The figure an ordered list right after it is the legend of. */
  legendOf: PlacedBlock | undefined;
  /** The `###` subsections of Compose so far, by their index in codeSubsections. */
  codeOrder: number[];
}
