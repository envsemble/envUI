import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react';
import { flushSync } from 'react-dom';

/*
 * The reader taking over an animated figure's example (MotionStage.tsx): a click on the recording,
 * replayed on the live example, or the keyboard reaching the stage, makes it the reader's; and
 * while the reader has one figure, the page's other figures hold still.
 */

/**
 * The elements a reader can operate in a figure. A stage that has none of them stays a recording.
 */
const operable =
  'a[href], button:not(:disabled), input:not(:disabled, [type="hidden"]), select:not(:disabled), textarea:not(:disabled), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/**
 * Replays a reader's first click on a recording, once the example is live: a press, and a click, on
 * the element under the pointer.
 */
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
 * How many figures on the page the reader has taken over. While there is one, the other figures
 * hold still: their virtual pointers' presses would reach the page as a press outside what the
 * reader opened, such as a calendar, and close it.
 */
let takenOver = 0;
const takeoverListeners = new Set<() => void>();
function subscribeTakeovers(listener: () => void) {
  takeoverListeners.add(listener);
  return () => {
    takeoverListeners.delete(listener);
  };
}

/** Counts a `live` figure as taken over, and returns whether any figure on the page is. */
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

/** Whether a press on a stage is on its pause button, which the reader's takeover ignores. */
const onPause = (event: { target: EventTarget }) =>
  event.target instanceof Element && Boolean(event.target.closest('.catalogue-motion-pause'));

/**
 * Lets the reader take over a figure's example (MotionStage). Returns whether the example is `live`
 * (the reader's); whether it is `takeable`: it has something to operate and no timeline that sets
 * its props (`countTimeline` counts the timelines); whether another figure is taken over, so this
 * one holds still (`held`); and the stage's event `handlers`. A click on the recording, or the
 * keyboard reaching the stage, makes it live. The keyboard leaving a live example that the reader
 * did nothing with makes it a recording again.
 */
export function useReaderTakeover(
  stage: RefObject<HTMLDivElement | null>,
  subject: HTMLElement | null,
) {
  // Whether the reader has the example, and whether they did anything with it.
  const [live, setLive] = useState(false);
  const touched = useRef(false);
  const timelines = useRef(0);
  // Decides `takeable` again, while the example is a recording.
  const recheck = useRef<() => void>(undefined);
  const [countTimeline] = useState(() => () => {
    timelines.current++;
    recheck.current?.();
    return () => {
      timelines.current--;
      recheck.current?.();
    };
  });
  const [takeable, setTakeable] = useState(false);
  useEffect(() => {
    if (!subject || live) return;
    // Once the example has something to operate, it keeps it as far as takeover goes, so a popup
    // closing as the recording plays doesn't make the stage leave the tab order.
    let found = false;
    const check = () => {
      found ||= Boolean(subject.querySelector(operable));
      if (found) observer.disconnect();
      setTakeable(timelines.current === 0 && found);
    };
    // An example that loads late, or whose controls appear or are enabled later, is checked as
    // it changes.
    const observer = new MutationObserver(check);
    observer.observe(subject, {
      childList: true,
      subtree: true,
      attributeFilter: ['disabled', 'href', 'tabindex', 'contenteditable', 'type'],
    });
    recheck.current = check;
    check();
    return () => {
      observer.disconnect();
      recheck.current = undefined;
    };
  }, [subject, live]);
  const goLive = () => {
    touched.current = false;
    flushSync(() => setLive(true));
  };
  const recordingHandlers = takeable &&
    !live && {
      // A click on the recording, by mouse or by touch, reaches the stage, because its content is
      // inert: the example goes live and the click is replayed on what is under it.
      onClick: (event: MouseEvent) => {
        if (onPause(event) || !event.nativeEvent.isTrusted || !subject) return;
        goLive();
        touched.current = true;
        pressAt(event.clientX, event.clientY, subject);
      },
      // The keyboard reaching the stage: the example goes live and focus moves into it, to its
      // first stop, or to its last when the keyboard came back from after it.
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
    // The keyboard leaving an example the reader did nothing with: the recording plays again.
    onBlur: (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (touched.current || (next instanceof Node && stage.current?.contains(next))) return;
      setLive(false);
    },
  };
  const held = useTakeover(live);
  return {
    live,
    setLive,
    takeable,
    countTimeline,
    held,
    handlers: { ...recordingHandlers, ...liveHandlers },
  };
}
