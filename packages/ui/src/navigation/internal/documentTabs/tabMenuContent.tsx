'use client';

import type { ReactNode } from 'react';
import * as Menu from '../../../actions/menu/Menu.js';
import type { DocumentTabsItem } from '../../DocumentTabs.js';
import { tabHolding } from './tabStrip.js';

type Side = 'left' | 'right';

interface TabMenuActions {
  closeName: (label: string) => string;
  onClose: (value: string) => void;
  onMove: ((value: string, side: Side) => void) | undefined;
  canMove: (value: string, side: Side) => boolean;
  closeAll: { onClick: () => void; label: string; disabled: boolean } | undefined;
  moveLeftLabel: string;
  moveRightLabel: string;
}

function TabMenuItems({
  tab,
  ownItems,
  closeName,
  onClose,
  onMove,
  canMove,
  closeAll,
  moveLeftLabel,
  moveRightLabel,
}: TabMenuActions & {
  tab: { value: string; label: string; closable: boolean } | undefined;
  ownItems: ReactNode;
}) {
  return (
    <>
      {tab?.closable && (
        <Menu.Item onClick={() => onClose(tab.value)}>{closeName(tab.label)}</Menu.Item>
      )}
      {tab && onMove && (
        <>
          <Menu.Item
            onClick={() => onMove(tab.value, 'left')}
            disabled={!canMove(tab.value, 'left')}
          >
            {moveLeftLabel}
          </Menu.Item>
          <Menu.Item
            onClick={() => onMove(tab.value, 'right')}
            disabled={!canMove(tab.value, 'right')}
          >
            {moveRightLabel}
          </Menu.Item>
        </>
      )}
      {closeAll && (
        <Menu.Item onClick={closeAll.onClick} disabled={closeAll.disabled}>
          {closeAll.label}
        </Menu.Item>
      )}
      {ownItems !== undefined && (
        <>
          {(tab?.closable || (tab && onMove) || closeAll) && <Menu.Separator />}
          {ownItems}
        </>
      )}
    </>
  );
}

export function tabMenuContent(
  target: Element | null,
  {
    items,
    contextMenu,
    ...actions
  }: TabMenuActions & {
    items: readonly DocumentTabsItem[];
    contextMenu: ((tab: DocumentTabsItem | null) => ReactNode) | undefined;
  },
): ReactNode {
  const tab = target === null ? null : tabHolding(target);
  const value = tab?.dataset.value;
  const item = value === undefined ? undefined : items.find((one) => one.value === value);
  const onTab = tab != null && value !== undefined;
  const own = contextMenu?.(item ?? null);
  const ownItems = own != null && own !== false ? own : undefined;
  const offersMenu = onTab || actions.closeAll !== undefined;
  if (!offersMenu) return ownItems ?? null;
  return (
    <TabMenuItems
      {...actions}
      tab={
        onTab
          ? {
              value,
              label: tab.getAttribute('aria-label') ?? '',
              closable: item?.closable !== false,
            }
          : undefined
      }
      ownItems={ownItems}
    />
  );
}
