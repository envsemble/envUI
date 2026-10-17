'use client';

import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { useResolvedLocale } from '../internal/useFormatters.js';

/** An avatar's size: sm 1.5 rem, md 2 rem, lg 3 rem or xl 5.5 rem. */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Person or organization name; the accessible name with label, and the initials fallback. */
  name: string;
  /** Picture URL. The fallback shows while it loads and when it is missing or fails. */
  src?: string | null;
  /** Shown without a picture: the default person picture, or initials (for example, for an organization). */
  fallback?: 'person' | 'initials';
  /**
   * sm 1.5 rem, md 2 rem, lg 3 rem or xl 5.5 rem, such as for a profile page.
   * @default 'md'
   */
  size?: AvatarSize;
  /** Name the avatar as an image by `name`; leave it off when text beside it already names the person. */
  label?: boolean;
}

/** The first letters of the first and last words, or the first two letters of a single word. */
function getInitials(name: string, locale: string | undefined) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const initials =
    words.length > 1
      ? `${words[0][0] ?? ''}${words[words.length - 1][0] ?? ''}`
      : words[0].slice(0, 2);
  return initials.toLocaleUpperCase(locale);
}

/** The envsemble default account picture. */
function PersonPicture() {
  return (
    <svg className="env-avatar-person" viewBox="0 0 104.15 104.15" aria-hidden="true">
      <circle
        className="env-avatar-person-background"
        cx="52.07"
        cy="52.07"
        r="52.07"
        fill="#a0c3ff"
      />
      <circle className="env-avatar-person-figure" cx="52.07" cy="41.35" r="19.08" fill="#4374e0" />
      <path
        className="env-avatar-person-figure"
        d="M52.44,67.48c-11.36-.23-19.72,3.35-25.18,6.92-4.93,3.21-7.85,8.73-7.85,14.61v3.61c8.93,7.21,20.29,11.53,32.67,11.53s23.73-4.32,32.67-11.53v-3.72c0-6.15-3.2-11.88-8.49-15.01s-13.14-6.19-23.8-6.41Z"
        fill="#4374e0"
      />
    </svg>
  );
}

/** A round picture of a person or organization, with the default person picture or initials as fallback. */
export function Avatar({
  name,
  src,
  fallback = 'person',
  size = 'md',
  label = false,
  className,
  ...props
}: AvatarProps) {
  const locale = useResolvedLocale();
  return (
    <BaseAvatar.Root
      {...props}
      className={classNames('env-avatar', className)}
      data-size={size}
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
      <BaseAvatar.Fallback
        className={classNames('env-avatar-fallback', `env-avatar-fallback-${fallback}`)}
      >
        {fallback === 'person' ? <PersonPicture /> : getInitials(name, locale)}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
