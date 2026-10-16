import { lazy, Suspense, type ComponentType } from 'react';
import { Text } from '@envsemble/envui';
import { Preview } from '../previews/Preview';

/**
 * Catalogue-only specimens: visual references that are not usage examples, such as a matrix of
 * every variant or forced interaction states. A page places one with `<!-- specimen: Name -->`;
 * the packaged Markdown leaves it out. Each loads with the page that shows it.
 */
const loaders = import.meta.glob<{ default: ComponentType }>('../specimens/*/*.tsx');
const specimens = new Map(Object.entries(loaders).map(([path, load]) => [path, lazy(load)]));

export function Specimen({ page, name }: { page: string; name: string }) {
  const Component = specimens.get(`../specimens/${page}/${name}.tsx`);
  if (!Component) throw new Error(`No specimen apps/catalogue/src/specimens/${page}/${name}.tsx`);
  return (
    <Preview>
      <Suspense fallback={<Text role="status">Loading specimen…</Text>}>
        {/* The specimen is looked up among module-level lazy components, not created here. */}
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Component />
      </Suspense>
    </Preview>
  );
}
