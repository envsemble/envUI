import type { DocumentationSection } from '../DocumentationTypes';

/**
 * The subsections of a page's Accessibility that say what envUI provides and what the application
 * provides. They are for people who build with envUI, so the component's page in the Docs shows
 * them, and the Site, which shows what it looks like and when to use it, leaves them out.
 */
const providesHeadings = { envui: 'envUI provides', app: 'You provide' } as const;

/** Markdown cut at its `###` and `##` headings, outside code fences. */
function subsections(markdown: string) {
  const chunks: string[] = [''];
  let fence: string | undefined;
  for (const line of markdown.split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)?.[1];
    if (marker && (!fence || (marker[0] === fence[0] && marker.length >= fence.length)))
      fence = fence ? undefined : marker;
    if (!fence && /^#{2,3} /.test(line)) chunks.push('');
    chunks[chunks.length - 1] += `${line}\n`;
  }
  return chunks;
}

const headingOf = (chunk: string) => /^#{2,3} (.*)/.exec(chunk)?.[1].trim();
const isProvides = (chunk: string) =>
  Object.values(providesHeadings).includes(headingOf(chunk) as never);

/** A section's Markdown without what envUI and the application provide. */
export function withoutProvides(markdown: string) {
  return subsections(markdown)
    .filter((chunk) => !isProvides(chunk))
    .join('')
    .replace(/\n+$/, '\n');
}

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

/** What envUI provides and what the application provides, each a Markdown list, from a page. */
export function providesOf(sections: readonly DocumentationSection[]) {
  const accessibility = sections.find((section) => section.id === 'accessibility');
  const markdown = (accessibility?.blocks ?? [])
    .map((block) => (block.kind === 'markdown' ? block.markdown : ''))
    .join('\n');
  const body = (heading: string) =>
    subsections(markdown)
      .find((chunk) => headingOf(chunk) === heading)
      ?.replace(/^.*\n/, '')
      .trim();
  return { envui: body(providesHeadings.envui), app: body(providesHeadings.app) };
}
