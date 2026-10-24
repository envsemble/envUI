import type {
  AnatomyLegendItem,
  DocumentationSection,
} from '../apps/catalogue/src/DocumentationTypes';

export declare const docsOnlySections: Set<string>;
export declare const providesHeadings: { envui: 'envUI provides'; app: 'You provide' };
export declare function subsections(markdown: string): string[];
export declare function withoutProvides(markdown: string): string;
export declare function providesOf(sections: readonly DocumentationSection[]): {
  envui: string | undefined;
  app: string | undefined;
};
export declare function legendName(item: AnatomyLegendItem): string | undefined;
