/*
 * The site's measuring loop. Every part of the site that sets a size or a scale from what it
 * measures on the page (the fits, the figures, the specimens, the tiles and the motion stages)
 * measures through `remeasure`. It is the only place that creates a ResizeObserver: ESLint
 * rejects one anywhere else in the site.
 */

/**
 * Lengths closer than this, in px, count as the same length. Boxes placed at whole pixels, or
 * measured a second time, come out a fraction of a pixel off, and a measure that reacted to that
 * would move things back and forth.
 */
export const pixelTolerance = 0.5;

/** What caused a measure to run: `update`, a resize, a mutation, an event, or the fonts. */
export type Change = 'update' | 'resize' | 'mutation' | 'event' | 'fonts';

/** What `remeasure` watches. */
export interface RemeasureOn {
  /**
   * When the first measure runs. `now` runs it synchronously inside `remeasure`, and `frame` in
   * the next animation frame. Absent, it runs when the resize observer first reports the
   * elements, which a ResizeObserver does for every element it starts observing.
   */
  first?: 'now' | 'frame';
  /** The elements whose size changes trigger a measure. */
  resize: readonly Element[];
  /**
   * A subtree whose mutations trigger a measure. `counts`, when given, filters the records:
   * the measure runs only when it returns true.
   */
  mutation?: {
    target: Node;
    options: MutationObserverInit;
    counts?: (records: MutationRecord[]) => boolean;
  };
  /** Events that trigger a measure, each list of types on its target, such as `transitionend`. */
  events?: readonly { target: EventTarget; types: readonly string[] }[];
  /** Whether to measure again once the web fonts have loaded. */
  fonts?: boolean;
}

/** The handle `remeasure` returns. */
export interface Remeasuring {
  /** Asks for a measure in the next frame. */
  update: () => void;
  /** Adds an element whose size changes trigger a measure, such as one the measure found. */
  observe: (element: Element) => void;
  /**
   * Stops watching. Nothing triggers a measure after this, including callbacks already on their
   * way, such as the fonts finishing loading.
   */
  stop: () => void;
}

/**
 * Calls `measure` in the next animation frame whenever something it watches changes, and passes
 * it the set of changes since the last call. Several changes in one frame cause one call. Every
 * change triggers a measure no matter how late it arrives, so the result does not depend on
 * timing. Call `stop` when the measured element goes away or its inputs change.
 */
export function remeasure(
  measure: (changed: ReadonlySet<Change>) => void,
  on: RemeasureOn,
): Remeasuring {
  let frame = 0;
  let active = true;
  const changed = new Set<Change>();
  // The changes are copied and cleared before the measure runs, because the measure may itself
  // ask for another one.
  const run = () => {
    const now = new Set(changed);
    changed.clear();
    measure(now);
  };
  const request = (change: Change) => {
    if (!active) return;
    changed.add(change);
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(run);
  };
  const update = () => request('update');
  const heard = () => request('event');
  const resize = new ResizeObserver(() => request('resize'));
  for (const element of on.resize) resize.observe(element);
  const { mutation } = on;
  let changes: MutationObserver | undefined;
  if (mutation) {
    changes = new MutationObserver((records) => {
      if (!mutation.counts || mutation.counts(records)) request('mutation');
    });
    changes.observe(mutation.target, mutation.options);
  }
  for (const { target, types } of on.events ?? [])
    for (const type of types) target.addEventListener(type, heard);
  if (on.fonts) void document.fonts?.ready.then(() => request('fonts'));
  if (on.first === 'now') measure(new Set(['update']));
  else if (on.first === 'frame') update();
  return {
    update,
    observe: (element) => resize.observe(element),
    stop() {
      active = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      changes?.disconnect();
      for (const { target, types } of on.events ?? [])
        for (const type of types) target.removeEventListener(type, heard);
    },
  };
}
