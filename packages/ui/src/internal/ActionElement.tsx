import type { ComponentPropsWithRef } from 'react';
import { useLinkComponent } from '../navigation/LinkProvider.js';

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

/** One native action implementation for button links, navigation and interactive cards. */
export function ActionElement({ disabled = false, ...props }: ActionElementProps) {
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
