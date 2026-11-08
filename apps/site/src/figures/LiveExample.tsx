import {
  lazy,
  Suspense,
  use,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Disclosure, Column, Text, Theme, useTheme } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import type { DeviceKind, StageFill } from '../shared/DocumentationTypes';
import { FigureDevice, OnDevice } from './DeviceFrame';
import { LoadBoundary, loadModule, reloadModule } from '../loading/LoadBoundary';
import { OpenExample } from './OpenExample';
import { CodeSkeleton, exampleLines, HoldPlaceholder, StageSkeleton } from '../loading/Loading';
import { MotionStage } from '../motion/MotionStage';
import { WidthSweep } from '../motion/WidthSweep';
import { SpecimenRender } from './Specimen';
import { StillMark } from './StillMark';

/**
 * Every example file, rendered live, and its source as text, each loaded with the page that shows
 * it. An example is apps/site/src/examples/<page>/<Name>.tsx with a default-exported
 * component; the page's Markdown places it by name in an empty ```tsx figure=Name``` fence.
 */
const loaders = import.meta.glob<{ default: ComponentType }>('../examples/*/*.tsx');
const sourceLoaders = import.meta.glob<string>('../examples/*/*.tsx', {
  query: '?raw',
  import: 'default',
});
const examples = new Map(
  Object.entries(loaders).map(([path, load]) => [path, lazy(loadModule(load))]),
);
const sources = new Map<string, Promise<string>>();
/** How each source loads: from its loader, or once it failed, from reloadModule. */
const sourceLoads = new Map<string, () => Promise<string>>();

export const examplePath = (page: string, name: string) => `../examples/${page}/${name}.tsx`;

/** Whether a page has an example file of the name, such as one a gallery picks for its tile. */
export const hasExample = (page: string, name: string) => examples.has(examplePath(page, name));

/**
 * The source of an example, loaded once and kept for every later render. A load that fails is kept
 * too, so renders until a retry read the same rejected promise rather than a new one each time,
 * which React would take for a promise it was never given; forgetSource drops it.
 */
function sourceOf(path: string) {
  let source = sources.get(path);
  if (!source) {
    source = loadModule(sourceLoads.get(path) ?? sourceLoaders[path])();
    sources.set(path, source);
  }
  return source;
}

/** Drops an example whose file failed to load, so that its next render loads it again. */
function forgetExample(path: string) {
  examples.set(path, lazy(loadModule(reloadModule(loaders[path], path, import.meta.url))));
}

/** Drops the source of an example that failed to load, so that its next render loads it again. */
function forgetSource(path: string) {
  sources.delete(path);
  sourceLoads.set(
    path,
    reloadModule(sourceLoaders[path], path, import.meta.url, {
      query: 'raw',
      pick: (module) => (module as { default: string }).default,
    }),
  );
}

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

