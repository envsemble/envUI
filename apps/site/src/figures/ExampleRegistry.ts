/*
 * Every example file, rendered live, and its source as text, each loaded with the page that shows
 * it. An example is apps/site/src/examples/<page>/<Name>.tsx with a default-exported component; the
 * page's Markdown places it by name in an empty ```tsx figure=Name``` fence.
 */
import { lazy, type ComponentType } from 'react';
import { loadModule, reloadModule } from '../loading/LoadBoundary';

const loaders = import.meta.glob<{ default: ComponentType }>('../examples/*/*.tsx');
const sourceLoaders = import.meta.glob<string>('../examples/*/*.tsx', {
  query: '?raw',
  import: 'default',
});
const examples = new Map(
  Object.entries(loaders).map(([path, load]) => [path, lazy(loadModule(load))]),
);
const sources = new Map<string, Promise<string>>();
/** How each source loads: from its loader, or once it failed, from reloadModule. */
const sourceLoads = new Map<string, () => Promise<string>>();

const pathOf = (page: string, name: string) => `../examples/${page}/${name}.tsx`;

/** An example's module, as the site serves it, for LoadBoundary to name. */
export const exampleModule = (page: string, name: string) => `src/examples/${page}/${name}.tsx`;

/** An example's component, a lazy one that loads its file; it throws for a name with no file. */
export function exampleComponent(page: string, name: string) {
  const path = pathOf(page, name);
  const Example = examples.get(path);
  if (!Example || !sourceLoaders[path])
    throw new Error(`No example file apps/site/src/examples/${page}/${name}.tsx`);
  return Example;
}

/**
 * The source of an example, loaded once and kept for every later render. A load that fails is kept
 * too, so renders until a retry read the same rejected promise rather than a new one each time,
 * which React would take for a promise it was never given; retrySource drops it.
 */
export function exampleSource(page: string, name: string) {
  const path = pathOf(page, name);
  let source = sources.get(path);
  if (!source) {
    source = loadModule(sourceLoads.get(path) ?? sourceLoaders[path])();
    sources.set(path, source);
  }
  return source;
}

/** Drops an example whose file failed to load, so that its next render loads it again. */
export function retryExample(page: string, name: string) {
  const path = pathOf(page, name);
  examples.set(path, lazy(loadModule(reloadModule(loaders[path], path, import.meta.url))));
}

/** Drops the source of an example that failed to load, so that its next render loads it again. */
export function retrySource(page: string, name: string) {
  const path = pathOf(page, name);
  sources.delete(path);
  sourceLoads.set(
    path,
    reloadModule(sourceLoaders[path], path, import.meta.url, {
      query: 'raw',
      pick: (module) => (module as { default: string }).default,
    }),
  );
}
