'use client';

import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { useLinkComponent } from './LinkComponentContext.js';
import {
  resolveEmphasis,
  useControlDefaults,
  type ControlTone,
  type ControlVariant,
} from './ControlDefaults.js';
import type { ControlSize } from './controlTypes.js';

/**
 * A button's emphasis as Button gives it: its own variant, tone and size, which win, and the
 * variant it falls back to where neither it nor the nearest ControlDefaults gives one that takes its
 * tone (resolveEmphasis). It is read here, in the client module, so that Button stays a server
 * component.
 */
export interface ActionEmphasis {
  variant?: ControlVariant;
  fallbackVariant: ControlVariant;
  tone?: ControlTone;
  size?: ControlSize;
  underline?: boolean;
}

export type ActionElementProps =
  | (ComponentPropsWithRef<'button'> & { href?: undefined })
  | (ComponentPropsWithRef<'a'> & {
      /** The destination: the element is a native link, through the LinkProvider's link component. */
      href: string;
      /**
       * A disabled button cannot be pressed; a disabled link has no destination, cannot be focused
       * or followed, and reports aria-disabled.
       */
      disabled?: boolean;
    });

/** Blocks activation while work runs, including form submission and navigation. */
const preventActivation = (event: MouseEvent<HTMLElement>) => event.preventDefault();

/**
 * One native action implementation for button links, navigation and interactive cards. `pending`
 * marks the action busy and blocks its activation; it is handled here, in the client module, so
 * that Button, a server component, passes only a boolean.
 */
export function ActionElement({
  disabled = false,
  pending = false,
  emphasis,
  ...given
}: ActionElementProps & { pending?: boolean; emphasis?: ActionEmphasis }) {
  const defaults = useControlDefaults();
  let rest = given;
  if (emphasis) {
    const { variant, tone } = resolveEmphasis(emphasis, defaults.variant);
    rest = {
      ...given,
      'data-variant': variant,
      'data-tone': tone,
      'data-size': emphasis.size ?? defaults.size,
      'data-underline': (variant === 'text' && emphasis.underline) || undefined,
    } as unknown as typeof given;
  }
  const props = (
    pending
      ? {
          ...rest,
          'aria-busy': true,
          'aria-disabled': true,
          'data-pending': '',
          onClick: preventActivation,
        }
      : rest
  ) as typeof rest;
  const LinkComponent = useLinkComponent();
  if (props.href !== undefined) {
    const { href, onClick, tabIndex, ...anchorProps } = props as ComponentPropsWithRef<'a'> & {
      href: string;
    };
    const sharedProps = {
      ...anchorProps,
      role: anchorProps.role ?? (disabled ? 'link' : undefined),
      'aria-disabled': disabled || anchorProps['aria-disabled'],
      tabIndex: disabled ? -1 : tabIndex,
    };
    // A disabled destination has no href, so it stays a native anchor outside the router.
    if (disabled) return <a {...sharedProps} onClick={(event) => event.preventDefault()} />;
    return LinkComponent === 'a' ? (
      <a {...sharedProps} href={href} onClick={onClick} />
    ) : (
      // The link component comes from LinkProvider and keeps its identity between renders.
      // eslint-disable-next-line react-hooks/static-components
      <LinkComponent {...sharedProps} href={href} onClick={onClick} />
    );
  }
  const { type = 'button', ...buttonProps } = props as ComponentPropsWithRef<'button'>;
  return <button {...buttonProps} type={type} disabled={disabled} />;
}
