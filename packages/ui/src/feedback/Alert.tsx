import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Grid, Row } from '../foundations/Layout.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { AlertDismiss } from './internal/AlertDismiss.js';
import { SkeletonScope } from '../foundations/SkeletonScope.js';
import { given, skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import { CheckCircle } from '../icons/CheckCircle.js';
import { Error as ErrorIcon } from '../icons/Error.js';
import { Info } from '../icons/Info.js';
import { Warning } from '../icons/Warning.js';

/** What an alert means: info, success, warning or danger. */
export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps
  extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'>,
    SkeletonProps {
  /**
   * What the message means: info, success, warning or danger, for an error or a failure. Sets the
   * tint, the border and the icon; info and success alerts are also status messages.
   * @default 'info'
   */
  tone?: AlertTone;
  /** A short heading for the message, such as "Sync paused", above the message. */
  title?: ReactNode;
  /** The message: what it means and what people can do. */
  children?: ReactNode;
  /** Replaces the tone's icon; false shows none. */
  icon?: ReactNode | false;
  /** An action below the message, such as a Button or Link. */
  action?: ReactNode;
  /** Shows a dismiss button that calls it; the application removes the alert. */
  onDismiss?: () => void;
  /**
   * Accessible name of the dismiss button, also shown as its tooltip.
   * @default 'Dismiss', or EnvUIProvider's messages.alert.dismiss
   */
  dismissLabel?: string;
  /**
   * The alert appeared because of something that just happened and should interrupt: warning and
   * danger alerts take the alert role. Info and success alerts are always polite status messages.
   */
  announce?: boolean;
}

const toneIcons: Record<AlertTone, ReactNode> = {
  info: <Info />,
  success: <CheckCircle />,
  warning: <Warning />,
  danger: <ErrorIcon />,
};

/**
 * An inline banner for a page- or section-level message, in its tone. It stays a server component:
 * its dismiss button is a CloseButton, a client leaf named in the provider's language.
 */
export function Alert(allProps: AlertProps) {
  const {
    tone = 'info',
    title,
    children,
    icon,
    action,
    onDismiss,
    dismissLabel,
    announce = false,
    skeleton = false,
    className,
    ...props
  } = allProps;
  // A title or message given as undefined, as over a placeholder item, is a bar in a skeleton.
  const hasTitle = title != null || given(allProps, 'title');
  const hasMessage = children != null || given(allProps, 'children');
  const role = tone === 'info' || tone === 'success' ? 'status' : announce ? 'alert' : undefined;
  const symbol = icon === undefined ? toneIcons[tone] : icon;
  return (
    <Grid
      columns="auto minmax(0, 1fr) auto"
      align="start"
      gap={3}
      padding={4}
      render={
        <div
          {...props}
          {...skeletonAttributes(skeleton)}
          role={role}
          className={classNames('env-alert', className)}
          data-tone={tone}
        />
      }
    >
      <SkeletonScope skeleton={skeleton}>
        {symbol !== false && symbol != null && (
          <span className="env-alert-icon">
            <DecorativeIcon>{symbol}</DecorativeIcon>
          </span>
        )}
        <Grid gap={1} className="env-alert-content">
          {hasTitle && <div className="env-alert-title">{title}</div>}
          {hasMessage && <div className="env-alert-message">{children}</div>}
          {action != null && (
            <Row wrap gap={2} className="env-alert-action">
              {action}
            </Row>
          )}
        </Grid>
        {onDismiss && <AlertDismiss label={dismissLabel} onDismiss={onDismiss} />}
      </SkeletonScope>
    </Grid>
  );
}
