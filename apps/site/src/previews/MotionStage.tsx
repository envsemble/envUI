import { useRef, useState, type ReactNode } from 'react';
import { IconButton, Tooltip } from '@envsemble/envui';
import { Pause } from '@envsemble/envui/icons/Pause';
import { PlayArrow } from '@envsemble/envui/icons/PlayArrow';
import { useDisplaySettings } from '../theme/DisplaySettings';
import { Playback, PreviewOverlays, useInView } from './Motion';

/**
 * The stage of an animated figure on a page, such as a slider stretching past its ends: the live
 * component on the recessed canvas, playing its timeline (useTimeline) in a loop while it is in
 * view, and a small pause button in its bottom end corner. The sidebar's pause pauses every
 * figure; a figure's own button overrides it for that figure, until the sidebar's changes or the
 * page does. Paused, a figure holds where it is. What it shows is a picture, inert, so the button
 * is all a reader can use in it.
 *
 * Its overlays, such as a menu, a dialog or a tooltip, open live inside the stage, as a tile's do
 * (PreviewOverlays): a dialog's scrim covers the stage, not the page, and nothing leaves it.
 * `height`, a CSS length, keeps the stage as tall as what opens in it from the start, so the
 * figure keeps one height as it plays.
 */
export function MotionStage({
  label,
  height,
  children,
}: {
  label: string;
  height?: string;
  children: ReactNode;
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
      className="site-live-example catalogue-motion-stage"
      style={height ? { minBlockSize: height } : undefined}
    >
      <div ref={setSubject} inert aria-hidden className="catalogue-motion-subject">
        <Playback playing={inView && !paused} rest="hold" root={subject}>
          <PreviewOverlays>{children}</PreviewOverlays>
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
