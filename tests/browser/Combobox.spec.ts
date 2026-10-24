import { test, expect, type Browser, type Locator, type Page } from '@playwright/test';
import { chevronTips, expectVerticalFlip, slowChevron } from './Chevron';
import { fixtureUrl } from './Servers';

const comboboxFixture = `${fixtureUrl}/?fixture=combobox`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
  });
  return errors;
}

const field = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const highlighted = (page: Page) =>
  page
    .locator('[role="option"][data-highlighted]')
    .evaluateAll((options) =>
      options.map((option) => option.querySelector('.env-list-row-label')?.textContent),
    );
const chips = (scope: Locator) => scope.locator('.env-combobox-chip-label').allTextContents();
const wellOf = (input: Locator) =>
  input.locator('xpath=ancestor::*[contains(@class, "env-combobox-control")][1]');

test.beforeEach(async ({ page }) => {
  await page.goto(comboboxFixture);
});

test('typing filters by label and description, ignoring case and accents, and Enter chooses the first match', async ({
  page,
}) => {
  const errors = collectErrors(page);
  const author = field(page, 'Author light');
  await expect(author).toHaveValue('Alex Morgan');
  await expect(author).toHaveAttribute('aria-expanded', 'false');
  await expect(author).toHaveAccessibleDescription('The person who answers questions.');
  // The chosen option's avatar sits before its label in the field.
  await expect(wellOf(author).locator('.env-combobox-value-leading .env-avatar')).toBeVisible();

  await author.fill('SAM');
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(author).toHaveAttribute('aria-expanded', 'true');
  await expect(list.getByRole('option')).toHaveText(['Sam Leesam.lee@example.com']);
  // The description is announced as the option's description, not as part of its name.
  const sam = list.getByRole('option', { name: 'Sam Lee', exact: true });
  await expect(sam).toHaveAccessibleDescription('sam.lee@example.com');
  await expect.poll(() => highlighted(page)).toEqual(['Sam Lee']);
  await expect(author).toHaveAttribute('aria-activedescendant', (await sam.getAttribute('id'))!);
  // While the typed text differs from the chosen label, the chosen avatar steps aside.
  await expect(wellOf(author).locator('.env-combobox-value-leading')).toHaveCount(0);
  await page.keyboard.press('Enter');
  await expect(list).toHaveCount(0);
  await expect(author).toHaveValue('Sam Lee');
  await expect(author).toBeFocused();

  await author.fill('emile');
  await expect(page.getByRole('option')).toHaveText(['Émile Durandemile.durand@example.com']);
  await author.fill('quinn.harper@');
  await expect(page.getByRole('option')).toHaveText(['Quinn Harperquinn.harper@example.com']);
  await author.fill('nobody here');
  await expect(page.locator('.env-combobox-empty')).toHaveText('No matches');
  await expect(page.locator('.env-combobox-empty')).toHaveAttribute('role', 'status');
  // Esc closes the popup, and leaving the field restores the chosen label.
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(author).toHaveValue('Sam Lee');
  expect(errors).toEqual([]);
});

test('arrows move the highlight from the chosen option, which shows a check mark', async ({
  page,
}) => {
  const owner = field(page, 'Owner light');
  await owner.focus();
  await page.keyboard.press('ArrowDown');
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect.poll(() => highlighted(page)).toEqual(['Riley Chen']);
  const riley = list.getByRole('option', { name: 'Riley Chen', exact: true });
  await expect(riley).toHaveAttribute('aria-selected', 'true');
  await expect(riley.locator('.env-combobox-item-indicator svg')).toBeVisible();
  await expect(list.locator('.env-combobox-item-indicator svg')).toHaveCount(1);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => highlighted(page)).toEqual(['Taylor Brooks']);
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => highlighted(page)).toEqual(['Jordan Park']);
  await page.keyboard.press('Enter');
  await expect(list).toHaveCount(0);
  await expect(owner).toHaveValue('Jordan Park');
  await expect(page.getByTestId('combobox-owner-light')).toHaveText(
    JSON.stringify({ owner: 'jordan-park', opened: 1 }),
  );

  // A disabled option cannot be chosen by pointer or keyboard.
  await owner.click();
  const jamie = page.getByRole('option', { name: 'Jamie Fox', exact: true });
  await expect(jamie).toHaveAttribute('aria-disabled', 'true');
  await jamie.click({ force: true });
  await expect(owner).toHaveValue('Jordan Park');
  // Pressing an option chooses it and closes the popup.
  await page.getByRole('option', { name: 'Drew Patel', exact: true }).click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(owner).toHaveValue('Drew Patel');
  // The chevron opens and closes the popup.
  const chevron = wellOf(owner).locator('.env-combobox-trigger');
  await expect(chevron).toHaveAttribute('tabindex', '-1');
  await expect(chevron).toHaveAccessibleName('Owner light');
  await chevron.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await chevron.click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
});

