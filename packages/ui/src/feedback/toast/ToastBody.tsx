import type { ReactNode } from 'react';
import { CheckCircle } from '../../icons/CheckCircle.js';
import { Info } from '../../icons/Info.js';
import { Warning } from '../../icons/Warning.js';
import type { ToastTone } from './ToastTypes.js';

function StatusIcon({ tone }: { tone: ToastTone }) {
  if (tone === 'neutral') return null;
  const StatusSymbol = tone === 'success' ? CheckCircle : tone === 'info' ? Info : Warning;
  return (
    <span className="env-icon env-toast-status-icon">
      <StatusSymbol />
    </span>
  );
}

export function ToastBody({
  tone,
  message,
  action,
  dismiss,
}: {
  tone: ToastTone;
  message: ReactNode;
  action?: ReactNode;
  dismiss?: ReactNode;
}) {
  return (
    <>
      <StatusIcon tone={tone} />
      {message}
      {action}
      {dismiss}
    </>
  );
}
