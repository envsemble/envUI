import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Stack } from '../foundations/Layout.js';
import { Text } from '../foundations/Text.js';
import { Error as ErrorIcon } from '../icons/Error.js';

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  /**
   * Error states replace content that failed to load: they show the error icon by default and
   * are announced as an alert. Pair them with a retry action.
   */
  tone?: 'neutral' | 'error';
  /** The title's heading level in the page outline; 4 by default. The appearance stays the same. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  tone = 'neutral',
  headingLevel = 4,
  className,
  children,
  ...props
}: EmptyStateProps) {
  const stateIcon = icon ?? (tone === 'error' ? <ErrorIcon /> : null);
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      {...props}
      className={classNames(
        'env-empty-state',
        tone === 'error' && 'env-empty-state-error',
        className,
      )}
    >
      {stateIcon != null && <DecorativeIcon>{stateIcon}</DecorativeIcon>}
      <Stack gap={2} className="env-empty-copy">
        <Text as={`h${headingLevel}`} variant="section-heading">
          {title}
        </Text>
        {description != null && <Text variant="supporting">{description}</Text>}
        {children}
      </Stack>
      {action}
    </div>
  );
}