test(
  'focusing a single field selects its label, so typing replaces it with a query',
  { tag: '@engines' },
  async ({ page }) => {
    const owner = field(page, 'Owner light');
    await owner.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.type('jor');
    await expect(owner).toHaveValue('jor');
    await expect.poll(() => highlighted(page)).toEqual(['Jordan Park']);
    // Closing without a choice brings the chosen label back.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(owner).toHaveValue('Riley Chen');
    await page.getByRole('button', { name: 'Reset people light', exact: true }).focus();
    await owner.focus();
    await page.keyboard.type('tay');
    await expect(owner).toHaveValue('tay');
    await expect.poll(() => highlighted(page)).toEqual(['Taylor Brooks']);
    await page.keyboard.press('Enter');
    await expect(owner).toHaveValue('Taylor Brooks');
    // Once focused, a press places the caret as usual.
    await owner.click();
    await page.keyboard.press('Escape');
    await owner.click({ position: { x: 4, y: 8 } });
    await page.keyboard.type('X');
    await expect(owner).not.toHaveValue('X');
  },
);

test('the chevron flips as the popup opens and closes, never pointing sideways', async ({
  page,
}) => {
  const owner = field(page, 'Owner light');
  const chevron = wellOf(owner).locator('.env-combobox-trigger');
  const icon = chevron.locator('.env-icon');
  await slowChevron(icon);
  await chevron.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  expectVerticalFlip(await chevronTips(icon), 1);
  await chevron.click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  expectVerticalFlip(await chevronTips(icon), -1);
});

test('several options show as chips that Backspace, the arrow keys and their buttons remove', async ({
  page,
}) => {
  const reviewers = field(page, 'Reviewers light');
  const well = wellOf(reviewers);
  const output = page.getByTestId('combobox-reviewers-light');
  await expect.poll(() => chips(well)).toEqual(['Sam Lee']);
  await expect(well).toHaveAttribute('role', 'toolbar');
  await expect(well).toHaveAccessibleName('Reviewers light');
  // The chosen options are read with the field.
  await expect(reviewers).toHaveAccessibleDescription('Sam Lee');
  await reviewers.click();
  const list = page.getByRole('listbox');
  await expect(list).toHaveAttribute('aria-multiselectable', 'true');
  await list.getByRole('option', { name: 'Jordan Park', exact: true }).click();
  // Without a typed filter the popup stays open for more choices.
  await expect(list).toBeVisible();
  await expect.poll(() => chips(well)).toEqual(['Sam Lee', 'Jordan Park']);
  await expect(list.locator('.env-combobox-item-indicator svg')).toHaveCount(2);
  // Choosing a chosen option again removes it.
  await list.getByRole('option', { name: 'Sam Lee', exact: true }).click();
  await expect.poll(() => chips(well)).toEqual(['Jordan Park']);
  await reviewers.fill('ri');
  await expect.poll(() => highlighted(page)).toEqual(['Riley Chen']);
  await page.keyboard.press('Enter');
  await expect.poll(() => chips(well)).toEqual(['Jordan Park', 'Riley Chen']);
  await expect(reviewers).toHaveValue('');
  await expect(output).toHaveText('jordan-park,riley-chen');
  await expect(reviewers).toHaveAccessibleDescription('Jordan Park, Riley Chen');

  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await page.keyboard.press('Backspace');
  await expect.poll(() => chips(well)).toEqual(['Jordan Park']);
  await page.keyboard.press('ArrowLeft');
  const chip = well.locator('.env-combobox-chip').first();
  await expect(chip).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(reviewers).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(chip).toBeFocused();
  await page.keyboard.press('Delete');
  await expect.poll(() => chips(well)).toEqual([]);
  await expect(reviewers).toBeFocused();
  await expect(output).toHaveText('');
  // Without chips the toolbar is a group again, with the placeholder back.
  await expect(well).toHaveAttribute('role', 'group');

  const watchers = field(page, 'Watchers light');
  const watchersWell = wellOf(watchers);
  const remove = watchersWell.getByRole('button', { name: 'Remove Jordan Park', exact: true });
  await expect(remove).toBeVisible();
  await remove.click();
  await expect.poll(() => chips(watchersWell)).toEqual(['Sam Lee']);
  await expect(watchers).toBeFocused();
});

