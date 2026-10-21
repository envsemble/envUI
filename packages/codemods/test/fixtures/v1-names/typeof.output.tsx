import type { ComponentProps, ComponentType } from 'react';
import { Menu, PanelDock, Table } from '@envsemble/envui';

export interface LinkItemProps extends Menu.ItemProps {
  external?: boolean;
}

export type DockComponent = ComponentType<ComponentProps<typeof PanelDock.Root>>;
export type TableComponent = typeof Table.Root;
export const item: typeof Menu.Item = Menu.Item;
export const isComponent = typeof Menu.Item === 'function';
export const registry = new Map<string, ComponentType<Menu.ItemProps>>([['item', Menu.Item]]);
