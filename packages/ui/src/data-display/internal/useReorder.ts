'use client';

import {
  useEffect,
  useLayoutEffect,
  useState,
  type KeyboardEvent,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { useLatest } from '../../internal/react/useLatest.js';
import { optionModule } from '../../internal/react/useOptionModule.js';
import { dragThreshold } from '../../internal/dom/lengths.js';
import { isLiftKey, isLiftedKey, isRowMoveKey } from './reorderKeys.js';
import type {
  createReorder,
  Reorder,
  ReorderAnnouncements,
  ReorderHandlers,
  ReorderOptions,
} from './reorderController.js';

export type { ReorderHandlers };

export interface Announcement {
  text: string;
  count: number;
}

const controllerLoadedOnlyByReorderableLists = optionModule(() => import('./reorderController.js'));

function replayableCopy<E extends SyntheticEvent>(event: E): E {
  const { currentTarget: currentTargetReactClearsAfterItsHandlers, target } = event;
  return Object.assign(Object.create(event) as E, {
    currentTarget: currentTargetReactClearsAfterItsHandlers,
    target,
    preventDefault: tooLateOnceReplayed,
    stopPropagation: tooLateOnceReplayed,
  });
}

function tooLateOnceReplayed() {}

function createDeferredReorder(read: () => ReorderOptions, announce: (text: string) => void) {
  let controller: Reorder | null = null;
  let failed = false;
  let waiting: (() => void)[] = [];
  let liftedWhileWaiting = false;
  let waitingPressStartY: number | null = null;
  let waitingPressDragged = false;
  let replaying = false;
  let replayMovedARow = false;
  const waits = () => !controller && !failed;
  const passOrKeepUntilLoaded = <E extends SyntheticEvent>(
    event: E,
    call: (handlers: ReorderHandlers, event: E) => void,
  ) => {
    if (controller) call(controller.handlers, event);
    else if (!failed) {
      const kept = replayableCopy(event);
      waiting.push(() => call(controller!.handlers, kept));
    }
  };
  const replayUntilARowMoves = () => {
    replaying = true;
    for (const call of waiting) {
      call();
      if (replayMovedARow) break;
    }
    replaying = false;
  };
  const handlers: ReorderHandlers = {
    handleKeyDown(event, row, label) {
      if (waits()) {
        if (isLiftKey(event.key)) {
          event.preventDefault();
          if (!event.repeat) liftedWhileWaiting = !liftedWhileWaiting;
        } else if (liftedWhileWaiting && isLiftedKey(event.key)) {
          event.preventDefault();
          if (event.key === 'Escape') {
            event.stopPropagation();
            liftedWhileWaiting = false;
          }
        } else if (event.key === 'Tab') liftedWhileWaiting = false;
      }
      passOrKeepUntilLoaded(event, (each, kept) => each.handleKeyDown(kept, row, label));
    },
    handleKeyUp(event) {
      if (waits() && event.key === ' ') event.preventDefault();
      passOrKeepUntilLoaded(event, (each, kept) => each.handleKeyUp(kept));
    },
    handleClick(event, row, label) {
      const pressWithoutDragTogglesLift = !waitingPressDragged;
      if (waits() && pressWithoutDragTogglesLift) liftedWhileWaiting = !liftedWhileWaiting;
      waitingPressDragged = false;
      passOrKeepUntilLoaded(event, (each, kept) => each.handleClick(kept, row, label));
    },
    handleBlur() {
      if (failed) return;
      if (controller) controller.handlers.handleBlur();
      else {
        liftedWhileWaiting = false;
        waiting.push(() => controller!.handlers.handleBlur());
      }
    },
    handlePointerDown(event, row, label) {
      if (waits() && event.button === 0) {
        waitingPressStartY = event.clientY;
        waitingPressDragged = false;
        const handle = event.currentTarget;
        handle.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        handle.focus({ preventScroll: true });
      }
      passOrKeepUntilLoaded(event, (each, kept) => each.handlePointerDown(kept, row, label));
    },
    handlePointerMove(event) {
      if (controller) controller.handlers.handlePointerMove(event);
      else if (waitingPressStartY !== null) {
        if (Math.abs(event.clientY - waitingPressStartY) >= dragThreshold)
          waitingPressDragged = true;
        passOrKeepUntilLoaded(event, (each, kept) => each.handlePointerMove(kept));
      }
    },
    handlePointerUp(event) {
      waitingPressStartY = null;
      passOrKeepUntilLoaded(event, (each, kept) => each.handlePointerUp(kept));
    },
    handlePointerCancel(event) {
      waitingPressStartY = null;
      passOrKeepUntilLoaded(event, (each, kept) => each.handlePointerCancel(kept));
    },
    rowKeyDown(event: KeyboardEvent<HTMLElement>, row, label) {
      if (waits() && isRowMoveKey(event)) event.preventDefault();
      passOrKeepUntilLoaded(event, (each, kept) => each.rowKeyDown(kept, row, label));
    },
  };
  return {
    handlers,
    load(module: { createReorder: typeof createReorder }) {
      controller = module.createReorder(() => {
        const options = read();
        if (!replaying) return options;
        return {
          ...options,
          onReorder: (from: number, to: number) => {
            replayMovedARow = true;
            options.onReorder?.(from, to);
          },
        };
      }, announce);
      replayUntilARowMoves();
      waiting = [];
    },
    fail() {
      failed = true;
      waiting = [];
    },
    restoreFocus: () => controller?.restoreFocus(),
    dispose: () => controller?.dispose(),
  };
}

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
  controllerLoadedOnlyByReorderableLists.preload();
  useEffect(() => {
    let mounted = true;
    controllerLoadedOnlyByReorderableLists.load().then(
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
