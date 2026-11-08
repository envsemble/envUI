import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { flushSync } from 'react-dom';
import { IconButton, Tooltip } from '@envsemble/envui';
import { IconPause } from '@envsemble/envui/icons/Pause';
import { IconPlayArrow } from '@envsemble/envui/icons/PlayArrow';
import type { StageFill } from '@docs-model/DocumentationTypes';
import { useVerdictFit } from '../fit/useVerdictFit';
import { useDisplaySettings } from '../theme/DisplaySettings';
import { Playback, StageOverlays } from './Playback';
import { useInView } from './useInView';
import { rootMotionDuration } from './RootMotionTokens';
import { FigureDevice, OnDevice } from '../figures/DeviceFrame';
import { flag } from '@envui-internal/internal/flag';

/** What the reader can operate in a figure: a stage with none of it stays a recording. */
const operable =
  'a[href], button:not(:disabled), input:not(:disabled, [type="hidden"]), select:not(:disabled), textarea:not(:disabled), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/** The press a reader's first click on a recording meant, sent to what is under it once live. */
function pressAt(x: number, y: number, subject: HTMLElement) {
  const target = document.elementFromPoint(x, y);
  if (!target || !subject.contains(target)) return;
  const init = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: x,
    clientY: y,
    view: window,
  };
  const pointer = { ...init, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0 };
  target.dispatchEvent(new PointerEvent('pointerdown', { ...pointer, buttons: 1 }));
  const down = target.dispatchEvent(
    new MouseEvent('mousedown', { ...init, buttons: 1, detail: 1 }),
  );
  const focusable = target.closest<HTMLElement>(operable);
  if (down && focusable && subject.contains(focusable)) focusable.focus({ preventScroll: true });
  target.dispatchEvent(new PointerEvent('pointerup', pointer));
  target.dispatchEvent(new MouseEvent('mouseup', { ...init, detail: 1 }));
  target.dispatchEvent(new MouseEvent('click', { ...init, detail: 1 }));
}

/**
 * How many figures on the page the reader has taken over. While any has, the others hold where
 * they are: their pointer's presses would reach the page as a press outside what the reader opened,
 * such as a calendar, and close it.
 */
let takenOver = 0;
const takeoverListeners = new Set<() => void>();
function subscribeTakeovers(listener: () => void) {
  takeoverListeners.add(listener);
  return () => {
    takeoverListeners.delete(listener);
  };
}
function useTakeover(live: boolean) {
  useEffect(() => {
    if (!live) return;
    takenOver++;
    for (const listener of takeoverListeners) listener();
    return () => {
      takenOver--;
      for (const listener of takeoverListeners) listener();
    };
  }, [live]);
  return useSyncExternalStore(
    subscribeTakeovers,
    () => takenOver > 0,
    () => false,
  );
}

/**
 * Whether an animated figure plays a do or don't figure's example: its stage is then that figure's
 * (VerdictFigure), joined to its Do or Don't bar, a square, or with `wide`, as wide as the column.
 */
export const VerdictMotion = createContext<false | 'square' | 'wide'>(false);

