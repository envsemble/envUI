import type { ReactNode } from 'react';
import { IconCheckCircle } from '../../icons/CheckCircle.js';
import { IconInfo } from '../../icons/Info.js';
import { IconWarning } from '../../icons/Warning.js';
import type { ToastTone } from './toastTypes.js';
import '../../styles/Base.css';
import '../../styles/Toast.css';

function StatusIcon({ tone }: { tone: ToastTone }) {
  if (tone === 'neutral') return null;
  const StatusSymbol =
    tone === 'success' ? IconCheckCircle : tone === 'info' ? IconInfo : IconWarning;
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
