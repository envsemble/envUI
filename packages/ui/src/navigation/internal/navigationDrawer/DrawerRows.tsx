'use client';

import { Collapsible } from '@base-ui/react/collapsible';
import { useId, useRef, type ReactElement, type ReactNode } from 'react';
import { Column } from '../../../layout/Layout.js';
import { Slot } from '../../../internal/layout/Slot.js';
import { IconChevronRight } from '../../../icons/ChevronRight.js';
import { CutLabelTooltip } from '../../../internal/popup/TooltipPopup.js';
import { useMessages } from '../../../internal/provider/EnvUIContext.js';
import { navigation } from '../../../foundations/messages/navigation.js';
import type { HeadingLevel } from '../../../foundations/headingLevel.js';
import type { NavigationDrawerDestination } from '../../destinations.js';
import { DestinationItem, type DestinationClasses } from '../DestinationItem.js';
import { destinationKey, destinationText } from '../destinationModel.js';
import type { ExpandedSections } from './useExpandedSections.js';
import { rendersContent } from '../../../internal/react/rendersContent.js';
import { useCutShort } from '../../../internal/popup/useCutShort.js';
import { DecorativeIcon } from '../../../internal/icon/DecorativeIcon.js';
import '../../../styles/Base.css';
import '../../../styles/NavigationDrawer.css';

const drawerClasses: DestinationClasses = {
  item: 'env-navigation-drawer-item',
  label: 'env-navigation-drawer-label',
  count: 'env-navigation-drawer-count',
};

export interface DrawerState extends ExpandedSections {
  oneLine: boolean;
  groupEnd: ((group: string) => ReactNode) | undefined;
}

function DrawerControl({
  destination,
  oneLine,
  end,
  as,
}: {
  destination: NavigationDrawerDestination;
  oneLine: boolean;
  end?: ReactNode;
  as?: (item: ReactElement) => ReactElement;
}) {
  const label = useRef<HTMLSpanElement>(null);
  const cut = useCutShort(label, oneLine);
  const destinationItem = (
    <DestinationItem
      classes={drawerClasses}
      destination={destination}
      labelRef={label}
      badge={
        destination.badge != null && (
          <Slot className="env-navigation-drawer-badge" element="span" layout="row" shrink="never">
            {destination.badge}
          </Slot>
        )
      }
      end={end}
    />
  );
  const item = as ? as(destinationItem) : destinationItem;
  return oneLine ? (
    <CutLabelTooltip cut={cut} label={destination.label} side="inline-end">
      {item}
    </CutLabelTooltip>
  ) : (
    item
  );
}

const chevron = (
  <DecorativeIcon className="env-navigation-drawer-chevron">
    <IconChevronRight />
  </DecorativeIcon>
);

function DrawerRow({
  destination,
  toggle,
  children,
}: {
  destination: NavigationDrawerDestination;
  toggle?: ReactNode;
  children: ReactNode;
}) {
  if (destination.end == null && toggle == null) return children;
  return (
    <div className="env-navigation-drawer-row">
      {children}
      {destination.end != null && (
        <Slot className="env-navigation-drawer-end" layout="row" shrink="never">
          {destination.end}
        </Slot>
      )}
      {toggle}
    </div>
  );
}

function DrawerBranch({
  destination,
  nested,
  state,
}: {
  destination: NavigationDrawerDestination;
  nested: readonly NavigationDrawerDestination[];
  state: DrawerState;
}) {
  const messages = useMessages('navigation', navigation);
  const key = destinationKey(destination);
  const heading = destination.href === undefined && destination.onClick === undefined;
  return (
    <Collapsible.Root
      open={state.expanded.has(key)}
      onOpenChange={(open) => state.setExpanded(key, open)}
      render={<li />}
      className="env-navigation-drawer-branch"
    >
      {heading ? (
        <DrawerRow destination={destination}>
          <DrawerControl
            destination={destination}
            oneLine={state.oneLine}
            end={chevron}
            as={(item) => <Collapsible.Trigger render={item} />}
          />
        </DrawerRow>
      ) : (
        <DrawerRow
          destination={destination}
          toggle={
            <Collapsible.Trigger
              className="env-navigation-drawer-toggle"
              aria-label={messages.contents({ label: destinationText(destination) })}
            >
              {chevron}
            </Collapsible.Trigger>
          }
        >
          <DrawerControl destination={destination} oneLine={state.oneLine} />
        </DrawerRow>
      )}
      <Collapsible.Panel
        hiddenUntilFound
        render={<ul />}
        className="env-navigation-drawer-children"
      >
        {nested.map((child) => (
          <DrawerItem key={destinationKey(child)} destination={child} state={state} />
        ))}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

export function DrawerItem({
  destination,
  state,
}: {
  destination: NavigationDrawerDestination;
  state: DrawerState;
}) {
  const nested = destination.children;
  if (nested !== undefined && nested.length > 0)
    return <DrawerBranch destination={destination} nested={nested} state={state} />;
  return (
    <li>
      <DrawerRow destination={destination}>
        <DrawerControl destination={destination} oneLine={state.oneLine} />
      </DrawerRow>
    </li>
  );
}

export function DrawerSection({
  group,
  items,
  level,
  state,
}: {
  group: string;
  items: NavigationDrawerDestination[];
  level: Exclude<HeadingLevel, 1>;
  state: DrawerState;
}) {
  const headingId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const cut = useCutShort(heading, state.oneLine);
  const Heading = `h${level}` as const;
  const end = state.groupEnd?.(group);
  const headingElement = (
    <Heading
      ref={heading}
      className="env-navigation-drawer-group-label"
      id={headingId}
      title={cut ? group : undefined}
    >
      {group}
    </Heading>
  );
  return (
    <Column render={<li />} className="env-navigation-drawer-section" align="stretch" gap={1}>
      {rendersContent(end) ? (
        <div className="env-navigation-drawer-group-row">
          {headingElement}
          <Slot className="env-navigation-drawer-group-end" layout="row" shrink="never">
            {end}
          </Slot>
        </div>
      ) : (
        headingElement
      )}
      <Column render={<ul />} aria-labelledby={headingId} align="stretch" gap={1}>
        {items.map((destination) => (
          <DrawerItem key={destinationKey(destination)} destination={destination} state={state} />
        ))}
      </Column>
    </Column>
  );
}
