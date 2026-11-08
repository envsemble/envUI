// Where the documentation and what it places live: docs/, the site's example and specimen folders,
// and the catalogue's generated summary.
import { fileURLToPath } from 'node:url';

export const documentationDirectory = fileURLToPath(new URL('../../docs/', import.meta.url));
export const examplesDirectory = fileURLToPath(
  new URL('../../apps/site/src/examples/', import.meta.url),
);
export const specimensDirectory = fileURLToPath(
  new URL('../../apps/site/src/specimens/', import.meta.url),
);
export const generatedFile = fileURLToPath(
  new URL('../../apps/site/src/generated/Documentation.ts', import.meta.url),
);
