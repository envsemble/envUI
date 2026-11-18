import type { Token } from 'marked';
import type { PlacedBlock } from '../../apps/site/src/documentation/DocumentationTypes.ts';
import type { ExampleEntry, PageSection, PageSectionDefinition } from './PageStructure.ts';

export interface ReadSection extends PageSection {
  tokens: Token[];
}

export interface PartNames {
  classes: Set<string>;
  components: Record<string, string[]>;
}

export interface PageInput {
  id: string;
  path: string;
  title: string;
}

export interface PageContext {
  kind: string;
  catalog: Record<string, ExampleEntry>;
  examples: Set<string>;
  specimens: Set<string>;
  partNames: PartNames;
}

export interface PageReading {
  document: PageInput;
  context: PageContext;
  foundation: boolean;
  structure: PageSectionDefinition[];
  codeTitle: string;
  placed: Set<string>;
  sections: ReadSection[];
  problems: string[];
  current: ReadSection | undefined;
  subheading: string | undefined;
  legendOf: PlacedBlock | undefined;
  codeOrder: number[];
}
