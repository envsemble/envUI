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
import { IconPause } from '@envsemble/envui/icons/Pause';
import { IconPlayArrow } from '@envsemble/envui/icons/PlayArrow';
import type { StageFill } from '../documentation/DocumentationTypes';
import { useVerdictFit } from '../fit/standalone/useVerdictFit';
import { useDisplaySettings } from '../display/DisplaySettings';
import { Playback, StageOverlays } from '../motion/Playback';
import { useInView } from '../motion/useInView';
import { rootMotionDuration } from '../shared/RootMotionTokens';
import { pixelTolerance, remeasure } from '../shared/Remeasure';
import { FigureDevice, OnDevice } from './DeviceFrame';
import { flag } from '@envui-internal/internal/flag';
import { useBrowserStandIns } from '../motion/BrowserStandIns';
import { useReaderTakeover } from '../motion/ReaderTakeover';
import { classNames } from '@envui-internal/internal/classNames';

/**
 * Whether an animated figure plays the example of a do or don't figure. Its stage is then that
 * figure's (VerdictFigure), joined to its Do or Don't bar: a square, or with `wide`, as wide as the
 * column.
 */
export const VerdictMotion = createContext<false | 'square' | 'wide'>(false);

/**
 * The stage of an animated figure on a page, such as a slider stretching past its ends. It shows
 * the live component on the recessed canvas, plays its pointer script (usePointer) or timeline
 * (useTimeline) in a loop while it is in view, and has a small pause button in its bottom end
 * corner that shows when the pointer or the keyboard reaches the figure (MotionStage.css).
 *
 * The Display menu's Motion setting pauses every figure. A figure's own button overrides that for
 * the figure until the menu's setting or the page changes. A paused figure holds where it is.
 *
 * Props: `foundation` marks a foundation figure's stage rather than an example's, and `className`
 * gives that figure its own layout. `stage` is the fill set in the example's fence. `top` places
 * the content at the stage's top, when the room the stage keeps is for something that opens below
 * it, such as a select's list. `height`, a CSS length, makes the stage as tall as what opens in it
 * from the start, so the figure keeps one height while it plays.
 *
 * While it plays, the content is a recording and is inert. When the virtual pointer plays the
 * example itself, the reader can take it over: a click on the stage, or the keyboard reaching it,
 * stops the playback, resets the example to its start and makes it live, and the click is replayed
 * on what it was on. Its overlays then open as they do in an application. The play button plays it
 * again, and so does the keyboard leaving it untouched. A figure whose timeline sets its props, or
 * that has nothing to operate, stays a recording. While the reader has one figure, the page's other
 * figures hold still (ReaderTakeover.ts), so their pointers' presses never close what the reader opened.
 *
 * While it plays, its overlays, such as a menu, a dialog or a tooltip, open inside the stage, as a
 * tile's do (StageOverlays): a dialog's backdrop covers the stage, not the page, and nothing leaves
 * it. The stage also keeps the tallest height it has reached at its width (useTallest), so a figure
 * that grows for a moment while it plays doesn't shrink back and move the page below it on every
 * loop.
 */
