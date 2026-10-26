import {
  createContext,
  lazy,
  Suspense,
  use,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Disclosure, Column, Text, Theme, useTheme } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import type { StageFill } from '../DocumentationTypes';
import { LoadBoundary, loadModule, reloadModule } from './LoadBoundary';
import { OpenExample } from './OpenExample';
import { InteractiveMark } from './InteractiveMark';
import { Loading } from './Loading';

/**
 * Every example file, rendered live, and its source as text, each loaded with the page that shows
 * it. An example is apps/site/src/examples/<page>/<Name>.tsx with a default-exported
 * component; the page's Markdown names it in an empty ```tsx example=Name``` fence.
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
    <CodeBlock language="tsx" label={`${name}.tsx`} copyable className="docs-example-source">
      {source.replace(/\n$/, '')}
    </CodeBlock>
  );
}

/**
 * Where the open code of a figure that sits in a narrower cell, beside another figure or beside
 * text, is shown: a slot across the whole content column below the cells, so code never scrolls
 * sideways in a cell. Without a slot, the code opens in its own disclosure.
 */
export const CodeSlot = createContext<HTMLElement | null>(null);

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
      <Suspense fallback={<Loading what="code" />}>
        <Source path={path} name={name} />
      </Suspense>
    </LoadBoundary>
  );
}

/** An example's source in a Code disclosure, with a copy button; a template preview shows it too. */
export function ExampleCode({ page, name }: { page: string; name: string }) {
  const slot = useContext(CodeSlot);
  const [open, setOpen] = useState(false);
  const code = <ExampleSource page={page} name={name} />;
  const title = (
    <>
      Code<span className="docs-visually-hidden">, {name}.tsx</span>
    </>
  );
  if (!slot)
    return (
      <Disclosure title={title} className="docs-live-example-code">
        {code}
      </Disclosure>
    );
  return (
    <>
      <Disclosure
        title={title}
        open={open}
        onOpenChange={setOpen}
        className="docs-live-example-code"
        data-slotted=""
      />
      {open &&
        createPortal(
          <section className="docs-code-panel" aria-label={`Code, ${name}.tsx`}>
            {code}
          </section>,
          slot,
        )}
    </>
  );
}

/**
 * An example file rendered live, loaded with the page and loaded again on a retry: the body of a
 * live example and of each figure of a page.
 */
export function ExampleRender({
  page,
  name,
  fallback = <Loading what="example" />,
}: {
  page: string;
  name: string;
  /** What shows while the file loads; a tile's tiny preview shows nothing. */
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
        {/* The example is looked up among module-level lazy components, not created here. */}
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Example />
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
 * is scaled rather than resized. A frame that would need to be smaller still keeps its size, and
 * the stage scrolls, as on a phone.
 */
function WidthBox({ width, children }: { width: number; children: ReactNode }) {
  const fit = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scaled, setScaled] = useState<{ scale: number; width: number; height: number }>();
  useLayoutEffect(() => {
    const frame = box.current;
    const stage = fit.current?.parentElement;
    if (!frame || !stage || typeof ResizeObserver === 'undefined') return;
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
    return () => {
      cancelAnimationFrame(frameRequest);
      observer.disconnect();
    };
  }, []);
  return (
    <div
      ref={fit}
      className="docs-width-fit"
      data-scaled={scaled ? '' : undefined}
      style={scaled && { inlineSize: scaled.width, blockSize: scaled.height }}
    >
      <div
        ref={box}
        className="docs-width-box"
        style={{ inlineSize: `${width}rem`, transform: scaled && `scale(${scaled.scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * An example rendered live in the documentation's theme, on the recessed canvas, with its source
 * and a copy button; with `widths`, in a frame of each width, one to a row, and with `caption`, a
 * sentence below it.
 */
export function LiveExample({
  page,
  name,
  title,
  caption,
  widths,
  open = false,
  stage,
}: {
  page: string;
  name: string;
  title: string;
  caption?: string;
  widths?: number[];
  /** Whether the example's overlays are shown open, as a picture. */
  open?: boolean;
  /** The stage's fill, where the page's would hide the subject. */
  stage?: StageFill;
}) {
  const theme = useTheme();
  const render = open ? (
    <OpenExample name={name}>
      <ExampleRender page={page} name={name} />
    </OpenExample>
  ) : (
    <ExampleRender page={page} name={name} />
  );
  return (
    <Column gap={3} className="docs-live-example-entry">
      {widths ? (
        <div
          role="group"
          aria-label={`${title} example`}
          className="docs-width-strip"
          data-example={name}
          {...keepLinksInPlace}
        >
          {widths.map((width) => (
            <figure key={width} className="docs-width-frame">
              {/* The stage scrolls where the frame is wider than the page, so the keyboard can
                  scroll it too. */}
              <Column
                render={<Theme {...theme} />}
                container="env-window"
                gap={0}
                className="docs-live-example"
                data-stage={stage}
                tabIndex={0}
                aria-label={`${width} rem wide`}
                role="group"
              >
                <WidthBox width={width}>{render}</WidthBox>
                <InteractiveMark enabled={!open} />
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
          aria-label={open ? `${title} example, shown open as a picture` : `${title} example`}
          className="docs-live-example"
          data-example={name}
          data-stage={stage}
          {...keepLinksInPlace}
        >
          {render}
          <InteractiveMark enabled={!open} />
        </Column>
      )}
      {caption && (
        <Text className="docs-figure-caption" emphasis="muted">
          {caption}
        </Text>
      )}
      <ExampleCode page={page} name={name} />
    </Column>
  );
}
