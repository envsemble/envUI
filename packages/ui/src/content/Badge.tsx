import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'done';

export interface BadgeProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Meaning of the state; done is the purple of completed work. Neutral by default. */
  tone?: BadgeTone;
  /** subtle (default) tints the background, solid fills it with the tone, outline draws a border. */
  variant?: 'subtle' | 'solid' | 'outline';
  /** A decorative icon before the label, such as a check mark; hidden from assistive technology. */
  icon?: ReactNode;
  /**
   * The label: a state, a name or a category in a word or two. It stays on one line and ends with
   * an ellipsis where the badge is wider than its container.
   */
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
