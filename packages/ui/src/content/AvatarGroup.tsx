import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { Avatar, type AvatarProps } from './Avatar.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { ActionElement } from '../internal/ActionElement.js';
import { classNames } from '../internal/classNames.js';

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
}

export interface AvatarGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The people, in order. Pass a preview with total when there are many more. */
  people: readonly AvatarGroupPerson[];
  /** The most avatars to show; the overflow chip after them counts the rest. All by default. */
  max?: number;
  /** As Avatar: small 1.5 rem, standard 2 rem (default), large 3 rem or display 5.5 rem. */
  size?: AvatarProps['size'];
  /** How many people there are in all, when people is only a preview of them. */
  total?: number;
  /** Makes every avatar a button with a name tooltip; receives the person pressed. */
  onPersonClick?: (person: AvatarGroupPerson, event: MouseEvent<HTMLElement>) => void;
  /** Text for people beyond the list, in the overflow tooltip and the group's name; "N more". */
  formatMore?: (count: number) => string;
  /**
   * The group's name from the number of people and their names, which end with formatMore's text
   * for people counted in total but not listed: "3 people: Alex Morgan, Sam Lee, 1 more" by
   * default. aria-label replaces it.
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
  size = 'standard',
  total,
  onPersonClick,
  formatMore = formatMorePeople,
  formatLabel = formatGroupLabel,
  className,
  'aria-label': label,
  ...props
}: AvatarGroupProps) {
  // An unknown total or max, such as NaN from missing data, counts and shows everyone passed.
  const count = Math.max(Math.floor(total ?? 0) || 0, people.length);
  if (count === 0) return null;
  const shown =
    max === undefined || Number.isNaN(max) ? people : people.slice(0, Math.max(0, Math.floor(max)));
  const hidden = people.slice(shown.length);
  // People counted in total whom the preview leaves out, so nobody can name them.
  const unlisted = count - people.length;
  const overflow = count - shown.length;
  const interactive = onPersonClick !== undefined || shown.some((person) => person.href);
  const names = people.map((person) => person.name);
  if (unlisted > 0) names.push(formatMore(unlisted));
  return (
    <div
      role="group"
      {...props}
      aria-label={label ?? formatLabel(count, names)}
      className={classNames('env-avatar-group', `env-avatar-group-${size}`, className)}
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
              does; the group's name already counts and names everyone for assistive technology.
              The count reads +2 in right-to-left text too. */}
          <span className="env-avatar-group-overflow" tabIndex={0}>
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
  size: AvatarProps['size'];
  onPersonClick: AvatarGroupProps['onPersonClick'];
}) {
  const avatar = (
    <Avatar name={person.name} src={person.src} fallback={person.fallback} size={size} />
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

function formatMorePeople(count: number) {
  return `${count} more`;
}

function formatGroupLabel(count: number, names: readonly string[]) {
  return `${count} ${count === 1 ? 'person' : 'people'}: ${names.join(', ')}`;
}
