import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Avatar, type AvatarProps } from './Avatar.js';
import { Tooltip } from '../overlays/Tooltip.js';
import { ActionElement } from '../internal/control/ActionElement.js';
import { classNames } from '../internal/classNames.js';
import { nameWithBadge } from './internal/avatarName.js';
import '../styles/Base.css';
import '../styles/AvatarButton.css';

export interface AvatarButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  /**
   * The person's name: shown in the tooltip, and the accessible name unless aria-label is set,
   * followed by a badge's text, such as Alex Morgan, online.
   */
  name: string;
  /**
   * A second tooltip line, such as the e-mail address of the signed-in account, or content such
   * as an organization's name with its plan's Badge.
   */
  description?: ReactNode;
  /** Picture URL; the fallback shows without one. */
  src?: string | null;
  /** Shown without a picture: the initials of `name`, by default, or the default person picture. */
  fallback?: AvatarProps['fallback'];
  /** The fill behind the initials or the person picture, as for Avatar; the name chooses one by default. */
  hue?: AvatarProps['hue'];
  /** Shows the avatar as chosen, as for Avatar: a ring and a check. A look only. */
  selected?: boolean;
  /**
   * A small mark at the avatar's bottom end, as for Avatar, such as a presence dot. Text, such as
   * online, also follows the name in the button's accessible name, as it shows on the button.
   */
  badge?: ReactNode;
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
  hue,
  selected,
  badge,
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
        aria-label={props['aria-label'] ?? nameWithBadge(name, badge)}
        className={classNames('env-avatar-button', className)}
      >
        <Avatar
          name={name}
          src={src}
          fallback={fallback}
          hue={hue}
          selected={selected}
          badge={badge}
          size={size}
        />
      </ActionElement>
    </Tooltip>
  );
}
