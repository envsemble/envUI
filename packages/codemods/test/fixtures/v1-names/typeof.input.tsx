import type { ComponentProps, ComponentType } from 'react';
import { MenuItem, PanelDock, Table } from '@envsemble/envui';
import type { MenuItemProps } from '@envsemble/envui';

export interface LinkItemProps extends MenuItemProps {
  external?: boolean;
}

export type DockComponent = ComponentType<ComponentProps<typeof PanelDock>>;
export type TableComponent = typeof Table;
export const item: typeof MenuItem = MenuItem;
export const isComponent = typeof MenuItem === 'function';
export const registry = new Map<string, ComponentType<MenuItemProps>>([['item', MenuItem]]);
