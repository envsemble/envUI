import { createElement, type ComponentPropsWithRef, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Stack } from '../foundations/Layout.js';
import { Text } from '../foundations/Text.js';
import { Error as ErrorIcon } from '../icons/Error.js';

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** What is missing or what happened, such as "No projects yet"; a heading of `headingLevel`. */
  title: ReactNode;
  /** Why, and what people can do, in a sentence or two of muted text under the title. */
  description?: ReactNode;
  /** A decorative icon above the text; an error state shows the error icon without it. */
  icon?: ReactNode;
  /** The action that resolves the state, such as a Button that creates the first item. */
  action?: ReactNode;
  /** More content under the description, such as a short list of next steps. */
  children?: ReactNode;
  /**
   * neutral for a state with nothing to show yet; danger for content that failed to load, which
   * shows the error icon by default and is announced as an alert. Pair it with a retry action.
   * @default 'neutral'
   */
  tone?: 'neutral' | 'danger';
  /** The title's heading level in the page outline; 4 by default. The appearance stays the same. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * `start` (default) for a state inside a card, panel or dialog. `center` for a state that takes the
   * place of a page's or region's content: a larger icon, centred text and action, centred
   * vertically in the height the application gives it.
   */
  align?: 'start' | 'center';
}

/**
 * What a region shows when it has nothing to show: no items yet, no matches, or content that failed
 * to load. A title, a description, an optional icon and the action that resolves the state.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  tone = 'neutral',
  headingLevel = 4,
  align = 'start',
  className,
  children,
  ...props
}: EmptyStateProps) {
  const stateIcon = icon ?? (tone === 'danger' ? <ErrorIcon /> : null);
  return (
    <div
      role={tone === 'danger' ? 'alert' : undefined}
      {...props}
      className={classNames('env-empty-state', className)}
      data-tone={tone}
      data-align={align}
    >
      {stateIcon != null && <DecorativeIcon>{stateIcon}</DecorativeIcon>}
      <Stack gap={2} className="env-empty-state-description">
        <Text render={createElement(`h${headingLevel}`)} variant="title">
          {title}
        </Text>
        {description != null && <Text variant="body-sm">{description}</Text>}
        {children}
      </Stack>
      {action}
    </div>
  );
}
