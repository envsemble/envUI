import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Card } from './Card.js';

export interface ActionCardProps extends Omit<ComponentPropsWithRef<'article'>, 'title'> {
  title?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}

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
