import { classNames } from '../../internal/classNames.js';
import { Button } from '../../actions/Button.js';
import { Close } from '../../icons/Close.js';
import { ToastBody } from './ToastBody.js';
import type { ToastProps } from './ToastTypes.js';

/** Manual presentation. The consumer owns placement, visibility, and any timer. */
export function Toast({
  variant = 'neutral',
  message,
  action,
  onDismiss,
  dismissLabel = 'Dismiss notification',
  announce = true,
  className,
  ...props
}: ToastProps) {
  return (
    <div
      {...props}
      className={classNames('env-toast', `env-toast-${variant}`, className)}
      role={props.role ?? (announce ? (variant === 'error' ? 'alert' : 'status') : undefined)}
    >
      <ToastBody
        variant={variant}
        message={
          <span className="env-toast-message" title={message}>
            {message}
          </span>
        }
        action={
          action && (
            <Button className="env-toast-action" onClick={action.onClick}>
              {action.label}
            </Button>
          )
        }
        dismiss={
          onDismiss && (
            <button
              type="button"
              className="env-toast-dismiss"
              aria-label={dismissLabel}
              onClick={onDismiss}
            >
              <span className="env-icon">
                <Close />
              </span>
            </button>
          )
        }
      />
    </div>
  );
}
