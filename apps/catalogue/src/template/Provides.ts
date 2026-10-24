import type { DocumentationSection } from '../DocumentationTypes';
import { providesOf, withoutProvides } from '../../../../scripts/SiteContent.mjs';

/**
 * The subsections of a page's Accessibility that say what envUI provides and what the application
 * provides are for people who build with envUI, so the page's guide in the Docs shows them, and the
 * Site, which shows what it looks like and when to use it, leaves them out. scripts/SiteContent.mjs
 * holds the rules, which the plain-language test reads too.
 */
export { providesOf, withoutProvides };

/**
 * The section as the Site shows it: Accessibility without what envUI and the application provide,
 * and nothing where that leaves only its heading.
 */
export function siteSection(section: DocumentationSection): DocumentationSection | undefined {
  if (section.id !== 'accessibility') return section;
  const blocks = section.blocks.map((block) =>
    block.kind === 'markdown' ? { ...block, markdown: withoutProvides(block.markdown) } : block,
  );
  const empty = blocks.every(
    (block) => block.kind === 'markdown' && !block.markdown.replace(/^## .*$/m, '').trim(),
  );
  return empty ? undefined : { ...section, blocks };
}
