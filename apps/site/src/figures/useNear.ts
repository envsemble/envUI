import { startTransition, useEffect, useRef, useState, type RefObject } from 'react';

/**
 * The box an element scrolls in, such as the scaffold's body the page scrolls inside, or none where
 * it scrolls with the document.
 */
function scrollerOf(element: Element) {
  for (let node = element.parentElement; node; node = node.parentElement)
    if (/auto|scroll|overlay/.test(getComputedStyle(node).overflowY)) return node;
  return null;
}

/**
 * Whether an element is near the viewport, once: the tiles render their examples from then on.
 * Further off, `approach` runs once, such as to start loading a tile's module, so it is there by
 * the time the tile renders. Near is measured in the box the page scrolls in: measured against the
 * window, that box would clip the tiles until they scroll into it, and a margin around the window
 * would never look ahead.
 */
export function useNear(
  element: RefObject<HTMLElement | null>,
  approach?: () => Promise<unknown> | void,
) {
  const [near, setNear] = useState(false);
  const approaching = useRef(approach);
  approaching.current = approach;
  useEffect(() => {
    const target = element.current;
    if (!target || near) return;
    const root = scrollerOf(target);
    // What is in view renders at once, as after a jump down the page, every tile that comes into
    // view together in one pass (inViewTogether); what is near it once the page is idle, one tile
    // after another, while it stays near: a tile scrolled past before its turn comes waits until it
    // nears the view again.
    const watch = (margin: string, enter: () => void, leave: () => void = () => {}) => {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries.at(-1);
          if (entry?.isIntersecting) enter();
          else leave();
        },
        { root, rootMargin: margin },
      );
      observer.observe(target);
      return observer;
    };
    let cancelNear = () => {};
    let cancelAhead = () => {};
    let shown = false;
    const inView = watch('0px', () => {
      cancelNear();
      if (shown) return;
      shown = true;
      inViewTogether(approaching.current, () => setNear(true));
    });
    const close = watch(
      '600px 0px',
      () => {
        cancelNear();
        cancelNear = whenIdle(() => startTransition(() => setNear(true)));
      },
      () => cancelNear(),
    );
    let approached = false;
    const ahead = approaching.current
      ? watch(
          '1800px 0px',
          () => {
            cancelAhead();
            cancelAhead = whenIdle(() => {
              approached = true;
              ahead?.disconnect();
              return approaching.current?.();
            });
          },
          () => {
            if (!approached) cancelAhead();
          },
        )
      : null;
    return () => {
      inView.disconnect();
      close.disconnect();
      ahead?.disconnect();
      cancelNear();
      cancelAhead();
    };
  }, [element, near]);
  return near;
}

/** The tiles that came into view in this frame: what each loads, and how each renders. */
interface CameIntoView {
  loads: Promise<unknown>[];
  renders: (() => void)[];
}
let cameIntoView: CameIntoView | null = null;

/**
 * Renders the tiles that come into view in one frame, such as after a jump down the page, in one
 * pass, once what each loads, such as its module, is there: they appear together rather than one
 * by one as each arrives.
 */
function inViewTogether(load: (() => Promise<unknown> | void) | undefined, render: () => void) {
  let batch = cameIntoView;
  if (!batch) {
    const next: CameIntoView = { loads: [], renders: [] };
    batch = cameIntoView = next;
    requestAnimationFrame(() => {
      cameIntoView = null;
      void Promise.all(next.loads).then(() => {
        for (const each of next.renders) each();
      });
    });
  }
  batch.loads.push(Promise.resolve(load?.()).catch(() => undefined));
  batch.renders.push(render);
}

/**
 * The tasks waiting for the page to be idle, run one to each idle moment, so the tiles ahead of the
 * view come in one by one rather than all at once, each fitted before the next, and what is in
 * view, such as the tiles after a jump down the page, loads and renders first.
 */
const idleTasks = new Set<() => Promise<unknown> | void>();
let idleRunning = false;

function runIdle() {
  const [task] = idleTasks;
  if (!task) {
    idleRunning = false;
    return;
  }
  idleTasks.delete(task);
  // A task that loads, such as a tile's module, holds the next until it has loaded.
  void Promise.resolve(task())
    .catch(() => undefined)
    .then(() => later(runIdle));
}

const later = (step: () => void) =>
  typeof requestIdleCallback === 'function'
    ? requestIdleCallback(step, { timeout: 1000 })
    : window.setTimeout(step, 50);

/** Runs a task once the page is idle, after those before it; returns its cancel. */
function whenIdle(task: () => Promise<unknown> | void) {
  idleTasks.add(task);
  if (!idleRunning) {
    idleRunning = true;
    later(runIdle);
  }
  return () => void idleTasks.delete(task);
}