/**
 * The stage of an animated figure on a page, such as a slider stretching past its ends: the live
 * component on the recessed canvas, playing its timeline (useTimeline) in a loop while it is in
 * view, and a small pause button in its bottom end corner, shown as the pointer or the keyboard
 * reaches the figure (Stage.css). The Display menu's Motion pauses every
 * figure; a figure's own button overrides it for that figure, until the menu's changes or the
 * page does. Paused, a figure holds where it is. `foundation` sets it on a foundation figure's
 * stage rather than an example's, with `className` for that figure's own layout, and `stage` is
 * the fill an example's fence gives it; `top` places what it shows at the stage's top, where the
 * room the stage keeps is for what opens below it, such as a select's list.
 *
 * While it plays, what it shows is a recording, inert. A figure the pointer no one sees plays is
 * the example itself, so the reader can take it over: a click on the stage, or the keyboard
 * reaching it, stops the playback, puts the example back at its start and hands it to the reader,
 * live, the click going on to what it was on. Its overlays then open as they do in an application.
 * The play button plays it again; the keyboard leaving it untouched does too. A figure whose
 * timeline sets its props, or with nothing to operate, stays a recording. While the reader has one
 * figure, the page's others hold where they are (useTakeover), so their pointers' presses never
 * close what the reader opened.
 *
 * Playing, its overlays, such as a menu, a dialog or a tooltip, open inside the stage, as a tile's
 * do (StageOverlays): a dialog's backdrop covers the stage, not the page, and nothing leaves it.
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
  const { motionPaused } = useDisplaySettings();
  const verdict = use(VerdictMotion);
  // The figure's own choice, and the Display menu's at the time, which it overrides only while that holds.
  const [own, setOwn] = useState<{ paused: boolean; over: boolean } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [subject, setSubject] = useState<HTMLDivElement | null>(null);
  const inView = useInView(stage);
  // Whether the reader has the example, and whether they did anything with it.
  const [live, setLive] = useState(false);
  const touched = useRef(false);
  const timelines = useRef(0);
  const [countTimeline] = useState(() => () => {
    timelines.current++;
    return () => {
      timelines.current--;
    };
  });
  // Whether the reader can take it over: something to operate, and no timeline setting its props.
  const [takeable, setTakeable] = useState(false);
  useEffect(() => {
    if (!subject || live) return;
    const check = () =>
      setTakeable(timelines.current === 0 && Boolean(subject.querySelector(operable)));
    check();
    // An example that loads late settles a moment after.
    const timer = setTimeout(check, 1000);
    return () => clearTimeout(timer);
  }, [subject, live]);
  // On a do or don't figure's square, the subject keeps its tallest height in a box drawn smaller
  // where it needs more room than the square (useVerdictFit), rather than the stage growing.
  const square = verdict === 'square';
  const box = useRef<HTMLDivElement>(null);
  const tallest = useRef<HTMLDivElement>(null);
  useVerdictFit(stage, box, square);
  useTallest(square ? tallest : stage, height);
  useThemeFade(subject);
  // Another figure the reader has taken over holds this one where it is, unless the reader plays it.
  const held = useTakeover(live);
  const paused = live || (own && own.over === motionPaused ? own.paused : held || motionPaused);
  const action = paused ? `Play ${label}` : `Pause ${label}`;
  const goLive = () => {
    touched.current = false;
    flushSync(() => setLive(true));
  };
  const onPause = (event: { target: EventTarget }) =>
    event.target instanceof Element && Boolean(event.target.closest('.catalogue-motion-pause'));
  const recordingHandlers = takeable &&
    !live && {
      // A click on the recording, by mouse or by touch, reaches the stage, its content being
      // inert: the example goes live and the click goes on to what is there.
      onClick: (event: MouseEvent) => {
        if (onPause(event) || !event.nativeEvent.isTrusted || !subject) return;
        goLive();
        touched.current = true;
        pressAt(event.clientX, event.clientY, subject);
      },
      // The keyboard on the stage: the example goes live and focus moves into it, to its last
      // stop where the keyboard came back from after it.
      onFocus: (event: FocusEvent) => {
        const element = stage.current;
        if (event.target !== element || !element.matches(':focus-visible') || !subject) return;
        const back =
          event.relatedTarget instanceof Node &&
          Boolean(element.compareDocumentPosition(event.relatedTarget) & 4);
        goLive();
        const stops = [...subject.querySelectorAll<HTMLElement>(operable)].filter(
          (stop) => stop.tabIndex >= 0 && stop.getClientRects().length > 0,
        );
        (back ? stops.at(-1) : stops[0])?.focus();
      },
    };
  const liveHandlers = live && {
    onPointerDown: (event: { target: EventTarget }) => {
      if (!onPause(event)) touched.current = true;
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (!['Tab', 'Shift'].includes(event.key) && !onPause(event)) touched.current = true;
    },
    // The keyboard leaving an example it did nothing with: the recording plays again.
    onBlur: (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (touched.current || (next instanceof Node && stage.current?.contains(next))) return;
      setLive(false);
    },
  };
  // Live, the example at its start, as the reader would find it in an application.
  const content = live ? (
    <Playback key="live" playing={false} rest="start" root={subject}>
      {children}
    </Playback>
  ) : (
    <Playback playing={inView && !paused} rest="hold" root={subject} countTimeline={countTimeline}>
      <StageOverlays>{children}</StageOverlays>
    </Playback>
  );
  // On a page's figure drawn on a device, the device stands on the stage, what plays on its screen.
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
      className={[
        foundation ? 'site-foundation-stage' : verdict ? 'site-verdict-stage' : 'site-live-example',
        'catalogue-motion-stage',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-figure={foundation ? 'example' : undefined}
      data-stage={fill}
      data-device={device && !verdict ? device : undefined}
      data-live={flag(live)}
      data-top={flag(top)}
      style={height && !square ? { minBlockSize: height } : undefined}
      {...(takeable && !live && { tabIndex: 0, role: 'group', 'aria-label': `${label}, try it` })}
      {...recordingHandlers}
      {...liveHandlers}
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
    const observer = new ResizeObserver(() => {
      const stageWidth = element.getBoundingClientRect().width;
      if (Math.abs(stageWidth - width) > 0.5) {
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
      if (need > tallest + 0.5) hold(need);
    });
    observer.observe(element);
    const subject = element.querySelector('.catalogue-motion-subject');
    if (subject) observer.observe(subject);
    return () => {
      observer.disconnect();
      clearTimeout(settle);
      element.style.minBlockSize = own;
    };
  }, [stage, height]);
}

/** The attributes of a nested theme that change its colors (Theme, ThemePreferenceProvider). */
const themeAttributes = ['data-env-theme', 'data-env-contrast'];

/**
 * Marks an animated figure's subject while a theme in it switches, such as the account menu's
 * theme changing, `data-catalogue-theme-fading`, for as long as its colors take to ease
 * (ThemeFade.css): the mark is set as the theme's attribute changes, before the page restyles, so
 * the change eases, and only then, so the parts' own transitions, such as a key's hover, keep
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
      // The fade takes one and a half of the slow token, and a frame to start.
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

/** A room's height: rem, or a CSS length, such as one that follows the scale (rowsAnd). */
type Room = number | string;
const lengthOf = (room: Room) => (typeof room === 'number' ? `${room}rem` : room);

/**
 * A figure's room for its tallest state, as a CSS length for its content's min-height: `wide`,
 * and `narrow` where its stage is narrower than `below` (in rem), where its rows wrap and
 * stand taller. With it the stage is that tall from the start, rather than growing the first time
 * the figure reaches that state (useTallest). A step of the stage's width, the container it lays
 * out in: the difference is huge and positive below `below`, so `narrow` wins, and negative from
 * it on, so `wide` does.
 */
export const roomFor = (wide: Room, narrow: Room, below: number) =>
  `max(${lengthOf(wide)}, min(${lengthOf(narrow)}, (${below}rem - 100cqi) * 1000))`;

/**
 * A room as tall as `rows` rows of a list, which are taller at the comfortable scale than at the
 * compact one, and `rem` more: the height of a popup of rows, such as a calendar, with the field
 * that opens it, so the stage keeps no more room than the open popup fills at either scale, and
 * the two sit in its middle rather than at its top.
 */
export const rowsAnd = (rows: number, rem: number) =>
  `calc(${rows} * var(--env-row-height) + ${rem}rem)`;
