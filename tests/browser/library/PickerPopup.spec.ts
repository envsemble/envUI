import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

/** The clock is fixed, so Today, Now and This month stay available. */
const today = new Date('2026-10-14T10:00:00');

const field = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
/** The open card; a closing one can still fade out. */
const openCard = (page: Page) => page.locator('.env-picker-popup[data-open]');

/** The open card's inset and corners, and how far its footer's first and last buttons sit from its edges. */
const cardGeometry = (page: Page) =>
  openCard(page).evaluate(async (card) => {
    // The card grows in; its boxes have their final size once the transition has run.
    await Promise.allSettled(card.getAnimations().map(({ finished }) => finished));
    const style = getComputedStyle(card);
    const box = card.getBoundingClientRect();
    const buttons = [...card.querySelectorAll<HTMLElement>('.env-picker-popup-footer .env-button')];
    const first = buttons[0]!;
    const last = buttons.at(-1)!;
    const firstBox = first.getBoundingClientRect();
    const lastBox = last.getBoundingClientRect();
    const round = (value: number) => Math.round(value * 10) / 10;
    return {
      padding: style.padding,
      radius: style.borderRadius,
      border: style.borderTopWidth,
      buttons: buttons.map((button) => button.textContent),
      // The labels: inside each button's own padding.
      labelStart: round(
        firstBox.left + Number.parseFloat(getComputedStyle(first).paddingLeft) - box.left,
      ),
      labelEnd: round(
        box.right - (lastBox.right - Number.parseFloat(getComputedStyle(last).paddingRight)),
      ),
      // The buttons' own boxes.
      start: round(firstBox.left - box.left),
      end: round(box.right - lastBox.right),
      bottom: round(box.bottom - Math.max(firstBox.bottom, lastBox.bottom)),
    };
  });

test('the three pickers open the same card, their actions inset alike from its edges', async ({
  page,
}) => {
  await page.clock.setFixedTime(today);
  await page.goto(`${fixtureUrl}/?fixture=picker-popup`);
  const cards = [];
  for (const [name, buttons] of [
    ['Card date', ['Today', 'Clear']],
    ['Card time', ['Now', 'Clear']],
    ['Card month', ['This month', 'Clear']],
  ] as const) {
    await field(page, name).click();
    await expect(openCard(page)).toBeVisible();
    const geometry = await cardGeometry(page);
    expect(geometry.buttons).toEqual(buttons);
    // It opens 8 px clear of the field's box, as every popup opens from its trigger, at its start.
    const control = (await field(page, name)
      .locator('xpath=ancestor::*[contains(@class, "env-text-field-control")][1]')
      .boundingBox())!;
    const card = (await openCard(page).boundingBox())!;
    expect(card.y - (control.y + control.height)).toBeCloseTo(8, 0);
    expect(card.x).toBeCloseTo(control.x, 0);
    cards.push(geometry);
    await page.keyboard.press('Escape');
    await expect(openCard(page)).toHaveCount(0);
  }
  const [date, time, month] = cards;
  // One inset and one radius: a panel's, as wide as a popup row's corner, 14 px at the default
  // scale.
  expect(date!.padding).toBe('14px');
  for (const card of [time, month]) {
    expect(card!.padding).toBe(date!.padding);
    expect(card!.radius).toBe(date!.radius);
    for (const edge of ['labelStart', 'labelEnd', 'start', 'end', 'bottom'] as const)
      expect(card![edge]).toBe(date![edge]);
  }
  // The labels line up with the inset; the buttons' boxes stay well inside it.
  const inset = Number.parseFloat(date!.padding) + Number.parseFloat(date!.border);
  expect(date!.labelStart).toBeCloseTo(inset, 0);
  expect(date!.labelEnd).toBeCloseTo(inset, 0);
  for (const edge of ['start', 'end', 'bottom'] as const)
    expect(date![edge]).toBeGreaterThanOrEqual(inset / 2);
});
