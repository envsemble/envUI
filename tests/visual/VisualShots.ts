import type { ElementHandle, Locator, Page } from '@playwright/test';
import type { ThemeName } from '../browser/support/CatalogueThemes';

export const densityShots = [
  { section: 'sizes', theme: 'light' },
  { section: 'form', theme: 'light' },
  { section: 'desktop', theme: 'light' },
  { section: 'desktop', theme: 'dark' },
] as const;
export const surfaceShots = ['light', 'dark'];
export const exampleShots = [
  { name: 'table-parts', page: 'table', example: 'WorkItemsWithParts' },
].flatMap((shot) => (['light', 'dark'] as const).map((theme) => ({ ...shot, theme })));

interface OpenList {
  name: string;
  themes: readonly ThemeName[];
  page: string;
  example: string;
  trigger?: (page: Page) => Locator;
  key?: string;
  open?: (page: Page, trigger: ElementHandle) => Promise<void>;
  popup: (page: Page) => Locator;
  count?: number;
  highlighted?: string;
  focusesHighlighted?: boolean;
  maxDiffPixels?: number;
  withTrigger: boolean;
}

export const stageOf = (page: Page) => page.getByTestId('layout-check-root');

async function focusFromKeyboard(page: Page, trigger: ElementHandle) {
  await trigger.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
}

export const openLists: OpenList[] = [
  {
    name: 'select',
    themes: ['light', 'dark', 'light-hc'],
    page: 'select',
    example: 'ProjectVisibility',
    trigger: (page) => stageOf(page).getByRole('combobox', { name: 'Visibility', exact: true }),
    key: 'Space',
    popup: (page) => page.getByRole('listbox'),
    highlighted: 'Team',
    focusesHighlighted: true,
    withTrigger: true,
  },
  {
    name: 'select-small',
    themes: ['light'],
    page: 'select',
    example: 'SmallToolbar',
    trigger: (page) => stageOf(page).getByRole('combobox', { name: 'Zoom', exact: true }),
    key: 'Space',
    popup: (page) => page.getByRole('listbox'),
    highlighted: '100%',
    focusesHighlighted: true,
    withTrigger: true,
  },
  {
    name: 'combobox',
    themes: ['light'],
    page: 'combobox',
    example: 'ChooseOwner',
    trigger: (page) => stageOf(page).getByRole('combobox', { name: 'Owner', exact: true }),
    key: 'ArrowDown',
    popup: (page) => page.getByRole('listbox'),
    highlighted: 'Alex Morgan',
    maxDiffPixels: 16,
    withTrigger: true,
  },
  {
    name: 'menu',
    themes: ['light', 'dark', 'light-hc'],
    page: 'menu',
    example: 'IconsAndShortcuts',
    trigger: (page) => stageOf(page).getByRole('button', { name: 'More actions', exact: true }),
    key: 'ArrowDown',
    popup: (page) => page.getByRole('menu', { name: 'Report actions', exact: true }),
    highlighted: 'Rename',
    focusesHighlighted: true,
    withTrigger: true,
  },
  {
    name: 'menu-choices',
    themes: ['light'],
    page: 'menu',
    example: 'Choices',
    trigger: (page) => stageOf(page).getByRole('button', { name: 'View', exact: true }),
    key: 'ArrowDown',
    popup: (page) => page.getByRole('menu', { name: 'View options', exact: true }),
    highlighted: 'Name',
    focusesHighlighted: true,
    withTrigger: true,
  },
  {
    name: 'command-palette',
    themes: ['light'],
    page: 'command-palette',
    example: 'GoToDocument',
    trigger: (page) => stageOf(page).getByRole('button', { name: 'Search', exact: true }),
    key: 'Enter',
    popup: (page) => page.getByRole('dialog', { name: 'Go to document', exact: true }),
    highlighted: 'Roadmap.md',
    withTrigger: false,
  },
  {
    name: 'tooltip',
    themes: ['light', 'dark'],
    page: 'tooltip',
    example: 'IconActions',
    trigger: (page) => stageOf(page).getByRole('button', { name: 'Refresh members', exact: true }),
    open: focusFromKeyboard,
    popup: (page) => page.locator('.env-tooltip', { hasText: 'Refresh members' }),
    withTrigger: true,
  },
  {
    name: 'toasts',
    themes: ['light', 'dark'],
    page: 'toast',
    example: 'Tones',
    popup: (page) => page.locator('.env-toast'),
    count: 4,
    withTrigger: false,
  },
];
