import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Tokens } from 'marked';
import type {
  ExampleBlock,
  FoundationFigureBlock,
} from '../../../apps/site/src/documentation/DocumentationTypes.ts';
import type { PageReading, PartNames } from '../PageReaderTypes.ts';
import { documentationDirectory, librarySourceDirectory } from '../../RepositoryPaths.ts';

const stylesDirectory = resolve(librarySourceDirectory, 'styles');

export function readPartNames(directory = documentationDirectory): PartNames {
  const classes = new Set<string>();
  if (existsSync(stylesDirectory))
    for (const name of readdirSync(stylesDirectory).filter((file) => file.endsWith('.css')))
      for (const [, found] of readFileSync(resolve(stylesDirectory, name), 'utf8').matchAll(
        /\.(env-[\w-]+)/g,
      ))
        classes.add(found);
  const file = resolve(directory, 'generated/parts.json');
  const json = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const components: Record<string, string[]> = {};
  for (const [group, entries] of [
    ['components', json.components],
    ['shared', json.shared],
  ])
    for (const [name, entry] of Object.entries<{ root?: string; parts?: { class: string }[] }>(
      entries ?? {},
    )) {
      const parts = [entry.root, ...(entry.parts ?? []).map((part) => part.class)].filter(
        (part): part is string => Boolean(part),
      );
      for (const part of parts) classes.add(part);
      if (group === 'components') components[name] = parts;
    }
  return { classes, components };
}

export function readLegend(page: PageReading, list: Tokens.List) {
  const figure = page.legendOf;
  if (!figure) return false;
  if (figure.kind === 'figure') figure.legend = foundationLegend(page, figure, list);
  else if (figure.role === 'variants') figure.legend = variantsLegend(page, figure, list);
  else figure.legend = anatomyLegend(page, figure, list);
  page.legendOf = undefined;
  return true;
}

function foundationLegend(page: PageReading, figure: FoundationFigureBlock, list: Tokens.List) {
  return list.items.map((item, index) => {
    const match = item.text.replace(/\s+/g, ' ').match(/^\*\*([^*]+)\*\*:?\s*(.*)$/);
    if (!match)
      page.problems.push(
        `item ${index + 1} of the legend of figure ${figure.name} must start with its name in bold, such as **Compact**: and what it means`,
      );
    return { name: match?.[1] ?? '', text: match?.[2]!.trim() ?? item.text };
  });
}

function variantsLegend(page: PageReading, figure: ExampleBlock, list: Tokens.List) {
  return list.items.map((item, index) => {
    const label = item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
    if (!label)
      page.problems.push(
        `item ${index + 1} of the legend of variants ${figure.name} must start with the variant's name in bold, such as **Outline**`,
      );
    const part = item.text.match(/`(env-[^`]+)`/)?.[1] ?? '';
    for (const name of part.match(/env-[\w-]+/g) ?? [])
      if (!page.context.partNames.classes.has(name))
        page.problems.push(
          `item ${index + 1} of the legend of variants ${figure.name} names ${name}, which neither packages/ui's CSS nor docs/generated/parts.json has`,
        );
    return { part, text: item.text.replace(/\s+/g, ' ').trim(), label: label ?? '' };
  });
}

function anatomyLegend(page: PageReading, figure: ExampleBlock, list: Tokens.List) {
  return list.items.map((item, index) => {
    const part = item.text.match(/`(env-[^`]+)`/)?.[1];
    if (!part)
      page.problems.push(
        `item ${index + 1} of the legend of anatomy ${figure.name} names no part, such as \`env-button\``,
      );
    const name = item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
    if (!name)
      page.problems.push(
        `item ${index + 1} of the legend of anatomy ${figure.name} must start with the part's name in bold, such as **Label**, which is all the catalogue shows of it`,
      );
    for (const name of (part ?? '').replace(/::text$/, '').match(/env-[\w-]+/g) ?? [])
      if (!page.context.partNames.classes.has(name))
        page.problems.push(
          `item ${index + 1} of the legend of anatomy ${figure.name} names ${name}, which neither packages/ui's CSS nor docs/generated/parts.json has`,
        );
    return {
      part: part ?? '',
      text: item.text.replace(/\s+/g, ' ').trim(),
      ...(name && { name }),
    };
  });
}
