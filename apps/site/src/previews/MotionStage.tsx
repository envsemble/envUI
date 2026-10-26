import { useRef, useState, type ReactNode } from 'react';
import { IconButton, Tooltip } from '@envsemble/envui';
import { Pause } from '@envsemble/envui/icons/Pause';
import { PlayArrow } from '@envsemble/envui/icons/PlayArrow';
import type { StageFill } from '../DocumentationTypes';
import { useDisplaySettings } from '../theme/DisplaySettings';
import { Playback, useInView } from './Motion';

/**
 * The stage of an animated figure on a page, such as a slider stretching past its ends: the live
 * component on the recessed canvas, playing its timeline (useTimeline) in a loop while it is in
 * view, and a small pause button in its bottom end corner. The sidebar's pause pauses every
 * figure; a figure's own button overrides it for that figure, until the sidebar's changes or the
 * page does. Paused, a figure holds where it is. What it shows is a picture, inert, so the button
 * is all a reader can use in it. `foundation` sets it on a foundation figure's stage rather than
 * an example's, with `className` for that figure's own layout, and `stage` is the fill an
 * example's fence gives it.
 */
export function MotionStage({
  label,
  children,
  foundation = false,
  className,
  stage: fill,
}: {
  label: string;
  children: ReactNode;
  foundation?: boolean;
  className?: string;
  stage?: StageFill;
}) {
  const { motionPaused } = useDisplaySettings();
  // The figure's own choice, and the sidebar's at the time, which it overrides only while that holds.
  const [own, setOwn] = useState<{ paused: boolean; over: boolean } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [subject, setSubject] = useState<HTMLDivElement | null>(null);
  const inView = useInView(stage);
  const paused = own && own.over === motionPaused ? own.paused : motionPaused;
  const action = paused ? `Play ${label}` : `Pause ${label}`;
  return (
    <div
      ref={stage}
      className={[
        foundation ? 'site-foundation-stage' : 'site-live-example',
        'catalogue-motion-stage',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-figure={foundation ? 'example' : undefined}
      data-stage={fill}
    >
      <div ref={setSubject} inert aria-hidden className="catalogue-motion-subject">
        <Playback playing={inView && !paused} rest="hold" root={subject}>
          {children}
        </Playback>
      </div>
      <Tooltip content={action}>
        <IconButton
          size="sm"
          className="catalogue-motion-pause"
          icon={paused ? <PlayArrow /> : <Pause />}
          aria-label={action}
          onClick={() => setOwn({ paused: !paused, over: motionPaused })}
        />
      </Tooltip>
    </div>
  );
}
