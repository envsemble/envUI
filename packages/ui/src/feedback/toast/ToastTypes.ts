import type { ComponentPropsWithRef, ReactNode } from 'react';

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

export interface ToastNotification {
  message: string;
  variant?: ToastVariant;
  action?: ToastAction;
  placement?: ToastPlacement;
  dismissible?: boolean;
  /**
   * Visible milliseconds before dismissal. Returning from overflow restarts the full duration.
   * Infinity (or 0) persists until dismissed.
   * Defaults to 5000, or Infinity for errors and notices with actions.
   */
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
  /** Maximum visible per placement (default 3). Newest notices stay visible; older ones hide behind a count. */
  visibleLimit?: number;
}
