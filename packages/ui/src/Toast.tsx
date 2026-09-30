import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { Button } from './Primitives.js';
import { Theme, useTheme } from './Theme.js';
import { CheckCircle } from './icons/CheckCircle.js';
import { Info } from './icons/Info.js';
import { Warning } from './icons/Warning.js';
import { Close } from './icons/Close.js';

export type ToastVariant = 'neutral' | 'success' | 'info' | 'error';
export type ToastPlacement = 'bottom-right' | 'top-center';
export interface ToastAction {
  label: string;
  onClick: () => void;
}
export interface ToastProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  message: string;
  variant?: ToastVariant;
  action?: ToastAction;
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Disable announcements for static examples; defaults to true for app feedback. */
  announce?: boolean;
}

function StatusIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'neutral') return null;
  const Icon = variant === 'success' ? CheckCircle : variant === 'info' ? Info : Warning;
  return (
    <span className="env-symbol env-toast-status-icon">
      <Icon />
    </span>
  );
}

function ToastBody({
  variant,
  message,
  action,
  dismiss,
}: {
  variant: ToastVariant;
  message: ReactNode;
  action?: ReactNode;
  dismiss?: ReactNode;
}) {
  return (
    <>
      <StatusIcon variant={variant} />
      {message}
      {action}
      {dismiss}
    </>
  );
}

/** Manual presentation. The consumer owns placement, visibility, and any timer. */
export function Toast({
  variant = 'neutral',
  message,
  action,
  onDismiss,
  dismissLabel = 'Dismiss notification',
  announce = true,
  className,
  ...props
}: ToastProps) {
  return (
    <div
      {...props}
      className={['env-toast', `env-toast-${variant}`, className].filter(Boolean).join(' ')}
      role={props.role ?? (announce ? (variant === 'error' ? 'alert' : 'status') : undefined)}
    >
      <ToastBody
        variant={variant}
        message={
          <span className="env-toast-message" title={message}>
            {message}
          </span>
        }
        action={
          action && (
            <Button className="env-toast-action" onClick={action.onClick}>
              {action.label}
            </Button>
          )
        }
        dismiss={
          onDismiss && (
            <button
              type="button"
              className="env-toast-dismiss"
              aria-label={dismissLabel}
              onClick={onDismiss}
            >
              <span className="env-symbol">
                <Close />
              </span>
            </button>
          )
        }
      />
    </div>
  );
}

export interface ToastNotification {
  message: string;
  variant?: ToastVariant;
  action?: ToastAction;
  placement?: ToastPlacement;
  dismissible?: boolean;
  /** Auto-dismiss milliseconds for non-error notices without actions. Zero persists. */
  duration?: number;
}
export interface ToastManager {
  show: (notification: ToastNotification) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}
export interface ToastProviderProps {
  children: ReactNode;
  defaultPlacement?: ToastPlacement;
  /** Capacity for each placement; queued notices begin their timer when displayed. */
  visibleLimit?: number;
}

type Entry = ToastNotification & { id: string; variant: ToastVariant; placement: ToastPlacement };
type Delivery = Pick<ReturnType<typeof BaseToast.useToastManager<Entry>>, 'add' | 'close'>;
type Timer = {
  remaining: number;
  started: number;
  handle?: ReturnType<typeof setTimeout>;
  paused: Set<string>;
};
const ManagerContext = createContext<ToastManager | null>(null);
const placements: readonly ToastPlacement[] = ['bottom-right', 'top-center'];

export function useToast(): ToastManager {
  const manager = useContext(ManagerContext);
  if (!manager)
    throw new Error('useToast must be used inside ToastProvider. Manual Toast needs no provider.');
  return manager;
}

export function ToastProvider({
  children,
  defaultPlacement = 'bottom-right',
  visibleLimit = 3,
}: ToastProviderProps) {
  if (!Number.isInteger(visibleLimit) || visibleLimit < 1)
    throw new RangeError('visibleLimit must be a positive integer.');
  if (!placements.includes(defaultPlacement)) throw new RangeError('Unsupported toast placement.');
  return (
    <ToastController defaultPlacement={defaultPlacement} visibleLimit={visibleLimit}>
      {children}
    </ToastController>
  );
}

