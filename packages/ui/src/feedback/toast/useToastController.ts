import { useEffect, useId, useMemo, useRef } from 'react';
import { toastPlacements } from './ToastTypes.js';
import type {
  ToastDelivery,
  ToastEntry,
  ToastNotification,
  ToastPlacement,
  ToastTimer,
} from './ToastTypes.js';

/** Owns notification queues, delivery stores, and pause-aware dismissal timers. */
export function useToastController(defaultPlacement: ToastPlacement, visibleLimit: number) {
  const notificationIdPrefix = useId();
  const notificationSequence = useRef(0);
  const visibleNotifications = useRef(new Map<string, ToastEntry>());
  const queuedNotifications = useRef<ToastEntry[]>([]);
  const placementStores = useRef(new Map<ToastPlacement, ToastDelivery>());
  const dismissalTimers = useRef(new Map<string, ToastTimer>());
  const focusedRegions = useRef(new Set<ToastPlacement>());
  const isWindowPaused = useRef(false);
  const currentDefaultPlacement = useRef(defaultPlacement);
  currentDefaultPlacement.current = defaultPlacement;
  const isMounted = useRef(true);
  const currentVisibleLimit = useRef(visibleLimit);
  currentVisibleLimit.current = visibleLimit;
  const controller = useMemo(() => {
    const queueListeners = new Set<() => void>();
    const queuedCounts: Record<ToastPlacement, number> = { 'bottom-right': 0, 'top-center': 0 };

    function notifyQueueChanges() {
      let changed = false;
      for (const placement of toastPlacements) {
        const count = queuedNotifications.current.filter(
          (entry) => entry.placement === placement,
        ).length;
        if (queuedCounts[placement] !== count) {
          queuedCounts[placement] = count;
          changed = true;
        }
      }
      if (changed) queueListeners.forEach((listener) => listener());
    }
    function subscribeToQueue(listener: () => void) {
      queueListeners.add(listener);
      return () => {
        queueListeners.delete(listener);
      };
    }
    function getQueuedCount(placement: ToastPlacement) {
      return queuedCounts[placement];
    }
    function cancelTimer(id: string) {
      clearTimeout(dismissalTimers.current.get(id)?.handle);
      dismissalTimers.current.delete(id);
    }
    function scheduleDismissal(id: string, timer: ToastTimer) {
      if (timer.pauseReasons.size || !isMounted.current) return;
      timer.startedAt = Date.now();
      // Browsers clamp longer delays to a signed 32-bit integer. Schedule long
      // finite durations in chunks rather than accidentally dismissing immediately.
      timer.handle = setTimeout(
        () => {
          timer.remainingMs = Math.max(0, timer.remainingMs - (Date.now() - timer.startedAt));
          if (timer.remainingMs > 0) scheduleDismissal(id, timer);
          else dismiss(id);
        },
        Math.min(timer.remainingMs, 2_147_483_647),
      );
    }
    function pause(id: string, reason: string) {
      const timer = dismissalTimers.current.get(id);
      if (!timer || timer.pauseReasons.has(reason)) return;
      if (!timer.pauseReasons.size) {
        timer.remainingMs = Math.max(0, timer.remainingMs - (Date.now() - timer.startedAt));
        clearTimeout(timer.handle);
        timer.handle = undefined;
      }
      timer.pauseReasons.add(reason);
    }
    function resume(id: string, reason: string) {
      const timer = dismissalTimers.current.get(id);
      if (timer?.pauseReasons.delete(reason) && !timer.pauseReasons.size)
        scheduleDismissal(id, timer);
    }
    function showQueuedNotifications() {
      if (!isMounted.current) return;
      for (const placement of toastPlacements) {
        const delivery = placementStores.current.get(placement);
        if (!delivery) continue;
        let visibleCount = [...visibleNotifications.current.values()].filter(
          (entry) => entry.placement === placement,
        ).length;
        while (visibleCount < currentVisibleLimit.current) {
          const queuedIndex = queuedNotifications.current.findIndex(
            (entry) => entry.placement === placement,
          );
          if (queuedIndex < 0) break;
          const [entry] = queuedNotifications.current.splice(queuedIndex, 1);
          visibleNotifications.current.set(entry.id, entry);
          visibleCount++;
          delivery.add({
            id: entry.id,
            title: entry.message,
            type: entry.variant,
            data: entry,
            priority: entry.variant === 'error' ? 'high' : 'low',
            timeout: 0,
            onRemove() {
              visibleNotifications.current.delete(entry.id);
              cancelTimer(entry.id);
              // Base UI removes the old item after this callback. Refill afterward.
              queueMicrotask(showQueuedNotifications);
            },
          });
          const durationMs =
            entry.duration ?? (entry.variant === 'error' || entry.action ? Infinity : 5000);
          if (durationMs > 0 && Number.isFinite(durationMs)) {
            const initialPauseReasons = [
              ...(isWindowPaused.current ? ['window'] : []),
              ...(focusedRegions.current.has(placement) ? ['viewport'] : []),
            ];
            const timer: ToastTimer = {
              remainingMs: durationMs,
              startedAt: Date.now(),
              pauseReasons: new Set(initialPauseReasons),
            };
            dismissalTimers.current.set(entry.id, timer);
            scheduleDismissal(entry.id, timer);
          }
        }
      }
      notifyQueueChanges();
    }
    function show(notification: ToastNotification) {
      if (
        notification.duration != null &&
        notification.duration !== Infinity &&
        (!Number.isFinite(notification.duration) || notification.duration < 0)
      )
        throw new RangeError('Toast duration must be a nonnegative number or Infinity.');
      const placement = notification.placement ?? currentDefaultPlacement.current;
      if (!toastPlacements.includes(placement))
        throw new RangeError('Unsupported toast placement.');
      const id = `${notificationIdPrefix}-toast-${++notificationSequence.current}`;
      queuedNotifications.current.push({
        ...notification,
        id,
        placement,
        variant: notification.variant ?? 'neutral',
      });
      showQueuedNotifications();
      return id;
    }
    function dismiss(id: string) {
      queuedNotifications.current = queuedNotifications.current.filter((entry) => entry.id !== id);
      notifyQueueChanges();
      cancelTimer(id);
      const entry = visibleNotifications.current.get(id);
      if (entry) placementStores.current.get(entry.placement)?.close(id);
    }
    function clear() {
      queuedNotifications.current = [];
      notifyQueueChanges();
      for (const id of visibleNotifications.current.keys()) dismiss(id);
    }
    function registerPlacementStore(placement: ToastPlacement, delivery: ToastDelivery) {
      placementStores.current.set(placement, delivery);
      showQueuedNotifications();
      // Retain the delivery through layout cleanup so passive cleanup can close
      // its store during Strict Mode replay. The controller owns both regions.
    }
    function setPlacementFocused(placement: ToastPlacement, focused: boolean) {
      if (focused) focusedRegions.current.add(placement);
      else focusedRegions.current.delete(placement);
      for (const entry of visibleNotifications.current.values())
        if (entry.placement === placement)
          focused ? pause(entry.id, 'viewport') : resume(entry.id, 'viewport');
    }
    function setWindowPaused(isPaused: boolean) {
      isWindowPaused.current = isPaused;
      for (const id of dismissalTimers.current.keys())
        isPaused ? pause(id, 'window') : resume(id, 'window');
    }
    return {
      manager: { show, dismiss, clear },
      subscribeToQueue,
      getQueuedCount,
      registerPlacementStore,
      showQueuedNotifications,
      pause,
      resume,
      setPlacementFocused,
      setWindowPaused,
      cancelTimer,
    };
  }, [notificationIdPrefix]);
  useEffect(() => {
    isMounted.current = true;
    controller.showQueuedNotifications();
    const blur = () => controller.setWindowPaused(true);
    const focus = () => controller.setWindowPaused(document.visibilityState === 'hidden');
    window.addEventListener('blur', blur);
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', focus);
    focus();
    return () => {
      isMounted.current = false;
      window.removeEventListener('blur', blur);
      window.removeEventListener('focus', focus);
      document.removeEventListener('visibilitychange', focus);
      controller.manager.clear();
      queuedNotifications.current = [];
      visibleNotifications.current.clear();
      focusedRegions.current.clear();
      for (const id of dismissalTimers.current.keys()) controller.cancelTimer(id);
    };
  }, [controller]);
  useEffect(controller.showQueuedNotifications, [controller, visibleLimit]);

  return controller;
}

export type ToastController = ReturnType<typeof useToastController>;
