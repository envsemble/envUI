import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Text } from '../foundations/Text.js';
import { Stack, ActionGroup } from '../foundations/Layout.js';
import { Surface, type SurfaceAppearanceProps } from '../foundations/Surface.js';
import { ActionElement, type ActionElementProps } from '../internal/ActionElement.js';

type CardAppearanceProps = Pick<SurfaceAppearanceProps, 'padding'> & {
  /**
   * The surface's fill: `row`, the standalone card fill; `pane`, a quieter fill that groups
   * content; or `canvas`, the page's own color.
   */
  tone?: Exclude<SurfaceAppearanceProps['tone'], 'alternate'>;
};
interface CardContentProps {
  /** A title in the section heading type, as an `h3`, at the top of a content card. */
  heading?: ReactNode;
  /** A short fact at the end of the heading row, such as when the card was updated. */
  meta?: ReactNode;
  /** Controls in a strip along the bottom of the card, such as Buttons; implies the action layout. */
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
    | (ComponentPropsWithRef<'div'> &
        CardContentProps & {
          /**
           * The element: `div` (default) or `article` for a content card, `button` for a card that
           * starts an action. With `href` the card is a link.
           */
          as?: 'div';
          href?: undefined;
        })
    | (ComponentPropsWithRef<'article'> & CardContentProps & { as: 'article'; href?: undefined })
    | (ComponentPropsWithRef<'button'> &
        InteractiveCardContentProps & { as: 'button'; href?: undefined })
    | (ComponentPropsWithRef<'a'> &
        InteractiveCardContentProps & {
          as?: 'a';
          /** The destination: the whole card is one native link, through the `LinkProvider`. */
          href: string;
          /**
           * A disabled button card cannot be pressed; a disabled link card has no destination,
           * cannot be focused and reports `aria-disabled`.
           */
          disabled?: boolean;
        })
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
