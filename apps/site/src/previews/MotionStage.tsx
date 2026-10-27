import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
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
 * Where an animated figure plays as a tip's picture (template/Tips.tsx): the tip's thumbnail is its
 * stage, plays it and has its pause button, so the figure gives it only what the button names.
 */
export const TipMotion = createContext<((label: string) => void) | null>(null);

/**
 * Whether a figure is paused, and the toggle of its own pause button: the sidebar's pause pauses
 * every figure, and a figure's own button overrides it for that figure, until the sidebar's
 * changes or the page does.
 */
export function useFigurePause() {
  const { motionPaused } = useDisplaySettings();
  // The figure's own choice, and the sidebar's at the time, which it overrides only while that holds.
  const [own, setOwn] = useState<{ paused: boolean; over: boolean } | null>(null);
  const paused = own && own.over === motionPaused ? own.paused : motionPaused;
  return [paused, () => setOwn({ paused: !paused, over: motionPaused })] as const;
}

/** A figure's small pause button, which plays it again once pressed again; `label` names it. */
export function PauseButton({
  paused,
  label,
  onToggle,
  className = 'catalogue-motion-pause',
}: {
  paused: boolean;
  label: string;
  onToggle: () => void;
  className?: string;
}) {
  const action = paused ? `Play ${label}` : `Pause ${label}`;
  return (
    <Tooltip content={action}>
      <IconButton
        size="sm"
        className={className}
        icon={paused ? <PlayArrow /> : <Pause />}
        aria-label={action}
        onClick={onToggle}
      />
    </Tooltip>
  );
}

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
  const verdict = use(VerdictMotion);
  const tip = use(TipMotion);
  const [paused, togglePause] = useFigurePause();
  const stage = useRef<HTMLDivElement>(null);
  const [subject, setSubject] = useState<HTMLDivElement | null>(null);
  const inView = useInView(stage);
  useTallest(stage, height);
  useLayoutEffect(() => tip?.(label), [tip, label]);
  // A tip's thumbnail is the stage: it plays the figure, which is its subject alone.
  if (tip) return children;
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
      <PauseButton paused={paused} label={label} onToggle={togglePause} />
    </div>
  );
}

/**
 * Keeps an animated figure's stage at the tallest height it has reached at its width, at least
 * `height`: what grows as the figure plays, such as a message that wraps or a list that gains a
 * row, then grows the stage once, and its loop back leaves the stage as it is, so the page below
 * stays put. At another width the stage measures afresh.
 */
function useTallest(stage: RefObject<HTMLDivElement | null>, height: string | undefined) {
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const own = height ?? '';
    let width = -1;
    // The tallest border box so far, and its min-height, which counts what the box's sizing
    // counts: without its padding and borders, by default.
    let tallest = 0;
    const hold = (border: number) => {
      tallest = border;
      if (!border) {
        element.style.minBlockSize = own;
        return;
      }
      const style = getComputedStyle(element);
      const frame =
        style.boxSizing === 'border-box'
          ? 0
          : parseFloat(style.paddingBlockStart) +
            parseFloat(style.paddingBlockEnd) +
            parseFloat(style.borderBlockStartWidth) +
            parseFloat(style.borderBlockEndWidth);
      element.style.minBlockSize = `max(${height ?? '0px'}, ${border - frame}px)`;
    };
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize[0];
      if (!box) return;
      if (Math.abs(box.inlineSize - width) > 0.5) {
        // At a new width the figure lays out anew: it starts again from the height it has now.
        width = box.inlineSize;
        hold(0);
        hold(element.getBoundingClientRect().height);
      } else if (box.blockSize > tallest + 0.5) hold(box.blockSize);
    });
    observer.observe(element, { box: 'border-box' });
    return () => {
      observer.disconnect();
      element.style.minBlockSize = own;
    };
  }, [stage, height]);
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
