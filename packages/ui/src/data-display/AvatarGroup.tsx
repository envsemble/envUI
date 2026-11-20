'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
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
import { ActionElement } from '../internal/control/ActionElement.js';
import { classNames } from '../internal/classNames.js';
import { nameWithBadge } from './internal/avatarName.js';
import { mergeRefs } from '../internal/react/setRef.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { useFormatters } from '../internal/provider/useFormatters.js';
import { avatarGroup as avatarGroupMessages } from '../foundations/messages/avatarGroup.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/AvatarGroup.css';

/**
 * One person in an AvatarGroup: the Avatar props a pile shows, a tooltip, a key, a destination and
 * itemProps. Without a hue, the name chooses one, never one that looks like its neighbour's. The
 * name is a pressable avatar's tooltip and accessible name, and a badge given as text, such as
 * online, follows the name there, as it shows.
 */
export interface AvatarGroupPerson extends Pick<
  AvatarProps,
  'name' | 'src' | 'fallback' | 'hue' | 'badge' | 'selected'
> {
  /**
   * The tooltip of a pressable avatar, such as the name with a role or an e-mail address; the
   * name by default. The name stays its accessible name.
   */
  tooltip?: ReactNode;
  /** A stable key, such as an account ID; the name and position by default. */
  id?: string | number;
  /** A destination for this person: the avatar becomes a link with a name tooltip. */
  href?: string;
  /**
   * More props for the person's avatar, or for its link or button when it is pressable, such as
   * data attributes for tests or a title. Its class joins the avatar's, its style and listeners
   * join the group's, and the avatar's name and role stay.
   */
  itemProps?: AvatarGroupItemProps;
}

/** What a person's itemProps can set on their avatar, or on its link or button. */
export type AvatarGroupItemProps = Omit<
  ComponentPropsWithoutRef<'a'>,
  | 'children'
  | 'href'
  | 'id'
  | 'role'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-hidden'
  | 'dangerouslySetInnerHTML'
> & { [attribute: `data-${string}`]: string | number | boolean | undefined };

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
  /**
   * The overflow chip's tooltip, from the people it hides and how many more total counts but
   * people doesn't list, such as a list of them with their avatars. Their names, one a line, and
   * formatMore's text by default. The chip's accessible name stays their names.
   */
  renderOverflowTooltip?: (hidden: readonly AvatarGroupPerson[], unlisted: number) => ReactNode;
}

const lookAlikeHueFamily: Record<AvatarHue, string> = {
  powder: 'blue',
  periwinkle: 'blue',
  seafoam: 'green',
  sage: 'green',
  blush: 'pink',
  orchid: 'pink',
  butter: 'warm',
  oat: 'warm',
};

function huesWithoutLookAlikeNeighbours(people: readonly AvatarGroupPerson[]): AvatarHue[] {
  const hues: AvatarHue[] = [];
  for (const person of people) {
    let hue = person.hue ?? avatarHue(person.name);
    const previous = hues.at(-1);
    if (
      person.hue === undefined &&
      previous !== undefined &&
      lookAlikeHueFamily[hue] === lookAlikeHueFamily[previous]
    ) {
      const start = avatarHues.indexOf(hue);
      for (let step = 1; step < avatarHues.length; step += 1) {
        const next = avatarHues[(start + step) % avatarHues.length];
        if (lookAlikeHueFamily[next] !== lookAlikeHueFamily[previous]) {
          hue = next;
          break;
        }
      }
    }
    hues.push(hue);
  }
  return hues;
}

const tapSpreadLastsWithoutAnotherTapMs = 5000;

