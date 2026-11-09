import { useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { Surface } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/code';
import { useDelayPassed, usePlaceholderShown } from './LoadingStore';
import { useArrival } from './useArrival';
import { usePulseNear } from './usePulseNear';
import { recordedSize } from './RecordedSizes';
import { flag } from '@envui-internal/internal/flag';
import { classNames } from '@envui-internal/internal/classNames';

/*
 * What the site shows while a part of a page loads, such as an example, its code or a specimen,
 * as the Loading pattern asks of applications (docs/patterns/loading.md): the part's shape as an
 * envUI skeleton, in its place and at its size, so nothing moves when it lands. Each skeleton is a
 * busy region whose content assistive technology skips, and one polite status for the whole page,
 * LoadingStatus, says what is loading. A placeholder shows only once a load has taken a noticeable
 * moment, and keeps its space meanwhile, so a quick load never flashes it; once shown, it stays a
 * moment too (HoldPlaceholder), so it never flickers. As what it stood for lands and shows, the
 * two crossfade, so the place is never seen empty.
 */

/**
 * A part of a page while it loads, as envUI's skeleton of its shape: a surface with `skeleton`,
 * whose content, the part's own components over placeholder text, shows as bars and shapes, inert
 * and skipped by assistive technology, while the surface is a busy region. Hidden until it has
 * waited a moment, it keeps its space. `.site-loading` marks it for the tests, which wait for it to
 * leave. `ref` takes its element, such as to watch it near the view.
 */
export function PartSkeleton({
  what,
  part,
  className,
  style,
  children,
  ref,
}: {
  /** What is loading, for the page's status, such as "example". */
  what: string;
  /** The part's key in PartSizes.json, which RecordPartSizes.ts reads from `data-site-part`. */
  part?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ref?: RefObject<HTMLDivElement | null>;
}) {
  const shown = usePlaceholderShown(what, part);
  const own = useRef<HTMLDivElement>(null);
  const element = ref ?? own;
  useArrival(element);
  usePulseNear(element);
  return (
    <Surface
      ref={element}
      skeleton
      padding={0}
      radius="none"
      className={classNames('site-loading', className)}
      data-shown={flag(shown)}
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
 * A figure's subject while it loads, an example, a specimen or a guide's figure: on a stage of its
 * own, a skeleton stage at the subject's recorded size and with the stage's fill, with a filled
 * shape in its middle where the subject will be, as a subject on its stage has; on the stage that
 * will show it, a skeleton of the subject's recorded size in its place. A part with no record keeps
 * the stage's least height. `ref` takes its element, as PartSkeleton's.
 */
export function StageSkeleton({
  part,
  what,
  stage = false,
  className,
  ref,
}: {
  /** The part's key in PartSizes.json, such as example:button/Variants. */
  part: string;
  what: string;
  /** Whether the part is its own stage, as a specimen that plays an example is. */
  stage?: boolean;
  /** The classes of the stage it stands for, such as a do or don't figure's. */
  className?: string;
  ref?: RefObject<HTMLDivElement | null>;
}) {
  const size = recordedSize(part);
  return (
    <PartSkeleton
      ref={ref}
      what={what}
      part={part}
      className={classNames(stage ? 'site-loading-stage' : 'site-loading-subject', className)}
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
    text += `${text ? ' ' : ''}${'x'.repeat(wordLengths[word % wordLengths.length])}`;
  return text.slice(0, length).trimEnd();
}

/** A line of code that hasn't loaded, as placeholder text, which the skeleton draws as a bar. */
function placeholderLine(index: number) {
  // Lines of a few lengths and indents, in a fixed order, so the bars read as code.
  const indent = [0, 2, 2, 4, 4, 2, 0, 2][index % 8];
  const length = [28, 40, 22, 46, 34, 18, 12, 30][(index * 5) % 8];
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
 * (Tile.css). The picture is decorative, as the tile's name leads to the page, so its skeleton
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
      data-shown={flag(shown)}
      aria-hidden
    />
  );
}
