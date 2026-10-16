import type { ComponentProps, ComponentType } from 'react';
import { MenuItem, Stat, Table } from '@envsemble/envui';
import type { MenuItemProps } from '@envsemble/envui';

export interface LinkItemProps extends MenuItemProps {
  external?: boolean;
}

export type StatComponent = ComponentType<ComponentProps<typeof Stat>>;
export type TableComponent = typeof Table;
export const item: typeof MenuItem = MenuItem;
export const isComponent = typeof MenuItem === 'function';
export const registry = new Map<string, ComponentType<MenuItemProps>>([['item', MenuItem]]);
