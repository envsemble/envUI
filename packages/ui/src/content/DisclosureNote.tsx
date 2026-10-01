import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Stack } from '../foundations/Layout.js';

export interface DisclosureNoteProps extends Omit<ComponentPropsWithRef<'details'>, 'title'> {
  title: ReactNode;
}

export function DisclosureNote({ title, className, children, ...props }: DisclosureNoteProps) {
  return (
    <details {...props} className={classNames('env-disclosure-note', className)}>
      <summary>{title}</summary>
      <Stack gap={2} className="env-disclosure-content">
        {children}
      </Stack>
    </details>
  );
}