test('Esc and the clear button clear a clearable field; other fields keep their value', async ({
  page,
}) => {
  const author = field(page, 'Author light');
  await author.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(author).toHaveValue('Alex Morgan');
  await page.keyboard.press('Escape');
  await expect(author).toHaveValue('');
  // Emptying the text of a clearable field removes the value too.
  await author.fill('sam');
  await page.keyboard.press('Enter');
  await expect(author).toHaveValue('Sam Lee');
  const clear = wellOf(author).getByRole('button', { name: 'Clear', exact: true });
  await clear.click();
  await expect(author).toHaveValue('');
  await expect(author).toBeFocused();
  await expect(clear).toHaveCount(0);

  // Without clearable the value can change but not be removed, like a Select.
  const owner = field(page, 'Owner light');
  await owner.focus();
  await page.keyboard.press('Escape');
  await expect(owner).toHaveValue('Riley Chen');
  await owner.fill('');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(owner).toHaveValue('Riley Chen');
  await expect(page.getByTestId('combobox-owner-light')).toContainText('"owner":"riley-chen"');
  await expect(wellOf(owner).getByRole('button', { name: 'Clear' })).toHaveCount(0);

  const reviewers = field(page, 'Reviewers light');
  await wellOf(reviewers).getByRole('button', { name: 'Clear', exact: true }).click();
  await expect.poll(() => chips(wellOf(reviewers))).toEqual([]);
  await expect(page.getByTestId('combobox-reviewers-light')).toHaveText('');
});

