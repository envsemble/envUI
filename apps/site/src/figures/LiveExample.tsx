import { Suspense, use, useRef, useState, type ReactNode } from 'react';
import { Disclosure, Column, Text } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/code';
import type { DeviceKind, StageFill } from '@docs-model/DocumentationTypes';
import { FigureDevice, OnDevice } from './DeviceFrame';
import { LoadBoundary } from '../loading/LoadBoundary';
import {
  exampleComponent,
  exampleModule,
  exampleSource,
  retryExample,
  retrySource,
} from './ExampleRegistry';
import { OpenExample } from './OpenExample';
import { CodeSkeleton, StageSkeleton } from '../loading/Skeletons';
import { exampleLines } from '../loading/RecordedSizes';
import { HoldPlaceholder } from '../loading/LoadingStore';
import { useSubjectShown } from './useSubjectShown';
import { MotionStage } from './MotionStage';
import { WidthSweep } from '../motion/WidthSweep';
import { WidthBox } from '../fit/standalone/WidthFit';
import { ExamplePlayback } from './Specimen';
import { StillMark } from './StillMark';
import { useBrowserStandIns } from '../motion/BrowserStandIns';
import { PageTheme } from './PageTheme';
import { keepLinksInPlace } from './KeepLinksInPlace';

function Source({ page, name }: { page: string; name: string }) {
  const source = use(exampleSource(page, name));
  return (
    <CodeBlock language="tsx" label={`${name}.tsx`} copyable className="site-example-source">
      {source.replace(/\n$/, '')}
    </CodeBlock>
  );
}

/**
 * An example's source as an open code block with a copy button, loaded with the page that shows it:
 * the code of a page's guide in the Docs, which shows an example file as code.
 */
export function ExampleSource({ page, name }: { page: string; name: string }) {
  // A retry renders the code afresh from its file loaded again.
  const [, setAttempt] = useState(0);
  return (
    <LoadBoundary
      what="code"
      modules={[`${exampleModule(page, name)}?raw`]}
      onRetry={() => {
        retrySource(page, name);
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense
        fallback={
          <CodeSkeleton label={`${name}.tsx`} lines={exampleLines(`${page}/${name}`) ?? 1} />
        }
      >
        <Source page={page} name={name} />
      </Suspense>
    </LoadBoundary>
  );
}

/**
 * An example's source in a disclosure right under its figure, Show code until it opens and Hide code
 * while it is, with a copy button once open; a template page's screen shows it too.
 */
export function ExampleCode({ page, name }: { page: string; name: string }) {
  const [open, setOpen] = useState(false);
  // The code renders once its disclosure first opens, not with the page: a page has many figures,
  // and each one's file and highlighting would load with it. A pointer over the summary starts
  // loading the file.
  const [opened, setOpened] = useState(false);
  const preload = () => void exampleSource(page, name).catch(() => {});
  return (
    <Disclosure
      title={
        <>
          {open ? 'Hide code' : 'Show code'}
          <span className="site-visually-hidden">, {name}.tsx</span>
        </>
      }
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setOpened(true);
      }}
      onPointerEnter={preload}
      className="site-live-example-code"
    >
      {opened && (
        <section aria-label={`Code, ${name}.tsx`}>
          <ExampleSource page={page} name={name} />
        </section>
      )}
    </Disclosure>
  );
}

/**
 * An example file rendered live, loaded with the page and loaded again on a retry: the body of a
 * live example and of each figure of a page.
 */