function ToastController({
  children,
  defaultPlacement,
  visibleLimit,
}: Required<ToastProviderProps>) {
  const prefix = useId();
  const counter = useRef(0);
  const active = useRef(new Map<string, Entry>());
  const pending = useRef<Entry[]>([]);
  const deliveries = useRef(new Map<ToastPlacement, Delivery>());
  const timers = useRef(new Map<string, Timer>());
  const focusedPlacements = useRef(new Set<ToastPlacement>());
  const windowPaused = useRef(false);
  const placementDefault = useRef(defaultPlacement);
  placementDefault.current = defaultPlacement;
  const alive = useRef(true);
  const limit = useRef(visibleLimit);
  limit.current = visibleLimit;
  const controller = useMemo(() => {
    function cancelTimer(id: string) {
      clearTimeout(timers.current.get(id)?.handle);
      timers.current.delete(id);
    }
    function schedule(id: string, timer: Timer) {
      if (timer.paused.size || !alive.current) return;
      timer.started = Date.now();
      timer.handle = setTimeout(() => dismiss(id), timer.remaining);
    }
    function pause(id: string, reason: string) {
      const timer = timers.current.get(id);
      if (!timer || timer.paused.has(reason)) return;
      if (!timer.paused.size) {
        timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.started));
        clearTimeout(timer.handle);
        timer.handle = undefined;
      }
      timer.paused.add(reason);
    }
    function resume(id: string, reason: string) {
      const timer = timers.current.get(id);
      if (timer?.paused.delete(reason) && !timer.paused.size) schedule(id, timer);
    }
    function flush() {
      if (!alive.current) return;
      for (const placement of placements) {
        const delivery = deliveries.current.get(placement);
        if (!delivery) continue;
        let count = [...active.current.values()].filter(
          (entry) => entry.placement === placement,
        ).length;
        while (count < limit.current) {
          const index = pending.current.findIndex((entry) => entry.placement === placement);
          if (index < 0) break;
          const [entry] = pending.current.splice(index, 1);
          active.current.set(entry.id, entry);
          count++;
          delivery.add({
            id: entry.id,
            title: entry.message,
            type: entry.variant,
            data: entry,
            priority: entry.variant === 'error' ? 'high' : 'low',
            timeout: 0,
            onRemove() {
              active.current.delete(entry.id);
              cancelTimer(entry.id);
              // Base UI removes the old item after this callback. Refill afterward.
              queueMicrotask(flush);
            },
          });
          const duration = entry.variant === 'error' || entry.action ? 0 : (entry.duration ?? 5000);
          if (duration) {
            const reasons = [
              ...(windowPaused.current ? ['window'] : []),
              ...(focusedPlacements.current.has(placement) ? ['viewport'] : []),
            ];
            const timer: Timer = {
              remaining: duration,
              started: Date.now(),
              paused: new Set(reasons),
            };
            timers.current.set(entry.id, timer);
            schedule(entry.id, timer);
          }
        }
      }
    }
    function show(notification: ToastNotification) {
      if (
        notification.duration != null &&
        (!Number.isFinite(notification.duration) || notification.duration < 0)
      )
        throw new RangeError('Toast duration must be a nonnegative number.');
      const placement = notification.placement ?? placementDefault.current;
      if (!placements.includes(placement)) throw new RangeError('Unsupported toast placement.');
      const id = `${prefix}-toast-${++counter.current}`;
      pending.current.push({
        ...notification,
        id,
        placement,
        variant: notification.variant ?? 'neutral',
      });
      flush();
      return id;
    }
    function dismiss(id: string) {
      pending.current = pending.current.filter((entry) => entry.id !== id);
      cancelTimer(id);
      const entry = active.current.get(id);
      if (entry) deliveries.current.get(entry.placement)?.close(id);
    }
    function clear() {
      pending.current = [];
      for (const id of active.current.keys()) dismiss(id);
    }
    function register(placement: ToastPlacement, delivery: Delivery) {
      deliveries.current.set(placement, delivery);
      flush();
      // Retain the delivery through layout cleanup so passive cleanup can close
      // its store during Strict Mode replay. The controller owns both regions.
    }
    function focusPlacement(placement: ToastPlacement, focused: boolean) {
      if (focused) focusedPlacements.current.add(placement);
      else focusedPlacements.current.delete(placement);
      for (const entry of active.current.values())
        if (entry.placement === placement)
          focused ? pause(entry.id, 'viewport') : resume(entry.id, 'viewport');
    }
    function pauseWindow(paused: boolean) {
      windowPaused.current = paused;
      for (const id of timers.current.keys()) paused ? pause(id, 'window') : resume(id, 'window');
    }
    return {
      manager: { show, dismiss, clear },
      register,
      flush,
      pause,
      resume,
      focusPlacement,
      pauseWindow,
      cancelTimer,
    };
  }, [prefix]);
  useEffect(() => {
    alive.current = true;
    controller.flush();
    const blur = () => controller.pauseWindow(true);
    const focus = () => controller.pauseWindow(document.visibilityState === 'hidden');
    window.addEventListener('blur', blur);
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', focus);
    focus();
    return () => {
      alive.current = false;
      window.removeEventListener('blur', blur);
      window.removeEventListener('focus', focus);
      document.removeEventListener('visibilitychange', focus);
      controller.manager.clear();
      pending.current = [];
      active.current.clear();
      focusedPlacements.current.clear();
      for (const id of timers.current.keys()) controller.cancelTimer(id);
    };
  }, [controller]);
  useEffect(controller.flush, [controller, visibleLimit]);
  return (
    <ManagerContext value={controller.manager}>
      {children}
      {placements.map((placement) => (
        <BaseToast.Provider key={placement} timeout={0} limit={Number.MAX_SAFE_INTEGER}>
          <ToastRegion placement={placement} controller={controller} />
        </BaseToast.Provider>
      ))}
    </ManagerContext>
  );
}

