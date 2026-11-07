import { lazy, Suspense, use, useState, type ComponentType } from 'react';
import { SpecimenHeadingLevel } from './Example';
import { SpecimenArea } from './SpecimenArea';
import { LoadBoundary, loadModule, reloadModule } from '../template/LoadBoundary';
import { HoldPlaceholder, StageSkeleton } from '../template/Loading';
import { VerdictMotion } from '../motion/MotionStage';

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
 * after it. Until it loads, a skeleton at its size holds its place: a stage of its own, unless
 * it shows on a stage of the figure's (`onStage`), as on an anatomy figure.
 */
export function SpecimenRender({
  page,
  name,
  onStage = false,
}: {
  page: string;
  name: string;
  onStage?: boolean;
}) {
  const [, setAttempt] = useState(0);
  // On a do or don't figure, the stage it stands for is the figure's, joined to its bar.
  const verdict = use(VerdictMotion);
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
      <Suspense
        fallback={
          <StageSkeleton
            part={`specimen:${page}/${name}`}
            what="specimens"
            stage={!onStage}
            className={verdict ? 'site-verdict-stage env-connected-row' : undefined}
          />
        }
      >
        <HoldPlaceholder part={`specimen:${page}/${name}`}>
          {/* The specimen is looked up among module-level lazy components, not created here. */}
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Component />
        </HoldPlaceholder>
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
      <SpecimenArea specimen={name}>
        <SpecimenRender page={page} name={name} />
      </SpecimenArea>
    </SpecimenHeadingLevel>
  );
}