test(
  'native forms submit the values, require a choice and reset to the defaults',
  { tag: '@engines' },
  async ({ page }) => {
    const submit = page.getByRole('button', { name: 'Submit people light', exact: true });
    const submitted = page.getByTestId('combobox-submitted-light');
    const document = field(page, 'Document light');
    await expect(document).toHaveAttribute('aria-required', 'true');
    await submit.click();
    // The empty required field keeps the form from submitting and takes focus.
    await expect(document).toBeFocused();
    await expect(submitted).toHaveText('');
    await page.keyboard.press('Escape');
    await document.fill('tok');
    await expect(page.getByRole('group', { name: 'Folders' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Recent' })).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(document).toHaveValue('design-system/tokens');
    await submit.click();
    await expect
      .poll(async () => JSON.parse((await submitted.textContent()) || '{}'))
      .toEqual({
        author: 'alex-morgan',
        watchers: ['sam-lee', 'jordan-park'],
        document: 'design-system/tokens',
      });

    const author = field(page, 'Author light');
    await author.fill('casey');
    await page.keyboard.press('Enter');
    const watchers = wellOf(field(page, 'Watchers light'));
    await watchers.getByRole('button', { name: 'Remove Sam Lee', exact: true }).click();
    await submit.click();
    await expect
      .poll(async () => JSON.parse((await submitted.textContent()) || '{}'))
      .toEqual({
        author: 'casey-nguyen',
        watchers: ['jordan-park'],
        document: 'design-system/tokens',
      });
    await page.getByRole('button', { name: 'Reset people light', exact: true }).click();
    await expect(author).toHaveValue('Alex Morgan');
    await expect.poll(() => chips(watchers)).toEqual(['Sam Lee', 'Jordan Park']);
    await expect(document).toHaveValue('');
  },
);

test('a server search shows its loading state, highlights the first result and keeps the chosen label', async ({
  page,
}) => {
  const contact = field(page, 'Contact light');
  const output = page.getByTestId('combobox-search-light');
  await contact.click();
  await expect(page.locator('.env-combobox-empty')).toHaveText('Type a name to search');
  await contact.pressSequentially('mo');
  await expect(page.locator('.env-combobox-status')).toHaveText('Searching…');
  // The list is busy, not the popup, so the status around it can announce Searching….
  await expect(page.locator('.env-combobox-list')).toHaveAttribute('aria-busy', 'true');
  expect(
    await page
      .locator('.env-combobox-status')
      .evaluate((status) => status.closest('[aria-busy="true"]') === null),
  ).toBe(true);
  await expect(page.locator('.env-combobox-status .env-spinner')).toBeVisible();
  // The results arrive after typing; the first is highlighted, so Enter chooses it.
  await expect(page.getByRole('option')).toHaveText(['Morgan Diazmorgan.diaz@example.com']);
  await expect.poll(() => highlighted(page)).toEqual(['Morgan Diaz']);
  await expect(page.locator('.env-combobox-status')).toHaveText('');
  await page.keyboard.press('Enter');
  await expect(contact).toHaveValue('Morgan Diaz');
  await expect
    .poll(async () => JSON.parse((await output.textContent())!))
    .toEqual({ chosen: 'morgan-diaz', chosenLabel: 'Morgan Diaz', queries: ['m', 'mo', ''] });
  // New results without the chosen option keep its label in the field.
  await contact.fill('ri');
  await expect(page.getByRole('option')).toHaveText(['Riley Chenriley.chen@example.com']);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(contact).toHaveValue('Morgan Diaz');
  await contact.fill('zz');
  await expect(page.locator('.env-combobox-empty')).toHaveText('No contacts found');
});

test(
  'near the bottom of the window the popup flips above the field',
  { tag: '@engines' },
  async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 600 });
    const owner = field(page, 'Owner light');
    await owner.evaluate((element) => {
      const top = element.getBoundingClientRect().top + scrollY;
      scrollTo(0, top - innerHeight + 80);
    });
    await owner.click();
    const popup = page.locator('.env-combobox-popup[data-open]');
    await expect(popup).toHaveAttribute('data-side', 'top');
    await expect(async () => {
      const [popupBox, wellBox] = await Promise.all([
        popup.boundingBox(),
        wellOf(owner).boundingBox(),
      ]);
      expect(popupBox!.y).toBeGreaterThanOrEqual(0);
      expect(popupBox!.y + popupBox!.height).toBeLessThanOrEqual(wellBox!.y + 1);
    }).toPass();
  },
);

test('small fields line up with small buttons and open the one popup', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    const toolbar = page.getByTestId(`combobox-compact-${theme}`);
    const owner = field(page, `Compact owner ${theme}`);
    const labels = field(page, `Compact labels ${theme}`);
    const neighbour = toolbar.getByRole('button', { name: `Compact neighbour ${theme}` });
    const [ownerBox, labelsBox, buttonBox] = await Promise.all([
      wellOf(owner).boundingBox(),
      wellOf(labels).boundingBox(),
      neighbour.boundingBox(),
    ]);
    expect(ownerBox!.height).toBeCloseTo(32, 0);
    expect(labelsBox!.height).toBeCloseTo(32, 0);
    expect(buttonBox!.height).toBeCloseTo(32, 0);
    // The hidden label still names the field; the placeholder and value show instead.
    await expect(owner).toHaveValue('Taylor Brooks');
    await owner.click();
    // A closing popup can still fade out while the next one opens.
    const popup = page.locator('.env-combobox-popup[data-open]');
    const geometry = await popup.evaluate(async (element) => {
      // The popup grows in; its rows have their final size once the transition has run.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await Promise.allSettled(element.getAnimations().map(({ finished }) => finished));
      const option = element.querySelector('.env-combobox-item')!;
      return {
        radius: Number.parseFloat(getComputedStyle(element).borderTopLeftRadius),
        padding: Number.parseFloat(getComputedStyle(element).paddingTop),
        option: option.getBoundingClientRect().height,
      };
    });
    expect(geometry.radius).toBeCloseTo(12, 0);
    expect(geometry.padding).toBeCloseTo(4, 0);
    // Options with a description take two lines; the row is at least the row height, 2.25 rem.
    expect(geometry.option).toBeGreaterThanOrEqual(36);
    await page.keyboard.press('Escape');
    await labels.click();
    const option = page.getByRole('option', { name: 'Accessibility', exact: true });
    await expect(option).toHaveAttribute('aria-selected', 'true');
    const height = await popup.evaluate(async (element) => {
      // The popup grows in; its rows have their final size once the transition has run.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await Promise.allSettled(element.getAnimations().map(({ finished }) => finished));
      return element.querySelector('[aria-selected="true"]')!.getBoundingClientRect().height;
    });
    expect(height).toBeCloseTo(36, 0);
    await page.keyboard.press('Escape');
  }
});

