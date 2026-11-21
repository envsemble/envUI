import type { ReactNode } from 'react';
import { IconCheckCircle } from '../../../icons/CheckCircle.js';
import { IconError } from '../../../icons/Error.js';
import { IconInfo } from '../../../icons/Info.js';
import type { ToastTone } from '../toastTypes.js';
import { DecorativeIcon } from '../../../internal/icon/DecorativeIcon.js';
import '../../../styles/Base.css';
import '../../../styles/Toast.css';

function StatusIcon({ tone, icon }: { tone: ToastTone; icon: ReactNode }) {
  if (icon !== undefined)
    return icon === null || icon === false ? null : (
      <DecorativeIcon className="env-toast-status-icon">{icon}</DecorativeIcon>
    );
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
  icon,
  message,
  action,
  dismiss,
}: {
  tone: ToastTone;
  icon: ReactNode;
  message: ReactNode;
  action?: ReactNode;
  dismiss?: ReactNode;
}) {
  return (
    <>
      <div className="env-toast-content">
        <StatusIcon tone={tone} icon={icon} />
        {message}
      </div>
      {action}
      {dismiss}
    </>
  );
}
