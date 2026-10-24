import { lazy, Suspense, useState, type ComponentType } from 'react';
import { SpecimenHeadingLevel } from '../previews/Example';
import { Preview } from '../previews/Preview';
import { LoadBoundary, loadModule, reloadModule } from './LoadBoundary';
import { Loading } from './Loading';

/**
 * Catalogue-only specimens: visual references that are not usage examples, such as a matrix of
 * every variant or forced interaction states. A page places one with `<!-- specimen: Name -->`;
 * the packaged Markdown leaves it out. Each loads with the page that shows it.
 */
const loaders = import.meta.glob<{ default: ComponentType }>('../specimens/*/*.tsx');
const specimens = new Map(
  Object.entries(loaders).map(([path, load]) => [path, lazy(loadModule(load))]),
);

/** A page's specimen; `headingLevel` is the level of its title, 3 inside a section of a page on the figure template. */
export function Specimen({
  page,
  name,
  headingLevel = 2,
}: {
  page: string;
  name: string;
  headingLevel?: 2 | 3;
}) {
  const [, setAttempt] = useState(0);
  const path = `../specimens/${page}/${name}.tsx`;
  const Component = specimens.get(path);
  if (!Component) throw new Error(`No specimen apps/catalogue/src/specimens/${page}/${name}.tsx`);
  return (
    <SpecimenHeadingLevel value={headingLevel}>
      <Preview specimen={name}>
        <LoadBoundary
          what="specimen"
          modules={[`src/specimens/${page}/${name}.tsx`]}
          onRetry={() => {
            // A failed load stays failed in its lazy component; the retry makes a new one.
            specimens.set(
              path,
              lazy(loadModule(reloadModule(loaders[path], path, import.meta.url))),
            );
            setAttempt((count) => count + 1);
          }}
        >
          <Suspense fallback={<Loading what="specimen" />}>
            {/* The specimen is looked up among module-level lazy components, not created here. */}
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Component />
          </Suspense>
        </LoadBoundary>
      </Preview>
    </SpecimenHeadingLevel>
  );
}
