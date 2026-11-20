import type { ComponentType } from 'react';
import { moduleRegistry } from '../loading/ModuleRegistry';
import { shownByPageTile } from './MemberTiles';

export interface TileModule {
  default: ComponentType;
  tileWindow?: TileWindow;
}

const tiles = moduleRegistry(import.meta.glob<TileModule>('/src/tiles/*.tsx'));

const pascal = (id: string) =>
  id.replace(/(^|-)([a-z\d])/g, (_, __: string, letter: string) => letter.toUpperCase());

const tilePath = (id: string) => `/src/tiles/${pascal(id)}.tsx`;

export interface TileWindow {
  width?: number;
  height?: number;
  popupLeast?: number;
  overlay?: boolean;
  app?: { least?: number };
}

export const narrowGallery = '(width < 29rem) and (not ((hover: none) or (pointer: coarse)))';

export const preloadTile = (page: string) => tiles.preload(tilePath(page));

export const tileOf = (page: string) =>
  tiles.has(tilePath(page)) ? () => tiles.load(tilePath(page)) : undefined;

const memberTiles = moduleRegistry(import.meta.glob<TileModule>('/src/tiles/members/*.tsx'));

export const memberTileOf = (component: string) => {
  const page = shownByPageTile[component];
  if (page) return tileOf(page);
  const path = `/src/tiles/members/${component}.tsx`;
  return memberTiles.has(path) ? () => memberTiles.load(path) : undefined;
};
