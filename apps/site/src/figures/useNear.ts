import { startTransition, useEffect, useRef, useState, type RefObject } from 'react';
import { onIdle, scrollerOf } from '../shared/Idle';

const inViewMargin = '0px';
const nearViewMargin = '600px 0px';
const loadAheadMargin = '1800px 0px';

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
    const inView = watch(inViewMargin, () => {
      cancelNear();
      if (shown) return;
      shown = true;
      inViewTogether(approaching.current, () => setNear(true));
    });
    const nearView = watch(
      nearViewMargin,
      () => {
        cancelNear();
        cancelNear = whenIdle(() => startTransition(() => setNear(true)));
      },
      () => cancelNear(),
    );
    let approached = false;
    const ahead = approaching.current
      ? watch(
          loadAheadMargin,
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
      nearView.disconnect();
      ahead?.disconnect();
      cancelNear();
      cancelAhead();
    };
  }, [element, near]);
  return near;
}

interface CameIntoView {
  loads: Promise<unknown>[];
  renders: (() => void)[];
}
let cameIntoView: CameIntoView | null = null;

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

const idleTasks = new Set<() => Promise<unknown> | void>();
let idleRunning = false;

function runIdle() {
  const [task] = idleTasks;
  if (!task) {
    idleRunning = false;
    return;
  }
  idleTasks.delete(task);
  void Promise.resolve(task())
    .catch(() => undefined)
    .then(() => onIdle(runIdle));
}

function whenIdle(task: () => Promise<unknown> | void) {
  idleTasks.add(task);
  if (!idleRunning) {
    idleRunning = true;
    onIdle(runIdle);
  }
  return () => void idleTasks.delete(task);
}
