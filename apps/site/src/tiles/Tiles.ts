import { lazy, type ComponentType } from 'react';
import { loadModule } from '../template/LoadBoundary';

/*
 * The tiles' own previews: for a component or pattern, a small live picture written for its tile
 * in the galleries and in Related, apps/site/src/tiles/<Page>.tsx, named after the page's id in
 * PascalCase (segmented-control is SegmentedControl.tsx), with a default-exported component. It
 * shows the component alone, large and centred, with as little else as it needs to be recognised,
 * and its animation, a timeline (useTimeline in previews/Motion.tsx) that plays on hover from that
 * still. A page without one shows the example its tile picks (Gallery.tsx, Related.tsx).
 */
const loaders = import.meta.glob<{ default: ComponentType }>('./*.tsx');
const tiles = new Map(
  Object.entries(loaders).map(([path, load]) => [path, lazy(loadModule(load))]),
);

/** A page's id in PascalCase, as its tile's file is named: segmented-control, SegmentedControl. */
const pascal = (id: string) =>
  id.replace(/(^|-)([a-z\d])/g, (_, __: string, letter: string) => letter.toUpperCase());

/**
 * The windows of the tiles whose component doesn't suit the tiles' 10 by 7.5 rem, by page id: a
 * larger one, drawn smaller, for a component too wide or tall, such as a toolbar or a menu open
 * below its button; a smaller one, drawn larger, for a small one, such as a key.
 */
export const tileWindows: Readonly<Record<string, { width: number; height: number }>> = {
  toast: { width: 16, height: 12 },
  'top-bar': { width: 17, height: 12.75 },
  page: { width: 16, height: 12 },
  scaffold: { width: 17, height: 12.75 },
  panes: { width: 40, height: 30 },
  'panel-dock': { width: 17, height: 12.75 },
  kbd: { width: 7, height: 5.25 },
  // The layout drawings, each drawn about as large as LineArt's, whose lines they share.
  box: { width: 9.4, height: 7.05 },
  row: { width: 8.4, height: 6.3 },
  column: { width: 9.5, height: 7.125 },
  grid: { width: 8.8, height: 6.6 },
  markdown: { width: 6, height: 4.5 },
  message: { width: 12, height: 9 },
  code: { width: 12, height: 9 },
  composer: { width: 12, height: 9 },
  accordion: { width: 15, height: 11.25 },
  alert: { width: 14, height: 10.5 },
  drawer: { width: 17, height: 12.75 },
  tabs: { width: 15, height: 11.25 },
  breadcrumbs: { width: 15, height: 11.25 },
  pager: { width: 14, height: 10.5 },
  pagination: { width: 13, height: 9.75 },
  tree: { width: 13, height: 9.75 },
  'table-of-contents': { width: 11, height: 8.25 },
  'document-tabs': { width: 18, height: 13.5 },
  dialog: { width: 20, height: 15 },
  'confirm-dialog': { width: 16, height: 12 },
  sheet: { width: 20, height: 15 },
  popover: { width: 14, height: 10.5 },
  'hover-card': { width: 14, height: 10.5 },
  toolbar: { width: 12, height: 9 },
  menu: { width: 14, height: 10.5 },
  combobox: { width: 14, height: 10.5 },
  'segmented-control': { width: 12, height: 9 },
  menubar: { width: 14, height: 10.5 },
  'command-palette': { width: 20, height: 15 },
  'date-picker': { width: 20, height: 15 },
  'time-picker': { width: 24, height: 18 },
  'month-picker': { width: 27, height: 20.25 },
  'color-picker': { width: 22, height: 16.5 },
  'drop-zone': { width: 14, height: 10.5 },
  'rich-text': { width: 11.5, height: 8.625 },
  table: { width: 16, height: 12 },
  list: { width: 16, height: 12 },
  'calendar-heatmap': { width: 13, height: 9.75 },
  'relative-time': { width: 12, height: 9 },
  badge: { width: 8, height: 6 },
  rating: { width: 9, height: 6.75 },
  'key-figures': { width: 18, height: 13.5 },
  loading: { width: 17, height: 12.75 },
  'empty-states': { width: 18, height: 13.5 },
  feedback: { width: 18, height: 16 },
  'progressive-disclosure': { width: 16, height: 12 },
  forms: { width: 20, height: 15 },
  settings: { width: 17, height: 12.75 },
  'destructive-actions': { width: 20, height: 17 },
  'file-upload': { width: 19, height: 14.25 },
  filtering: { width: 20, height: 15 },
  conversation: { width: 19, height: 14.25 },
  'data-tables': { width: 19, height: 14.25 },
  'account-and-organizations': { width: 19, height: 14.25 },
  'app-frame': { width: 18, height: 13.5 },
  navigation: { width: 15, height: 11.25 },
};

/** The tile of a page, by its id, where it has one of its own. */
export const tileOf = (page: string): ComponentType | undefined =>
  tiles.get(`./${pascal(page)}.tsx`);