export function MotionStage({
  label,
  height,
  children,
  foundation = false,
  className,
  stage: fill,
  top = false,
}: {
  label: string;
  height?: string;
  children: ReactNode;
  foundation?: boolean;
  className?: string;
  stage?: StageFill;
  top?: boolean;
}) {
  useBrowserStandIns();
  const { motionPaused } = useDisplaySettings();
  const verdict = use(VerdictMotion);
  // The figure's own choice, and the Display menu's setting when it was made: the choice applies
  // only while the menu's setting stays the same.
  const [own, setOwn] = useState<{ paused: boolean; over: boolean } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [subject, setSubject] = useState<HTMLDivElement | null>(null);
  const inView = useInView(stage);
  const { live, setLive, takeable, countTimeline, held, handlers } = useReaderTakeover(
    stage,
    subject,
  );
  // On a do or don't figure's square, the subject keeps its tallest height in a box that is drawn
  // smaller where it needs more room than the square (useVerdictFit), so the stage doesn't grow.
  const square = verdict === 'square';
  const box = useRef<HTMLDivElement>(null);
  const tallest = useRef<HTMLDivElement>(null);
  useVerdictFit(stage, box, { on: square, shape: 'square' });
  useTallest(square ? tallest : stage, height);
  useThemeFade(subject);
  // While the reader has taken over another figure, this one holds still (held), unless the reader
  // plays it.
  const paused = live || (own && own.over === motionPaused ? own.paused : held || motionPaused);
  const action = paused ? `Play ${label}` : `Pause ${label}`;
  // Live, the example starts from its start, as the reader would find it in an application.
  const content = live ? (
    <Playback key="live" playing={false} rest="start" root={subject}>
      {children}
    </Playback>
  ) : (
    <Playback playing={inView && !paused} rest="hold" root={subject} countTimeline={countTimeline}>
      <StageOverlays>{children}</StageOverlays>
    </Playback>
  );
  // On a figure drawn on a device, the device stands on the stage and the content plays on its
  // screen.
  const device = use(FigureDevice);
  const shown = device && !verdict ? <OnDevice kind={device}>{content}</OnDevice> : content;
  const subjectProps = {
    inert: !live,
    'aria-hidden': live ? undefined : true,
    className: 'catalogue-motion-subject',
  };
  return (
    <div
      ref={stage}
      className={classNames(
        foundation ? 'site-foundation-stage' : verdict ? 'site-verdict-stage' : 'site-live-example',
        'catalogue-motion-stage',
        className,
      )}
      data-figure={foundation ? 'example' : undefined}
      data-stage={fill}
      data-device={device && !verdict ? device : undefined}
      data-live={flag(live)}
      data-top={flag(top)}
      style={height && !square ? { minBlockSize: height } : undefined}
      {...(takeable && !live && { tabIndex: 0, role: 'group', 'aria-label': `${label}, try it` })}
      {...handlers}
    >
      {square ? (
        <div ref={box} className="site-verdict-fit">
          <div
            ref={(element) => {
              tallest.current = element;
              setSubject(element);
            }}
            {...subjectProps}
            style={height ? { minBlockSize: height } : undefined}
          >
            {content}
          </div>
        </div>
      ) : (
        <div ref={setSubject} {...subjectProps}>
          {shown}
        </div>
      )}
      <Tooltip content={action}>
        <IconButton
          size="sm"
          className="catalogue-motion-pause"
          icon={paused ? <IconPlayArrow /> : <IconPause />}
          aria-label={action}
          onClick={() => {
            if (live) {
              setLive(false);
              setOwn({ paused: false, over: motionPaused });
            } else setOwn({ paused: !paused, over: motionPaused });
          }}
        />
      </Tooltip>
    </div>
  );
}

/**
 * Keeps an animated figure's stage at the tallest height it has needed at its width, at least
 * `height`: what grows as the figure plays, such as a message that wraps or a list that gains a row,
 * then grows the stage once, and its loop back leaves the stage as it is, so the page below stays
 * put. At another width the stage measures afresh. It measures the height the stage needs without
 * the hold, never the height the hold gives it: a figure that stretches to fill its stage would
 * otherwise keep whatever height it once had, and Firefox, which lays a stage out a little taller
 * than its min-height, would grow it without end.
 */
