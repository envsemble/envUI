'use client';

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import {
  Avatar,
  avatarHue,
  avatarHues,
  type AvatarHue,
  type AvatarProps,
  type AvatarSize,
} from './Avatar.js';
import { Tooltip } from '../overlays/Tooltip.js';
import { ActionElement } from '../internal/ActionElement.js';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { useFormatters } from '../internal/useFormatters.js';
import { avatarGroup as avatarGroupMessages } from '../foundations/messages/avatarGroup.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/AvatarGroup.css';

export interface AvatarGroupPerson {
  /** The person's name: the tooltip and accessible name of a pressable avatar, and the initials. */
  name: string;
  /** Picture URL; the fallback shows while it loads and when it is missing or fails. */
  src?: string | null;
  /** Initials, by default, or the default person picture, as for Avatar. */
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
  /**
   * The group keeps the room its spread takes, so spreading never moves what is around it, and the
   * pile rests at one end of that room, along the inline axis: start, or end for a group at the
   * end of a row, such as at a list row's end.
   * @default 'start'
   */
  align?: 'start' | 'end';
  /** How many people there are in all, when people is only a preview of them. */
  total?: number;
  /**
   * Makes every avatar a button with a name tooltip; receives the person pressed. The avatars are
   * targets only while the group is spread: at rest the pile is one target, which hover, a tap or
   * keyboard focus spreads.
   */
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

/** The hues that look alike side by side: two blues, two greens, two pinks and two warm hues. */
const hueFamily: Record<AvatarHue, string> = {
  powder: 'blue',
  periwinkle: 'blue',
  seafoam: 'green',
  sage: 'green',
  blush: 'pink',
  orchid: 'pink',
  butter: 'warm',
  oat: 'warm',
};

/**
 * Each person's hue in the group: the one their name chooses, unless it looks like the previous
 * avatar's, in its family; then the next hue in order that doesn't, so no two neighbours blur.
 */
function groupHues(names: readonly string[]): AvatarHue[] {
  const hues: AvatarHue[] = [];
  for (const name of names) {
    let hue = avatarHue(name);
    const previous = hues.at(-1);
    if (previous !== undefined && hueFamily[hue] === hueFamily[previous]) {
      const start = avatarHues.indexOf(hue);
      for (let step = 1; step < avatarHues.length; step += 1) {
        const next = avatarHues[(start + step) % avatarHues.length];
        if (hueFamily[next] !== hueFamily[previous]) {
          hue = next;
          break;
        }
      }
    }
    hues.push(hue);
  }
  return hues;
}

/** How long a group spread by a tap stays spread without another tap in it. */
const tapSpreadDuration = 5000;

/**
 * Whether a tap spread the group, where no pointer hovers: until a tap outside, a pause or a mouse
 * leaving it. `tapInside` restarts the pause.
 */
function useTapSpread(group: RefObject<HTMLDivElement | null>) {
  const [tapped, setTapped] = useState(false);
  const [taps, setTaps] = useState(0);
  useEffect(() => {
    if (!tapped) return;
    const bunch = () => setTapped(false);
    const timer = setTimeout(bunch, tapSpreadDuration);
    const outside = (event: PointerEvent) => {
      // A pointer event on the document has a node as its target.
      if (!group.current?.contains(event.target as Node)) bunch();
    };
    document.addEventListener('pointerdown', outside, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', outside, true);
    };
  }, [group, tapped, taps]);
  const tapInside = () => {
    if (tapped) setTaps((value) => value + 1);
  };
  return { tapped, setTapped, tapInside };
}

/**
 * A pile of avatars for a set of people, such as the members of a project, with a chip that counts
 * the rest and lists them in its tooltip. Hover, a tap or keyboard focus spreads it.
 */
export function AvatarGroup({
  people,
  max,
  size = 'md',
  align = 'start',
  total,
  onPersonClick,
  formatMore: ownFormatMore,
  formatLabel: ownFormatLabel,
  className,
  style,
  'aria-label': label,
  ref,
  onClick,
  onPointerDown,
  onPointerLeave,
  ...props
}: AvatarGroupProps) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const { tapped, setTapped, tapInside } = useTapSpread(groupRef);
  // A format prop wins over the provider's messages, which win over the English defaults.
  const messages = useMessages('avatarGroup', avatarGroupMessages);
  const formatters = useFormatters();
  // Names separated as the locale lists them, without a conjunction: "Alex Morgan, Sam Lee, 9 more".
  const list = (items: readonly string[]) =>
    formatters.list({ type: 'unit', style: 'short' }).format(items);
  const formatMore =
    ownFormatMore ??
    ((count: number) => messages.more({ count, countText: formatters.number().format(count) }));
  const formatLabel =
    ownFormatLabel ??
    ((count: number, names: readonly string[]) =>
      messages.label({
        count,
        countText: formatters.number().format(count),
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
  // Each item's place: the avatars before and after it, and whether the count is, from which the
  // style sheet moves it as the group bunches, within the room the group keeps for its spread.
  const counted = overflow > 0;
  const hues = groupHues(shown.map((person) => person.name));
  const place = (index: number): CSSProperties => ({
    '--env-avatar-group-before': String(Math.min(index, shown.length - 1)),
    '--env-avatar-group-after': String(Math.max(0, shown.length - 1 - index)),
    '--env-avatar-group-count-before': index === shown.length ? '1' : '0',
    '--env-avatar-group-count-after': counted && index < shown.length ? '1' : '0',
  });
  return (
    <div
      role="group"
      {...props}
      ref={(node) => {
        groupRef.current = node;
        setRef(ref, node);
      }}
      aria-label={label ?? formatLabel(count, names)}
      className={classNames('env-avatar-group', className)}
      style={style}
      data-size={size}
      data-align={align}
      data-interactive={flag(interactive)}
      data-spread={flag(tapped)}
      // At rest the pile is one target, the group itself under the style sheet's cover: a tap on it
      // spreads the group, and only then do taps reach the avatars.
      onClick={(event) => {
        onClick?.(event);
        if (event.target === event.currentTarget) setTapped(true);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        tapInside();
      }}
      onPointerLeave={(event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        // A mouse that clicked the pile spreads it by hover alone once it leaves; touch leaves
        // after every tap, so it keeps the spread.
        if (event.pointerType === 'mouse') setTapped(false);
      }}
    >
      {shown.map((person, index) => (
        <AvatarGroupItem
          key={person.id ?? `${index}-${person.name}`}
          person={person}
          hue={hues[index]}
          size={size}
          style={place(index)}
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
            style={place(shown.length)}
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
  hue,
  size,
  style,
  onPersonClick,
}: {
  person: AvatarGroupPerson;
  hue: AvatarHue | undefined;
  size: AvatarSize;
  style: CSSProperties;
  onPersonClick: AvatarGroupProps['onPersonClick'];
}) {
  const pressable = Boolean(person.href) || onPersonClick !== undefined;
  const avatar = (
    <Avatar
      name={person.name}
      src={person.src}
      fallback={person.fallback}
      hue={hue}
      size={size}
      selected={person.selected}
      style={pressable ? undefined : style}
    />
  );
  if (!pressable) return avatar;
  const onClick =
    onPersonClick && ((event: MouseEvent<HTMLElement>) => onPersonClick(person, event));
  return (
    <Tooltip content={person.name}>
      {person.href ? (
        <ActionElement
          href={person.href}
          aria-label={person.name}
          className="env-avatar-group-item"
          style={style}
          onClick={onClick}
        >
          {avatar}
        </ActionElement>
      ) : (
        <ActionElement
          aria-label={person.name}
          className="env-avatar-group-item"
          style={style}
          onClick={onClick}
        >
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
