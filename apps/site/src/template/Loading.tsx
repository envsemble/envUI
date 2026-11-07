import {
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { motionDuration, motionEase, reducedMotion } from '../motion/MotionTokens';
import { Surface } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import sharedSizes from 'virtual:envui-part-sizes';
import sharedLines from 'virtual:envui-example-lines';

/*
 * What the site shows while a part of a page loads, such as an example, its code or a specimen,
 * as the Loading pattern asks of applications (docs/patterns/loading.md): the part's shape as an
 * envUI skeleton, in its place and at its size, so nothing moves when it lands. Each skeleton is a
 * busy region whose content assistive technology skips, and one polite status for the whole page,
 * LoadingStatus, says what is loading. A placeholder shows only once a load has taken a noticeable
 * moment, and keeps its space meanwhile, so a quick load never flashes it; once shown, it stays a
 * moment too (HoldPlaceholder), so it never flickers. What it stood for fades in as it lands.
 */

/** How long a part may take before its skeleton shows: quick loads never flash it. */
const placeholderDelay = 240;

/** How long a skeleton that shows stays at least, so it never flickers. */
const placeholderLeast = 240;

/** When each part's skeleton showed, by the part's key, while it shows. */
const shownAt = new Map<string, number>();

/** A wait for each part whose skeleton showed only a moment ago, until it has shown its least. */
const holds = new Map<string, Promise<void>>();

/**
 * Holds what a part's skeleton stands for, inside the Suspense boundary the skeleton is the
 * fallback of, until the skeleton has shown for a moment: a part that lands just after its
 * skeleton showed keeps it a little longer rather than flicker. A part whose skeleton never showed
 * renders at once.
 */
export function HoldPlaceholder({ part, children }: { part: string; children: ReactNode }) {
  const at = shownAt.get(part);
  const left = at === undefined ? 0 : at + placeholderLeast - performance.now();
  let hold = holds.get(part);
  if (!hold && at !== undefined && left <= 1) shownAt.delete(part);
  if (!hold && left > 1) {
    hold = new Promise<void>((resolve) => window.setTimeout(resolve, left)).then(() => {
      holds.delete(part);
      shownAt.delete(part);
    });
    holds.set(part, hold);
  }
  if (hold) use(hold);
  return children;
}

/**
 * Fades in what took a skeleton's place in its parent, once, as the skeleton leaves for it: the
 * parts the parent didn't hold before. In the motion tokens' time; with motion reduced, at once.
 */
function useArrival(skeleton: { current: HTMLElement | null }) {
  useLayoutEffect(() => {
    const element = skeleton.current;
    const parent = element?.parentElement;
    if (!element || !parent) return;
    return () => {
      const before = new Set(parent.children);
      // Once React has put what it stands for in its place, before the page paints.
      queueMicrotask(() => {
        if (!parent.isConnected || reducedMotion()) return;
        const easing = motionEase();
        for (const child of parent.children)
          if (!before.has(child) && !child.classList.contains('site-loading'))
            child.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: motionDuration('medium'),
              easing,
            });
      });
    };
  }, [skeleton]);
}

/** What each skeleton that shows is loading, in the order they showed, for LoadingStatus. */
let loading: readonly string[] = [];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const setLoading = (next: readonly string[]) => {
  loading = next;
  for (const listener of listeners) listener();
};

/** Whether a placeholder shows yet: once it has waited placeholderDelay. */
function useDelayPassed() {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setPassed(true), placeholderDelay);
    return () => window.clearTimeout(timer);
  }, []);
  return passed;
}

/**
 * Whether a placeholder shows yet, as useDelayPassed says. From then until it leaves, LoadingStatus
 * counts what it is loading.
 */
function usePlaceholderShown(what: string, part?: string) {
  const shown = useDelayPassed();
  useEffect(() => {
    if (!shown) return;
    if (part !== undefined) shownAt.set(part, performance.now());
    setLoading([...loading, what]);
    return () => {
      const index = loading.indexOf(what);
      setLoading(loading.filter((_, at) => at !== index));
    };
  }, [shown, what, part]);
  return shown;
}

/**
 * The page's one polite status of what is loading: "Loading example" as the first skeleton shows,
 * said once however many follow, and empty again once they have all loaded, which isn't read.
 */
export function LoadingStatus() {
  const parts = useSyncExternalStore(
    subscribe,
    () => loading,
    () => loading,
  );
  const [label, setLabel] = useState('');
  // The label is that of the first part of a run of loading ones, kept until they have all loaded.
  if (parts.length && !label) setLabel(`Loading ${parts[0]}`);
  if (!parts.length && label) setLabel('');
  return (
    <span role="status" className="site-visually-hidden">
      {label}
    </span>
  );
}

/**
 * What the build gives each page's content of the parts on it, rather than every page's to the
 * site's start (vite.config.ts): its examples' and specimens' recorded sizes and its examples'
 * lines of code. While developing, every part's is in the virtual modules instead.
 */
const pageSizes = new Map<string, readonly [number, number]>();
const pageLines = new Map<string, number>();

/** Keeps the parts' data a page's content brought, as it loads (PageContent.ts). */
export function keepPageParts(content: {
  partSizes?: Record<string, [number, number]>;
  exampleLines?: Record<string, number>;
}) {
  for (const [part, size] of Object.entries(content.partSizes ?? {})) pageSizes.set(part, size);
  for (const [example, lines] of Object.entries(content.exampleLines ?? {}))
    pageLines.set(example, lines);
}

/** A part's recorded width and height, in rem (scripts/site/RecordPartSizes.ts). */
export const recordedSize = (part: string): readonly [number, number] | undefined =>
  sharedSizes[part] ?? pageSizes.get(part);

