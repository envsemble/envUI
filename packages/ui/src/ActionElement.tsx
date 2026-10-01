import type { ComponentPropsWithRef } from 'react';

export type ActionElementProps =
  | (ComponentPropsWithRef<'button'> & { href?: undefined })
  | (ComponentPropsWithRef<'a'> & { href: string; disabled?: boolean });

/** One native action implementation for button links, navigation and interactive cards. */
export function ActionElement({ disabled = false, ...props }: ActionElementProps) {
  if (props.href !== undefined) {
    const { href, onClick, tabIndex, ...anchorProps } = props as ComponentPropsWithRef<'a'>;
    return (
      <a
        {...anchorProps}
        href={disabled ? undefined : href}
        role={anchorProps.role ?? (disabled ? 'link' : undefined)}
        aria-disabled={disabled || anchorProps['aria-disabled']}
        tabIndex={disabled ? -1 : tabIndex}
        onClick={(event) => {
          if (disabled) event.preventDefault();
          else onClick?.(event);
        }}
      />
    );
  }
  const { type = 'button', ...buttonProps } = props as ComponentPropsWithRef<'button'>;
  return <button {...buttonProps} type={type} disabled={disabled} />;
}
