import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Stack } from '../foundations/Layout.js';

export interface DisclosureProps extends Omit<ComponentPropsWithRef<'details'>, 'title'> {
  title: ReactNode;
}

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
