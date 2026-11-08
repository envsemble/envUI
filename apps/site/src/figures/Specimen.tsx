import {
  Suspense,
  use,
  useContext,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Column, Text, Theme, useTheme } from '@envsemble/envui';
import { PartHeadingLevel, SpecimenHeadingLevel } from './Example';
import { hasExample } from './ExampleRegistry';
import { LoadBoundary } from '../loading/LoadBoundary';
import { moduleRegistry } from '../loading/ModuleRegistry';
import { HoldPlaceholder, StageSkeleton } from '../loading/Loading';
import { VerdictMotion } from '../motion/MotionStage';

/*
 * The catalogue's specimens, apps/site/src/specimens/<page>/<Name>.tsx, each a default-exported
 * component that loads with the page that shows it. A specimen is one of two things:
 *
 * - A picture of the catalogue's own, such as a matrix of every variant or forced interaction
 *   states, which a page places with `<!-- specimen: Name -->` (Specimen); the packaged Markdown
 *   leaves it out.
 * - An example's playback, named after the example it plays (ExamplePlayback): the figure of an
 *   example that takes `motion` plays it in the example's place, and an anatomy figure that takes
 *   `specimen` numbers its parts on it, held in a moment. It imports the example, or draws it again
 *   where it must change what the example holds, and a script plays it (apps/site/src/motion), so
 *   changing or renaming an example changes its playback too.
 */
const specimens = moduleRegistry(
  import.meta.glob<{ default: ComponentType }>('/src/specimens/*/*.tsx'),
);

const specimenPath = (page: string, name: string) => `/src/specimens/${page}/${name}.tsx`;

/**
 * A page's specimen file rendered, loaded with the page and loaded again on a retry. Until it
 * loads, a skeleton at its size holds its place: a stage of its own, unless it shows on a stage of
 * the figure's (`onStage`), as on an anatomy figure.
 */
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

/**
 * An example's playback, in its figure: the specimen named after the example. It throws for an
 * example without a playback, or a playback whose example is gone, as when the example was renamed
 * without it.
 */
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

/** Link specimens retain native link semantics without navigating away from the page. */
function preventExampleNavigation(event: MouseEvent<HTMLDivElement>) {
  if (event.target instanceof Element && event.target.closest('a[href]')) {
    event.preventDefault();
  }
}

/**
 * A specimen a page places, in an area that follows the documentation's current theme;
 * `headingLevel` is the level of its title, 3 inside a section of a page. The area names the
 * specimen, so the visual baseline can name an untitled one's image after it.
 */
export function Specimen({
  page,
  name,
  headingLevel = 2,
}: {
  page: string;
  name: string;
  headingLevel?: 2 | 3;
}) {
  const theme = useTheme();
  return (
    <SpecimenHeadingLevel value={headingLevel}>
      <Column
        render={<Theme {...theme} />}
        gap={0}
        className="catalogue-specimen-area"
        data-catalogue-specimen={name}
        onClickCapture={preventExampleNavigation}
        onAuxClickCapture={preventExampleNavigation}
      >
        <SpecimenBody page={page} name={name} />
      </Column>
    </SpecimenHeadingLevel>
  );
}

/** A titled part of a specimen, such as one state of a matrix, under a small muted label. */
export function SpecimenPart({
  title,
  children,
  caption,
}: {
  title: string;
  children: ReactNode;
  caption?: ReactNode;
}) {
  const specimenLevel = useContext(SpecimenHeadingLevel);
  const level = useContext(PartHeadingLevel) ?? ((specimenLevel + 1) as 3 | 4);
  const Heading = `h${level}` as const;
  return (
    <Column render={<section />} gap={2} className="catalogue-specimen">
      {/* A small muted label, as the state matrix names its rows, quieter than the section's heading. */}
      <Text render={<Heading />} variant="body-sm">
        {title}
      </Text>
      {children}
      {caption && <Text variant="caption">{caption}</Text>}
    </Column>
  );
}
