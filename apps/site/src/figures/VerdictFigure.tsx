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

const verdicts = {
  do: { label: 'Do', icon: <IconCheck /> },
  dont: { label: 'Don’t', icon: <IconClose /> },
  caution: { label: 'Caution', icon: <IconWarning /> },
};

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
  shows: 'example' | 'open' | 'motion';
  wide: boolean;
  stage?: StageFill;
}) {
  const { label, icon } = verdicts[verdict];
  const id = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const shape = wide ? 'wide' : shows === 'example' ? 'fit' : 'square';
  useVerdictFit(stageRef, box, {
    on: shape !== 'wide' && shows !== 'motion',
    shape: shape === 'fit' ? 'fit' : 'square',
  });
  return (
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
