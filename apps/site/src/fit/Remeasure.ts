/** What made a measure run again (remeasure): a call, a resize, a mutation, an event or the fonts. */
export type Change = 'update' | 'resize' | 'mutation' | 'event' | 'fonts';

/** What a measure follows (remeasure). */
export interface RemeasureOn {
  /**
   * Whether it measures at once or in the next frame as it starts; absent, once its resize observer
   * first reports the elements, as it does for every element it starts observing.
   */
  first?: 'now' | 'frame';
  /** The elements whose size it follows. */
  resize: readonly Element[];
  /** A subtree whose changes it follows, and which of them count (all, absent). */
  mutation?: {
    target: Node;
    options: MutationObserverInit;
    counts?: (records: MutationRecord[]) => boolean;
  };
  /** The events it follows, such as an overlay's transition ending, by what hears them. */
  events?: readonly { target: EventTarget; types: readonly string[] }[];
  /** Whether it measures again once the web fonts are ready. */
  fonts?: boolean;
}

/** A measure that follows what changes it (remeasure). */
export interface Remeasuring {
  /** Measures again in the next frame. */
  update: () => void;
  /** Follows the size of another element too, such as one the measure found. */
  observe: (element: Element) => void;
  /** Stops it: nothing it follows measures again, also what comes later, such as the fonts. */
  stop: () => void;
}

/**
 * Runs `measure` again in the next frame whenever what it follows changes, once a frame however
 * many changes come, and tells it what changed since it last ran: each change measures it again
 * however late it comes, so no timing decides what it measures. The site's fits and figures that
 * measure what they show follow it so. It follows until `stop`, as its figure goes or changes:
 * what comes after that, such as the fonts arriving, measures nothing.
 */
export function remeasure(
  measure: (changed: ReadonlySet<Change>) => void,
  on: RemeasureOn,
): Remeasuring {
  let frame = 0;
  let active = true;
  const changed = new Set<Change>();
  // What changed is handed over before the measure runs, which may ask to measure again.
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
