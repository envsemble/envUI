import { useId, useRef } from 'react';
import { Column } from '@envsemble/envui';
import { IconCheck } from '@envsemble/envui/icons/Check';
import { IconClose } from '@envsemble/envui/icons/Close';
import { IconWarning } from '@envsemble/envui/icons/Warning';
import type { StageFill } from '../documentation/DocumentationTypes';
import { ExampleCode, ExampleRender } from './LiveExample';
import { keepLinksInPlace } from './KeepLinksInPlace';
import { OpenExample } from './OpenExample';
import { ExamplePlayback } from './Specimen';
import { VerdictMotion } from './MotionStage';
import { useVerdictFit } from '../fit/standalone/useVerdictFit';
import { PageTheme } from './PageTheme';

/** The mark of a do, a don't or a caution: its icon and its word. */
const verdicts = {
  do: { label: 'Do', icon: <IconCheck /> },
  dont: { label: 'Don’t', icon: <IconClose /> },
  caution: { label: 'Caution', icon: <IconWarning /> },
};

/**
 * A do, don't or caution figure, as a gallery's cells: the live example on its stage; under it, a
 * strip of the same fill with its tag, a check, a cross or a warning with the word Do, Don't or
 * Caution in green, red or amber, a caution being acceptable with care rather than a mistake, and
 * its one sentence beside it; and under that, the example's code (Verdicts.css). The stage is as
 * tall as the example, or square where the example shows open or playing, and the example is
 * drawn smaller where it needs more room than the stage's width (useVerdictFit). A `wide` figure,
 * whose point is a change across the column's width, keeps a stage as wide as the column and as
 * tall as its example.
 */
export function VerdictFigure({
  page,
  name,
  verdict,
  caption,
  shows,
  wide,
  stage,
}: {
  page: string;
  name: string;
  verdict: 'do' | 'dont' | 'caution';
  caption: string;
  /**
   * What the stage shows: the example; its overlays open, as a picture; or its animated specimen of
   * the same name playing it.
   */
  shows: 'example' | 'open' | 'motion';
  /** Whether it keeps a stage as wide as the column, rather than a square. */
  wide: boolean;
  /** The stage's fill, where the page's would hide the subject. */
  stage?: StageFill;
}) {
  const { label, icon } = verdicts[verdict];
  const id = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  // A figure that shows its example open or playing keeps a square, the room what opens in it
  // needs; any other is as tall as its example. A playing one is fitted by its motion's stage.
  const shape = wide ? 'wide' : shows === 'example' ? 'fit' : 'square';
  useVerdictFit(stageRef, box, {
    on: shape !== 'wide' && shows !== 'motion',
    shape: shape === 'fit' ? 'fit' : 'square',
  });
  return (
    // Named by its mark and its sentence, each read once.
    <figure
      className="site-verdict"
      data-verdict={verdict}
      data-shape={shape}
      aria-labelledby={`${id}-verdict ${id}-caption`}
    >
      {shows === 'motion' ? (
        <VerdictMotion value={wide ? 'wide' : 'square'}>
          <ExamplePlayback page={page} name={name} />
        </VerdictMotion>
      ) : (
        <Column
          ref={stageRef}
          render={<PageTheme />}
          gap={0}
          className="site-verdict-stage"
          data-example={name}
          data-stage={stage}
          {...keepLinksInPlace}
        >
          <div ref={box} className="site-verdict-fit">
            {shows === 'open' ? (
              <OpenExample name={name}>
                <ExampleRender page={page} name={name} />
              </OpenExample>
            ) : (
              <ExampleRender page={page} name={name} />
            )}
          </div>
        </Column>
      )}
      {/* A strip of the stage's fill under it: the verdict's tag and its sentence beside it. */}
      <figcaption className="site-verdict-caption" data-stage={stage}>
        <span className="site-verdict-mark" id={`${id}-verdict`}>
          {icon}
          <span>{label}</span>
        </span>
        <span className="site-verdict-sentence" id={`${id}-caption`}>
          {caption}
        </span>
      </figcaption>
      <ExampleCode page={page} name={name} />
    </figure>
  );
}
