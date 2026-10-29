import type { ComponentPropsWithRef } from 'react';
import { Avatar, type AvatarProps } from '../content/Avatar.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { ActionElement } from '../internal/ActionElement.js';
import { classNames } from '../internal/classNames.js';
import '../styles/Base.css';
import '../styles/AvatarButton.css';

export interface AvatarButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  /** The person's name: shown in the tooltip, and the accessible name unless aria-label is set. */
  name: string;
  /** A second tooltip line, such as the e-mail address of the signed-in account. */
  description?: string;
  /** Picture URL; the default person picture shows without one. */
  src?: string | null;
  /** Shown without a picture: the default person picture (default), or the initials of `name`. */
  fallback?: AvatarProps['fallback'];
  /**
   * The picture: sm 1.5 rem, md 2 rem or lg 3 rem, inside a slightly larger hit area, which grows
   * to the touch height under a coarse pointer.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A person's avatar as a button, typically the account menu trigger in a topbar. A halo shows hover,
 * press and an open menu, and the tooltip names the account.
 */
export function AvatarButton({
  name,
  description,
  src,
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarButtonProps) {
  return (
    <Tooltip
      side="bottom"
      content={
        description ? (
          <span className="env-avatar-button-tooltip">
            <span>{name}</span>
            <span>{description}</span>
          </span>
        ) : (
          name
        )
      }
    >
      <ActionElement
        {...props}
        aria-label={props['aria-label'] ?? name}
        className={classNames('env-avatar-button', className)}
      >
        <Avatar name={name} src={src} fallback={fallback} size={size} />
      </ActionElement>
    </Tooltip>
  );
}
