import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Card } from './Card.js';

export interface ActionCardProps extends Omit<ComponentPropsWithRef<'article'>, 'title'> {
  /** The card's title, Card's `heading`: an `h3` in the section heading type. */
  title?: ReactNode;
  /** A short fact at the end of the heading row, such as when the card was updated. */
  meta?: ReactNode;
  /** Controls in a strip along the bottom of the card, such as Buttons. */
  actions?: ReactNode;
}

/** An `article` card with an action strip: Card with `layout="action"`, kept for earlier applications. */
export function ActionCard({
  title,
  meta,
  actions,
  className,
  children,
  ...props
}: ActionCardProps) {
  return (
    <Card
      {...props}
      as="article"
      layout="action"
      heading={title}
      meta={meta}
      actions={actions}
      className={className}
    >
      {children}
    </Card>
  );
}
