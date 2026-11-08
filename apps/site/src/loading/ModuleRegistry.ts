import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { reloadModule } from './LoadBoundary';
import { loadOnce } from './LoadOnce';

/** A glob's files, each a component as its default export. */
type ComponentModule = { default: ComponentType };

/**
 * The files of a glob of the site's own, such as `import.meta.glob('/src/examples/*\/*.tsx')`, each
 * loaded with the page that shows it and kept, by its path from the site app's root, such as
 * `/src/examples/button/CreateProject.tsx` (loadOnce). A load that fails is kept until `retry`
 * drops it and, in development, asks for the file again under a new URL (reloadModule). `query`
 * and `pick` say how to read a file loaded again, as `raw` and its default export for a glob of
 * sources.
 */
export function moduleRegistry<T>(
  glob: Record<string, () => Promise<T>>,
  reload: { query?: string; pick?: (module: unknown) => T } = {},
) {
  const loaders = new Map(Object.entries(glob));
  const loads = new Map<string, Promise<T>>();
  const components = new Map<string, LazyExoticComponent<ComponentType>>();

  /** The loader of a file, or an error that names the file missing. */
  const loaderOf = (path: string) => {
    const load = loaders.get(path);
    if (!load) throw new Error(`No file apps/site${path}`);
    return load;
  };

  const registry = {
    /** Whether the glob has a file at `path`. */
    has: (path: string) => loaders.has(path),
    /** The module at `path`, loaded once and kept; it throws for a path with no file. */
    load: (path: string) => loadOnce(loads, path, loaderOf(path)),
    /** Starts loading the file at `path`, where there is one, ahead of its first render. */
    preload(path: string) {
      if (loaders.has(path)) registry.load(path).catch(() => undefined);
    },
    /**
     * The default export of the file at `path` as a lazy component, the same one until a retry; it
     * throws for a path with no file.
     */
    component(path: string): LazyExoticComponent<ComponentType> {
      loaderOf(path);
      let component = components.get(path);
      if (!component) {
        // The registry's files are components' modules, which default-export one.
        component = lazy(() => registry.load(path) as Promise<ComponentModule>);
        components.set(path, component);
      }
      return component;
    },
    /** The file at `path` as the site app serves it, for LoadBoundary to name. */
    module: (path: string) => path.slice(1),
    /** Drops a file that failed to load, so that its next render loads it again. */
    retry(path: string) {
      const root = new URL(import.meta.env.BASE_URL, window.location.href).href;
      loaders.set(path, reloadModule(loaderOf(path), path.slice(1), root, reload));
      loads.delete(path);
      components.delete(path);
    },
  };
  return registry;
}
