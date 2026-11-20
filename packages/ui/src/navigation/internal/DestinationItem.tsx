'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { classNames } from '../../internal/classNames.js';
import { ActionElement } from '../../internal/control/ActionElement.js';
import { Column, Row } from '../../layout/Layout.js';
import { DecorativeIcon } from '../../internal/icon/DecorativeIcon.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { SymbolIconFill } from '../../internal/icon/SymbolIconFill.js';
import { navigation, type NavigationMessages } from '../../foundations/messages/navigation.js';
import { flag } from '../../internal/flag.js';
import type { NavigationDrawerDestination } from '../destinations.js';
import { givenLabelText } from '../../internal/text/labelText.js';

/**
 * The part classes of a form's destinations, which each form writes out as literals: an indicator
 * around the icon above the label, as in NavigationBar and NavigationRail, or none, for a row of icon, label and count,
 * as in NavigationDrawer.
 */
export interface DestinationClasses {
  item: string;
  indicator?: string;
  label: string;
  count: string;
}

/** A run of destinations of one group, in the list's order: NavigationDrawer's sections. */
export interface DestinationSection<Item> {
  /** The group's heading, or undefined for destinations outside any group. */
  group: string | undefined;
  items: Item[];
}

/**
 * The list's destinations in runs of one group, in their order: a new section starts wherever
 * `group` differs from the destination before.
 */
export function destinationSections<Item extends { group?: string }>(
  destinations: readonly Item[],
): DestinationSection<Item>[] {
  const sections: DestinationSection<Item>[] = [];
  for (const destination of destinations) {
    const last = sections.at(-1);
    if (last && last.group === destination.group) last.items.push(destination);
    else sections.push({ group: destination.group, items: [destination] });
  }
  return sections;
}

/** A destination's name as text: its textValue, else its label, which is then a string. */
export const destinationText = (destination: NavigationDrawerDestination) =>
  givenLabelText(destination.label, destination.textValue) ?? '';

/** A destination's key: its id, else its address, else its name, which the list keeps unique. */
export const destinationKey = (destination: NavigationDrawerDestination) =>
  destination.id ?? destination.href ?? destinationText(destination);

/** Whether a destination nested under these, at any depth, is the current one. */
export function holdsCurrent(
  children: readonly NavigationDrawerDestination[] | undefined,
): boolean {
  return children?.some((child) => child.current === true || holdsCurrent(child.children)) ?? false;
}

/** The count as it shows: nothing for none or a dot, and 999+ above 999. */
export function shownCount(count: number | true | undefined): string | undefined {
  if (typeof count !== 'number' || !Number.isFinite(count) || count <= 0) return undefined;
  return count > 999 ? '999+' : String(Math.floor(count));
}

/**
 * The name of an item with a count, such as Inbox, 3 new, or with a dot, such as Activity, new;
 * undefined where its label names it.
 */
export function countedName(
  label: string,
  count: number | true | undefined,
  messages: NavigationMessages,
): string | undefined {
  if (count === true) return messages.itemNew({ label });
  const shown = shownCount(count);
  return shown === undefined ? undefined : messages.itemCount({ label, count: shown });
}

/** The navigation messages, with the application's overrides. */
export const useNavigationMessages = () => useMessages('navigation', navigation);

export interface DestinationItemProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  classes: DestinationClasses;
  destination: NavigationDrawerDestination;
  /**
   * The form shows only the top level, as NavigationRail and NavigationBar do: a destination whose
   * nested destinations hold the current one takes the current fill, and reports aria-current="true".
   */
  topLevel?: boolean;
  /** The destination's badge in its slot, after the label: NavigationDrawer's. */
  badge?: ReactNode;
  /** The component's own content at the end of a row, after the count: a section's chevron. */
  end?: ReactNode;
  /** The label's element, such as to tell whether it is cut short. */
  labelRef?: Ref<HTMLSpanElement>;
  /** The control's element, for a tooltip that renders it as its trigger. */
  ref?: Ref<HTMLElement>;
}

/**
 * One destination's control: a link with href, through the LinkProvider's link component, or a
 * button that runs onClick, or that only opens and closes the destinations under it. The current one reports aria-current="page" and fills its icon; one
 * with a count is named with it, such as Inbox, 3 new. NavigationBar and NavigationRail put the icon in an indicator,
 * with the count on it, above the label; NavigationDrawer puts the icon, the label and the count in a row.
 */
export function DestinationItem({
  classes,
  destination,
  labelRef,
  ref,
  topLevel = false,
  badge,
  end,
  ...tooltipTriggerProps
}: DestinationItemProps) {
  const messages = useNavigationMessages();
  const { label, icon, count, current = false, disabled = false, href, onClick } = destination;
  const inside = topLevel && !current && holdsCurrent(destination.children);
  const marked = current || inside;
  const shown = shownCount(count);
  const dot = count === true;
  const icons =
    icon == null ? null : (
      <SymbolIconFill selected={marked}>
        <DecorativeIcon>{icon}</DecorativeIcon>
      </SymbolIconFill>
    );
  const countBadge = (shown !== undefined || dot) && (
    <span className={classes.count} aria-hidden="true" data-dot={flag(dot)}>
      {shown}
    </span>
  );
  const control =
    href !== undefined ? (
      <ActionElement href={href} onClick={onClick} disabled={disabled} />
    ) : onClick !== undefined ? (
      <ActionElement onClick={onClick} disabled={disabled} />
    ) : (
      <ActionElement disabled={disabled} />
    );
  const { className: itemClassName, ...itemProps } = destination.itemProps ?? {};
  const shared = {
    ...(mergeProps(itemProps, tooltipTriggerProps) as HTMLAttributes<HTMLElement>),
    ref,
    render: control,
    className: classNames(classes.item, itemClassName),
    'data-current': flag(marked),
    'data-disabled': flag(disabled),
    'aria-current': current ? ('page' as const) : inside ? ('true' as const) : undefined,
    'aria-label': countedName(destinationText(destination), count, messages),
  };
  const spaceBetweenLabelAndCount = shown !== undefined && ' ';
  return classes.indicator === undefined ? (
    <Row {...shared} align="center" gap={3}>
      {icons}
      <span className={classes.label} ref={labelRef}>
        {label}
      </span>
      {badge}
      {spaceBetweenLabelAndCount}
      {countBadge}
      {end}
    </Row>
  ) : (
    <Column {...shared} align="center" gap={1}>
      <span className={classes.label}>{label}</span>
      {spaceBetweenLabelAndCount}
      <span className={classes.indicator}>
        {icons}
        {countBadge}
      </span>
    </Column>
  );
}
