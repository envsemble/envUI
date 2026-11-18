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

const operable =
  'a[href], button:not(:disabled), input:not(:disabled, [type="hidden"]), select:not(:disabled), textarea:not(:disabled), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

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

const onPause = (event: { target: EventTarget }) =>
  event.target instanceof Element && Boolean(event.target.closest('.catalogue-motion-pause'));

export function useReaderTakeover(
  stage: RefObject<HTMLDivElement | null>,
  subject: HTMLElement | null,
) {
  const [live, setLive] = useState(false);
  const touched = useRef(false);
  const timelines = useRef(0);
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
    let everOperable = false;
    const check = () => {
      everOperable ||= Boolean(subject.querySelector(operable));
      if (everOperable) observer.disconnect();
      setTakeable(timelines.current === 0 && everOperable);
    };
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
      onClick: (event: MouseEvent) => {
        if (onPause(event) || !event.nativeEvent.isTrusted || !subject) return;
        goLive();
        touched.current = true;
        pressAt(event.clientX, event.clientY, subject);
      },
      onFocus: (event: FocusEvent) => {
        const element = stage.current;
        if (event.target !== element || !element.matches(':focus-visible') || !subject) return;
        const cameBackFromAfter =
          event.relatedTarget instanceof Node &&
          Boolean(
            element.compareDocumentPosition(event.relatedTarget) & Node.DOCUMENT_POSITION_FOLLOWING,
          );
        goLive();
        const stops = [...subject.querySelectorAll<HTMLElement>(operable)].filter(
          (stop) => stop.tabIndex >= 0 && stop.getClientRects().length > 0,
        );
        (cameBackFromAfter ? stops.at(-1) : stops[0])?.focus();
      },
    };
  const liveHandlers = live && {
    onPointerDown: (event: { target: EventTarget }) => {
      if (!onPause(event)) touched.current = true;
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (!['Tab', 'Shift'].includes(event.key) && !onPause(event)) touched.current = true;
    },
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
