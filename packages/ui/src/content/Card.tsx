import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Text } from '../foundations/Text.js';
import { Stack, ActionGroup } from '../foundations/Layout.js';
import { Surface, type SurfaceAppearanceProps } from '../foundations/Surface.js';
import { ActionElement, type ActionElementProps } from '../internal/ActionElement.js';

type CardAppearanceProps = Pick<SurfaceAppearanceProps, 'padding'> & {
  tone?: Exclude<SurfaceAppearanceProps['tone'], 'alternate'>;
};
interface CardContentProps {
  heading?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  /** An action strip implies action layout; explicit layout also works without actions. */
  layout?: 'content' | 'action';
}
interface InteractiveCardContentProps {
  heading?: never;
  meta?: never;
  actions?: never;
  layout?: never;
}
export type CardProps = CardAppearanceProps &
  (
    | (ComponentPropsWithRef<'div'> & CardContentProps & { as?: 'div'; href?: undefined })
    | (ComponentPropsWithRef<'article'> & CardContentProps & { as: 'article'; href?: undefined })
    | (ComponentPropsWithRef<'button'> &
        InteractiveCardContentProps & { as: 'button'; href?: undefined })
    | (ComponentPropsWithRef<'a'> &
        InteractiveCardContentProps & { as?: 'a'; href: string; disabled?: boolean })
  );

/** Shared card surface, optionally a native action or a content card with an action strip. */
export function Card({
  as,
  tone = 'row',
  padding,
  heading,
  meta,
  actions,
  layout = 'content',
  className,
  style,
  children,
  ...props
}: CardProps) {
  const isInteractive = props.href !== undefined || as === 'button';
  const hasActionLayout = layout === 'action' || actions != null;
  const cardClassName = classNames(
    'env-card',
    !hasActionLayout && 'env-card-content',
    isInteractive && 'env-clickable-card',
    hasActionLayout && 'env-action-card',
    className,
  );
  const content = (
    <>
      {(heading != null || meta != null) && (
        <div className="env-action-card-heading">
          {heading != null && (
            <Text as="h3" variant="section-heading">
              {heading}
            </Text>
          )}
          {meta != null && (
            <Text as="span" variant="supporting" className="env-action-card-meta">
              {meta}
            </Text>
          )}
        </div>
      )}
      {children}
    </>
  );
  const cardRoot = isInteractive ? (
    <Stack
      gap={4}
      render={<ActionElement {...(props as ActionElementProps)} />}
      className={cardClassName}
      style={style}
    />
  ) : (
    <Stack
      {...(props as ComponentPropsWithRef<'div'> & ComponentPropsWithRef<'article'>)}
      as={as === 'article' ? 'article' : 'div'}
      gap={hasActionLayout ? 0 : 4}
      className={cardClassName}
      style={style}
    />
  );
  return (
    <Surface tone={tone} padding={padding} render={cardRoot}>
      {isInteractive ? (
        children
      ) : hasActionLayout ? (
        <>
          <Stack className="env-card-content env-action-card-body">{content}</Stack>
          {actions != null && (
            <ActionGroup as="footer" align="end" className="env-action-card-actions">
              {actions}
            </ActionGroup>
          )}
        </>
      ) : (
        content
      )}
    </Surface>
  );
}
