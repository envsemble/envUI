import { preloadExample } from './ExampleRegistry';
import { preloadSpecimen } from './Specimen';

export function preloadFigures(page: string, names: readonly string[]) {
  for (const name of names) {
    preloadExample(page, name);
    preloadSpecimen(page, name);
  }
}
