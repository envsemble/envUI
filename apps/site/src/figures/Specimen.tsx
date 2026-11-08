import { Suspense, use, useState, type ComponentType } from 'react';
import { SpecimenHeadingLevel } from './Example';
import { SpecimenArea } from './SpecimenArea';
import { LoadBoundary } from '../loading/LoadBoundary';
import { moduleRegistry } from '../loading/ModuleRegistry';
import { HoldPlaceholder, StageSkeleton } from '../loading/Loading';
import { VerdictMotion } from '../motion/MotionStage';

/**
 * Catalogue-only specimens: visual references that are not usage examples, such as a matrix of
 * every variant or forced interaction states. A page places one with `<!-- specimen: Name -->`;
 * the packaged Markdown leaves it out. Each loads with the page that shows it.
 */
const specimens = moduleRegistry(
  import.meta.glob<{ default: ComponentType }>('/src/specimens/*/*.tsx'),
);

const specimenPath = (page: string, name: string) => `/src/specimens/${page}/${name}.tsx`;

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
  // On a do or don't figure, the stage it stands for is the figure's cell.
  const verdict = use(VerdictMotion);
  const path = specimenPath(page, name);
  const Component = specimens.component(path);
  return (
    <LoadBoundary
      what="specimen"
      modules={[specimens.module(path)]}
      onRetry={() => {
        specimens.retry(path);
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense
        fallback={
          <StageSkeleton
            part={`specimen:${page}/${name}`}
            what="specimens"
            stage={!onStage}
            className={verdict ? 'site-verdict-stage' : undefined}
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
