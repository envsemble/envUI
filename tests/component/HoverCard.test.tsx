import { beforeEach, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/HoverCard.fixture.tsx';
import {
  animationsDone,
  box,
  keyboard,
  mouse,
  nextFrames,
  passTime,
  stopTimers,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const themes = ['light', 'dark'] as const;
const hoverOpenDelayMs = 600;
const closeDelayMs = 300;

beforeEach(() => {
  mount(fixture);
});

const card = () => document.querySelector<HTMLElement>('.env-hover-card');
const cardShown = () => {
  const element = card();
  return !!element && element.getBoundingClientRect().height > 0;
};
const isOpen = () => expect.poll(cardShown).toBe(true);
const isClosed = () => expect.poll(card).toBeNull();
const cardTheme = () =>
  card()!.parentElement!.closest('[data-env-theme]')!.getAttribute('data-env-theme');
const changes = (theme: string) => () =>
  page.getByTestId(`hover-card-changes-${theme}`).element().textContent;

function center(locator: Locator | Element) {
  const { x, y, width, height } = box(locator);
  return { x: x + width / 2, y: y + height / 2 };
}

test(
  'a hover card opens after the delay on hover, stays open on the card and keeps the theme',
  { tags: ['engines'] },
  async () => {
    stopTimers();
    for (const theme of themes) {
      const trigger = page
        .getByTestId(`hover-card-${theme}`)
        .getByRole('link', { name: `Roadmap ${theme}` });
      await trigger.hover();
      await passTime(hoverOpenDelayMs - 10);
      expect(card()).toBeNull();
      await passTime(20);
      await isOpen();
      expect(cardTheme()).toBe(theme);
      expect(page.getByRole('dialog').elements()).toHaveLength(0);

      await expect.poll(() => card()!.hasAttribute('data-starting-style')).toBe(false);
      await nextFrames();
      await animationsDone(card()!, true);
      const target = center(card()!.querySelector('p')!);
      await mouse.move(target.x, target.y, { steps: 8 });
      await passTime(700);
      expect(cardShown()).toBe(true);
      await mouse.dblclick(target.x, target.y);
      expect(getSelection()?.toString().trim()).not.toBe('');
      expect(cardShown()).toBe(true);

      await mouse.move(5, 5);
      await passTime(closeDelayMs);
      await isClosed();
      await expect.poll(changes(theme)).toBe('true false');
    }
    await page.getByRole('link', { name: 'Roadmap light' }).hover();
    await passTime(hoverOpenDelayMs);
    await isOpen();
    await keyboard.press('Escape');
    await isClosed();
  },
);

test(
  'a hover card opens at once on keyboard focus, leaves focus on the trigger and closes on Escape',
  { tags: ['engines'] },
  async () => {
    stopTimers();
    for (const theme of themes) {
      const scope = page.getByTestId(`hover-card-${theme}`);
      const trigger = scope.getByRole('link', { name: `Roadmap ${theme}` });
      const before = scope.getByRole('button', { name: `Before ${theme}` });
      (before.element() as HTMLElement).focus();
      await keyboard.press('Shift');
      (trigger.element() as HTMLElement).focus();
      await expect.element(trigger).toHaveFocus();
      await isOpen();
      expect(cardTheme()).toBe(theme);
      await expect.element(trigger).toHaveFocus();

      await keyboard.press('Escape');
      await isClosed();
      await expect.element(trigger).toHaveFocus();
      await passTime(700);
      expect(card()).toBeNull();
      expect(changes(theme)()).toBe('true false');

      await keyboard.press('Shift+Tab');
      await expect.element(before).toHaveFocus();
      expect(card()).toBeNull();
    }
  },
);
