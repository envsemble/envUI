'use client';

import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { Avatar, type AvatarProps, type AvatarSize } from './Avatar.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { ActionElement } from '../internal/ActionElement.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { useFormatters } from '../internal/useFormatters.js';
import { avatarGroup as avatarGroupMessages } from '../foundations/messages/avatarGroup.js';

export interface AvatarGroupPerson {
  /** The person's name: the tooltip and accessible name of a pressable avatar, and the initials. */
  name: string;
  /** Picture URL; the fallback shows while it loads and when it is missing or fails. */
  src?: string | null;
  /** person, the default person picture (default), or initials, as for Avatar. */
  fallback?: AvatarProps['fallback'];
  /** A stable key, such as an account ID; the name and position by default. */
  id?: string | number;
  /** A destination for this person: the avatar becomes a link with a name tooltip. */
  href?: string;
  /**
   * Shows the person's avatar as chosen: a ring and a check. A look only: say what is chosen in
   * the control around the group, such as an option or the group's label.
   */
  selected?: boolean;
}

export interface AvatarGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The people, in order. Pass a preview with total when there are many more. */
  people: readonly AvatarGroupPerson[];
  /** The most avatars to show; the overflow chip after them counts the rest. All by default. */
  max?: number;
  /**
   * As Avatar: sm 1.5 rem, md 2 rem, lg 3 rem or xl 5.5 rem.
   * @default 'md'
   */
  size?: AvatarSize;
  /** How many people there are in all, when people is only a preview of them. */
  total?: number;
  /** Makes every avatar a button with a name tooltip; receives the person pressed. */
  onPersonClick?: (person: AvatarGroupPerson, event: MouseEvent<HTMLElement>) => void;
  /**
   * Text for people beyond the list, in the overflow tooltip and the group's name. It overrides
   * EnvUIProvider's `messages.avatarGroup.more` for this group.
   * @default '{count} more'
   */
  formatMore?: (count: number) => string;
  /**
   * The group's name from the number of people and their names, which end with formatMore's text
   * for people counted in total but not listed, such as "3 people: Alex Morgan, Sam Lee, 1 more".
   * It overrides EnvUIProvider's `messages.avatarGroup.label` for this group; aria-label replaces
   * it.
   * @default '{count} people: {names}'
   */
  formatLabel?: (count: number, names: readonly string[]) => string;
}

/**
 * Overlapping avatars for a set of people, such as the members of a project, with a chip that
 * counts the rest and lists them in its tooltip. A ring in the color of the surface below
 * separates the avatars.
 */
export function AvatarGroup({
  people,
  max,
  size = 'md',
  total,
  onPersonClick,
  formatMore: ownFormatMore,
  formatLabel: ownFormatLabel,
  className,
  'aria-label': label,
  ...props
}: AvatarGroupProps) {
  // A format prop wins over the provider's messages, which win over the English defaults.
  const messages = useMessages('avatarGroup', avatarGroupMessages);
  const formatters = useFormatters();
  // Names separated as the locale lists them, without a conjunction: "Alex Morgan, Sam Lee, 9 more".
  const list = (items: readonly string[]) =>
    formatters.list({ type: 'unit', style: 'short' }).format(items);
  const formatMore =
    ownFormatMore ??
    ((count: number) => messages.more({ count, number: formatters.number().format(count) }));
  const formatLabel =
    ownFormatLabel ??
    ((count: number, names: readonly string[]) =>
      messages.label({
        count,
        number: formatters.number().format(count),
        names: list(names),
      }));
  // A total or max that is no count, such as NaN from missing data, an endless total or a max of
  // null, counts and shows everyone passed.
  const count = Math.max(isCount(total) ? Math.floor(total) : 0, people.length);
  if (count === 0) return null;
  const shown =
    typeof max === 'number' && !Number.isNaN(max)
      ? people.slice(0, Math.max(0, Math.floor(max)))
      : people;
  const hidden = people.slice(shown.length);
  // People counted in total whom the preview leaves out, so nobody can name them.
  const unlisted = count - people.length;
  const overflow = count - shown.length;
  const interactive = onPersonClick !== undefined || shown.some((person) => person.href);
  const names = people.map((person) => person.name);
  if (unlisted > 0) names.push(formatMore(unlisted));
  // The overflow chip stands for the people it hides, as its tooltip lists them.
  const hiddenNames = hidden.map((person) => person.name);
  if (unlisted > 0) hiddenNames.push(formatMore(unlisted));
  return (
    <div
      role="group"
      {...props}
      aria-label={label ?? formatLabel(count, names)}
      className={classNames('env-avatar-group', className)}
      data-size={size}
      data-interactive={interactive ? '' : undefined}
    >
      {shown.map((person, index) => (
        <AvatarGroupItem
          key={person.id ?? `${index}-${person.name}`}
          person={person}
          size={size}
          onPersonClick={onPersonClick}
        />
      ))}
      {overflow > 0 && (
        <Tooltip
          content={
            <span className="env-avatar-group-tooltip">
              {hidden.map((person, index) => (
                <span key={person.id ?? `${index}-${person.name}`}>{person.name}</span>
              ))}
              {unlisted > 0 && <span>{formatMore(unlisted)}</span>}
            </span>
          }
        >
          {/* A tab stop of its own, so the keyboard reaches the names it lists, as the pointer
              does; for assistive technology it is an image named by those names. The count reads
              +2 in right-to-left text too. */}
          <span
            className="env-avatar-group-overflow"
            tabIndex={0}
            role="img"
            aria-label={list(hiddenNames)}
          >
            <span dir="ltr">{`+${overflow}`}</span>
          </span>
        </Tooltip>
      )}
    </div>
  );
}

function AvatarGroupItem({
  person,
  size,
  onPersonClick,
}: {
  person: AvatarGroupPerson;
  size: AvatarSize;
  onPersonClick: AvatarGroupProps['onPersonClick'];
}) {
  const avatar = (
    <Avatar
      name={person.name}
      src={person.src}
      fallback={person.fallback}
      size={size}
      selected={person.selected}
    />
  );
  if (!person.href && !onPersonClick) return avatar;
  const onClick =
    onPersonClick && ((event: MouseEvent<HTMLElement>) => onPersonClick(person, event));
  return (
    <Tooltip content={person.name}>
      {person.href ? (
        <ActionElement
          href={person.href}
          aria-label={person.name}
          className="env-avatar-group-item"
          onClick={onClick}
        >
          {avatar}
        </ActionElement>
      ) : (
        <ActionElement aria-label={person.name} className="env-avatar-group-item" onClick={onClick}>
          {avatar}
        </ActionElement>
      )}
    </Tooltip>
  );
}

/** A number of people: finite, so neither NaN nor endless. */
function isCount(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
