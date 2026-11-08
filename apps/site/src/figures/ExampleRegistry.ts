/*
 * Every example file, rendered live, and its source as text, each loaded with the page that shows
 * it. An example is apps/site/src/examples/<page>/<Name>.tsx with a default-exported component; the
 * page's Markdown places it by name in an empty ```tsx figure=Name``` fence.
 */
import type { ComponentType } from 'react';
import { moduleRegistry } from '../loading/ModuleRegistry';

const examples = moduleRegistry(
  import.meta.glob<{ default: ComponentType }>('/src/examples/*/*.tsx'),
);
const sources = moduleRegistry(
  import.meta.glob<string>('/src/examples/*/*.tsx', { query: '?raw', import: 'default' }),
  { query: 'raw', pick: (module) => (module as { default: string }).default },
);

const pathOf = (page: string, name: string) => `/src/examples/${page}/${name}.tsx`;

/** Whether a page has an example of this name. */
export const hasExample = (page: string, name: string) => examples.has(pathOf(page, name));

/** An example's module, as the site serves it, for LoadBoundary to name. */
export const exampleModule = (page: string, name: string) => examples.module(pathOf(page, name));

/** An example's component, a lazy one that loads its file; it throws for a name with no file. */
export const exampleComponent = (page: string, name: string) =>
  examples.component(pathOf(page, name));

/** The source of an example, loaded once and kept for every later render. */
export const exampleSource = (page: string, name: string) => sources.load(pathOf(page, name));

/** Drops an example whose file failed to load, so that its next render loads it again. */
export const retryExample = (page: string, name: string) => examples.retry(pathOf(page, name));

/** Drops the source of an example that failed to load, so that its next render loads it again. */
export const retrySource = (page: string, name: string) => sources.retry(pathOf(page, name));
