import { Suspense, use, useRef, useState, type ComponentType } from 'react';
import { Column } from '@envsemble/envui';
import { SpecimenHeadingLevel } from './SpecimenFrame';
import { hasExample } from './ExampleRegistry';
import { keepLinksInPlace } from './KeepLinksInPlace';
import { LoadBoundary } from '../loading/LoadBoundary';
import { componentRegistry } from '../loading/ModuleRegistry';
import { HoldPlaceholder } from '../loading/LoadingStore';
import { StageSkeleton } from '../loading/Skeletons';
import { useSubjectShown } from './useSubjectShown';
import { VerdictMotion } from './MotionStage';
import { PageTheme } from './PageTheme';
import { partKey } from '../documentation/PartKeys';

const specimens = componentRegistry(
  import.meta.glob<{ default: ComponentType }>('/src/specimens/*/*.tsx'),
);

const specimenPath = (page: string, name: string) => `/src/specimens/${page}/${name}.tsx`;

export const preloadSpecimen = (page: string, name: string) =>
  specimens.preload(specimenPath(page, name));

function SpecimenBody({
  page,
  name,
  onStage = false,
}: {
  page: string;
  name: string;
  onStage?: boolean;
}) {
  const [, setAttempt] = useState(0);
  const verdict = use(VerdictMotion);
  const path = specimenPath(page, name);
  const place = useRef<HTMLDivElement>(null);
  const skeleton = (
    <StageSkeleton
      ref={place}
      part={partKey('specimen', page, name)}
      what="specimens"
      stage={!onStage}
      className={verdict ? 'site-verdict-stage' : undefined}
    />
  );
  if (!useSubjectShown(place)) return skeleton;
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
      <Suspense fallback={skeleton}>
        <HoldPlaceholder part={partKey('specimen', page, name)}>
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Component />
        </HoldPlaceholder>
      </Suspense>
    </LoadBoundary>
  );
}

export function ExamplePlayback({
  page,
  name,
  onStage = false,
}: {
  page: string;
  name: string;
  onStage?: boolean;
}) {
  const example = `apps/site/src/examples/${page}/${name}.tsx`;
  const playback = `apps/site/src/specimens/${page}/${name}.tsx`;
  if (!specimens.has(specimenPath(page, name)))
    throw new Error(`The example ${example} plays in its figure, but there is no ${playback}`);
  if (!hasExample(page, name))
    throw new Error(
      `${playback} plays the example ${example}, which is missing: rename them together`,
    );
  return <SpecimenBody page={page} name={name} onStage={onStage} />;
}

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
      <Column
        render={<PageTheme />}
        gap={0}
        className="catalogue-specimen-area"
        data-catalogue-specimen={name}
        {...keepLinksInPlace}
      >
        <SpecimenBody page={page} name={name} />
      </Column>
    </SpecimenHeadingLevel>
  );
}
