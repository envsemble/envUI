'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { IconButton, type IconButtonProps } from './Button.js';
import { Close } from '../icons/Close.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { common } from '../foundations/messages/common.js';
import type { ControlSize } from '../foundations/Theme.js';

export interface CloseButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> {
  /**
   * The button's name, such as Close notification or Remove Alex Morgan where more than one thing
   * closes nearby.
   * @default 'Close', or EnvUIProvider's messages.common.close
   */
  'aria-label'?: string;
  /**
   * ghost, the quiet icon on chrome and inside surfaces, or secondary, on the neutral fill, where
   * the button should read as a control of its own, such as over an image.
   * @default 'ghost'
   */
  variant?: 'ghost' | 'secondary';
  /** The icon; a Close cross by default. */
  icon?: ReactNode;
  /** As Button's: the height, and the width, of the square button. */
  size?: ControlSize;
  /** As Button's: a spinner replaces the icon while the work runs. */
  pending?: boolean;
}

/**
 * The button that closes, dismisses or removes what it sits in, such as a dialog, a notification, a
 * tab or a chip: an icon-only button with a cross, named Close in the provider's language. Under a
 * coarse pointer, its hit area reaches the touch size even where it draws smaller.
 */
export function CloseButton({
  'aria-label': label,
  variant = 'ghost',
  icon,
  className,
  ...props
}: CloseButtonProps) {
  const messages = useMessages('common', common);
  return (
    <IconButton
      {...({
        ...props,
        variant,
        icon: icon ?? <Close />,
        'aria-label': label ?? messages.close,
        className: classNames('env-close-button', className),
      } as IconButtonProps)}
    />
  );
}
