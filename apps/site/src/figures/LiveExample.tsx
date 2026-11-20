import { Suspense, use, useRef, useState, type ReactNode } from 'react';
import { Disclosure, Column, Text } from '@envsemble/envui';
import { HighlightedCodeBlock } from '@envsemble/envui/code';
import type { DeviceKind, StageFill } from '../documentation/DocumentationTypes';
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
import { partKey } from '../documentation/PartKeys';

function Source({ page, name }: { page: string; name: string }) {
  const source = use(exampleSource(page, name));
  return (
    <HighlightedCodeBlock
      language="tsx"
      label={`${name}.tsx`}
      copyable
      className="site-example-source"
    >
      {source.replace(/\n$/, '')}
    </HighlightedCodeBlock>
  );
}

export function ExampleSource({ page, name }: { page: string; name: string }) {
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

export function ExampleCode({ page, name }: { page: string; name: string }) {
  const [open, setOpen] = useState(false);
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

export function ExampleRender({
  page,
  name,
  fallback,
}: {
  page: string;
  name: string;
  fallback?: ReactNode;
}) {
  const [, setAttempt] = useState(0);
  const place = useRef<HTMLDivElement>(null);
  const shown = useSubjectShown(fallback === undefined ? place : undefined);
  const skeleton =
    fallback === undefined ? (
      <StageSkeleton ref={place} part={partKey('example', page, name)} what="examples" />
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
        <HoldPlaceholder part={partKey('example', page, name)}>
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Example />
        </HoldPlaceholder>
      </Suspense>
    </LoadBoundary>
  );
}

export type Presentation =
  | { kind: 'widths'; widths: number[] }
  | { kind: 'sweep'; widths: number[]; classes?: boolean; fit?: boolean }
  | { kind: 'open'; live?: boolean }
  | { kind: 'motion'; device?: DeviceKind }
  | { kind: 'device'; device: DeviceKind };

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
  presentation?: Presentation;
  stage?: StageFill;
  code?: boolean;
}) {
  useBrowserStandIns();
  const still = presentation?.kind === 'open' && !presentation.live;
  const device = presentation?.kind === 'device' ? presentation.device : undefined;
  const render =
    presentation?.kind === 'open' ? (
      <OpenExample name={name} live={presentation.live ?? false} part={partKey('open', page, name)}>
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
