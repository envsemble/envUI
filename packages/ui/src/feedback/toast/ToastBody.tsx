import type { ReactNode } from 'react';
import { IconCheckCircle } from '../../icons/CheckCircle.js';
import { IconError } from '../../icons/Error.js';
import { IconInfo } from '../../icons/Info.js';
import type { ToastTone } from './toastTypes.js';
import '../../styles/Base.css';
import '../../styles/Toast.css';

function StatusIcon({ tone }: { tone: ToastTone }) {
  if (tone === 'neutral') return null;
  const StatusSymbol =
    tone === 'success' ? IconCheckCircle : tone === 'info' ? IconInfo : IconError;
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
  // The tone icon and the message stand together, the icon level with the message's first line,
  // and the two are centred in the toast as one, beside the action and the dismiss button.
  return (
    <>
      <div className="env-toast-content">
        <StatusIcon tone={tone} />
        {message}
      </div>
      {action}
      {dismiss}
    </>
  );
}
