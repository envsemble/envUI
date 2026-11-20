'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { classNames } from '../../internal/classNames.js';
import { ActionElement } from '../../internal/control/ActionElement.js';
import { Column, Row } from '../../layout/Layout.js';
import { DecorativeIcon } from '../../internal/icon/DecorativeIcon.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { SymbolIconFill } from '../../internal/icon/SymbolIconFill.js';
import { navigation } from '../../foundations/messages/navigation.js';
import { flag } from '../../internal/flag.js';
import type { NavigationDrawerDestination } from '../destinations.js';
import {
  countedName,
  destinationCurrent,
  destinationText,
  shownCount,
} from './destinationModel.js';

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

function DestinationCount({
  className,
  count,
}: {
  className: string;
  count: number | true | undefined;
}) {
  const shown = shownCount(count);
  const dot = count === true;
  if (shown === undefined && !dot) return null;
  return (
    <span className={className} aria-hidden="true" data-dot={flag(dot)}>
      {shown}
    </span>
  );
}

export function DestinationIndicator({
  classes,
  icon,
  count,
}: {
  classes: DestinationClasses;
  icon: ReactNode;
  count: number | true | undefined;
}) {
  return (
    <span className={classes.indicator}>
      {icon}
      <DestinationCount className={classes.count} count={count} />
    </span>
  );
}

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
  const messages = useMessages('navigation', navigation);
  const { label, icon, count, disabled = false, href, onClick } = destination;
  const current = destinationCurrent(destination, topLevel);
  const marked = current !== undefined;
  const icons =
    icon == null ? null : (
      <SymbolIconFill selected={marked}>
        <DecorativeIcon>{icon}</DecorativeIcon>
      </SymbolIconFill>
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
    'aria-current': current,
    'aria-label': countedName(destinationText(destination), count, messages),
  };
  const spaceBetweenLabelAndCount = shownCount(count) !== undefined && ' ';
  return classes.indicator === undefined ? (
    <Row {...shared} align="center" gap={3}>
      {icons}
      <span className={classes.label} ref={labelRef}>
        {label}
      </span>
      {badge}
      {spaceBetweenLabelAndCount}
      <DestinationCount className={classes.count} count={count} />
      {end}
    </Row>
  ) : (
    <Column {...shared} align="center" gap={1}>
      <span className={classes.label}>{label}</span>
      {spaceBetweenLabelAndCount}
      <DestinationIndicator classes={classes} icon={icons} count={count} />
    </Column>
  );
}
