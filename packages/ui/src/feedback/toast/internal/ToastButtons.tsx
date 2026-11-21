'use client';

import { Fragment } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { Badge } from '../../../data-display/Badge.js';
import { Button, IconButton } from '../../../actions/Button.js';
import { IconClose } from '../../../icons/Close.js';
import type { ToastAction } from '../toastTypes.js';
import { toastActions, type ToastEntry } from './toastEntry.js';
import '../../../styles/Base.css';
import '../../../styles/Toast.css';

function ToastActionButton({
  action,
  main,
  live,
}: {
  action: ToastAction;
  main: boolean;
  live: boolean;
}) {
  const variant = main ? 'outline' : 'ghost';
  if (action.href !== undefined)
    return (
      <Button
        variant={variant}
        className="env-toast-action"
        href={action.href}
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    );
  if (!live)
    return (
      <Button variant={variant} className="env-toast-action" onClick={action.onClick}>
        {action.label}
      </Button>
    );
  return (
    <BaseToast.Action
      render={<Button variant={variant} className="env-toast-action" onClick={action.onClick} />}
    >
      {action.label}
    </BaseToast.Action>
  );
}

export function ToastActionButtons({ entry, live }: { entry: ToastEntry; live: boolean }) {
  const actions = toastActions(entry);
  if (actions.length === 0) return null;
  if (actions.length === 1) return <ToastActionButton action={actions[0]} main live={live} />;
  return (
    <span className="env-toast-actions">
      {actions.map((action, index) => (
        <Fragment key={index}>
          <ToastActionButton action={action} main={index === actions.length - 1} live={live} />
        </Fragment>
      ))}
    </span>
  );
}

export function ToastDismissButton({
  label,
  onDismiss,
}: {
  label: string;
  onDismiss: (() => void) | 'closes-base-ui-toast';
}) {
  const dismissProps = {
    variant: 'ghost',
    icon: <IconClose />,
    className: 'env-toast-dismiss',
    'aria-label': label,
  } as const;
  return onDismiss === 'closes-base-ui-toast' ? (
    <BaseToast.Close aria-hidden={false} render={<IconButton {...dismissProps} />} />
  ) : (
    <IconButton {...dismissProps} onClick={onDismiss} />
  );
}

export function ToastQueuedCount({
  count,
  label,
  live,
}: {
  count: number;
  label: string | undefined;
  live: boolean;
}) {
  return (
    <Badge
      className="env-toast-queued-count"
      data-toast-id="queued"
      role={live ? 'status' : undefined}
      count={`+${count}`}
      aria-label={label}
    />
  );
}
