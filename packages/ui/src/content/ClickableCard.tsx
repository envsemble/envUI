import type { ComponentPropsWithRef } from 'react';
import { Card } from './Card.js';

export type ClickableCardProps =
  | (ComponentPropsWithRef<'button'> & { href?: never })
  | (ComponentPropsWithRef<'a'> & { href: string; disabled?: boolean });

/** A single interactive surface. Do not nest links or controls inside it. */
export function ClickableCard(props: ClickableCardProps) {
  if (props.href !== undefined) {
    return <Card {...props} />;
  }
  return <Card {...props} as="button" />;
}
