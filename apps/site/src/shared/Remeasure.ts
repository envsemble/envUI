export const pixelTolerance = 0.5;

export type Change = 'update' | 'resize' | 'mutation' | 'event' | 'fonts';

export interface RemeasureOn {
  first?: 'now' | 'frame';
  resize: readonly Element[];
  mutation?: {
    target: Node;
    options: MutationObserverInit;
    counts?: (records: MutationRecord[]) => boolean;
  };
  events?: readonly { target: EventTarget; types: readonly string[] }[];
  fonts?: boolean;
}

export interface Remeasuring {
  update: () => void;
  observe: (element: Element) => void;
  stop: () => void;
}

export function remeasure(
  measure: (changed: ReadonlySet<Change>) => void,
  on: RemeasureOn,
): Remeasuring {
  let frame = 0;
  let active = true;
  const changed = new Set<Change>();
  const run = () => {
    const changedSinceLastMeasure = new Set(changed);
    changed.clear();
    measure(changedSinceLastMeasure);
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
