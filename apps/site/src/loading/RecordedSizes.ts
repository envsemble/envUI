import sharedSizes from 'virtual:envui-part-sizes';
import sharedLines from 'virtual:envui-example-lines';

/**
 * What the build gives each page's content of the parts on it, rather than every page's to the
 * site's start (scripts/site/SiteData.ts): its examples' and specimens' recorded sizes and its examples'
 * lines of code. While developing, every part's is in the virtual modules instead.
 */
const pageSizes = new Map<string, readonly [number, number]>();
const pageLines = new Map<string, number>();

/** Keeps the parts' data a page's content brought, as it loads (pages/PageContent.ts). */
export function keepPageParts(content: {
  partSizes?: Record<string, [number, number]>;
  exampleLines?: Record<string, number>;
}) {
  for (const [part, size] of Object.entries(content.partSizes ?? {})) pageSizes.set(part, size);
  for (const [example, lines] of Object.entries(content.exampleLines ?? {}))
    pageLines.set(example, lines);
}

/** A part's recorded width and height, in rem (scripts/site/RecordPartSizes.ts). */
export const recordedSize = (part: string): readonly [number, number] | undefined =>
  sharedSizes[part] ?? pageSizes.get(part);

/** The lines of an example's code, by page/Name, where they are known. */
export const exampleLines = (example: string): number | undefined =>
  sharedLines[example] ?? pageLines.get(example);
