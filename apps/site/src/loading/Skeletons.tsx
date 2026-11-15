import { useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { CodeBlock, Surface } from '@envsemble/envui';
import { earlyPlaceholderDelayMs, useDelayPassed, usePlaceholderShown } from './LoadingStore';
import { useFiguresMounted } from './useFiguresMounted';
import { useArrival } from './useArrival';
import { usePulseNear } from './usePulseNear';
import { recordedSize } from './RecordedSizes';
import { classNames, flag } from '../shared/Attributes';

export function PartSkeleton({
  what,
  part,
  className,
  style,
  children,
  ref,
}: {
  what: string;
  part?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ref?: RefObject<HTMLDivElement | null>;
}) {
  const [early, setEarly] = useState(!useFiguresMounted());
  const [near, setNear] = useState<boolean>();
  const [waitsUntilNear, setWaitsUntilNear] = useState(false);
  const waiting = (early && near === undefined) || (waitsUntilNear && !near);
  const shown = usePlaceholderShown(what, part, early, waiting);
  const own = useRef<HTMLDivElement>(null);
  const element = ref ?? own;
  useArrival(element);
  usePulseNear(element, (nowNear) => {
    if (early && near === undefined && !nowNear) {
      setEarly(false);
      setWaitsUntilNear(true);
    }
    setNear(nowNear);
  });
  return (
    <Surface
      ref={element}
      skeleton
      padding={0}
      radius="none"
      className={classNames('site-loading', className)}
      data-shown={flag(shown)}
      data-site-early={flag(early)}
      data-site-part={part}
      style={early ? { ...style, '--site-loading-delay': `${earlyPlaceholderDelayMs}ms` } : style}
    >
      {children}
    </Surface>
  );
}

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

export function StageSkeleton({
  part,
  what,
  stage = false,
  className,
  ref,
}: {
  part: string;
  what: string;
  stage?: boolean;
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
          minBlockSize: stage ? undefined : 0,
        }
      }
    >
      {stage && <span className="site-loading-stage-subject" />}
    </PartSkeleton>
  );
}

const wordLengths = [5, 3, 7, 4, 9, 2, 6, 5, 8, 3, 4, 6];

export function placeholderText(length: number) {
  let text = '';
  for (let word = 0; text.length < length; word++)
    text += `${text ? ' ' : ''}${'x'.repeat(wordLengths[word % wordLengths.length])}`;
  return text.slice(0, length).trimEnd();
}

const codeLineIndents = [0, 2, 2, 4, 4, 2, 0, 2];
const codeLineLengths = [28, 40, 22, 46, 34, 18, 12, 30];
const codeLineLengthStride = 5;

function placeholderLine(index: number) {
  const indent = codeLineIndents[index % codeLineIndents.length];
  const length = codeLineLengths[(index * codeLineLengthStride) % codeLineLengths.length];
  return ' '.repeat(indent) + 'x'.repeat(length);
}

export function CodeSkeleton({ label, lines }: { label: string; lines: number }) {
  const text = Array.from({ length: Math.max(1, lines) }, (_, index) =>
    placeholderLine(index),
  ).join('\n');
  return (
    <PartSkeleton what="code">
      <CodeBlock label={label} copyable className="site-example-source">
        {text}
      </CodeBlock>
    </PartSkeleton>
  );
}

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