function ToastRegion({
  placement,
  controller,
}: {
  placement: ToastPlacement;
  controller: {
    register: (placement: ToastPlacement, delivery: Delivery) => void;
    pause: (id: string, reason: string) => void;
    resume: (id: string, reason: string) => void;
    focusPlacement: (placement: ToastPlacement, focused: boolean) => void;
  };
}) {
  const base = BaseToast.useToastManager<Entry>();
  const theme = useTheme();
  useLayoutEffect(
    () => controller.register(placement, { add: base.add, close: base.close }),
    [controller, placement, base.add, base.close],
  );
  return (
    <BaseToast.Portal>
      <Theme theme={theme} className="env-toast-portal-theme">
        <BaseToast.Viewport
          className={`env-toast-viewport env-toast-viewport-${placement}`}
          aria-label={
            placement === 'bottom-right' ? 'Bottom right notifications' : 'Top center notifications'
          }
          onFocusCapture={() => controller.focusPlacement(placement, true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              controller.focusPlacement(placement, false);
          }}
        >
          {base.toasts.map((toast) => {
            const entry = toast.data!;
            return (
              <BaseToast.Root
                key={toast.id}
                toast={toast}
                className={`env-toast env-toast-${entry.variant}`}
                onMouseEnter={() => controller.pause(toast.id, 'hover')}
                onMouseLeave={() => controller.resume(toast.id, 'hover')}
                onFocusCapture={() => controller.pause(toast.id, 'focus')}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    controller.resume(toast.id, 'focus');
                }}
              >
                <ToastBody
                  variant={entry.variant}
                  message={<BaseToast.Title className="env-toast-message" title={entry.message} />}
                  action={
                    entry.action && (
                      <BaseToast.Action
                        render={
                          <Button className="env-toast-action" onClick={entry.action.onClick} />
                        }
                      >
                        {entry.action.label}
                      </BaseToast.Action>
                    )
                  }
                  dismiss={
                    entry.dismissible !== false && (
                      <BaseToast.Close
                        className="env-toast-dismiss"
                        aria-hidden={false}
                        aria-label="Dismiss notification"
                      >
                        <span className="env-symbol">
                          <Close />
                        </span>
                      </BaseToast.Close>
                    )
                  }
                />
              </BaseToast.Root>
            );
          })}
        </BaseToast.Viewport>
      </Theme>
    </BaseToast.Portal>
  );
}
