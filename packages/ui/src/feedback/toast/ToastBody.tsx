import type { ReactNode } from 'react';
import { CheckCircle } from '../../icons/CheckCircle.js';
import { Info } from '../../icons/Info.js';
import { Warning } from '../../icons/Warning.js';
import type { ToastVariant } from './ToastTypes.js';

function StatusIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'neutral') return null;
  const StatusSymbol = variant === 'success' ? CheckCircle : variant === 'info' ? Info : Warning;
  return (
    <span className="env-icon env-toast-status-icon">
      <StatusSymbol />
    </span>
  );
}

export function ToastBody({
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
