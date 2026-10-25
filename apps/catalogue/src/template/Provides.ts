import type { DocumentationSection } from '../DocumentationTypes';
import { providesOf, siteMarkdown, withoutProvides } from '../../../../scripts/SiteContent.mjs';

/**
 * The subsections of a page's Accessibility that say what envUI provides and what the application
 * provides are for people who build with envUI, so the page in the Docs shows them, and the Usage
 * guide, which shows what it looks like and when to use it, leaves them out, as it leaves out a
 * table's In code column. scripts/SiteContent.mjs holds the
 * rules, which the plain-language test reads too.
 */
export { providesOf, withoutProvides };

/**
 * The section as the Usage guide shows it: without what envUI and the application provide or a
 * table's code, and nothing where that leaves only its heading.
 */
export function siteSection(section: DocumentationSection): DocumentationSection | undefined {
  const blocks = section.blocks.map((block) =>
    block.kind === 'markdown'
      ? { ...block, markdown: siteMarkdown(section, block.markdown) }
      : block,
  );
  const empty = blocks.every(
    (block) => block.kind === 'markdown' && !block.markdown.replace(/^## .*$/m, '').trim(),
  );
  return empty ? undefined : { ...section, blocks };
}
