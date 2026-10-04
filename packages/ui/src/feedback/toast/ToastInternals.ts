import type { Toast as BaseToast } from '@base-ui/react/toast';
import type { ToastNotification, ToastPlacement, ToastVariant } from './ToastTypes.js';

export type ToastEntry = ToastNotification & {
  id: string;
  variant: ToastVariant;
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

export const toastPlacements: readonly ToastPlacement[] = ['bottom-right', 'top-center'];