test('in a dialog the popup keeps its theme, and Esc closes the popup, then the dialog', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Share dark', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Share dark' });
  await expect(dialog).toBeVisible();
  const share = dialog.getByRole('combobox', { name: 'Share with dark', exact: true });
  await share.click();
  const popup = page.locator('.env-combobox-popup');
  await expect(popup).toBeVisible();
  await expect(popup.locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
    'data-env-theme',
    'dark',
  );
  await page.getByRole('option', { name: 'Riley Chen', exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect.poll(() => chips(wellOf(share))).toEqual(['Riley Chen']);
  await expect(share).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
  await expect(dialog).toBeVisible();
  // Esc never removes chips; with the popup closed it goes on to close the dialog.
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('narrow containers wrap chips within the field, and the popup fits a phone', async ({
  page,
}) => {
  const narrow = page.getByTestId('combobox-narrow-light');
  const topics = field(page, 'Topics light');
  const well = wellOf(topics);
  const layout = await well.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const items = [...element.querySelectorAll('.env-combobox-chip')].map((chip) =>
      chip.getBoundingClientRect(),
    );
    const style = getComputedStyle(element);
    // The capped full corner: half the tallest single-line control.
    const probe = document.createElement('div');
    probe.style.blockSize = 'var(--env-radius-full)';
    element.append(probe);
    const full = probe.getBoundingClientRect().height;
    probe.remove();
    return {
      box: { left: box.left, right: box.right, height: box.height },
      rows: new Set(items.map((item) => Math.round(item.top))).size,
      inside: items.every((item) => item.left >= box.left && item.right <= box.right),
      radius: Number.parseFloat(style.borderTopLeftRadius),
      full,
    };
  });
  const container = (await narrow.boundingBox())!;
  expect(layout.box.right - layout.box.left).toBeLessThanOrEqual(container.width + 1);
  expect(layout.rows).toBeGreaterThan(1);
  expect(layout.inside).toBe(true);
  // A wrapped field keeps the capped full corner rather than becoming a pill.
  expect(layout.box.height).toBeGreaterThan(32);
  expect(layout.radius).toBeCloseTo(layout.full, 0);
  expect(layout.radius).toBeLessThan(layout.box.height / 2 - 4);

  await page.setViewportSize({ width: 390, height: 700 });
  const author = field(page, 'Author light');
  await author.click();
  const popup = page.locator('.env-combobox-popup');
  await expect(async () => {
    const box = (await popup.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(391);
  }).toPass();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('in right-to-left text the arrow keys follow the reading direction to the chips', async ({
  page,
}) => {
  const field_ = field(page, 'Right to left light');
  const well = wellOf(field_);
  await field_.focus();
  // The end of the text is on the left; the chips are on the right.
  await page.keyboard.press('ArrowRight');
  await expect(well.locator('.env-combobox-chip').last()).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(well.locator('.env-combobox-chip').first()).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(well.locator('.env-combobox-chip').last()).toBeFocused();
  const [chipBox, inputBox] = await Promise.all([
    well.locator('.env-combobox-chip').first().boundingBox(),
    field_.boundingBox(),
  ]);
  expect(chipBox!.x).toBeGreaterThan(inputBox!.x);
});

test('disabled and read-only fields keep their value', async ({ page }) => {
  const disabled = field(page, 'Disabled light');
  await expect(disabled).toBeDisabled();
  await expect(wellOf(disabled)).toHaveCSS('opacity', '0.48');
  const readOnly = field(page, 'Read only light');
  await expect(readOnly).toHaveAttribute('readonly', '');
  // The input reports the read-only state; its chips are no widgets, so they carry none.
  await expect(readOnly).toHaveAttribute('aria-readonly', 'true');
  await expect(wellOf(readOnly).locator('.env-combobox-chip')).toHaveCount(1);
  await expect(wellOf(readOnly).locator('.env-combobox-chip[aria-readonly]')).toHaveCount(0);
  await expect(wellOf(readOnly).getByRole('button', { name: /^Remove/ })).toHaveCount(0);
  await readOnly.click();
  const list = page.getByRole('listbox');
  await expect(list).toHaveAttribute('aria-readonly', 'true');
  await list.getByRole('option', { name: 'Riley Chen', exact: true }).click();
  await expect.poll(() => chips(wellOf(readOnly))).toEqual(['Sam Lee']);
  await page.keyboard.press('Escape');
  await expect(list).toHaveCount(0);
  const invalid = field(page, 'Invalid light');
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAccessibleDescription('Choose someone on the team.');
  // The input carries the error; the chevron repeats neither it nor the description.
  for (const name of ['Invalid light', 'Author light']) {
    const chevron = wellOf(field(page, name)).locator('.env-combobox-trigger');
    await expect(chevron).not.toHaveAttribute('aria-describedby');
    await expect(chevron).not.toHaveAttribute('aria-invalid');
  }
});

async function openOnTouchScreen(browser: Browser) {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(comboboxFixture);
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  return page;
}

test('touch screens give fields, chips and options the touch height', async ({
  browser,
  browserName,
}) => {
  const page = await openOnTouchScreen(browser);
  const owner = field(page, 'Compact owner light');
  expect((await wellOf(owner).boundingBox())!.height).toBeCloseTo(44, 0);
  await expect(owner).toHaveCSS('font-size', '16px');
  const chip = wellOf(field(page, 'Compact labels light')).locator('.env-combobox-chip').first();
  expect((await chip.boundingBox())!.height).toBeCloseTo(28, 0);
  await owner.tap();
  const option = page.getByRole('option', { name: 'Sam Lee', exact: true });
  await expect(option).toBeVisible();
  const height = await option.evaluate(async (element) => {
    const popup = element.closest('.env-combobox-popup')!;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.allSettled(popup.getAnimations().map(({ finished }) => finished));
    return element.getBoundingClientRect().height;
  });
  expect(height).toBeGreaterThanOrEqual(44);
  // WebKit's emulated tap doesn't choose the option it aims at; a real one does.
  if (browserName !== 'webkit') {
    await option.tap();
    await expect(owner).toHaveValue('Sam Lee');
  }
  await page.context().close();
});

test("touch screens give every chip's remove button a hit area of the touch size", async ({
  browser,
}) => {
  const page = await openOnTouchScreen(browser);
  const removes = page.locator('.env-combobox-chip-remove');
  // Single rows, wrapped rows, and a chip under the label on the field's edge.
  expect(await removes.count()).toBeGreaterThan(10);
  const areas = await removes.evaluateAll(async (buttons) => {
    const results = [];
    for (const button of buttons) {
      if (!button.checkVisibility()) continue;
      button.scrollIntoView({ block: 'center' });
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const box = button.getBoundingClientRect();
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
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      results.push({
        name: button.getAttribute('aria-label'),
        width: Math.round(
          box.width + reach((d) => [box.left - d, y]) + reach((d) => [box.right + d, y]),
        ),
        height: Math.round(
          box.height + reach((d) => [x, box.top - d]) + reach((d) => [x, box.bottom + d]),
        ),
      });
    }
    return results;
  });
  // Measured in half pixels, so a hit area of 44 px can measure 43.
  expect(areas.filter(({ width, height }) => width < 43 || height < 43)).toEqual([]);
  await page.context().close();
});

test('a server search ends its query with a choice or when the label returns, so Enter keeps it', async ({
  page,
}) => {
  const contact = field(page, 'Contact light');
  const output = page.getByTestId('combobox-search-light');
  const state = async () => JSON.parse((await output.textContent())!);
  await contact.click();
  await contact.pressSequentially('mo');
  await expect(page.getByRole('option')).toHaveText(['Morgan Diazmorgan.diaz@example.com']);
  await page.keyboard.press('Enter');
  await expect(contact).toHaveValue('Morgan Diaz');
  // The chosen label is no query: the application hears the query end.
  await expect.poll(async () => (await state()).queries.at(-1)).toBe('');
  await contact.fill('ri');
  await expect(page.getByRole('option')).toHaveText(['Riley Chenriley.chen@example.com']);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(contact).toHaveValue('Morgan Diaz');
  // Leaving the query brings the label back, and ends the query too, so its results go.
  await expect.poll(async () => (await state()).queries.at(-1)).toBe('');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.env-combobox-empty')).toHaveText('Type a name to search');
  await expect(page.getByRole('option')).toHaveCount(0);
  await page.keyboard.press('Enter');
  await expect(contact).toHaveValue('Morgan Diaz');
  await expect.poll(state).toMatchObject({ chosen: 'morgan-diaz', chosenLabel: 'Morgan Diaz' });
});

test('Esc clears a closed single field only while it has a value, and never removes chips', async ({
  page,
}) => {
  const author = field(page, 'Author light');
  const changes = page.getByTestId('combobox-author-changes-light');
  // The well keeps room for the clear button only while the button shows.
  await expect(wellOf(author)).toHaveAttribute('data-actions', '2');
  await author.focus();
  await page.keyboard.press('Escape');
  await expect(author).toHaveValue('');
  await expect(changes).toHaveText('[null]');
  await expect(wellOf(author)).toHaveAttribute('data-actions', '1');
  // With nothing to clear, Esc reports no change.
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(changes).toHaveText('[null]');

  // Chips stay: Backspace, their remove buttons and the clear button remove them.
  const reviewers = field(page, 'Reviewers light');
  await reviewers.focus();
  await page.keyboard.press('Escape');
  await expect.poll(() => chips(wellOf(reviewers))).toEqual(['Sam Lee']);
  await expect(page.getByTestId('combobox-reviewer-changes-light')).toHaveText('0');

  // In a dialog, Esc in an empty field goes on to close the dialog.
  const trigger = page.getByRole('button', { name: 'Share light', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Share light' });
  const share = dialog.getByRole('combobox', { name: 'Share with light', exact: true });
  await share.focus();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('values without an option keep their place among the options reported', async ({ page }) => {
  const mentioned = field(page, 'Mentioned light');
  const well = wellOf(mentioned);
  // A value the field never saw among the options shows as itself.
  await expect.poll(() => chips(well)).toEqual(['Sam Lee', 'former-member', 'Riley Chen']);
  await well.getByRole('button', { name: 'Remove Sam Lee', exact: true }).click();
  await expect(page.getByTestId('combobox-mentioned-light')).toHaveText(
    JSON.stringify([
      ['former-member', 'former-member'],
      ['riley-chen', 'Riley Chen'],
    ]),
  );
  await expect.poll(() => chips(well)).toEqual(['former-member', 'Riley Chen']);
});

test('typing reads no styles for the text direction, which is read as the popup opens', async ({
  page,
}) => {
  const author = field(page, 'Author light');
  await author.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  // Reading the direction brings the page's styles up to date; at every keystroke that would
  // restyle the page as people type.
  await page.evaluate(() => {
    const original = window.getComputedStyle;
    const reads = { count: 0 };
    (window as unknown as { directionReads: typeof reads }).directionReads = reads;
    window.getComputedStyle = function (element: Element, pseudo?: string | null) {
      if (element instanceof HTMLInputElement && element.classList.contains('env-combobox-input'))
        reads.count++;
      return original.call(window, element, pseudo);
    } as typeof window.getComputedStyle;
  });
  await page.keyboard.type('jordan', { delay: 20 });
  await expect.poll(() => highlighted(page)).toEqual(['Jordan Park']);
  expect(
    await page.evaluate(
      () => (window as unknown as { directionReads: { count: number } }).directionReads.count,
    ),
  ).toBe(0);
});

test('open in a contained PortalContainer, the list leaves the rest of the page in reach', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=portal-containers`);
  await expect(page.getByTestId('combobox-layer').getByRole('listbox')).toBeVisible();
  // Base UI hides the page around an open list from assistive technology, modal or not; in a
  // contained PortalContainer, the field, the other previews and the page stay in reach.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          ['outside', 'preview', 'dialog-preview', 'combobox-preview']
            .map((id) => document.querySelector(`[data-testid="${id}"]`)!)
            .concat(document.querySelector('.env-combobox-input')!)
            .filter((element) => element.closest('[aria-hidden="true"]')).length,
      ),
    )
    .toBe(0);
  await expect(page.getByRole('combobox', { name: 'Owner' })).toBeVisible();
});
