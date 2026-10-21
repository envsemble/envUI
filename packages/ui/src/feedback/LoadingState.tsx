'use client';

import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { Grid } from '../foundations/Layout.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { common } from '../foundations/messages/common.js';

export interface LoadingStateProps extends ComponentPropsWithRef<'div'> {
  /**
   * What is loading, such as Loading project, which names the region for assistive technology; an
   * aria-label overrides it.
   * @default 'Loading', or EnvUIProvider's messages.common.loading
   */
  label?: string;
}

/**
 * A region of placeholders for content that is loading, such as Skeletons in the shape of a card: a
 * status named by label and marked busy, which stacks its children 0.5 rem apart.
 */
export function LoadingState({ label, className, children, ...props }: LoadingStateProps) {
  const messages = useMessages('common', common);
  return (
    <Grid
      gap={2}
      {...props}
      role="status"
      aria-label={props['aria-label'] ?? label ?? messages.loading}
      aria-busy="true"
      className={classNames('env-loading-state', className)}
    >
      {children}
    </Grid>
  );
}