/** The lines of an example's code, by page/Name, where they are known. */
export const exampleLines = (example: string): number | undefined =>
  sharedLines[example] ?? pageLines.get(example);

/**
 * A part of a page while it loads, as envUI's skeleton of its shape: a surface with `skeleton`,
 * whose content, the part's own components over placeholder text, shows as bars and shapes, inert
 * and skipped by assistive technology, while the surface is a busy region. Hidden until it has
 * waited a moment, it keeps its space. `.site-loading` marks it for the tests, which wait for it to
 * leave.
 */
export function PartSkeleton({
  what,
  part,
  className,
  style,
  children,
}: {
  /** What is loading, for the page's status, such as "example". */
  what: string;
  /** The part's key in PartSizes.json, which RecordPartSizes.ts reads from `data-site-part`. */
  part?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const shown = usePlaceholderShown(what, part);
  const element = useRef<HTMLDivElement>(null);
  useArrival(element);
  return (
    <Surface
      ref={element}
      skeleton
      padding={0}
      radius="none"
      className={['site-loading', className].filter(Boolean).join(' ')}
      data-shown={shown ? '' : undefined}
      data-site-part={part}
      style={style}
    >
      {children}
    </Surface>
  );
}

/**
 * A long part while it loads, such as a table of every token: a skeleton of its start, `start`, in
 * the room of the whole part, which the part's place keeps where its size was recorded, or else
 * `whole`, the whole of it laid out unseen. A skeleton pulses everything in it on every frame, so
 * a long one would hold up the page that is loading; its start shows the shape.
 */
export function LongPartSkeleton({
  what,
  start,
  whole,
}: {
  what: string;
  start: ReactNode;
  whole?: ReactNode;
}) {
  return (
    <div className="site-loading-long">
      {whole && (
        <div className="site-loading-room" aria-hidden inert>
          {whole}
        </div>
      )}
      <PartSkeleton what={what} className="site-loading-start">
        {start}
      </PartSkeleton>
    </div>
  );
}

/**
 * A figure's subject while it loads, an example, a specimen or a demo: on a stage of its own, a
 * skeleton stage at the subject's recorded size and with the stage's fill, with a filled shape in
 * its middle where the subject will be, as a subject on its stage has; on the stage that will
 * show it, a skeleton of the subject's recorded size in its place. A part with no record keeps the
 * stage's least height.
 */
export function StageSkeleton({
  part,
  what,
  stage = false,
  className,
}: {
  /** The part's key in PartSizes.json, such as example:button/Variants. */
  part: string;
  what: string;
  /** Whether the part is its own stage, as a specimen that plays an example is. */
  stage?: boolean;
  /** The classes of the stage it stands for, such as a do or don't figure's. */
  className?: string;
}) {
  const size = recordedSize(part);
  return (
    <PartSkeleton
      what={what}
      part={part}
      className={[stage ? 'site-loading-stage' : 'site-loading-subject', className]
        .filter(Boolean)
        .join(' ')}
      style={
        size && {
          inlineSize: stage ? undefined : `min(100%, ${size[0]}rem)`,
          blockSize: `${size[1]}rem`,
          // At its recorded height, also where that is less than a skeleton's least, so the stage
          // keeps its height as the part lands.
          minBlockSize: stage ? undefined : 0,
        }
      }
    >
      {stage && <span className="site-loading-stage-subject" />}
    </PartSkeleton>
  );
}

/** Lengths of placeholder words, in turn, so a line of them wraps as words of text do. */
const wordLengths = [5, 3, 7, 4, 9, 2, 6, 5, 8, 3, 4, 6];

/**
 * Text that hasn't loaded, as words that make up its length in characters: inside a skeleton, its
 * bars are as long, and wrap onto as many lines, as the text will.
 */
export function placeholderText(length: number) {
  let text = '';
  for (let word = 0; text.length < length; word++)
    text += `${text ? ' ' : ''}${'x'.repeat(wordLengths[word % wordLengths.length]!)}`;
  return text.slice(0, length).trimEnd();
}

/** A line of code that hasn't loaded, as placeholder text, which the skeleton draws as a bar. */
function placeholderLine(index: number) {
  // Lines of a few lengths and indents, in a fixed order, so the bars read as code.
  const indent = [0, 2, 2, 4, 4, 2, 0, 2][index % 8]!;
  const length = [28, 40, 22, 46, 34, 18, 12, 30][(index * 5) % 8]!;
  return ' '.repeat(indent) + 'x'.repeat(length);
}

/**
 * An example's code while it loads: the code block it will be, with its name and copy button, as a
 * skeleton over as many lines as the file has (`lines`), so the page stays where it is when the
 * code lands.
 */
export function CodeSkeleton({ label, lines }: { label: string; lines: number }) {
  const text = Array.from({ length: Math.max(1, lines) }, (_, index) =>
    placeholderLine(index),
  ).join('\n');
  return (
    <PartSkeleton what="code">
      <CodeBlock language="text" label={label} copyable className="site-example-source">
        {text}
      </CodeBlock>
    </PartSkeleton>
  );
}

/**
 * A gallery's or Related's tile while its picture loads, once it has come near enough to load:
 * a skeleton over the whole stage, which pulses in its place until the picture is fitted on it
 * (Related.css). The picture is decorative, as the tile's name leads to the page, so its skeleton
 * is hidden from assistive technology and says nothing.
 */
export function TileSkeleton() {
  const shown = useDelayPassed();
  return (
    <Surface
      skeleton
      padding={0}
      radius="none"
      className="catalogue-tile-loading"
      data-shown={shown ? '' : undefined}
      aria-hidden
    />
  );
}
