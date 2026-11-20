'use client';

import { useId } from 'react';
import type { ItemProps, RootProps } from '../List.js';
import { listIds, renderItem, renderList } from './listMarkup.js';

export function TitledList(props: RootProps) {
  return renderList(props, listIds(useId()));
}

export function ControlledItem(props: ItemProps) {
  return renderItem(props, listIds(useId()));
}
