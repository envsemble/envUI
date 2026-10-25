import type {
  AnatomyLegendItem,
  DocumentationSection,
} from '../apps/catalogue/src/DocumentationTypes';

export declare const docsOnlySections: Set<string>;
export declare const providesHeadings: { envui: 'envUI provides'; app: 'You provide' };
export declare function subsections(markdown: string): string[];
export declare function withoutProvides(markdown: string): string;
export declare const providesSections: Set<string>;
export declare const codeColumnHeading: 'In code';
export declare function withoutCodeColumns(markdown: string): string;
export declare function siteMarkdown(section: DocumentationSection, markdown: string): string;
export declare function providesOf(sections: readonly DocumentationSection[]): {
  envui: string | undefined;
  app: string | undefined;
};
export declare function legendName(item: AnatomyLegendItem): string | undefined;

export declare const optionUseHeading: 'Use for';
export interface OptionTableOption {
  name: string;
  nameTokens: unknown[];
  details: { title: string; markdown: string }[];
  use: string;
}
export interface OptionTable {
  column: string;
  options: OptionTableOption[];
}
export declare function optionTable(token: unknown): OptionTable | undefined;
export declare function optionTableProblems(table: OptionTable): string[];
export declare function siteStructure(document: {
  sections?: readonly DocumentationSection[];
}): { where: string; kind: 'after a figure' | 'too many paragraphs'; text: string }[];
export declare const blockParagraphs: number;
export declare const paragraphLength: number;
export declare function longParagraphs(document: {
  sections?: readonly DocumentationSection[];
}): { where: string; length: number; text: string }[];
export declare function optionPieces(
  markdown: string,
): ({ markdown: string } | { options: OptionTable; raw: string })[];
export declare function technicalText(text: string): { kind: string; text: string }[];
