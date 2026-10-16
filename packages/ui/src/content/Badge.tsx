import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'done';

export interface BadgeProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Meaning of the state; done is the purple of completed work. Neutral by default. */
  tone?: BadgeTone;
  /** subtle (default) tints the background, solid fills it with the tone, outline draws a border. */
  variant?: 'subtle' | 'solid' | 'outline';
  icon?: ReactNode;
  children: ReactNode;
}

/** A small pill label for a state, such as In progress, Blocked or Archived, or a short name. */
export function Badge({
  tone = 'neutral',
  variant = 'subtle',
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={classNames('env-badge', className)}
      data-tone={tone}
      data-variant={variant}
    >
      {icon != null && <DecorativeIcon>{icon}</DecorativeIcon>}
      <span className="env-badge-label">{children}</span>
    </span>
  );
}
