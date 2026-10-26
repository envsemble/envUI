import { lazy, Suspense, useState, type ComponentType } from 'react';
import { SpecimenHeadingLevel, SpecimenStage } from '../previews/Example';
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

const specimenPath = (page: string, name: string) => `../specimens/${page}/${name}.tsx`;

/**
 * A page's specimen file rendered, loaded with the page and loaded again on a retry: the body of a
 * placed specimen, and of an example's figure that plays it (`motion`), whose specimen is named
 * after it.
 */
export function SpecimenRender({ page, name }: { page: string; name: string }) {
  const [, setAttempt] = useState(0);
  const path = specimenPath(page, name);
  const Component = specimens.get(path);
  if (!Component) throw new Error(`No specimen apps/site/src/specimens/${page}/${name}.tsx`);
  return (
    <LoadBoundary
      what="specimen"
      modules={[`src/specimens/${page}/${name}.tsx`]}
      onRetry={() => {
        // A failed load stays failed in its lazy component; the retry makes a new one.
        specimens.set(path, lazy(loadModule(reloadModule(loaders[path], path, import.meta.url))));
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={<Loading what="specimen" />}>
        {/* The specimen is looked up among module-level lazy components, not created here. */}
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Component />
      </Suspense>
    </LoadBoundary>
  );
}

/** A page's specimen; `headingLevel` is the level of its title, 3 inside a section of a page. */
export function Specimen({
  page,
  name,
  headingLevel = 2,
}: {
  page: string;
  name: string;
  headingLevel?: 2 | 3;
}) {
  return (
    <SpecimenHeadingLevel value={headingLevel}>
      <Preview specimen={name}>
        <SpecimenStage value>
          <SpecimenRender page={page} name={name} />
        </SpecimenStage>
      </Preview>
    </SpecimenHeadingLevel>
  );
}
