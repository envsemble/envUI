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
} from './Browser.ts';
import { mount } from './Mount.tsx';

const themes = ['light', 'dark'] as const;

beforeEach(() => {
  mount(fixture);
});

const card = () => document.querySelector<HTMLElement>('.env-hover-card');
/** Whether the card is in the page and shows. */
const cardShown = () => {
  const element = card();
  return !!element && element.getBoundingClientRect().height > 0;
};
const isOpen = () => expect.poll(cardShown).toBe(true);
const isClosed = () => expect.poll(card).toBeNull();
/** The theme of the nearest themed ancestor of the card. */
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
    // The card's delays pass only as the test moves the clock, however slow the machine.
    stopTimers();
    for (const theme of themes) {
      const trigger = page
        .getByTestId(`hover-card-${theme}`)
        .getByRole('link', { name: `Roadmap ${theme}` });
      await trigger.hover();
      // The pointer has to rest on the trigger first (600 ms by default).
      await passTime(590);
      expect(card()).toBeNull();
      await passTime(20);
      await isOpen();
      expect(cardTheme()).toBe(theme);
      // Supplementary details, not a dialog.
      expect(page.getByRole('dialog').elements()).toHaveLength(0);

      // The pointer moves from the trigger onto the card, and the card stays past the close
      // delay, which this waits out, and its text can be selected.
      // Once it has grown in, so the point stays on it.
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

      // Leaving the trigger and the card closes it, once its close delay, 300 ms, has passed.
      await mouse.move(5, 5);
      await passTime(300);
      await isClosed();
      await expect.poll(changes(theme)).toBe('true false');
    }
    // Escape closes it while the pointer rests on its trigger.
    await page.getByRole('link', { name: 'Roadmap light' }).hover();
    await passTime(600);
    await isOpen();
    await keyboard.press('Escape');
    await isClosed();
  },
);

test(
  'a hover card opens at once on keyboard focus, leaves focus on the trigger and closes on Escape',
  { tags: ['engines'] },
  async () => {
    // The clock stands still, so the card that opens came with no wait: the hover delay is 600 ms.
    stopTimers();
    for (const theme of themes) {
      const scope = page.getByTestId(`hover-card-${theme}`);
      const trigger = scope.getByRole('link', { name: `Roadmap ${theme}` });
      const before = scope.getByRole('button', { name: `Before ${theme}` });
      (before.element() as HTMLElement).focus();
      // WebKit leaves links out of the Tab order by default, so focus moves to the link directly
      // after a key press, which makes it keyboard focus.
      await keyboard.press('Shift');
      (trigger.element() as HTMLElement).focus();
      await expect.element(trigger).toHaveFocus();
      await isOpen();
      expect(cardTheme()).toBe(theme);
      await expect.element(trigger).toHaveFocus();

      await keyboard.press('Escape');
      await isClosed();
      await expect.element(trigger).toHaveFocus();
      // The delayed focus opening does not bring it back: this moves the clock past it.
      await passTime(700);
      expect(card()).toBeNull();
      expect(changes(theme)()).toBe('true false');

      // Tab moves on rather than into the card, and the card does not reopen.
      await keyboard.press('Shift+Tab');
      await expect.element(before).toHaveFocus();
      expect(card()).toBeNull();
    }
  },
);