function Source({ path, name }: { path: string; name: string }) {
  const source = use(sourceOf(path));
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
  const path = examplePath(page, name);
  return (
    <LoadBoundary
      what="code"
      modules={[`src/examples/${page}/${name}.tsx?raw`]}
      onRetry={() => {
        forgetSource(path);
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense
        fallback={
          <CodeSkeleton label={`${name}.tsx`} lines={exampleLines(`${page}/${name}`) ?? 1} />
        }
      >
        <Source path={path} name={name} />
      </Suspense>
    </LoadBoundary>
  );
}

/**
 * An example's source in a disclosure right under its figure, Show code until it opens and Hide code
 * while it is, with a copy button once open; a template preview shows it too.
 */
export function ExampleCode({ page, name }: { page: string; name: string }) {
  const [open, setOpen] = useState(false);
  // The code renders once its disclosure first opens, not with the page: a page has many figures,
  // and each one's file and highlighting would load with it. A pointer over the summary starts
  // loading the file.
  const [opened, setOpened] = useState(false);
  const preload = () => void sourceOf(examplePath(page, name)).catch(() => {});
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
  const path = examplePath(page, name);
  const Example = examples.get(path);
  if (!Example || !sourceLoaders[path])
    throw new Error(`No example file apps/site/src/examples/${page}/${name}.tsx`);
  return (
    <LoadBoundary
      what="example"
      modules={[`src/examples/${page}/${name}.tsx`]}
      onRetry={() => {
        forgetExample(path);
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={fallback}>
        <HoldPlaceholder part={`example:${page}/${name}`}>
          {/* The example is looked up among module-level lazy components, not created here. */}
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

/** The least a width frame is drawn at to fit its stage; one that would need less scrolls. */
export const leastFitScale = 0.7;

/**
 * A frame of a given width for an example, drawn smaller where its stage is narrower than the
 * frame and its outline, down to `leastFitScale`, so the frames of an Adapting to width figure fit
 * a column beside the page's contents; the example still lays out at the frame's own width, as it
 * is scaled rather than resized. A frame that would need to be smaller still keeps its size, as on
 * a phone: it scrolls across the stage, seen from its start, and fades out at an edge where it runs
 * on past it, as a cropped sweep or device does, rather than ending in a slice through its words.
 */
function WidthBox({ width, children }: { width: number; children: ReactNode }) {
  const fit = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scaled, setScaled] = useState<{ scale: number; width: number; height: number }>();
  /** Whether the frame is wider than its stage even at `leastFitScale`, and scrolls across it. */
  const [cropped, setCropped] = useState(false);
  useLayoutEffect(() => {
    const frame = box.current;
    const place = fit.current;
    const stage = place?.parentElement;
    if (!frame || !place || !stage || typeof ResizeObserver === 'undefined') return;
    /** Marks the edges where the frame runs on past its place, which fade out. */
    const markCuts = () => {
      const most = place.scrollWidth - place.clientWidth;
      // From the start, whichever way the text runs: scrollLeft counts down from 0 right to left.
      const along = Math.abs(place.scrollLeft);
      const cut = [along > 0.5 && 'start', most - along > 0.5 && 'end'].filter(Boolean).join(' ');
      if ((place.dataset.cut ?? '') !== cut) {
        if (cut) place.dataset.cut = cut;
        else delete place.dataset.cut;
      }
    };
    const measure = () => {
      const style = getComputedStyle(stage);
      const room =
        stage.clientWidth -
        parseFloat(style.paddingInlineStart) -
        parseFloat(style.paddingInlineEnd);
      // The outline beside the frame, at its offset, needs room on both sides too.
      const outline = getComputedStyle(frame);
      const edge = parseFloat(outline.outlineOffset) + parseFloat(outline.outlineWidth);
      const scale = room / (frame.offsetWidth + 2 * edge);
      const next =
        scale < 1 && scale >= leastFitScale
          ? { scale, width: frame.offsetWidth * scale, height: frame.offsetHeight * scale }
          : undefined;
      setCropped(scale < leastFitScale);
      markCuts();
      // Unchanged sizes keep the state, so the stage, which grows with the frame, settles.
      setScaled((current) =>
        current &&
        next &&
        Math.abs(current.width - next.width) < 0.5 &&
        Math.abs(current.height - next.height) < 0.5
          ? current
          : next,
      );
    };
    // Measured in the next frame, as resizing the frame's place resizes the stage it observes.
    let frameRequest = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frameRequest);
      frameRequest = requestAnimationFrame(measure);
    });
    observer.observe(stage);
    observer.observe(frame);
    // Its place too, which takes the stage's width once the frame is cropped.
    observer.observe(place);
    place.addEventListener('scroll', markCuts, { passive: true });
    return () => {
      cancelAnimationFrame(frameRequest);
      observer.disconnect();
      place.removeEventListener('scroll', markCuts);
    };
  }, []);
  return (
    <div
      ref={fit}
      className="catalogue-width-fit"
      data-scaled={scaled ? '' : undefined}
      data-cropped={cropped ? '' : undefined}
      // Cropped, it scrolls across the stage, so the keyboard can scroll it too.
      tabIndex={cropped ? 0 : undefined}
      style={scaled && { inlineSize: scaled.width, blockSize: scaled.height }}
    >
      <div
        ref={box}
        className="catalogue-width-box"
        style={{ inlineSize: `${width}rem`, transform: scaled && `scale(${scaled.scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * An example rendered live in the documentation's theme, on the recessed canvas, with its source
 * and a copy button; with `widths`, in a frame of each width, one to a row, or with `sweep`, in
 * one frame whose width sweeps between them (`classes` names their window classes, `fit` draws it
 * smaller where it must to reach the widest), and with `caption`, a sentence below it. With
 * `motion`, the stage plays it: its animated specimen of the same name, which uses the example as a
 * person would, takes the stage's place, above its caption and code. With `open` and `live`, as an
 * overview's, it rests with its overlay open, and people can use it; without `live`, it is a still
 * picture, marked as one. Without `code`, as the preview at the top of a Docs page's Usage, whose
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
          <SpecimenRender page={page} name={name} />
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