export function ExampleRender({
  page,
  name,
  fallback,
}: {
  page: string;
  name: string;
  /**
   * What shows while the file loads: by default a skeleton at the example's size in its place on
   * the stage. A tile's picture shows nothing, as its whole stage is a skeleton meanwhile
   * (TileStage.tsx).
   */
  fallback?: ReactNode;
}) {
  // A retry renders the example afresh from its file loaded again, and leaves its code as it is.
  const [, setAttempt] = useState(0);
  const place = useRef<HTMLDivElement>(null);
  // On a pre-rendered page, the example's place is held until it renders (useSubjectShown).
  const shown = useSubjectShown(fallback === undefined ? place : undefined);
  const skeleton =
    fallback === undefined ? (
      <StageSkeleton ref={place} part={`example:${page}/${name}`} what="examples" />
    ) : (
      fallback
    );
  if (!shown) return skeleton;
  const Example = exampleComponent(page, name);
  return (
    <LoadBoundary
      what="example"
      modules={[exampleModule(page, name)]}
      onRetry={() => {
        retryExample(page, name);
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={skeleton}>
        <HoldPlaceholder part={`example:${page}/${name}`}>
          {/* The example is looked up among the registry's lazy components, not created here. */}
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Example />
        </HoldPlaceholder>
      </Suspense>
    </LoadBoundary>
  );
}

/**
 * How a live example is shown, as its fence's `figure=` attributes say (validation/Figures.ts);
 * without one, live in one window of the column's width.
 */
export type Presentation =
  /** In a frame of each width, in rem, one to a row (`widths`). */
  | { kind: 'widths'; widths: number[] }
  /**
   * In one frame whose width sweeps between the widths and back (`sweep`), its ruler naming their
   * window classes too (`classes`), drawn smaller where it must to reach the widest (`fit`).
   */
  | { kind: 'sweep'; widths: number[]; classes?: boolean; fit?: boolean }
  /**
   * Resting with its overlays open (`open`): a still picture, marked as one, or `live`, to use, as
   * an overview's is.
   */
  | { kind: 'open'; live?: boolean }
  /**
   * Played by its stage (`motion`): its animated specimen of the same name, which uses the example
   * as a person would, in its device, where it has one.
   */
  | { kind: 'motion'; device?: DeviceKind }
  /**
   * On a phone's or a window's screen at the device's real width, filling it, the device drawn to
   * fit the stage (DeviceFrame).
   */
  | { kind: 'device'; device: DeviceKind };

/**
 * An example rendered live in the documentation's theme, on the recessed canvas, as `presentation`
 * says, with `caption`, a sentence below it, and its source and a copy button under that. Without
 * `code`, as the figure at the top of a Docs page's Usage (UsageFigure), whose code follows it, it
 * shows no code of its own.
 */
export function LiveExample({
  page,
  name,
  title,
  caption,
  presentation,
  stage,
  code = true,
}: {
  page: string;
  name: string;
  title: string;
  caption?: string;
  /** How it is shown; without one, live in one window. */
  presentation?: Presentation;
  /** The stage's fill, where the page's would hide the subject. */
  stage?: StageFill;
  /** Whether its code shows under it, in a disclosure. */
  code?: boolean;
}) {
  useBrowserStandIns();
  const still = presentation?.kind === 'open' && !presentation.live;
  const device = presentation?.kind === 'device' ? presentation.device : undefined;
  const render =
    presentation?.kind === 'open' ? (
      <OpenExample name={name} live={presentation.live ?? false} part={`open:${page}/${name}`}>
        <ExampleRender page={page} name={name} />
      </OpenExample>
    ) : (
      <ExampleRender page={page} name={name} />
    );
  return (
    <Column gap={3} className="site-live-example-entry">
      {presentation?.kind === 'motion' ? (
        <FigureDevice value={presentation.device}>
          <ExamplePlayback page={page} name={name} />
        </FigureDevice>
      ) : presentation?.kind === 'sweep' ? (
        // On the page's own theme: a theme boundary around it would paint over the page.
        <div
          role="group"
          aria-label={`${title} example, its width changing`}
          data-example={name}
          {...keepLinksInPlace}
        >
          <MotionStage label="the example's width changing" stage={stage}>
            <WidthSweep
              widths={presentation.widths}
              classes={presentation.classes ?? false}
              fit={presentation.fit ?? false}
              crop
            >
              {render}
            </WidthSweep>
          </MotionStage>
        </div>
      ) : presentation?.kind === 'widths' ? (
        <div
          role="group"
          aria-label={`${title} example`}
          className="catalogue-width-strip"
          data-example={name}
          {...keepLinksInPlace}
        >
          {presentation.widths.map((width) => (
            <figure key={width} className="catalogue-width-frame">
              <Column
                render={<PageTheme />}
                container="env-window"
                gap={0}
                className="site-live-example"
                data-stage={stage}
                aria-label={`${width} rem wide`}
                role="group"
              >
                <WidthBox width={width}>{render}</WidthBox>
              </Column>
              <Text render={<figcaption />} variant="caption" emphasis="muted">
                {width} rem wide
              </Text>
            </figure>
          ))}
        </div>
      ) : (
        <Column
          render={<PageTheme />}
          container="env-window"
          gap={0}
          role="group"
          aria-label={still ? `${title} example, shown open as a picture` : `${title} example`}
          className="site-live-example"
          data-example={name}
          data-stage={stage}
          data-device={device}
          {...keepLinksInPlace}
        >
          {device ? (
            <OnDevice kind={device} label={`${title} on a ${device}`}>
              {render}
            </OnDevice>
          ) : (
            render
          )}
        </Column>
      )}
      {still && <StillMark />}
      {caption && (
        <Text className="site-figure-caption" emphasis="muted">
          {caption}
        </Text>
      )}
      {code && <ExampleCode page={page} name={name} />}
    </Column>
  );
}
