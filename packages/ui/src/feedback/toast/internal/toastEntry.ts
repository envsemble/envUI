import type { Toast as BaseToast } from '@base-ui/react/toast';
import type { ToastAction, ToastNotification, ToastPlacement, ToastTone } from '../toastTypes.js';

export type ToastEntry = ToastNotification & {
  id: string;
  tone: ToastTone;
  placement: ToastPlacement;
};

export type ToastObject = BaseToast.Root.ToastObject<ToastEntry>;

export function entrySetByController(toastObject: ToastObject) {
  return toastObject.data!;
}

/** A notification's text before it renders: its textValue, else its message when that is a string. */
export const toastText = (entry: ToastNotification) =>
  entry.textValue ?? (typeof entry.message === 'string' ? entry.message : undefined);

/** A notification's actions, the main one last. */
export const toastActions = (entry: ToastNotification): readonly ToastAction[] =>
  entry.actions ?? [];
export type ToastDelivery = Pick<
  ReturnType<typeof BaseToast.useToastManager<ToastEntry>>,
  'add' | 'close'
>;

export type ToastPauseReason = 'hidden' | 'window' | 'viewport' | 'hover' | 'focus';

export type ToastTimer = {
  durationMs: number;
  remainingMs: number;
  startedAt: number;
  handle?: ReturnType<typeof setTimeout>;
  pauseReasons: Set<ToastPauseReason>;
};

export const toastPlacements: readonly ToastPlacement[] = ['bottom-end', 'top-center'];
