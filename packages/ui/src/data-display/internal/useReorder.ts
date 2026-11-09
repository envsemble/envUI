'use client';

import {
  useEffect,
  useLayoutEffect,
  useState,
  type KeyboardEvent,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { useLatest } from '../../internal/useLatest.js';
import { optionModule } from '../../internal/react/useOptionModule.js';
import { dragThreshold, isLiftKey, isLiftedKey, isRowMoveKey } from './reorderKeys.js';
import type {
  createReorder,
  Reorder,
  ReorderAnnouncements,
  ReorderHandlers,
  ReorderOptions,
} from './reorderController.js';

export type { ReorderHandlers };

/** The latest announcement, and how many there have been, so a repeat is told apart. */
export interface Announcement {
  text: string;
  count: number;
}

/**
 * The code that moves the rows, which only a reorderable list loads: it starts loading as the list
 * renders, so it is there by the time people reach a handle, and what they do before it is, such
 * as a drag begun at once, waits for it.
 */
const controllerModule = optionModule(() => import('./reorderController.js'));

/**
 * An event as it was dispatched, to hand to the controller once it has loaded. React clears an
 * event's currentTarget once its handlers have run, so it is kept; preventing its default then
 * would come too late, so the handlers below do that as it happens.
 */
function replayed<E extends SyntheticEvent>(event: E): E {
  const { currentTarget, target } = event;
  return Object.assign(Object.create(event) as E, {
    currentTarget,
    target,
    preventDefault() {},
    stopPropagation() {},
  });
}

/**
 * Handlers for a list's rows and handles that pass each event to the controller, or, until it has
 * loaded, keep it for the controller to handle as it arrives, in order. Meanwhile they do at once
 * what can't wait, by the controller's own rules (reorderKeys.ts): preventing the default of a key
 * or a press it takes, and capturing a pressed pointer so the drag's moves still reach the handle.
 * Where the controller fails to load, they leave every event alone.
 */
function createDeferredReorder(read: () => ReorderOptions, announce: (text: string) => void) {
  let controller: Reorder | null = null;
  let failed = false;
  let waiting: (() => void)[] = [];
  /** Whether the events that wait have lifted a row by its handle's keys or a press of it. */
  let liftHeld = false;
  /** Where a press of a handle that waits started, so its moves wait too; and whether it dragged. */
  let pressedAt: number | null = null;
  let dragged = false;
  /** Set once a replayed event has had the application move a row (see load). */
  let replaying = false;
  let reordered = false;
  const waits = () => !controller && !failed;
  /** Hands the event to the controller, or keeps it, as it was dispatched, until it has loaded. */
  const pass = <E extends SyntheticEvent>(
    event: E,
    call: (handlers: ReorderHandlers, event: E) => void,
  ) => {
    if (controller) call(controller.handlers, event);
    else if (!failed) {
      const kept = replayed(event);
      waiting.push(() => call(controller!.handlers, kept));
    }
  };
  const handlers: ReorderHandlers = {
    handleKeyDown(event, row, label) {
      if (waits()) {
        if (isLiftKey(event.key)) {
          event.preventDefault();
          if (!event.repeat) liftHeld = !liftHeld;
        } else if (liftHeld && isLiftedKey(event.key)) {
          event.preventDefault();
          if (event.key === 'Escape') {
            event.stopPropagation();
            liftHeld = false;
          }
        } else if (event.key === 'Tab') liftHeld = false;
      }
      pass(event, (each, kept) => each.handleKeyDown(kept, row, label));
    },
    handleKeyUp(event) {
      if (waits() && event.key === ' ') event.preventDefault();
      pass(event, (each, kept) => each.handleKeyUp(kept));
    },
    handleClick(event, row, label) {
      // A press that didn't drag lifts the row, or drops it.
      if (waits() && !dragged) liftHeld = !liftHeld;
      dragged = false;
      pass(event, (each, kept) => each.handleClick(kept, row, label));
    },
    handleBlur() {
      if (failed) return;
      if (controller) controller.handlers.handleBlur();
      else {
        liftHeld = false;
        waiting.push(() => controller!.handlers.handleBlur());
      }
    },
    handlePointerDown(event, row, label) {
      if (waits() && event.button === 0) {
        pressedAt = event.clientY;
        dragged = false;
        const handle = event.currentTarget;
        handle.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        handle.focus({ preventScroll: true });
      }
      pass(event, (each, kept) => each.handlePointerDown(kept, row, label));
    },
    handlePointerMove(event) {
      if (controller) controller.handlers.handlePointerMove(event);
      else if (pressedAt !== null) {
        if (Math.abs(event.clientY - pressedAt) >= dragThreshold) dragged = true;
        pass(event, (each, kept) => each.handlePointerMove(kept));
      }
    },
    handlePointerUp(event) {
      pressedAt = null;
      pass(event, (each, kept) => each.handlePointerUp(kept));
    },
    handlePointerCancel(event) {
      pressedAt = null;
      pass(event, (each, kept) => each.handlePointerCancel(kept));
    },
    rowKeyDown(event: KeyboardEvent<HTMLElement>, row, label) {
      if (waits() && isRowMoveKey(event)) event.preventDefault();
      pass(event, (each, kept) => each.rowKeyDown(kept, row, label));
    },
  };
  return {
    handlers,
    /**
     * Takes the loaded controller and hands it what waited for it, until one of those events has
     * the application move a row: the rows move in the DOM only once it has rendered again, so
     * what came after would read the old order and move the wrong row. It is dropped.
     */
    load(module: { createReorder: typeof createReorder }) {
      controller = module.createReorder(() => {
        const options = read();
        if (!replaying) return options;
        return {
          ...options,
          onReorder: (from: number, to: number) => {
            reordered = true;
            options.onReorder?.(from, to);
          },
        };
      }, announce);
      replaying = true;
      for (const call of waiting) {
        call();
        if (reordered) break;
      }
      replaying = false;
      waiting = [];
    },
    /** The controller didn't load: the rows can't move, and their events are left alone. */
    fail() {
      failed = true;
      waiting = [];
    },
    restoreFocus: () => controller?.restoreFocus(),
    dispose: () => controller?.dispose(),
  };
}

/**
 * Moving the rows of a list by keyboard and pointer, with a preview while the row moves and one
 * onReorder(from, to) when it is dropped.
 *
 * - The handle's keys: Space or Enter lifts the row, ↑ and ↓ move it, Home and End move it to an
 *   end, Space or Enter drops it, and Escape or Tab puts it back. Losing focus puts it back too.
 * - A press of the handle without dragging lifts the row as the keys do, and another drops it.
 *   While the row is lifted, the handle is pressed (aria-pressed).
 * - Alt+↑ or Alt+↓ on the row's target moves it one place at once.
 * - Dragging the handle moves the row with the pointer and scrolls the nearest scroll area near its
 *   edges.
 *
 * Each step is announced through `announcement`, which the list shows in a polite live region,
 * and so is a move that the start or the end of the list stops.
 * After a move, focus returns to the handle or target that moved the row.
 */
export function useReorder(
  list: RefObject<HTMLElement | null>,
  onReorder: ((from: number, to: number) => void) | undefined,
  announcements: ReorderAnnouncements,
  formatNumber: (value: number) => string,
) {
  const [announcement, setAnnouncement] = useState<Announcement>({ text: '', count: 0 });
  const latest = useLatest({ onReorder, announcements, formatNumber });
  const [reorder] = useState(() =>
    createDeferredReorder(
      () => ({ list: list.current, ...latest.current }),
      (text) => setAnnouncement((last) => ({ text, count: last.count + 1 })),
    ),
  );
  // Loading starts as the list first renders; the controller is made once it is in the page.
  controllerModule.preload();
  useEffect(() => {
    let mounted = true;
    controllerModule.load().then(
      (module) => {
        if (mounted) reorder.load(module);
      },
      () => reorder.fail(),
    );
    return () => {
      mounted = false;
      reorder.dispose();
    };
  }, [reorder]);
  useLayoutEffect(() => reorder.restoreFocus());
  return { announcement, handlers: reorder.handlers };
}
