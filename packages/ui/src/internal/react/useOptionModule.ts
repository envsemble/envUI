'use client';

import { useEffect, useState } from 'react';

/**
 * The code of an option that a component loads only where the option is used, such as a table's
 * column resizing: imported once, in the browser, and again after an import that failed, so a
 * component mounted later tries again.
 */
export interface OptionModule<T> {
  /** The module once it has loaded, else undefined. */
  readonly loaded: T | undefined;
  /** Loads the module, or rejects where it can't load, such as on the server or offline. */
  load(): Promise<T>;
  /**
   * Starts loading it, as a component renders with the option, with no failure to handle. After a
   * failure it waits for the next load, as a component mounts, rather than trying on each render.
   */
  preload(): void;
}

export function optionModule<T>(importer: () => Promise<T>): OptionModule<T> {
  let loading: Promise<T> | undefined;
  let loaded: T | undefined;
  let failed = false;
  const load = () => {
    if (typeof window === 'undefined') return Promise.reject(new Error('Not in a browser'));
    failed = false;
    loading ??= importer().then(
      (module) => (loaded = module),
      (error: unknown) => {
        loading = undefined;
        failed = true;
        throw error;
      },
    );
    return loading;
  };
  return {
    get loaded() {
      return loaded;
    },
    load,
    preload() {
      if (typeof window !== 'undefined' && !failed) load().catch(() => {});
    },
  };
}

/**
 * An option's module once it has loaded, while `enabled`, loading it as the component mounts.
 * Where it fails to load, the option is missing, as if it were not set, until a later mount. The
 * first render never has it, even where it has already loaded, since the server rendered without
 * it and a component hydrating later must match that.
 */
export function useOptionModule<T>(module: OptionModule<T>, enabled: boolean): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    if (!enabled || value) return;
    let mounted = true;
    module.load().then(
      (loaded) => {
        if (mounted) setValue(loaded);
      },
      () => {},
    );
    return () => {
      mounted = false;
    };
  }, [module, enabled, value]);
  return enabled ? value : undefined;
}
