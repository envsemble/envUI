import type { ComponentPropsWithRef } from 'react';
import { Avatar, type AvatarProps } from '../content/Avatar.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { classNames } from '../internal/classNames.js';

export interface AvatarButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  /** The person's name: shown in the tooltip, and the accessible name unless aria-label is set. */
  name: string;
  /** A second tooltip line, such as the e-mail address of the signed-in account. */
  detail?: string;
  /** Picture URL; the default person picture shows without one. */
  src?: string | null;
  /** Shown without a picture: the default person picture (default), or the initials of `name`. */
  fallback?: AvatarProps['fallback'];
  /** small 1.5 rem, standard 2 rem (default) or large 3 rem picture, inside a slightly larger hit area. */
  size?: 'small' | 'standard' | 'large';
}

/**
 * A person's avatar as a button, typically the account menu trigger in a topbar. A halo shows hover,
 * press and an open menu, and the tooltip names the account.
 */
export function AvatarButton({
  name,
  detail,
  src,
  fallback,
  size = 'standard',
  className,
  type = 'button',
  ...props
}: AvatarButtonProps) {
  return (
    <Tooltip
      side="bottom"
      content={
        detail ? (
          <span className="env-avatar-button-tooltip">
            <span>{name}</span>
            <span>{detail}</span>
          </span>
        ) : (
          name
        )
      }
    >
      <button
        {...props}
        type={type}
        aria-label={props['aria-label'] ?? name}
        className={classNames('env-avatar-button', className)}
      >
        <Avatar name={name} src={src} fallback={fallback} size={size} />
      </button>
    </Tooltip>
  );
}
