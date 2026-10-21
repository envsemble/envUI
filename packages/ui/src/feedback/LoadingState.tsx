'use client';

import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { Row } from '../foundations/Layout.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { common } from '../foundations/messages/common.js';
import { Spinner } from './Spinner.js';

export interface LoadingStateProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * What is loading, such as Loading project: shown beside the spinner, and read as the status.
   * @default 'Loading', or EnvUIProvider's messages.common.loading
   */
  label?: string;
}

/**
 * Loading with no known shape: a spinner with a label that says what is loading, in a status
 * region marked busy. Where the shape of what loads is known, render it as a skeleton instead,
 * with `skeleton` on its surface.
 */
export function LoadingState({ label, className, ...props }: LoadingStateProps) {
  const messages = useMessages('common', common);
  return (
    <Row
      align="center"
      justify="center"
      gap={3}
      {...props}
      role="status"
      aria-busy="true"
      className={classNames('env-loading-state', className)}
    >
      <Spinner />
      <span className="env-loading-state-label">{label ?? messages.loading}</span>
    </Row>
  );
}
