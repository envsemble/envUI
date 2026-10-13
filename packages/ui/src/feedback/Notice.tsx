import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { IconButton } from '../actions/Button.js';
import { CheckCircle } from '../icons/CheckCircle.js';
import { Close } from '../icons/Close.js';
import { Error as ErrorIcon } from '../icons/Error.js';
import { Info } from '../icons/Info.js';
import { Warning } from '../icons/Warning.js';

export type NoticeTone = 'info' | 'success' | 'warning' | 'error';

export interface NoticeProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> {
  /** info (default), success, warning or error; each has its tone color and default icon. */
  tone?: NoticeTone;
  title?: ReactNode;
  children?: ReactNode;
  /** Replaces the tone's icon; false shows none. */
  icon?: ReactNode | false;
  /** An action below the message, such as a Button or Link. */
  action?: ReactNode;
  /** Shows a dismiss button that calls it; the application removes the notice. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button; Dismiss by default. */
  dismissLabel?: string;
  /**
   * The notice appeared because of something that just happened and should interrupt: warning and
   * error notices become alerts. Info and success notices are always polite status messages.
   */
  announce?: boolean;
}

const toneIcons: Record<NoticeTone, ReactNode> = {
  info: <Info />,
  success: <CheckCircle />,
  warning: <Warning />,
  error: <ErrorIcon />,
};

/** An inline banner for a page- or section-level message, in its tone. */
export function Notice({
  tone = 'info',
  title,
  children,
  icon,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  announce = false,
  className,
  ...props
}: NoticeProps) {
  const role = tone === 'info' || tone === 'success' ? 'status' : announce ? 'alert' : undefined;
  const symbol = icon === undefined ? toneIcons[tone] : icon;
  return (
    <div {...props} role={role} className={classNames('env-notice', className)} data-tone={tone}>
      {symbol !== false && symbol != null && (
        <span className="env-notice-icon">
          <DecorativeIcon>{symbol}</DecorativeIcon>
        </span>
      )}
      <div className="env-notice-content">
        {title != null && <div className="env-notice-title">{title}</div>}
        {children != null && <div className="env-notice-message">{children}</div>}
        {action != null && <div className="env-notice-action">{action}</div>}
      </div>
      {onDismiss && (
        <IconButton
          variant="text"
          icon={<Close />}
          aria-label={dismissLabel}
          title={dismissLabel}
          className="env-notice-dismiss"
          onClick={onDismiss}
        />
      )}
    </div>
  );
}
