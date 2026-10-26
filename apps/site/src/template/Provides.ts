import type { DocumentationSection } from '../DocumentationTypes';
import {
  providesOf,
  catalogueMarkdown,
  withoutProvides,
} from '../../../../scripts/CatalogueContent.mjs';

/**
 * The subsections of a page's Accessibility that say what envUI provides and what the application
 * provides are for people who build with envUI, so the page in the Docs shows them, and the catalogue,
 * which shows what it looks like and when to use it, leaves them out, as it leaves out a
 * table's In code column. scripts/CatalogueContent.mjs holds the
 * rules, which the plain-language test reads too.
 */
export { providesOf, withoutProvides };

/**
 * The section as the catalogue shows it: without what envUI and the application provide or a
 * table's code, and nothing where that leaves only its heading.
 */
export function catalogueSection(section: DocumentationSection): DocumentationSection | undefined {
  const blocks = section.blocks.map((block) =>
    block.kind === 'markdown'
      ? { ...block, markdown: catalogueMarkdown(section, block.markdown) }
      : block,
  );
  const empty = blocks.every(
    (block) => block.kind === 'markdown' && !block.markdown.replace(/^## .*$/m, '').trim(),
  );
  return empty ? undefined : { ...section, blocks };
}
