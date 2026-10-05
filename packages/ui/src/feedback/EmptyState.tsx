import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Stack } from '../foundations/Layout.js';
import { Text } from '../foundations/Text.js';

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div {...props} className={classNames('env-empty-state', className)}>
      {icon != null && <DecorativeIcon>{icon}</DecorativeIcon>}
      <Stack gap={2} className="env-empty-copy">
        <Text as="h4" variant="section-heading">
          {title}
        </Text>
        {description != null && <Text variant="supporting">{description}</Text>}
        {children}
      </Stack>
      {action}
    </div>
  );
}
