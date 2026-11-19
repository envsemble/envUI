import type { Toast as BaseToast } from '@base-ui/react/toast';
import type { ToastAction, ToastNotification, ToastPlacement, ToastTone } from '../toastTypes.js';

export type ToastEntry = ToastNotification & {
  id: string;
  tone: ToastTone;
  placement: ToastPlacement;
};

/** A notification's text, for its native title and its announcement, where it has one. */
export const toastText = (entry: ToastNotification) =>
  entry.text ?? (typeof entry.message === 'string' ? entry.message : undefined);

/** A notification's actions, the main one last: actions, or its one action. */
export const toastActions = (entry: ToastNotification): readonly ToastAction[] =>
  entry.actions ?? (entry.action ? [entry.action] : []);
export type ToastDelivery = Pick<
  ReturnType<typeof BaseToast.useToastManager<ToastEntry>>,
  'add' | 'close'
>;
export type ToastTimer = {
  durationMs: number;
  remainingMs: number;
  startedAt: number;
  handle?: ReturnType<typeof setTimeout>;
  pauseReasons: Set<string>;
};

export const toastPlacements: readonly ToastPlacement[] = ['bottom-end', 'top-center'];
