import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Stack } from '../foundations/Layout.js';

export interface DisclosureProps extends Omit<ComponentPropsWithRef<'details'>, 'title'> {
  /** The summary: one line that says what the details hold and opens or closes them. */
  title: ReactNode;
  /** The details, shown below the summary while the disclosure is open. */
  children?: ReactNode;
  /** Whether the details show; with `onToggle` it controls the disclosure. Closed by default. */
  open?: boolean;
}

/** A summary that shows and hides the details below it, on the native details element. */
export function Disclosure({ title, className, children, ...props }: DisclosureProps) {
  return (
    <details {...props} className={classNames('env-disclosure', className)}>
      <summary>{title}</summary>
      <Stack gap={2} className="env-disclosure-panel">
        {children}
      </Stack>
    </details>
  );
}
