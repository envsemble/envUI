import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface AvatarProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Person or organization name; supplies the initials fallback and, with label, the accessible name. */
  name: string;
  /** Picture URL. Initials show while it loads and when it is missing or fails. */
  src?: string | null;
  /** small 1.5 rem, standard 2 rem (default), large 3 rem, display 5.5 rem. */
  size?: 'small' | 'standard' | 'large' | 'display';
  /** Announce the name; omit when adjacent text already names the person. */
  label?: boolean;
}

/** The first letters of the first and last words, or the first two letters of a single word. */
export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const initials =
    words.length > 1
      ? `${words[0][0] ?? ''}${words[words.length - 1][0] ?? ''}`
      : words[0].slice(0, 2);
  return initials.toLocaleUpperCase();
}

/** A round picture of a person or organization, with an initials fallback. */
export function Avatar({
  name,
  src,
  size = 'standard',
  label = false,
  className,
  ...props
}: AvatarProps) {
  return (
    <BaseAvatar.Root
      {...props}
      className={classNames('env-avatar', `env-avatar-${size}`, className)}
      role={label ? 'img' : undefined}
      aria-label={label ? name : undefined}
      aria-hidden={label ? undefined : true}
    >
      {src ? (
        <BaseAvatar.Image
          className="env-avatar-image"
          src={src}
          alt=""
          draggable={false}
          referrerPolicy="no-referrer"
        />
      ) : null}
      <BaseAvatar.Fallback className="env-avatar-fallback">{getInitials(name)}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
