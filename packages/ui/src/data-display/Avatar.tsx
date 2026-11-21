'use client';

import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { IconCheck } from '../icons/Check.js';
import { useResolvedLocale } from '../internal/provider/locale.js';
import { flag } from '../internal/flag.js';
import { Slot } from '../internal/layout/Slot.js';
import '../styles/Base.css';
import '../styles/Avatar.css';

/** An avatar's size: sm 1.5 rem, md 2 rem, lg 3 rem or xl 5.5 rem. */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * The hues an avatar without a picture takes, named for their colors: each a pastel fill with the
 * initials or figure in a deep shade of the same hue.
 */
export const avatarHues = [
  'powder',
  'seafoam',
  'sage',
  'butter',
  'blush',
  'periwinkle',
  'orchid',
  'oat',
] as const;

/** One of the hues of an avatar without a picture. */
export type AvatarHue = (typeof avatarHues)[number];

/**
 * The hue a name gives an avatar: the same name always gives the same hue, on every page and in
 * every session, and different names spread across the hues. Letter case and surrounding spaces do
 * not count.
 */
export function avatarHue(name: string): AvatarHue {
  return avatarHues[fnv1aOfUtf16CodeUnits(name.trim().toLowerCase()) % avatarHues.length];
}

const fnv1aOffsetBasis = 0x811c9dc5;
const fnv1aPrime = 0x01000193;

function fnv1aOfUtf16CodeUnits(text: string) {
  let hash = fnv1aOffsetBasis;
  for (const char of text) {
    for (let index = 0; index < char.length; index += 1) {
      hash ^= char.charCodeAt(index);
      hash = Math.imul(hash, fnv1aPrime);
    }
  }
  return hash >>> 0;
}

export interface AvatarProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Person or organization name: the accessible name of a named avatar, and the initials fallback. */
  name: string;
  /** Picture URL. The fallback shows while it loads and when it is missing or fails. */
  src?: string | null;
  /**
   * Shown without a picture: the initials of `name`, so people tell avatars apart, or the default
   * person picture, which an empty `name` shows too. An element is placed as given on the hue's
   * fill, in its deep shade as `currentColor`, such as an icon or a Graphic for a bot, an agent, a
   * team or a service account.
   * @default 'initials'
   */
  fallback?: 'person' | 'initials' | ReactElement;
  /**
   * The fill behind the initials or the person picture. Without it, the name chooses one, the same
   * for the same name everywhere; set it for an organization with a color of its own.
   */
  hue?: AvatarHue;
  /**
   * sm 1.5 rem, md 2 rem, lg 3 rem or xl 5.5 rem, such as for a profile page.
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * Names the avatar as an image by `name`. Without it, the avatar is hidden from assistive
   * technology, for when text beside it already names the person.
   * @default false
   */
  named?: boolean;
  /**
   * Shows the avatar as chosen, such as in a list of people to pick from: a ring around it and a
   * small check at its bottom end, so the choice never rests on color alone. It is a look only:
   * the control around the avatar, such as a checkbox or an option, says it is chosen.
   * @default false
   */
  selected?: boolean;
  /**
   * A small mark at the avatar's bottom end, placed as given, such as a presence dot, an unread
   * marker or an organization's mark; at its top end while the avatar is selected, whose check
   * takes the bottom end. It is hidden from assistive technology with the avatar, so say what it
   * shows in the text beside it.
   */
  badge?: ReactNode;
}

function getInitials(name: string, locale: string | undefined) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const initials =
    words.length > 1
      ? `${words[0][0] ?? ''}${words[words.length - 1][0] ?? ''}`
      : words[0].slice(0, 2);
  return initials.toLocaleUpperCase(locale);
}

function DefaultAccountPicture() {
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

/** A round picture of a person or organization, with their initials or the default person picture as fallback. */
export function Avatar({
  name,
  src,
  fallback: ownFallback,
  hue,
  size = 'md',
  named = false,
  selected = false,
  badge,
  className,
  ...props
}: AvatarProps) {
  const locale = useResolvedLocale();
  const initials = getInitials(name, locale);
  const ownFallbackContent = typeof ownFallback === 'object' ? ownFallback : null;
  const fallback: 'person' | 'initials' =
    typeof ownFallback === 'string' ? ownFallback : initials ? 'initials' : 'person';
  return (
    <BaseAvatar.Root
      {...props}
      className={classNames('env-avatar', className)}
      data-size={size}
      data-hue={hue ?? avatarHue(name)}
      data-selected={flag(selected)}
      role={named ? 'img' : undefined}
      aria-label={named ? name : undefined}
      aria-hidden={named ? undefined : true}
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
      {ownFallbackContent ? (
        <BaseAvatar.Fallback className="env-avatar-fallback">
          <Slot className="env-avatar-fallback-content" element="span" layout="row">
            {ownFallbackContent}
          </Slot>
        </BaseAvatar.Fallback>
      ) : (
        <BaseAvatar.Fallback
          className={classNames('env-avatar-fallback', `env-avatar-fallback-${fallback}`)}
        >
          {fallback === 'person' ? <DefaultAccountPicture /> : initials}
        </BaseAvatar.Fallback>
      )}
      {selected && (
        <span className="env-avatar-check" aria-hidden="true">
          <IconCheck />
        </span>
      )}
      {badge != null && (
        <Slot className="env-avatar-badge" element="span" layout="row">
          {badge}
        </Slot>
      )}
    </BaseAvatar.Root>
  );
}
