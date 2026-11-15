import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { reloadModule } from './LoadBoundary';
import { loadOnce } from './LoadOnce';

const noFile = (path: string) => new Error(`No file apps/site${path}`);

export function moduleRegistry<T>(
  glob: Record<string, () => Promise<T>>,
  reload: { query?: string; pick?: (module: unknown) => T } = {},
) {
  const loaders = new Map(Object.entries(glob));
  const loads = new Map<string, Promise<T>>();

  const loaderOf = (path: string) => {
    const load = loaders.get(path);
    if (!load) throw noFile(path);
    return load;
  };

  const registry = {
    has: (path: string) => loaders.has(path),
    load: (path: string) => loadOnce(loads, path, loaderOf(path)),
    preload(path: string) {
      if (loaders.has(path)) registry.load(path).catch(() => undefined);
    },
    module: (path: string) => path.slice(1),
    retry(path: string) {
      const root = new URL(import.meta.env.BASE_URL, window.location.href).href;
      loaders.set(path, reloadModule(loaderOf(path), path.slice(1), root, reload));
      loads.delete(path);
    },
  };
  return registry;
}

export function componentRegistry(glob: Record<string, () => Promise<{ default: ComponentType }>>) {
  const files = moduleRegistry(glob);
  const components = new Map<string, LazyExoticComponent<ComponentType>>();
  return {
    ...files,
    component(path: string): LazyExoticComponent<ComponentType> {
      if (!files.has(path)) throw noFile(path);
      let component = components.get(path);
      if (!component) {
        component = lazy(() => files.load(path));
        components.set(path, component);
      }
      return component;
    },
    retry(path: string) {
      files.retry(path);
      components.delete(path);
    },
  };
}
