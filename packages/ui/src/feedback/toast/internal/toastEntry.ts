import type { Toast as BaseToast } from '@base-ui/react/toast';
import type { ToastNotification, ToastPlacement, ToastTone } from '../toastTypes.js';

export type ToastEntry = ToastNotification & {
  id: string;
  tone: ToastTone;
  placement: ToastPlacement;
};
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