function useTallest(stage: RefObject<HTMLDivElement | null>, height: string | undefined) {
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const own = height ?? '';
    let width = -1;
    // The tallest the stage has needed so far, its border box.
    let tallest = 0;
    let held = own;
    /**
     * The stage's border box without the hold, measured at once and the hold put back. It is
     * measured at its own height, not stretched to its row's: stages side by side, as an
     * overview's, would otherwise each measure the other's hold and hold each other up, a little
     * higher every time where a browser rounds up, without end. Its width stays as it is: in a
     * column of flex items, `align-self` sets the width, and a stage at its content's width would
     * wrap its text and measure far too tall.
     */
    const needed = () => {
      const { alignSelf, inlineSize } = element.style;
      element.style.inlineSize = `${element.getBoundingClientRect().width}px`;
      element.style.minBlockSize = own;
      element.style.alignSelf = 'start';
      const box = element.getBoundingClientRect().height;
      element.style.alignSelf = alignSelf;
      element.style.inlineSize = inlineSize;
      element.style.minBlockSize = held;
      return box;
    };
    const hold = (border: number) => {
      tallest = border;
      // The min-height counts what the stage's sizing counts: without its padding and borders
      // where it is sized by its content box.
      const style = getComputedStyle(element);
      const frame =
        style.boxSizing === 'border-box'
          ? 0
          : parseFloat(style.paddingBlockStart) +
            parseFloat(style.paddingBlockEnd) +
            parseFloat(style.borderBlockStartWidth) +
            parseFloat(style.borderBlockEndWidth);
      held = border ? `max(${height ?? '0px'}, ${border - frame}px)` : own;
      element.style.minBlockSize = held;
    };
    // At a new width the figure lays out anew, and a figure that picks its layout by its width,
    // such as rows that stack on a phone, does so a moment later: the stage lets go of its hold
    // and takes it again from what it needs once the figure has settled.
    let settle: ReturnType<typeof setTimeout> | undefined;
    const subject = element.querySelector('.catalogue-motion-subject');
    const sizes = remeasure(
      () => {
        const stageWidth = element.getBoundingClientRect().width;
        if (Math.abs(stageWidth - width) > pixelTolerance) {
          width = stageWidth;
          hold(0);
          clearTimeout(settle);
          settle = setTimeout(() => {
            settle = undefined;
            hold(needed());
          }, 400);
          return;
        }
        if (settle !== undefined) return;
        const need = needed();
        if (need > tallest + pixelTolerance) hold(need);
      },
      { resize: subject ? [element, subject] : [element] },
    );
    return () => {
      sizes.stop();
      clearTimeout(settle);
      element.style.minBlockSize = own;
    };
  }, [stage, height]);
}

/** The attributes of a nested theme that change its colors (Theme, ThemePreferenceProvider). */
const themeAttributes = ['data-env-theme', 'data-env-contrast'];

/**
 * Marks an animated figure's subject with `data-catalogue-theme-fading` while a theme inside it
 * switches, such as when the account menu changes the theme, for as long as the colors take to ease
 * (ThemeFade.css). The mark is set when the theme's attribute changes, before the page restyles, so
 * the change eases. It is set only then, so the parts' own transitions, such as a key's hover, keep
 * their own timing the rest of the time.
 */
function useThemeFade(subject: HTMLElement | null) {
  useEffect(() => {
    if (!subject) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver((changes) => {
      if (!changes.some(({ target }) => target !== subject)) return;
      subject.dataset.catalogueThemeFading = '';
      clearTimeout(timer);
      // The fade takes one and a half times the slow motion token, plus a frame to start.
      timer = setTimeout(
        () => delete subject.dataset.catalogueThemeFading,
        1.5 * rootMotionDuration('slow') + 50,
      );
    });
    observer.observe(subject, { subtree: true, attributeFilter: themeAttributes });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      delete subject.dataset.catalogueThemeFading;
    };
  }, [subject]);
}

/**
 * A height: a number of rem, or a CSS length, such as one that follows the scale (rowsAnd).
 */
type HeightLength = number | string;
const lengthOf = (room: HeightLength) => (typeof room === 'number' ? `${room}rem` : room);

/**
 * A figure's room for its tallest state, as a CSS length for its content's min-height: `wide`, or
 * `narrow` where its stage is narrower than `below` rem, where its rows wrap and stand taller. With
 * it the stage is that tall from the start, rather than growing the first time the figure reaches
 * that state (useTallest). The CSS is a step function of the stage's width (the container it lays
 * out in): the difference is huge and positive below `below`, so `narrow` wins, and negative from
 * there on, so `wide` wins.
 */
export const roomFor = (wide: HeightLength, narrow: HeightLength, below: number) =>
  `max(${lengthOf(wide)}, min(${lengthOf(narrow)}, (${below}rem - 100cqi) * 1000))`;

/**
 * A room as tall as `rows` rows of a list plus `rem` more: the height of a popup of rows, such as a
 * calendar, with the field that opens it. Rows are taller at the comfortable scale than at the
 * compact one, so the stage keeps no more room than the open popup fills at either scale, and the
 * field and popup sit in the middle of the stage rather than at its top.
 */
export const rowsAnd = (rows: number, rem: number) =>
  `calc(${rows} * var(--env-row-height) + ${rem}rem)`;
