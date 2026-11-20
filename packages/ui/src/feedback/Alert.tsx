import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Grid } from '../layout/Layout.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
import { Slot } from '../internal/layout/Slot.js';
import { AlertDismiss } from './internal/AlertDismiss.js';
import {
  inSkeleton,
  given,
  skeletonAttributes,
  type SkeletonProps,
} from '../internal/skeleton/skeleton.js';
import { IconCheckCircle } from '../icons/CheckCircle.js';
import { IconError } from '../icons/Error.js';
import { IconInfo } from '../icons/Info.js';
import { IconWarning } from '../icons/Warning.js';
import '../styles/Base.css';
import '../styles/Alert.css';

/** What an alert means: info, success, warning or danger. */
export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps
  extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'>, SkeletonProps {
  /**
   * What the message means: info, success, warning or danger, for an error or a failure. Sets the
   * tint, the title's and icon's color and the icon; info and success alerts are also status messages.
   * @default 'info'
   */
  tone?: AlertTone;
  /**
   * A short heading for the message, such as "Sync paused", above the message: text, or content
   * such as a branch name in Code or a link.
   */
  title?: ReactNode;
  /** The message: what it means and what people can do. */
  children?: ReactNode;
  /** Replaces the tone's icon; null or false shows none. */
  icon?: ReactNode;
  /** Actions below the message, such as a Button or a Link, in a row that wraps. */
  actions?: ReactNode;
  /**
   * Where the actions go: below the message, or at the end of the alert's row, before the dismiss
   * button, as in a one-line banner such as "Sync paused. Resume". At the end, they move below the
   * message where the alert is too narrow for both.
   * @default 'below'
   */
  actionsPlacement?: 'below' | 'end';
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
   * @default false
   */
  announce?: boolean;
}

const toneIcons: Record<AlertTone, ReactNode> = {
  info: <IconInfo />,
  success: <IconCheckCircle />,
  warning: <IconWarning />,
  danger: <IconError />,
};

/**
 * An inline banner for a page- or section-level message, in its tone. It is a server component;
 * its dismiss button is an IconButton with a cross, named in the provider's language.
 */
export function Alert(allProps: AlertProps) {
  const {
    tone = 'info',
    title,
    children,
    icon,
    actions,
    actionsPlacement = 'below',
    onDismiss,
    dismissLabel,
    announce = false,
    skeleton = false,
    className,
    ...props
  } = allProps;
  const hasTitle = title != null || given(allProps, 'title');
  const hasMessage = children != null || given(allProps, 'children');
  const role = tone === 'info' || tone === 'success' ? 'status' : announce ? 'alert' : undefined;
  const symbol = icon === undefined ? toneIcons[tone] : icon;
  const actionSlot = actions != null && (
    <Slot className="env-alert-action" layout="row">
      {actions}
    </Slot>
  );
  const content = (
    <Grid gap={1} className="env-alert-content">
      {hasTitle && <div className="env-alert-title">{title}</div>}
      {hasMessage && <Slot className="env-alert-message">{children}</Slot>}
      {actionsPlacement === 'below' && actionSlot}
    </Grid>
  );
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
      {inSkeleton(
        skeleton,
        <>
          {symbol !== false && symbol != null && (
            <span className="env-alert-icon">
              <DecorativeIcon>{symbol}</DecorativeIcon>
            </span>
          )}
          {actions != null && actionsPlacement === 'end' ? (
            <div className="env-alert-row">
              {content}
              {actionSlot}
            </div>
          ) : (
            content
          )}
          {onDismiss && <AlertDismiss label={dismissLabel} onDismiss={onDismiss} />}
        </>,
      )}
    </Grid>
  );
}
