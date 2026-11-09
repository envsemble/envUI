import { preloadExample } from './ExampleRegistry';
import { preloadSpecimen } from './Specimen';

/**
 * Starts loading the files of a page's figures of these names, ahead of their first render: each
 * example's, and the specimen named after it, its playback or the specimen its anatomy is numbered
 * on, where there is one.
 */
export function preloadFigures(page: string, names: readonly string[]) {
  for (const name of names) {
    preloadExample(page, name);
    preloadSpecimen(page, name);
  }
}
