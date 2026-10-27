import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { IconButton, Tooltip } from '@envsemble/envui';
import { Pause } from '@envsemble/envui/icons/Pause';
import { PlayArrow } from '@envsemble/envui/icons/PlayArrow';
import type { StageFill } from '../DocumentationTypes';
import { useDisplaySettings } from '../theme/DisplaySettings';
import { Playback, PreviewOverlays, useInView } from './Motion';

/**
 * Whether an animated figure plays a do or don't figure's example: its stage is then that figure's
 * (VerdictFigure), joined to its Do or Don't bar.
 */
export const VerdictMotion = createContext(false);

/**
 * The stage of an animated figure on a page, such as a slider stretching past its ends: the live
 * component on the recessed canvas, playing its timeline (useTimeline) in a loop while it is in
 * view, and a small pause button in its bottom end corner. The sidebar's pause pauses every
 * figure; a figure's own button overrides it for that figure, until the sidebar's changes or the
 * page does. Paused, a figure holds where it is. What it shows is a picture, inert, so the button
 * is all a reader can use in it. `foundation` sets it on a foundation figure's stage rather than
 * an example's, with `className` for that figure's own layout, and `stage` is the fill an
 * example's fence gives it.
 *
 * Its overlays, such as a menu, a dialog or a tooltip, open live inside the stage, as a tile's do
 * (PreviewOverlays): a dialog's scrim covers the stage, not the page, and nothing leaves it.
 * `height`, a CSS length, keeps the stage as tall as what opens in it from the start, so the
 * figure keeps one height as it plays. Whatever the figure, the stage keeps the tallest height it
 * has reached at its width (useTallest), so a figure that grows for a moment as it plays never
 * shrinks back and moves the page below it on every loop.
 */
export function MotionStage({
  label,
  height,
  children,
  foundation = false,
  className,
  stage: fill,
}: {
  label: string;
  height?: string;
  children: ReactNode;
  foundation?: boolean;
  className?: string;
  stage?: StageFill;
}) {
  const { motionPaused } = useDisplaySettings();
  const verdict = use(VerdictMotion);
  // The figure's own choice, and the sidebar's at the time, which it overrides only while that holds.
  const [own, setOwn] = useState<{ paused: boolean; over: boolean } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [subject, setSubject] = useState<HTMLDivElement | null>(null);
  const inView = useInView(stage);
  useTallest(stage, subject, height);
  const paused = own && own.over === motionPaused ? own.paused : motionPaused;
  const action = paused ? `Play ${label}` : `Pause ${label}`;
  return (
    <div
      ref={stage}
      className={[
        foundation
          ? 'site-foundation-stage'
          : verdict
            ? 'site-verdict-stage env-connected-row'
            : 'site-live-example',
        'catalogue-motion-stage',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-figure={foundation ? 'example' : undefined}
      data-stage={fill}
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

/**
 * Keeps an animated figure's stage at the tallest height its figure has reached at its width, at
 * least `height`: what grows as the figure plays, such as a message that wraps or a list that gains
 * a row, then grows the stage once, and its loop back leaves the stage as it is, so the page below
 * stays put. At another width the stage measures afresh. It measures the figure, not the stage,
 * whose own height the hold sets: Firefox lays a stage out a little taller than its min-height,
 * which measured again would grow it without end.
 */
function useTallest(
  stage: RefObject<HTMLDivElement | null>,
  subject: HTMLDivElement | null,
  height: string | undefined,
) {
  useEffect(() => {
    const element = stage.current;
    if (!element || !subject) return;
    const own = height ?? '';
    let width = -1;
    // The tallest the figure has been so far, its border box.
    let tallest = 0;
    const hold = (figure: number) => {
      tallest = figure;
      if (!figure) {
        element.style.minBlockSize = own;
        return;
      }
      // The stage's min-height counts what its sizing counts: its padding and borders too where
      // it is sized by its border box.
      const style = getComputedStyle(element);
      const frame =
        style.boxSizing === 'border-box'
          ? parseFloat(style.paddingBlockStart) +
            parseFloat(style.paddingBlockEnd) +
            parseFloat(style.borderBlockStartWidth) +
            parseFloat(style.borderBlockEndWidth)
          : 0;
      element.style.minBlockSize = `max(${height ?? '0px'}, ${figure + frame}px)`;
    };
    const observer = new ResizeObserver(() => {
      const stageWidth = element.getBoundingClientRect().width;
      const figure = subject.getBoundingClientRect().height;
      if (Math.abs(stageWidth - width) > 0.5) {
        // At a new width the figure lays out anew: it starts again from the height it has now.
        width = stageWidth;
        hold(0);
        hold(subject.getBoundingClientRect().height);
      } else if (figure > tallest + 0.5) hold(figure);
    });
    observer.observe(element);
    observer.observe(subject);
    return () => {
      observer.disconnect();
      element.style.minBlockSize = own;
    };
  }, [stage, subject, height]);
}

/**
 * A figure's room for its tallest state, as a CSS length for its content's min-height: `wide`,
 * and `narrow` where its stage is narrower than `below` (all in rem), where its rows wrap and
 * stand taller. With it the stage is that tall from the start, rather than growing the first time
 * the figure reaches that state (useTallest). A step of the stage's width, the container it lays
 * out in: the difference is huge and positive below `below`, so `narrow` wins, and negative from
 * it on, so `wide` does.
 */
export const roomFor = (wide: number, narrow: number, below: number) =>
  `max(${wide}rem, min(${narrow}rem, (${below}rem - 100cqi) * 1000))`;
