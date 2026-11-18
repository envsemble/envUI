import type { ComponentType } from 'react';
import { componentRegistry, moduleRegistry } from '../loading/ModuleRegistry';

const examples = componentRegistry(
  import.meta.glob<{ default: ComponentType }>('/src/examples/*/*.tsx'),
);
const sources = moduleRegistry(
  import.meta.glob<string>('/src/examples/*/*.tsx', { query: '?raw', import: 'default' }),
  { query: 'raw', pick: (module) => (module as { default: string }).default },
);

const pathOf = (page: string, name: string) => `/src/examples/${page}/${name}.tsx`;

export const hasExample = (page: string, name: string) => examples.has(pathOf(page, name));

export const exampleModule = (page: string, name: string) => examples.module(pathOf(page, name));

export const exampleComponent = (page: string, name: string) =>
  examples.component(pathOf(page, name));

export const preloadExample = (page: string, name: string) => examples.preload(pathOf(page, name));

export const exampleSource = (page: string, name: string) => sources.load(pathOf(page, name));

export const retryExample = (page: string, name: string) => examples.retry(pathOf(page, name));

export const retrySource = (page: string, name: string) => sources.retry(pathOf(page, name));
