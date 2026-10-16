import type { ComponentProps, ComponentType } from 'react';
import { Menu, Stat, Table } from '@envsemble/envui';

export interface LinkItemProps extends Menu.ItemProps {
  external?: boolean;
}

export type StatComponent = ComponentType<ComponentProps<typeof Stat.Root>>;
export type TableComponent = typeof Table.Root;
export const item: typeof Menu.Item = Menu.Item;
export const isComponent = typeof Menu.Item === 'function';
export const registry = new Map<string, ComponentType<Menu.ItemProps>>([['item', Menu.Item]]);
