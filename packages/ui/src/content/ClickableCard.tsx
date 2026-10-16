import type { ComponentPropsWithRef } from 'react';
import { Card } from './Card.js';

export type ClickableCardProps =
  | (ComponentPropsWithRef<'button'> & { href?: never })
  | (ComponentPropsWithRef<'a'> & {
      /** The destination: the whole card is one native link, through the `LinkProvider`. */
      href: string;
      /**
       * A disabled button card cannot be pressed; a disabled link card has no destination, cannot
       * be focused and reports `aria-disabled`.
       */
      disabled?: boolean;
    });

/**
 * A single interactive surface: Card with `href`, or Card `as="button"`, kept for earlier
 * applications. Do not nest links or controls inside it.
 */
export function ClickableCard(props: ClickableCardProps) {
  if (props.href !== undefined) {
    return <Card {...props} />;
  }
  return <Card {...props} as="button" />;
}
