import sharedSizes from 'virtual:envui-part-sizes';
import sharedLines from 'virtual:envui-example-lines';

const pageSizes = new Map<string, readonly [number, number]>();
const pageLines = new Map<string, number>();

export function keepPageParts(content: {
  partSizes?: Record<string, [number, number]>;
  exampleLines?: Record<string, number>;
}) {
  for (const [part, size] of Object.entries(content.partSizes ?? {})) pageSizes.set(part, size);
  for (const [example, lines] of Object.entries(content.exampleLines ?? {}))
    pageLines.set(example, lines);
}

export const recordedSize = (part: string): readonly [number, number] | undefined =>
  sharedSizes[part] ?? pageSizes.get(part);

export const exampleLines = (example: string): number | undefined =>
  sharedLines[example] ?? pageLines.get(example);
