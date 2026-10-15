import { useEffect, useId, useMemo, useRef } from 'react';
import {
  toastPlacements,
  type ToastDelivery,
  type ToastEntry,
  type ToastTimer,
} from './ToastInternals.js';
import type { ToastNotification, ToastPlacement } from './ToastTypes.js';

/** Delivers notifications immediately and tracks pause-aware visible lifetimes. */
export function useToastController(defaultPlacement: ToastPlacement) {
  const notificationIdPrefix = useId();
  const notificationSequence = useRef(0);
  const notifications = useRef(new Map<string, ToastEntry>());
  const pendingNotifications = useRef<ToastEntry[]>([]);
  const placementStores = useRef(new Map<ToastPlacement, ToastDelivery>());
  const dismissalTimers = useRef(new Map<string, ToastTimer>());
  const focusedViewports = useRef(new Set<ToastPlacement>());
  const isWindowPaused = useRef(false);
  const currentDefaultPlacement = useRef(defaultPlacement);
  currentDefaultPlacement.current = defaultPlacement;
  const isMounted = useRef(true);
  const controller = useMemo(() => {
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
    function deliverPendingNotifications() {
      if (!isMounted.current) return;
      pendingNotifications.current = pendingNotifications.current.filter((entry) => {
        const delivery = placementStores.current.get(entry.placement);
        if (!delivery) return true;
        const durationMs =
          entry.duration ?? (entry.variant === 'error' || entry.action ? Infinity : 5000);
        if (durationMs > 0 && Number.isFinite(durationMs)) {
          dismissalTimers.current.set(entry.id, {
            durationMs,
            remainingMs: durationMs,
            startedAt: Date.now(),
            pauseReasons: new Set([
              'hidden',
              ...(isWindowPaused.current ? ['window'] : []),
              ...(focusedViewports.current.has(entry.placement) ? ['viewport'] : []),
            ]),
          });
        }
        delivery.add({
          id: entry.id,
          title: entry.message,
          type: entry.variant,
          data: entry,
          priority: entry.variant === 'error' ? 'high' : 'low',
          timeout: 0,
          onClose() {
            notifications.current.delete(entry.id);
            cancelTimer(entry.id);
          },
        });
        return false;
      });
    }
    function setVisibleNotifications(placement: ToastPlacement, visibleIds: ReadonlySet<string>) {
      for (const entry of notifications.current.values()) {
        if (entry.placement !== placement) continue;
        const timer = dismissalTimers.current.get(entry.id);
        if (!timer) continue;
        if (visibleIds.has(entry.id)) {
          if (timer.pauseReasons.has('hidden')) timer.remainingMs = timer.durationMs;
          resume(entry.id, 'hidden');
        } else {
          pause(entry.id, 'hidden');
          // Hidden roots cannot retain pointer or keyboard interaction pauses.
          timer.pauseReasons.delete('hover');
          timer.pauseReasons.delete('focus');
        }
      }
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
      const entry: ToastEntry = {
        ...notification,
        id,
        placement,
        variant: notification.variant ?? 'neutral',
      };
      notifications.current.set(id, entry);
      pendingNotifications.current.push(entry);
      deliverPendingNotifications();
      return id;
    }
    function dismiss(id: string) {
      pendingNotifications.current = pendingNotifications.current.filter(
        (entry) => entry.id !== id,
      );
      cancelTimer(id);
      const entry = notifications.current.get(id);
      notifications.current.delete(id);
      if (entry) placementStores.current.get(entry.placement)?.close(id);
    }
    function clear() {
      for (const id of notifications.current.keys()) dismiss(id);
    }
    function registerPlacementStore(placement: ToastPlacement, delivery: ToastDelivery) {
      placementStores.current.set(placement, delivery);
      deliverPendingNotifications();
      // Retain the delivery through layout cleanup so passive cleanup can close
      // its store during Strict Mode replay. The controller owns both regions.
    }
    function setViewportFocused(placement: ToastPlacement, focused: boolean) {
      if (focused) focusedViewports.current.add(placement);
      else focusedViewports.current.delete(placement);
      for (const entry of notifications.current.values()) {
        if (entry.placement !== placement) continue;
        if (focused) pause(entry.id, 'viewport');
        else resume(entry.id, 'viewport');
      }
    }
    function setWindowPaused(isPaused: boolean) {
      isWindowPaused.current = isPaused;
      for (const id of dismissalTimers.current.keys()) {
        if (isPaused) pause(id, 'window');
        else resume(id, 'window');
      }
    }
    return {
      manager: { show, dismiss, clear },
      registerPlacementStore,
      deliverPendingNotifications,
      setVisibleNotifications,
      pause,
      resume,
      setViewportFocused,
      setWindowPaused,
      cancelTimer,
    };
  }, [notificationIdPrefix]);
  useEffect(() => {
    // The refs hold the same collections for the controller's lifetime.
    const entries = notifications.current;
    const viewports = focusedViewports.current;
    const timers = dismissalTimers.current;
    isMounted.current = true;
    controller.deliverPendingNotifications();
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
      pendingNotifications.current = [];
      entries.clear();
      viewports.clear();
      for (const id of timers.keys()) controller.cancelTimer(id);
    };
  }, [controller]);

  return controller;
}

export type ToastController = ReturnType<typeof useToastController>;
