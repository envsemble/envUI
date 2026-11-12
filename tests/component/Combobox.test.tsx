import { beforeEach, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Combobox.fixture.tsx';
import * as portalContainer from '../fixture/PortalContainer.fixture.tsx';
import {
  animationsDone,
  box,
  collectErrors,
  css,
  keyboard,
  mouse,
  nextFrames,
  shown,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const field = (name: string) => page.getByRole('combobox', { name, exact: true });
const input = (locator: Locator) => locator.element() as HTMLInputElement;
const value = (locator: Locator) => () => input(locator).value;
const list = () => page.getByRole('listbox');
const listShown = () => shown(list());
const option = (name: string) => page.getByRole('option', { name, exact: true });
const highlighted = () =>
  [...document.querySelectorAll('[role="option"][data-highlighted]')].map(
    (each) => each.querySelector('.env-list-row-label')?.textContent,
  );
const optionTexts = () =>
  [...document.querySelectorAll('[role="option"] .env-list-row-text')].map(
    (each) => each.textContent,
  );
/** The well a field's input sits in, with its chips and buttons. */
const wellOf = (locator: Locator) =>
  locator.element().closest<HTMLElement>('.env-combobox-control')!;
/** A button in a field's well, by its name. */
const buttonIn = (well: Element, name: string) =>
  well.querySelector<HTMLElement>(`button[aria-label="${name}"]`);
/** Whether a field's well shows a button by that name. */
const showsButton = (well: Element, name: string) => {
  const button = buttonIn(well, name);
  return button !== null && shown(page.elementLocator(button));
};
/**
 * Presses an element where it shows, as a person's pointer does: for parts whose role and name
 * change as a popup opens, which a locator by role would lose.
 */
async function press(target: Element) {
  // Into view first, as Playwright's click scrolls it.
  target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  const at = box(target);
  await mouse.click(at.x + at.width / 2, at.y + at.height / 2);
}
const chips = (well: Element) => () =>
  [...well.querySelectorAll('.env-combobox-chip-label')].map((each) => each.textContent);
const text = (testId: string) => () => page.getByTestId(testId).element().textContent;
const json = (testId: string) => () => JSON.parse(text(testId)() || '{}');
const focus = (locator: Locator) => (locator.element() as HTMLElement).focus();
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
const closed = () => expect.poll(listShown).toBe(false);
const opened = () => expect.poll(listShown).toBe(true);
const query = (selector: string) => document.querySelector<HTMLElement>(selector);
/** The popup that is open, once it has finished growing in, so its boxes have their final size. */
async function openPopup() {
  await expect.poll(() => query('.env-combobox-popup[data-open]')).not.toBeNull();
  const popup = query('.env-combobox-popup[data-open]')!;
  await nextFrames();
  await animationsDone(popup);
  return popup;
}

/**
 * Where a chevron's tip points through its running turn, as [x, y] on the screen at eleven even
 * steps: the drawn chevron points right, so its tip follows the transform's first column. The turn
 * then finishes.
 */
async function chevronTips(icon: Element) {
  await expect.poll(() => icon.getAnimations().length).toBe(1);
  const [turn] = icon.getAnimations();
  turn!.pause();
  const duration = Number(turn!.effect!.getComputedTiming().duration);
  const tips: [number, number][] = [];
  for (let step = 0; step <= 10; step++) {
    turn!.currentTime = (duration * step) / 10;
    const { a, b } = new DOMMatrix(getComputedStyle(icon).transform);
    tips.push([a, b]);
  }
  turn!.finish();
  return tips;
}

/**
 * Checks a half turn from pointing one way to the other along the vertical: from down (1) to up
 * (-1) or back, keeping its shape all the way, never squashed flat as a flip over is halfway.
 */
function expectHalfTurn(tips: [number, number][], from: 1 | -1) {
  for (const [x, y] of tips) expect(Math.hypot(x, y)).toBeCloseTo(1, 2);
  expect(tips[0]![1]).toBeCloseTo(from, 2);
  expect(tips.at(-1)![1]).toBeCloseTo(-from, 2);
}

test('typing filters by label and description, ignoring case and accents, and Enter chooses the first match', async () => {
  const errors = collectErrors();
  const author = field('Author light');
  expect(value(author)()).toBe('Alex Morgan');
  await expect.element(author).toHaveAttribute('aria-expanded', 'false');
  await expect.element(author).toHaveAccessibleDescription('The person who answers questions.');
  // The chosen option's avatar sits before its label in the field.
  const avatar = () => wellOf(author).querySelector('.env-combobox-value-icon .env-avatar');
  expect(shown(page.elementLocator(avatar()!))).toBe(true);

  await author.fill('SAM');
  await opened();
  await expect.element(author).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(optionTexts).toEqual(['Sam Leesam.lee@example.com']);
  // The description is announced as the option's description, not as part of its name.
  const sam = option('Sam Lee');
  await expect.element(sam).toHaveAccessibleDescription('sam.lee@example.com');
  await expect.poll(highlighted).toEqual(['Sam Lee']);
  await expect.element(author).toHaveAttribute('aria-activedescendant', sam.element().id);
  // While the typed text differs from the chosen label, the chosen avatar steps aside.
  expect(wellOf(author).querySelector('.env-combobox-value-icon')).toBeNull();
  await keyboard.press('Enter');
  await expect.poll(() => list().query()).toBeNull();
  expect(value(author)()).toBe('Sam Lee');
  await isFocused(author);

  await author.fill('emile');
  await expect.poll(optionTexts).toEqual(['Émile Durandemile.durand@example.com']);
  await author.fill('quinn.harper@');
  await expect.poll(optionTexts).toEqual(['Quinn Harperquinn.harper@example.com']);
  await author.fill('nobody here');
  await expect.poll(() => query('.env-combobox-empty')?.textContent).toBe('No matches');
  expect(query('.env-combobox-empty')!.getAttribute('role')).toBe('status');
  // Esc closes the popup, and leaving the field restores the chosen label.
  await keyboard.press('Escape');
  await expect.poll(() => list().query()).toBeNull();
  expect(value(author)()).toBe('Sam Lee');
  expect(errors).toEqual([]);
});

test('with nothing chosen, clearing the query highlights the first option again', async () => {
  // packages/ui/src/forms/internal/autoHighlightAlways.ts
  const document_ = field('Document light');
  focus(document_);
  await keyboard.type('a');
  await expect.poll(highlighted).toEqual(['Quarterly report']);
  await keyboard.press('ArrowDown');
  await expect.poll(highlighted).toEqual(['Release notes']);
  await keyboard.press('Backspace');
  await expect.poll(value(document_)).toBe('');
  await expect.poll(highlighted).toEqual(['Quarterly report']);
});

test('arrows move the highlight from the chosen option, which shows the selection and a check mark, and the chevron turns as it opens and closes the popup', async () => {
  const owner = field('Owner light');
  focus(owner);
  await keyboard.press('ArrowDown');
  await opened();
  await expect.poll(highlighted).toEqual(['Riley Chen']);
  const riley = option('Riley Chen');
  await expect.element(riley).toHaveAttribute('aria-selected', 'true');
  expect(
    shown(page.elementLocator(riley.element().querySelector('.env-combobox-item-indicator svg')!)),
  ).toBe(true);
  expect(list().element().querySelectorAll('.env-combobox-item-indicator svg')).toHaveLength(1);
  await keyboard.press('ArrowDown');
  await expect.poll(highlighted).toEqual(['Taylor Brooks']);
  // Off the highlight, the chosen option keeps the selection's fill and text.
  const probe = document.createElement('div');
  probe.style.backgroundColor = 'var(--env-color-bg-selected)';
  probe.style.color = 'var(--env-color-fg-on-selected)';
  riley.element().append(probe);
  const selection = [css(probe, 'background-color'), css(probe, 'color')];
  probe.remove();
  await expect.poll(() => [css(riley, 'background-color'), css(riley, 'color')]).toEqual(selection);
  await keyboard.press('ArrowUp');
  await keyboard.press('ArrowUp');
  await expect.poll(highlighted).toEqual(['Jordan Park']);
  await keyboard.press('Enter');
  await expect.poll(() => list().query()).toBeNull();
  expect(value(owner)()).toBe('Jordan Park');
  await expect
    .poll(text('combobox-owner-light'))
    .toBe(JSON.stringify({ owner: 'jordan-park', opened: 1 }));

  // A disabled option cannot be chosen by pointer or keyboard.
  await owner.click();
  const jamie = option('Jamie Fox');
  await expect.element(jamie).toHaveAttribute('aria-disabled', 'true');
  await jamie.click({ force: true });
  expect(value(owner)()).toBe('Jordan Park');
  // Pressing an option chooses it and closes the popup.
  await option('Drew Patel').click();
  await expect.poll(() => list().query()).toBeNull();
  expect(value(owner)()).toBe('Drew Patel');
  // The chevron opens and closes the popup, turning half a turn each way and keeping its shape.
  const chevron = wellOf(owner).querySelector<HTMLElement>('.env-combobox-trigger')!;
  expect(chevron.getAttribute('tabindex')).toBe('-1');
  await expect.element(page.elementLocator(chevron)).toHaveAccessibleName('Owner light');
  const icon = chevron.querySelector<HTMLElement>('.env-icon')!;
  // Slowed, so the test can seek through the turn while it runs; the transition, and whether
  // reduced motion leaves it out, stay the style sheet's.
  icon.style.transitionDuration = '20s';
  await press(chevron);
  await opened();
  expectHalfTurn(await chevronTips(icon), 1);
  await press(chevron);
  await expect.poll(() => list().query()).toBeNull();
  expectHalfTurn(await chevronTips(icon), -1);
});

test(
  'focusing a single field selects its label, so typing replaces it with a query',
  { tags: ['engines'] },
  async () => {
    const owner = field('Owner light');
    await owner.click();
    await opened();
    await keyboard.type('jor');
    expect(value(owner)()).toBe('jor');
    await expect.poll(highlighted).toEqual(['Jordan Park']);
    // Closing without a choice brings the chosen label back.
    await keyboard.press('Escape');
    await expect.poll(() => list().query()).toBeNull();
    expect(value(owner)()).toBe('Riley Chen');
    focus(page.getByRole('button', { name: 'Reset people light', exact: true }));
    focus(owner);
    await keyboard.type('tay');
    expect(value(owner)()).toBe('tay');
    await expect.poll(highlighted).toEqual(['Taylor Brooks']);
    await keyboard.press('Enter');
    await expect.poll(value(owner)).toBe('Taylor Brooks');
    // Once focused, a press places the caret as usual.
    await owner.click();
    await keyboard.press('Escape');
    const at = box(owner);
    await mouse.click(at.x + 4, at.y + 8);
    await keyboard.type('X');
    expect(value(owner)()).not.toBe('X');
  },
);

test('the list opens 8 px clear of the field, at its start edge, and small fields line up with small buttons and open the one popup', async () => {
  const owner = field('Owner light');
  await press(wellOf(owner).querySelector('.env-combobox-trigger')!);
  const popup = await openPopup();
  const well = box(wellOf(owner));
  const placed = box(popup);
  // Below the field, or above it where the window has no room below.
  const gap =
    placed.y > well.y ? placed.y - (well.y + well.height) : well.y - (placed.y + placed.height);
  expect(gap).toBeCloseTo(8, 0);
  expect(placed.x).toBeCloseTo(well.x, 0);
  await keyboard.press('Escape');
  await closed();

  for (const theme of ['light', 'dark'] as const) {
    const toolbar = page.getByTestId(`combobox-compact-${theme}`);
    const compact = field(`Compact owner ${theme}`);
    const labels = field(`Compact labels ${theme}`);
    const neighbour = toolbar.getByRole('button', { name: `Compact neighbour ${theme}` });
    expect(box(wellOf(compact)).height).toBeCloseTo(32, 0);
    expect(box(wellOf(labels)).height).toBeCloseTo(32, 0);
    expect(box(neighbour).height).toBeCloseTo(32, 0);
    // The hidden label still names the field; the placeholder and value show instead.
    expect(value(compact)()).toBe('Taylor Brooks');
    await compact.click();
    // A closing popup can still fade out while the next one opens.
    const compactPopup = await openPopup();
    // The frosted popup's corners, concentric with its rows through its inset (Popup.css).
    expect(Number.parseFloat(css(compactPopup, 'border-top-left-radius'))).toBeCloseTo(20, 0);
    expect(Number.parseFloat(css(compactPopup, 'padding-top'))).toBeCloseTo(6, 0);
    // Options with a description take two lines; the row is at least the md control height.
    expect(box(compactPopup.querySelector('.env-combobox-item')!).height).toBeGreaterThanOrEqual(
      40,
    );
    await keyboard.press('Escape');
    await labels.click();
    await expect.element(option('Accessibility')).toHaveAttribute('aria-selected', 'true');
    const labelsPopup = await openPopup();
    expect(box(labelsPopup.querySelector('[aria-selected="true"]')!).height).toBeCloseTo(40, 0);
    await keyboard.press('Escape');
  }
});

test('several options show as chips that Backspace, the arrow keys and their buttons remove, and values without an option keep their place', async () => {
  const reviewers = field('Reviewers light');
  const well = wellOf(reviewers);
  const output = text('combobox-reviewers-light');
  await expect.poll(chips(well)).toEqual(['Sam Lee']);
  expect(well.getAttribute('role')).toBe('toolbar');
  await expect.element(page.elementLocator(well)).toHaveAccessibleName('Reviewers light');
  // The chosen options are read with the field.
  await expect.element(reviewers).toHaveAccessibleDescription('Sam Lee');
  await reviewers.click();
  await opened();
  await expect.element(list()).toHaveAttribute('aria-multiselectable', 'true');
  await option('Jordan Park').click();
  // Without a typed filter the popup stays open for more choices.
  expect(listShown()).toBe(true);
  await expect.poll(chips(well)).toEqual(['Sam Lee', 'Jordan Park']);
  expect(list().element().querySelectorAll('.env-combobox-item-indicator svg')).toHaveLength(2);
  // Choosing a chosen option again removes it.
  await option('Sam Lee').click();
  await expect.poll(chips(well)).toEqual(['Jordan Park']);
  await reviewers.fill('ri');
  await expect.poll(highlighted).toEqual(['Riley Chen']);
  await keyboard.press('Enter');
  await expect.poll(chips(well)).toEqual(['Jordan Park', 'Riley Chen']);
  expect(value(reviewers)()).toBe('');
  await expect.poll(output).toBe('jordan-park,riley-chen');
  await expect.element(reviewers).toHaveAccessibleDescription('Jordan Park, Riley Chen');

  await keyboard.press('Escape');
  await expect.poll(() => list().query()).toBeNull();
  await keyboard.press('Backspace');
  await expect.poll(chips(well)).toEqual(['Jordan Park']);
  await keyboard.press('ArrowLeft');
  const chip = () => page.elementLocator(well.querySelector('.env-combobox-chip')!);
  await isFocused(chip());
  await keyboard.press('ArrowRight');
  await isFocused(reviewers);
  await keyboard.press('ArrowLeft');
  await isFocused(chip());
  await keyboard.press('Delete');
  await expect.poll(chips(well)).toEqual([]);
  await isFocused(reviewers);
  await expect.poll(output).toBe('');
  // Without chips the toolbar is a group again, with the placeholder back.
  await expect.poll(() => well.getAttribute('role')).toBe('group');

  const watchers = wellOf(field('Watchers light'));
  await press(buttonIn(watchers, 'Remove Jordan Park')!);
  await expect.poll(chips(watchers)).toEqual(['Sam Lee']);
  await isFocused(field('Watchers light'));

  // A value the field never saw among the options shows as itself, and keeps its place among the
  // options reported.
  const mentioned = wellOf(field('Mentioned light'));
  await expect.poll(chips(mentioned)).toEqual(['Sam Lee', 'former-member', 'Riley Chen']);
  await press(buttonIn(mentioned, 'Remove Sam Lee')!);
  await expect.poll(text('combobox-mentioned-light')).toBe(
    JSON.stringify([
      ['former-member', 'former-member'],
      ['riley-chen', 'Riley Chen'],
    ]),
  );
  await expect.poll(chips(mentioned)).toEqual(['former-member', 'Riley Chen']);
});

test('Esc and the clear button clear a clearable field, Esc only while it has a value and never chips; other fields keep their value', async () => {
  const author = field('Author light');
  const changes = text('combobox-author-changes-light');
  // The well keeps room for the clear button only while the button shows.
  expect(wellOf(author).getAttribute('data-action-count')).toBe('2');
  focus(author);
  await keyboard.press('ArrowDown');
  await opened();
  await keyboard.press('Escape');
  await expect.poll(() => list().query()).toBeNull();
  expect(value(author)()).toBe('Alex Morgan');
  await keyboard.press('Escape');
  await expect.poll(value(author)).toBe('');
  await expect.poll(changes).toBe('[null]');
  await expect.poll(() => wellOf(author).getAttribute('data-action-count')).toBe('1');
  // With nothing to clear, Esc reports no change.
  await keyboard.press('Escape');
  await keyboard.press('Escape');
  expect(changes()).toBe('[null]');
  // Emptying the text of a clearable field removes the value too.
  await author.fill('sam');
  await keyboard.press('Enter');
  await expect.poll(value(author)).toBe('Sam Lee');
  await press(buttonIn(wellOf(author), 'Clear')!);
  await expect.poll(value(author)).toBe('');
  await isFocused(author);
  await expect.poll(() => showsButton(wellOf(author), 'Clear')).toBe(false);

  // Without clearable the value can change but not be removed, like a Select.
  const owner = field('Owner light');
  focus(owner);
  await keyboard.press('Escape');
  expect(value(owner)()).toBe('Riley Chen');
  await owner.fill('');
  await opened();
  await keyboard.press('Tab');
  await expect.poll(() => list().query()).toBeNull();
  expect(value(owner)()).toBe('Riley Chen');
  expect(text('combobox-owner-light')()).toContain('"owner":"riley-chen"');
  expect(showsButton(wellOf(owner), 'Clear')).toBe(false);

  // Chips stay: Esc removes none; Backspace, their remove buttons and the clear button do.
  const reviewers = field('Reviewers light');
  focus(reviewers);
  await keyboard.press('Escape');
  await expect.poll(chips(wellOf(reviewers))).toEqual(['Sam Lee']);
  expect(text('combobox-reviewer-changes-light')()).toBe('0');
  await press(buttonIn(wellOf(reviewers), 'Clear')!);
  await expect.poll(chips(wellOf(reviewers))).toEqual([]);
  await expect.poll(text('combobox-reviewers-light')).toBe('');

  // In a dialog, Esc in an empty field goes on to close the dialog.
  const trigger = page.getByRole('button', { name: 'Share light', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Share light' });
  await expect.element(dialog).toBeVisible();
  focus(dialog.getByRole('combobox', { name: 'Share with light', exact: true }));
  await keyboard.press('Escape');
  await expect.poll(() => dialog.query()).toBeNull();
  await isFocused(trigger);
});

test(
  'native forms submit the values, require a choice and reset to the defaults',
  { tags: ['engines'] },
  async () => {
    const submit = page.getByRole('button', { name: 'Submit people light', exact: true });
    const submitted = json('combobox-submitted-light');
    const document_ = field('Document light');
    await expect.element(document_).toHaveAttribute('aria-required', 'true');
    await submit.click();
    // The empty required field keeps the form from submitting and takes focus.
    await isFocused(document_);
    expect(text('combobox-submitted-light')()).toBe('');
    await keyboard.press('Escape');
    await document_.fill('tok');
    await expect.poll(() => shown(page.getByRole('group', { name: 'Folders' }))).toBe(true);
    expect(page.getByRole('group', { name: 'Recent' }).query()).toBeNull();
    await keyboard.press('Enter');
    await expect.poll(value(document_)).toBe('design-system/tokens');
    await submit.click();
    await expect.poll(submitted).toEqual({
      author: 'alex-morgan',
      watchers: ['sam-lee', 'jordan-park'],
      document: 'design-system/tokens',
    });

    const author = field('Author light');
    await author.fill('casey');
    await keyboard.press('Enter');
    const watchers = wellOf(field('Watchers light'));
    await press(buttonIn(watchers, 'Remove Sam Lee')!);
    await submit.click();
    await expect.poll(submitted).toEqual({
      author: 'casey-nguyen',
      watchers: ['jordan-park'],
      document: 'design-system/tokens',
    });
    await page.getByRole('button', { name: 'Reset people light', exact: true }).click();
    await expect.poll(value(author)).toBe('Alex Morgan');
    await expect.poll(chips(watchers)).toEqual(['Sam Lee', 'Jordan Park']);
    expect(value(document_)()).toBe('');
  },
);

test('a server search shows its loading state, has the first option that arrives highlighted, keeps the chosen label and ends its query with a choice or as the label returns', async () => {
  const contact = field('Contact light');
  const state = json('combobox-search-light');
  const status = () => query('.env-combobox-status')?.textContent;
  await contact.click();
  await expect.poll(() => query('.env-combobox-empty')?.textContent).toBe('Type a name to search');
  await keyboard.type('mo');
  // No option is there yet as the search runs.
  await expect.poll(status).toBe('Searching…');
  // The list is busy, not the popup, so the status around it can announce Searching….
  expect(query('.env-combobox-list')!.getAttribute('aria-busy')).toBe('true');
  expect(query('.env-combobox-status')!.closest('[aria-busy="true"]')).toBeNull();
  expect(shown(page.elementLocator(query('.env-combobox-status .env-spinner')!))).toBe(true);
  // Options that arrive after typing have the first highlighted, so Enter chooses it.
  await expect.poll(optionTexts).toEqual(['Morgan Diazmorgan.diaz@example.com']);
  await expect.poll(highlighted).toEqual(['Morgan Diaz']);
  expect(status()).toBe('');
  await keyboard.press('Enter');
  await expect.poll(value(contact)).toBe('Morgan Diaz');
  // The chosen label is no query: the application hears the query end.
  await expect
    .poll(state)
    .toEqual({ chosen: 'morgan\u0000diaz', chosenLabel: 'Morgan Diaz', queries: ['m', 'mo', ''] });
  // New results without the chosen option keep its label in the field.
  await contact.fill('ri');
  await expect.poll(optionTexts).toEqual(['Riley Chenriley.chen@example.com']);
  await keyboard.press('Escape');
  await expect.poll(() => list().query()).toBeNull();
  expect(value(contact)()).toBe('Morgan Diaz');
  // Leaving the query brings the label back, and ends the query too, so its results go.
  await expect.poll(() => state().queries.at(-1)).toBe('');
  await keyboard.press('ArrowDown');
  await expect.poll(() => query('.env-combobox-empty')?.textContent).toBe('Type a name to search');
  expect(page.getByRole('option').elements()).toHaveLength(0);
  await keyboard.press('Enter');
  expect(value(contact)()).toBe('Morgan Diaz');
  await expect
    .poll(state)
    .toMatchObject({ chosen: 'morgan\u0000diaz', chosenLabel: 'Morgan Diaz' });
  await contact.fill('zz');
  await expect.poll(() => query('.env-combobox-empty')?.textContent).toBe('No contacts found');
});

test(
  'near the bottom of the window the popup flips above the field',
  { tags: ['engines'] },
  async () => {
    await page.viewport(1000, 600);
    const owner = field('Owner light');
    const top = owner.element().getBoundingClientRect().top + scrollY;
    scrollTo(0, top - innerHeight + 80);
    await owner.click();
    await expect
      .poll(() => query('.env-combobox-popup[data-open]')?.getAttribute('data-side'))
      .toBe('top');
    await expect
      .poll(() => {
        const popup = box(query('.env-combobox-popup[data-open]')!);
        return popup.y >= 0 && popup.y + popup.height <= box(wellOf(owner)).y + 1;
      })
      .toBe(true);
  },
);

test('in a dialog the popup keeps its theme, and Esc closes the popup, then the dialog', async () => {
  const trigger = page.getByRole('button', { name: 'Share dark', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Share dark' });
  await expect.element(dialog).toBeVisible();
  const share = dialog.getByRole('combobox', { name: 'Share with dark', exact: true });
  await share.click();
  await expect.poll(() => query('.env-combobox-popup')).not.toBeNull();
  const popup = query('.env-combobox-popup')!;
  expect(popup.closest('[data-env-theme]')!.getAttribute('data-env-theme')).toBe('dark');
  await option('Riley Chen').click();
  await expect.element(dialog).toBeVisible();
  await expect.poll(chips(wellOf(share))).toEqual(['Riley Chen']);
  await isFocused(share);
  await keyboard.press('Escape');
  await expect.poll(() => query('.env-combobox-popup')).toBeNull();
  await expect.element(dialog).toBeVisible();
  // Esc never removes chips; with the popup closed it goes on to close the dialog.
  await keyboard.press('Escape');
  await expect.poll(() => dialog.query()).toBeNull();
  await isFocused(trigger);
});

test('narrow containers wrap chips within the field, and the popup fits a phone', async () => {
  const narrow = page.getByTestId('combobox-narrow-light');
  const well = wellOf(field('Topics light'));
  const outer = well.getBoundingClientRect();
  const items = [...well.querySelectorAll('.env-combobox-chip')].map((chip) =>
    chip.getBoundingClientRect(),
  );
  // A field's corner: the large corner, no more than a third of the single-line field's height.
  const probe = document.createElement('div');
  probe.style.blockSize = 'min(var(--env-radius-lg), var(--env-field-height) / 3)';
  well.append(probe);
  const corner = probe.getBoundingClientRect().height;
  probe.remove();
  const radius = Number.parseFloat(css(well, 'border-top-left-radius'));
  expect(outer.right - outer.left).toBeLessThanOrEqual(box(narrow).width + 1);
  expect(new Set(items.map((item) => Math.round(item.top))).size).toBeGreaterThan(1);
  expect(items.every((item) => item.left >= outer.left && item.right <= outer.right)).toBe(true);
  // A wrapped field keeps a single-line field's corners rather than becoming a pill.
  expect(outer.height).toBeGreaterThan(32);
  expect(radius).toBeCloseTo(corner, 0);
  expect(radius).toBeLessThan(outer.height / 2 - 4);

  await page.viewport(390, 700);
  await field('Author light').click();
  await expect
    .poll(() => {
      const popup = query('.env-combobox-popup');
      if (!popup) return false;
      const placed = box(popup);
      return placed.x >= 0 && placed.x + placed.width <= 391;
    })
    .toBe(true);
  expect(document.documentElement.scrollWidth <= innerWidth).toBe(true);
});

test('in right-to-left text the arrow keys follow the reading direction to the chips', async () => {
  const rtl = field('Right to left light');
  const chipsOf = () => [...wellOf(rtl).querySelectorAll<HTMLElement>('.env-combobox-chip')];
  focus(rtl);
  // The end of the text is on the left; the chips are on the right.
  await keyboard.press('ArrowRight');
  await expect.poll(() => document.activeElement).toBe(chipsOf().at(-1));
  await keyboard.press('ArrowRight');
  await expect.poll(() => document.activeElement).toBe(chipsOf()[0]);
  await keyboard.press('ArrowLeft');
  await expect.poll(() => document.activeElement).toBe(chipsOf().at(-1));
  expect(box(chipsOf()[0]!).x).toBeGreaterThan(box(rtl).x);
});

test('disabled and read-only fields keep their value', async () => {
  const disabled = field('Disabled light');
  await expect.element(disabled).toBeDisabled();
  // A disabled field doesn't fade as a whole: its value, chevron and label take the disabled text
  // color.
  const control = wellOf(disabled);
  expect(css(control, 'opacity')).toBe('1');
  const probe = document.createElement('span');
  probe.style.color = 'var(--env-color-fg-disabled)';
  control.append(probe);
  const colors = [
    ...['.env-combobox-input', '.env-combobox-trigger', '.env-combobox-label'].map((part) =>
      css(control.querySelector(part)!, 'color'),
    ),
    css(probe, 'color'),
  ];
  probe.remove();
  expect(new Set(colors).size).toBe(1);
  const readOnly = field('Read only light');
  await expect.element(readOnly).toHaveAttribute('readonly', '');
  // The input reports the read-only state; its chips are no widgets, so they carry none.
  await expect.element(readOnly).toHaveAttribute('aria-readonly', 'true');
  const well = wellOf(readOnly);
  expect(well.querySelectorAll('.env-combobox-chip')).toHaveLength(1);
  expect(well.querySelectorAll('.env-combobox-chip[aria-readonly]')).toHaveLength(0);
  expect(well.querySelectorAll('button[aria-label^="Remove"]')).toHaveLength(0);
  await readOnly.click();
  await opened();
  await expect.element(list()).toHaveAttribute('aria-readonly', 'true');
  await option('Riley Chen').click();
  await expect.poll(chips(wellOf(readOnly))).toEqual(['Sam Lee']);
  await keyboard.press('Escape');
  await expect.poll(() => list().query()).toBeNull();
  const invalid = field('Invalid light');
  await expect.element(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect.element(invalid).toHaveAccessibleDescription('Choose someone on the team.');
  // The input carries the error; the chevron repeats neither it nor the description.
  for (const name of ['Invalid light', 'Author light']) {
    const chevron = wellOf(field(name)).querySelector('.env-combobox-trigger')!;
    expect(chevron.hasAttribute('aria-describedby')).toBe(false);
    expect(chevron.hasAttribute('aria-invalid')).toBe(false);
  }
});

test("touch screens give fields, chips and options the touch height, and every chip's remove button a hit area as tall as a row and its gap", async () => {
  await commands.emulateTouch(true);
  try {
    await page.viewport(390, 844);
    // Mounted afresh on the touch screen, as a page loads on one.
    mount(fixture);
    expect(matchMedia('(pointer: coarse)').matches).toBe(true);
    const owner = field('Compact owner light');
    expect(box(wellOf(owner)).height).toBeCloseTo(44, 0);
    expect(css(owner, 'font-size')).toBe('16px');
    const labels = wellOf(field('Compact labels light'));
    expect(box(labels.querySelector('.env-combobox-chip')!).height).toBeCloseTo(28, 0);
    // Wrapped rows of chips lie a small step apart, as for a mouse, not a touch height apart.
    expect(css(labels, 'row-gap')).toBe('8px');

    const removes = [...document.querySelectorAll<HTMLElement>('.env-combobox-chip-remove')];
    // Single rows, wrapped rows, and a chip under the label on the field's edge.
    expect(removes.length).toBeGreaterThan(10);
    const areas = [];
    for (const button of removes) {
      if (!button.checkVisibility()) continue;
      button.scrollIntoView({ block: 'center' });
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const at = button.getBoundingClientRect();
      // How far beyond each edge, through the centre, a press still lands on the button.
      const reach = (point: (distance: number) => [number, number]) => {
        let distance = 0;
        while (distance < 40) {
          const hit = document.elementFromPoint(...point(distance + 0.5));
          if (hit === null || !button.contains(hit)) break;
          distance += 1;
        }
        return distance;
      };
      const x = at.x + at.width / 2;
      const y = at.y + at.height / 2;
      areas.push({
        name: button.getAttribute('aria-label'),
        width: Math.round(
          at.width + reach((d) => [at.left - d, y]) + reach((d) => [at.right + d, y]),
        ),
        height: Math.round(
          at.height + reach((d) => [x, at.top - d]) + reach((d) => [x, at.bottom + d]),
        ),
      });
    }
    // A 28 px row and its 8 px gap: hit areas of rows above and below meet without overlapping,
    // so each reaches its full size. Measured in half pixels, so 36 px can measure 35.
    expect(areas.filter(({ width, height }) => width < 35 || height < 35)).toEqual([]);

    owner.element().scrollIntoView({ block: 'center' });
    const tap = async (target: Element) => {
      const at = box(target);
      await commands.touch('touchStart', at.x + at.width / 2, at.y + at.height / 2);
      await commands.touch('touchEnd');
    };
    await tap(owner.element());
    await expect.poll(() => shown(option('Sam Lee'))).toBe(true);
    await openPopup();
    expect(box(option('Sam Lee')).height).toBeGreaterThanOrEqual(44);
    await tap(option('Sam Lee').element());
    await expect.poll(value(owner)).toBe('Sam Lee');
  } finally {
    await commands.emulateTouch(false);
  }
});

test('open in a contained PortalContainer, the list leaves the rest of the page in reach', async () => {
  mount(portalContainer);
  await expect
    .poll(() => shown(page.getByTestId('combobox-layer').getByRole('listbox')))
    .toBe(true);
  // Base UI hides the page around an open list from assistive technology, modal or not; in a
  // contained PortalContainer, the field, the other previews and the page stay in reach.
  await expect
    .poll(
      () =>
        ['outside', 'preview', 'dialog-preview', 'combobox-preview']
          .map((id) => document.querySelector(`[data-testid="${id}"]`)!)
          .concat(document.querySelector('.env-combobox-input')!)
          .filter((element) => element.closest('[aria-hidden="true"]')).length,
    )
    .toBe(0);
  expect(shown(page.getByRole('combobox', { name: 'Owner' }))).toBe(true);
});
