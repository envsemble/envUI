import { lazy, Suspense, useState, type ComponentType } from 'react';
import { Text } from '@envsemble/envui';
import { Preview } from '../previews/Preview';
import { LoadBoundary } from './LoadBoundary';

/**
 * Catalogue-only specimens: visual references that are not usage examples, such as a matrix of
 * every variant or forced interaction states. A page places one with `<!-- specimen: Name -->`;
 * the packaged Markdown leaves it out. Each loads with the page that shows it.
 */
const loaders = import.meta.glob<{ default: ComponentType }>('../specimens/*/*.tsx');
const specimens = new Map(Object.entries(loaders).map(([path, load]) => [path, lazy(load)]));

export function Specimen({ page, name }: { page: string; name: string }) {
  const [attempt, setAttempt] = useState(0);
  const path = `../specimens/${page}/${name}.tsx`;
  const Component = specimens.get(path);
  if (!Component) throw new Error(`No specimen apps/catalogue/src/specimens/${page}/${name}.tsx`);
  return (
    <Preview>
      <LoadBoundary
        key={attempt}
        what="specimen"
        onRetry={() => {
          // A failed load stays failed in its lazy component; the retry makes a new one.
          specimens.set(path, lazy(loaders[path]));
          setAttempt((count) => count + 1);
        }}
      >
        <Suspense fallback={<Text role="status">Loading specimen…</Text>}>
          {/* The specimen is looked up among module-level lazy components, not created here. */}
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Component />
        </Suspense>
      </LoadBoundary>
    </Preview>
  );
}
