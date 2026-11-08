import { Suspense, use, useState, type MouseEvent, type ReactNode } from 'react';
import { Disclosure, Column, Text, Theme, useTheme } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
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
import { MotionStage } from '../motion/MotionStage';
import { WidthSweep } from '../motion/WidthSweep';
import { WidthBox } from '../fit/WidthFit';
import { ExamplePlayback } from './Specimen';
import { StillMark } from './StillMark';

/**
 * Links in an example keep their semantics without navigating away from the documentation. A link
 * to a part of the page, such as a table of contents' link to its section, stays on it and works.
 */
function preventNavigation(event: MouseEvent<HTMLDivElement>) {
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!link) return;
  const href = link.getAttribute('href') ?? '';
  if (href.length > 1 && href.startsWith('#') && document.getElementById(href.slice(1))) return;
  event.preventDefault();
}

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
  fallback = <StageSkeleton part={`example:${page}/${name}`} what="examples" />,
}: {
  page: string;
  name: string;
  /**
   * What shows while the file loads: a skeleton at the example's size in its place on the stage.
   * A tile's picture shows nothing, as its whole stage is a skeleton meanwhile (TileStage.tsx).
   */
  fallback?: ReactNode;
}) {
  // A retry renders the example afresh from its file loaded again, and leaves its code as it is.
  const [, setAttempt] = useState(0);
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
      <Suspense fallback={fallback}>
        <HoldPlaceholder part={`example:${page}/${name}`}>
          {/* The example is looked up among the registry's lazy components, not created here. */}
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Example />
        </HoldPlaceholder>
      </Suspense>
    </LoadBoundary>
  );
}

/** The handlers that keep an example's links from leaving the documentation. */
export const keepLinksInPlace = {
  onClickCapture: preventNavigation,
  onAuxClickCapture: preventNavigation,
};

/**
 * An example rendered live in the documentation's theme, on the recessed canvas, with its source
 * and a copy button; with `widths`, in a frame of each width, one to a row, or with `sweep`, in
 * one frame whose width sweeps between them (`classes` names their window classes, `fit` draws it
 * smaller where it must to reach the widest), and with `caption`, a sentence below it. With
 * `motion`, the stage plays it: its animated specimen of the same name, which uses the example as a
 * person would, takes the stage's place, above its caption and code. With `open` and `live`, as an
 * overview's, it rests with its overlay open, and people can use it; without `live`, it is a still
 * picture, marked as one. Without `code`, as the figure at the top of a Docs page's Usage (UsageFigure), whose
 * code follows it, it shows no code of its own. With `device`, it shows on a phone's or a window's
 * screen at the device's real width, filling it, the device drawn to fit the stage (DeviceFrame),
 * an animated one too: its stage puts the device around what it plays.
 */
export function LiveExample({
  page,
  name,
  title,
  caption,
  widths,
  sweep = false,
  classes = false,
  fit = false,
  open = false,
  live = false,
  stage,
  motion = false,
  code = true,
  device,
}: {
  page: string;
  name: string;
  title: string;
  caption?: string;
  widths?: number[];
  /** Whether the example is shown in one frame whose width sweeps between `widths`. */
  sweep?: boolean;
  /** Whether that frame's ruler names its window class too. */
  classes?: boolean;
  /** Whether that frame is drawn smaller where it must to reach its widest width. */
  fit?: boolean;
  /** Whether the example's overlays are shown open, as a picture. */
  open?: boolean;
  /** Whether, shown open, it is live rather than a picture, as a page's overview is. */
  live?: boolean;
  /** The stage's fill, where the page's would hide the subject. */
  stage?: StageFill;
  /** Whether its animated specimen plays it in place of the live stage. */
  motion?: boolean;
  /** Whether its code shows under it, in a disclosure. */
  code?: boolean;
  /** The device it shows on, at the device's real width. */
  device?: DeviceKind;
}) {
  const theme = useTheme();
  const render = open ? (
    <OpenExample name={name} live={live} part={`open:${page}/${name}`}>
      <ExampleRender page={page} name={name} />
    </OpenExample>
  ) : (
    <ExampleRender page={page} name={name} />
  );
  return (
    <Column gap={3} className="site-live-example-entry">
      {motion ? (
        <FigureDevice value={device}>
          <ExamplePlayback page={page} name={name} />
        </FigureDevice>
      ) : widths && sweep ? (
        // On the page's own theme: a theme boundary around it would paint over the page.
        <div
          role="group"
          aria-label={`${title} example, its width changing`}
          data-example={name}
          {...keepLinksInPlace}
        >
          <MotionStage label="the example's width changing" stage={stage}>
            <WidthSweep widths={widths} classes={classes} fit={fit} crop>
              {render}
            </WidthSweep>
          </MotionStage>
        </div>
      ) : widths ? (
        <div
          role="group"
          aria-label={`${title} example`}
          className="catalogue-width-strip"
          data-example={name}
          {...keepLinksInPlace}
        >
          {widths.map((width) => (
            <figure key={width} className="catalogue-width-frame">
              <Column
                render={<Theme {...theme} />}
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
          render={<Theme {...theme} />}
          container="env-window"
          gap={0}
          role="group"
          aria-label={
            open && !live ? `${title} example, shown open as a picture` : `${title} example`
          }
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
      {open && !live && !motion && <StillMark />}
      {caption && (
        <Text className="site-figure-caption" emphasis="muted">
          {caption}
        </Text>
      )}
      {code && <ExampleCode page={page} name={name} />}
    </Column>
  );
}
