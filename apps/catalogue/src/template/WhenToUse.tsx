import type { DocumentationMetadata } from '../DocumentationTypes';
import { Documentation } from '../pages/Documentation';
import { pageOf } from './Related';

/**
 * Component pages that paint nothing a reader sees, which Built from leaves out: the layout
 * primitives that only arrange what is inside them.
 */
const layoutPages = new Set(['box', 'row', 'column', 'grid']);

/**
 * The components a reader sees in a pattern, from the exports it combines, each page once: hooks,
 * helpers and providers, such as useToast, placeholders or LinkProvider, a dialog's close button
 * and the layout primitives are for agents and the Docs, which keep the whole list.
 */
export function visibleComponents(composes: string[]) {
  const pages = new Map<string, { title: string; path: string }>();
  for (const name of composes) {
    if (!/^[A-Z]/.test(name) || /(?:Provider|Close)$/.test(name)) continue;
    const page = pageOf(name);
    if (!page || page.section !== 'Components' || page.path.startsWith('docs/')) continue;
    if (layoutPages.has(page.reference.id)) continue;
    pages.set(page.path, { title: page.reference.title, path: page.reference.path });
  }
  return [...pages.values()];
}

/**
 * The start of When to use on a page on the figure template, from its frontmatter: a short list of
 * what it is for and, for a pattern, the components it is built from. What to use instead is in
 * Related, at the end of the page.
 */
export function WhenToUse({ metadata, path }: { metadata: DocumentationMetadata; path: string }) {
  const list = (items: string[]) => items.map((text) => `- ${text}`).join('\n');
  // Pages of docs/ are one folder deep, so ../<path> reaches any of them from any page.
  const built = visibleComponents(metadata.composes ?? []);
  return (
    <div className="docs-when">
      <Documentation markdown={`### Use it when\n\n${list(metadata.useWhen)}`} path={path} />
      {built.length ? (
        <Documentation
          markdown={`### Built from\n\n${built.map(({ title, path: page }) => `[${title}](../${page})`).join(', ')}`}
          path={path}
        />
      ) : null}
    </div>
  );
}