function useTapSpread(group: RefObject<HTMLDivElement | null>) {
  const [tapped, setTapped] = useState(false);
  const [taps, setTaps] = useState(0);
  useEffect(() => {
    if (!tapped) return;
    const bunch = () => setTapped(false);
    const timer = setTimeout(bunch, tapSpreadLastsWithoutAnotherTapMs);
    const outside = (event: PointerEvent) => {
      if (!group.current?.contains(event.target as Node)) bunch();
    };
    document.addEventListener('pointerdown', outside, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', outside, true);
    };
  }, [group, tapped, taps]);
  const restartPauseOnTapInside = () => {
    if (tapped) setTaps((value) => value + 1);
  };
  return { tapped, setTapped, restartPauseOnTapInside };
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
  renderOverflowTooltip,
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
  const { tapped, setTapped, restartPauseOnTapInside } = useTapSpread(groupRef);
  const messages = useMessages('avatarGroup', avatarGroupMessages);
  const formatters = useFormatters();
  const listWithoutConjunction = (items: readonly string[]) =>
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
        names: listWithoutConjunction(names),
      }));
  const count = Math.max(isCount(total) ? Math.floor(total) : 0, people.length);
  if (count === 0) return null;
  const shown =
    typeof max === 'number' && !Number.isNaN(max)
      ? people.slice(0, Math.max(0, Math.floor(max)))
      : people;
  const hidden = people.slice(shown.length);
  const countedButUnlisted = count - people.length;
  const overflow = count - shown.length;
  const interactive = onPersonClick !== undefined || shown.some((person) => person.href);
  const names = people.map((person) => person.name);
  if (countedButUnlisted > 0) names.push(formatMore(countedButUnlisted));
  const overflowChipNames = hidden.map((person) => person.name);
  if (countedButUnlisted > 0) overflowChipNames.push(formatMore(countedButUnlisted));
  const counted = overflow > 0;
  const hues = huesWithoutLookAlikeNeighbours(shown);
  const placeForTheStyleSheetToBunch = (index: number): CSSProperties => ({
    '--_avatar-group-before': String(Math.min(index, shown.length - 1)),
    '--_avatar-group-after': String(Math.max(0, shown.length - 1 - index)),
    '--_avatar-group-count-before': index === shown.length ? '1' : '0',
    '--_avatar-group-count-after': counted && index < shown.length ? '1' : '0',
  });
  return (
    <div
      role="group"
      {...props}
      ref={mergeRefs(groupRef, ref)}
      aria-label={label ?? formatLabel(count, names)}
      className={classNames('env-avatar-group', className)}
      style={style}
      data-size={size}
      data-align={align}
      data-interactive={flag(interactive)}
      data-spread={flag(tapped)}
      onClick={(event) => {
        onClick?.(event);
        const tapOnTheRestingPilesCover = event.target === event.currentTarget;
        if (tapOnTheRestingPilesCover) setTapped(true);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        restartPauseOnTapInside();
      }}
      onPointerLeave={(event: ReactPointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        const mouseLeavesTheSpreadToHover = event.pointerType === 'mouse';
        if (mouseLeavesTheSpreadToHover) setTapped(false);
      }}
    >
      {shown.map((person, index) => (
        <AvatarGroupItem
          key={person.id ?? `${index}-${person.name}`}
          person={person}
          hue={hues[index]}
          size={size}
          style={placeForTheStyleSheetToBunch(index)}
          onPersonClick={onPersonClick}
        />
      ))}
      {overflow > 0 && (
        <Tooltip
          content={
            renderOverflowTooltip ? (
              renderOverflowTooltip(hidden, Math.max(0, countedButUnlisted))
            ) : (
              <span className="env-avatar-group-tooltip">
                {hidden.map((person, index) => (
                  <span key={person.id ?? `${index}-${person.name}`}>{person.name}</span>
                ))}
                {countedButUnlisted > 0 && <span>{formatMore(countedButUnlisted)}</span>}
              </span>
            )
          }
        >
          <span
            className="env-avatar-group-overflow"
            style={placeForTheStyleSheetToBunch(shown.length)}
            tabIndex={0}
            role="img"
            aria-label={listWithoutConjunction(overflowChipNames)}
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
  const itemProps = (person.itemProps ?? {}) as HTMLAttributes<HTMLElement>;
  const avatar = (
    <Avatar
      {...(pressable ? undefined : mergeProps(itemProps, { style }))}
      name={person.name}
      src={person.src}
      fallback={person.fallback}
      hue={hue}
      size={size}
      selected={person.selected}
      badge={person.badge}
    />
  );
  if (!pressable) return avatar;
  const onClick =
    onPersonClick && ((event: MouseEvent<HTMLElement>) => onPersonClick(person, event));
  const ownItemProps = mergeProps(itemProps, {
    'aria-label': nameWithBadge(person.name, person.badge),
    className: 'env-avatar-group-item',
    style,
    onClick,
  });
  return (
    <Tooltip content={person.tooltip ?? person.name}>
      {person.href ? (
        <ActionElement {...ownItemProps} href={person.href}>
          {avatar}
        </ActionElement>
      ) : (
        <ActionElement {...ownItemProps}>{avatar}</ActionElement>
      )}
    </Tooltip>
  );
}

function isCount(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
