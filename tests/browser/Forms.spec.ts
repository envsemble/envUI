import { expect, test } from '@playwright/test';
import { chevronTips, expectVerticalFlip, slowChevron } from './helpers/Chevron';
import { fixtureUrl } from './helpers/Servers';

test.beforeEach(async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
});

test('fields associate labels, hints, and validation messages', async ({ page }) => {
  const project = page.getByRole('textbox', { name: 'Project name', exact: true });
  await expect(project).toHaveAccessibleDescription('A descriptive name');
  await expect(
    page.getByRole('textbox', { name: 'Notes', exact: true }),
  ).toHaveAccessibleDescription('Optional supporting details');
  const invalid = page.getByRole('textbox', { name: 'Invalid sample', exact: true });
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAccessibleDescription('Please correct this value');
  // The frame is Field's: Field.Root around the control, Field.Description and Field.Error.
  const field = page.locator('.env-field', { has: invalid });
  await expect(field).toHaveAttribute('data-invalid', '');
  await expect(field.locator('> .env-field-error')).toHaveText('Please correct this value');
  await expect(
    page.locator('.env-field', { has: project }).locator('> .env-field-description'),
  ).toHaveText('A descriptive name');
  await expect(page.locator('.env-field', { has: project })).not.toHaveAttribute('data-invalid');
});

test(
  'native controls submit values and restore uncontrolled defaults on form reset',
  { tag: '@engines' },
  async ({ page }) => {
    const controlled = page.getByTestId('controlled-checkbox');
    const uncontrolled = page.getByTestId('uncontrolled-checkbox');
    await expect(controlled).toHaveAttribute('aria-checked', 'mixed');
    await expect(controlled).toHaveJSProperty('indeterminate', true);
    await expect(uncontrolled).toHaveJSProperty('indeterminate', true);
    await controlled.click();
    await expect(controlled).toBeChecked();
    await expect(page.getByTestId('control-state')).toHaveText('true');
    await uncontrolled.click();
    await expect(uncontrolled).toBeChecked();
    await expect(uncontrolled).toHaveJSProperty('indeterminate', false);

    const notifications = page.getByRole('switch', { name: 'Notifications', exact: true });
    await expect(notifications).toBeChecked();
    await notifications.click();
    await expect(notifications).not.toBeChecked();
    await page.getByRole('radio', { name: /Shared/ }).check();
    await page.getByRole('textbox', { name: 'Project name', exact: true }).fill('Changed project');
    await page.getByRole('textbox', { name: 'Notes', exact: true }).fill('Changed notes');
    const search = page.getByRole('searchbox', { name: 'Search projects', exact: true });
    await search.fill('changed query');
    await page.getByRole('button', { name: 'Submit form', exact: true }).click();
    await expect
      .poll(async () => JSON.parse((await page.getByTestId('form-values').textContent())!))
      .toEqual({
        project: 'Changed project',
        notes: 'Changed notes',
        query: 'changed query',
        controlled: 'enabled',
        uncontrolled: 'enabled',
        visibility: 'shared',
        plan: 'starter',
        emptyChoice: '',
      });

    await page.getByRole('button', { name: 'Reset form', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toHaveValue(
      'Initial project',
    );
    await expect(page.getByRole('textbox', { name: 'Notes', exact: true })).toHaveValue(
      'Initial notes',
    );
    // SearchField renders its query itself, and follows the reset to its default query.
    await expect(search).toHaveValue('initial query');
    await expect(page.getByRole('button', { name: 'Clear search', exact: true })).toHaveCount(1);
    await search.fill('');
    await expect(page.getByRole('button', { name: 'Clear search', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Reset form', exact: true }).click();
    await expect(search).toHaveValue('initial query');
    await expect(uncontrolled).toHaveJSProperty('indeterminate', true);
    await expect(uncontrolled).not.toBeChecked();
    await expect(controlled).toBeChecked();
    await expect(notifications).toBeChecked();
    await expect(page.getByRole('radio', { name: /Private/ })).toBeChecked();
    await expect(page.getByRole('radio', { name: /Shared/ })).not.toBeChecked();
  },
);

test('a controlled mixed checkbox retains its DOM state when the owner retains mixed', async ({
  page,
}) => {
  const fixed = page.getByTestId('frozen-checkbox');
  await expect(fixed).toHaveJSProperty('indeterminate', true);
  await fixed.click();
  await expect(page.getByTestId('frozen-request')).toHaveText('true');
  await expect(fixed).toHaveAttribute('aria-checked', 'mixed');
  await expect(fixed).toHaveJSProperty('indeterminate', true);
  await expect(fixed).not.toBeChecked();
});

test(
  'canceling a native form reset preserves field and selection state',
  { tag: '@engines' },
  async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Prevent form reset', exact: true }).check();
    await page
      .getByRole('textbox', { name: 'Project name', exact: true })
      .fill('Preserved project');
    const search = page.getByRole('searchbox', { name: 'Search projects', exact: true });
    await search.fill('preserved query');
    await page.getByTestId('uncontrolled-checkbox').click();
    await page.getByRole('switch', { name: 'Notifications', exact: true }).uncheck();
    await page.getByRole('radio', { name: /Shared/ }).check();
    const plan = page.getByRole('combobox', { name: 'Plan', exact: true });
    await plan.click();
    await page.getByRole('option', { name: 'Team', exact: true }).click();
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reset form', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toHaveValue(
      'Preserved project',
    );
    await expect(page.getByTestId('uncontrolled-checkbox')).toBeChecked();
    await expect(page.getByTestId('uncontrolled-checkbox')).toHaveJSProperty(
      'indeterminate',
      false,
    );
    await expect(
      page.getByRole('switch', { name: 'Notifications', exact: true }),
    ).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Shared/ })).toBeChecked();
    await expect(plan).toHaveText('Team');
    await expect(search).toHaveValue('preserved query');
  },
);

test('Select supports keyboard commit, typeahead, Escape, and native form reset', async ({
  page,
}) => {
  const trigger = page.getByRole('combobox', { name: 'Plan', exact: true });
  await expect(trigger).toHaveText('Starter');
  await trigger.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'Starter', exact: true })).toBeFocused();
  await expect(page.getByRole('option', { name: 'Enterprise', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveText('Team');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'Team', exact: true })).toBeFocused();
  await page.keyboard.press('Home');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toHaveText('Team');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'Team', exact: true })).toBeFocused();
  await page.keyboard.press('s');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toHaveText('Starter');
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'Starter', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toHaveText('Team');
  await page.getByRole('button', { name: 'Submit form', exact: true }).click();
  await expect
    .poll(async () => JSON.parse((await page.getByTestId('form-values').textContent())!).plan)
    .toBe('team');
  await page.getByRole('button', { name: 'Reset form', exact: true }).click();
  await expect(trigger).toHaveText('Starter');
  await page.setViewportSize({ width: 320, height: 480 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await trigger.click();
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  const wrappedOptions = await list.getByRole('option').evaluateAll((options) => {
    // The label follows the check-mark slot.
    for (const option of options)
      option.lastElementChild!.textContent = 'Long workspace configuration label '.repeat(3);
    return options.map((option) => ({ height: option.clientHeight, content: option.scrollHeight }));
  });
  for (const option of wrappedOptions)
    expect(option.content).toBeLessThanOrEqual(option.height + 1);
  // Changing option content invalidates Floating UI's previous measurements.
  await expect(async () => {
    const popup = await page.locator('.env-select-popup').boundingBox();
    expect(popup!.x).toBeGreaterThanOrEqual(0);
    expect(popup!.x + popup!.width).toBeLessThanOrEqual(321);
    expect(popup!.y + popup!.height).toBeLessThanOrEqual(481);
  }).toPass({ timeout: 8_000 });
  const scroll = await list.evaluate((element) => ({
    height: element.clientHeight,
    content: element.scrollHeight,
  }));
  expect(scroll.content).toBeGreaterThan(scroll.height);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('a Select whose queued focus is lost moves focus to the highlighted option once open', async ({
  page,
}) => {
  // On a busy page, Base UI's queued move of focus to the option is now and then lost. Stand in
  // for that by ignoring the first focus call an option gets.
  await page.evaluate(() => {
    const focus = HTMLElement.prototype.focus;
    let lost = false;
    HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
      if (this.getAttribute('role') === 'option' && !lost) {
        lost = true;
        return;
      }
      focus.call(this, options);
    };
  });
  const trigger = page.getByRole('combobox', { name: 'Plan', exact: true });
  await trigger.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'Starter', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveText('Team');
});

test('a Select opened with the pointer leaves focus where Base UI puts it', async ({ page }) => {
  // The safety net above is for keyboard opens only. Record who focuses an option, and let none
  // take focus, so focus stays on the trigger as the list opens: only Base UI may move it.
  await page.evaluate(() => {
    const callers: string[] = [];
    (window as unknown as { optionFocusCallers: string[] }).optionFocusCallers = callers;
    const focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
      if (this.getAttribute('role') === 'option') callers.push(new Error().stack ?? '');
      else focus.call(this, options);
    };
  });
  const trigger = page.getByRole('combobox', { name: 'Plan', exact: true });
  await trigger.click();
  const popup = page.locator('.env-select-popup');
  await expect(page.getByRole('listbox')).toBeVisible();
  // The safety net runs once the list has opened, when its animations finish.
  await expect
    .poll(() => popup.evaluate((element) => element.getAnimations({ subtree: true }).length))
    .toBe(0);
  await expect(trigger).toBeFocused();
  const callers = await page.evaluate(
    () => (window as unknown as { optionFocusCallers: string[] }).optionFocusCallers,
  );
  expect(callers.filter((stack) => stack.includes('Select.tsx'))).toEqual([]);
  await page.keyboard.press('Escape');
});

test("a Select's chevron flips as the list opens and closes, never pointing sideways", async ({
  page,
}) => {
  // A half turn swings the chevron through pointing right in a frame or two, a twitch beside the
  // opening list. It flips over instead.
  const trigger = page.getByRole('combobox', { name: 'Plan', exact: true });
  const icon = trigger.locator('xpath=..').locator('.env-select-icon');
  await slowChevron(icon);
  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  expectVerticalFlip(await chevronTips(icon), 1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  expectVerticalFlip(await chevronTips(icon), -1);
  // With reduced motion it points the other way at once, at the style sheet's own duration.
  await icon.evaluate((element: HTMLElement) =>
    element.style.removeProperty('transition-duration'),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  expect(await icon.evaluate((element) => element.getAnimations().length)).toBe(0);
  expect(
    await icon.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).b),
  ).toBeCloseTo(-1, 2);
  await page.keyboard.press('Escape');
});

test('a Select is an outlined field, and the open list stands apart from a pane', async ({
  page,
}) => {
  const outlined = page.getByRole('combobox', { name: 'Pane sort', exact: true });
  // An outlined field, as a TextField is: the well has an edge and no fill, and the label rests
  // inside it.
  const [field, labelBox, paneBox] = await Promise.all([
    outlined
      .locator('xpath=ancestor::*[contains(@class, "env-select-control")][1]')
      .evaluate((control) => {
        const edge = getComputedStyle(control.querySelector('.env-text-field-border')!);
        return {
          box: control.getBoundingClientRect().toJSON() as DOMRect,
          edge: Number.parseFloat(edge.borderTopWidth),
          fill: getComputedStyle(control).backgroundColor,
        };
      }),
    page.locator('label.env-select-label', { hasText: 'Pane sort' }).boundingBox(),
    page.getByTestId('select-pane').boundingBox(),
  ]);
  expect(field.edge).toBeGreaterThan(0);
  expect(field.fill).toBe('rgba(0, 0, 0, 0)');
  expect(labelBox!.y).toBeGreaterThanOrEqual(field.box.y - labelBox!.height);
  // With a visible label it fills its container, as every field does; without one it is as wide
  // as its longest option.
  const filter = page.getByRole('combobox', { name: 'Pane filter', exact: true });
  expect(field.box.width).toBeGreaterThan(paneBox!.width / 2);
  expect((await filter.boundingBox())!.width).toBeLessThan(paneBox!.width / 2);
  const role = page.getByRole('combobox', { name: 'Pane role', exact: true });

  await role.click();
  await expect(page.getByRole('option', { name: 'Boreal', exact: true })).toBeVisible();
  // Frosted, its fill is close to a pane's in light: its shadow sets it apart.
  await expect(page.locator('.env-select-popup')).not.toHaveCSS('box-shadow', 'none');
  // The popup takes the surface corners, and its options the same corners inset by its padding.
  const corners = await page.locator('.env-select-popup').evaluate((popup) => {
    const option = popup.querySelector('.env-select-item')!;
    const radius = (element: Element) =>
      Number.parseFloat(getComputedStyle(element).borderTopLeftRadius);
    return {
      popup: radius(popup),
      option: radius(option),
      padding: Number.parseFloat(getComputedStyle(popup).paddingTop),
    };
  });
  // The menus' frosted popup: 1.25 rem corners, concentric with its rows'.
  expect(corners.popup).toBeCloseTo(20, 0);
  expect(Math.abs(corners.option - (corners.popup - corners.padding))).toBeLessThan(1);
  await page.getByRole('option', { name: 'Boreal', exact: true }).click();
  await expect(role).toHaveText('Boreal');
});

test(
  'a required Select participates in native constraint validation',
  { tag: '@engines' },
  async ({ page }) => {
    const nativeInput = page.getByTestId('required-form').locator('input[name="requiredChoice"]');
    await expect
      .poll(() => nativeInput.evaluate((input: HTMLInputElement) => input.validity.valueMissing))
      .toBe(true);
    await page.getByRole('button', { name: 'Submit required choice', exact: true }).click();
    await expect(page.getByTestId('required-submissions')).toHaveText('0');
    const required = page.getByRole('combobox', { name: 'Required choice', exact: true });
    await expect(required).toHaveAttribute('aria-required', 'true');
    await expect(required).toBeFocused();
    // Dismiss the native validation bubble before interacting with the custom popup: one engine
    // consumes the first outside click while that bubble is open.
    await page.keyboard.press('Escape');
    await required.press('ArrowDown');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.getByRole('option', { name: 'Aurora', exact: true }).click();
    await expect(nativeInput).toHaveValue('aurora');
    await expect
      .poll(() => nativeInput.evaluate((input: HTMLInputElement) => input.validity.valid))
      .toBe(true);
    await page.getByRole('button', { name: 'Submit required choice', exact: true }).click();
    await expect(page.getByTestId('required-submissions')).toHaveText('1');
  },
);

test('a small Select has a small trigger, and its popup has the menus anatomy with a check mark', async ({
  page,
}) => {
  const compact = page.getByRole('combobox', { name: 'Compact plan', exact: true });
  const standard = page.getByRole('combobox', { name: 'Plan', exact: true });
  // The field's well, with its edge, is as tall as the control height, and at least 2.25 rem while
  // its label shows: a small one, of 2 rem, takes 2.25 rem.
  const well = (locator: typeof compact) =>
    locator.locator('xpath=ancestor::*[contains(@class, "env-select-control")][1]').boundingBox();
  const [compactBox, standardBox] = await Promise.all([well(compact), well(standard)]);
  expect(compactBox!.height).toBeCloseTo(36, 0);
  expect(compactBox!.height).toBeLessThan(standardBox!.height);
  const chevron = (locator: typeof compact) =>
    locator
      .locator('xpath=..')
      .locator('.env-select-icon')
      .evaluate((icon) => icon.getBoundingClientRect().width);
  expect(await chevron(compact)).toBeLessThan(await chevron(standard));
  // Without a visible label, a small select keeps the small height.
  const unlabelled = page.getByRole('combobox', { name: 'Compact unlabelled plan', exact: true });
  expect((await well(unlabelled))!.height).toBeCloseTo(32, 0);

  await compact.focus();
  await page.keyboard.press('Space');
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  const popup = page.locator('.env-select-popup');
  await expect(popup).not.toHaveAttribute('data-starting-style');
  const surface = await popup.evaluate(async (element) => {
    // The popup grows in; its rows have their final size once the transition has run.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.allSettled(element.getAnimations().map(({ finished }) => finished));
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--env-color-bg-popup)';
    element.append(probe);
    const popupColor = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const style = getComputedStyle(element);
    return {
      popupColor,
      background: style.backgroundColor,
      border: Number.parseFloat(style.borderTopWidth),
      radius: Number.parseFloat(style.borderTopLeftRadius),
      padding: Number.parseFloat(style.paddingTop),
    };
  });
  // The popup's color, frosted at 88 % in light; its edge is there, clear, for a solid popup.
  expect(surface.popupColor).toBe('rgb(245, 245, 247)');
  expect(surface.background).toBe('color(srgb 0.960784 0.960784 0.968627 / 0.88)');
  expect(surface.border).toBeGreaterThanOrEqual(1);
  expect(surface.radius).toBeCloseTo(20, 0);
  expect(surface.padding).toBeCloseTo(6, 0);
  // It opens 8 px clear of the outlined field, as every popup does, whatever the field's size, and
  // lines up with the field's edges, to the pixel the positioner rounds to.
  const [triggerBox, popupBox] = [(await well(compact))!, (await popup.boundingBox())!];
  expect(Math.abs(popupBox.x - triggerBox.x)).toBeLessThan(1);
  expect(Math.abs(popupBox.x + popupBox.width - (triggerBox.x + triggerBox.width))).toBeLessThan(1);
  const gap =
    popupBox.y > triggerBox.y
      ? popupBox.y - (triggerBox.y + triggerBox.height)
      : triggerBox.y - (popupBox.y + popupBox.height);
  expect(gap).toBeCloseTo(8, 0);
  const starter = page.getByRole('option', { name: 'Starter', exact: true });
  const team = page.getByRole('option', { name: 'Team', exact: true });
  await expect(starter).toBeFocused();
  for (const option of [starter, team])
    expect((await option.boundingBox())!.height).toBeCloseTo(40, 0);
  // A check mark shows the selected option, and labels stay aligned.
  await expect(starter.locator('.env-select-item-indicator svg')).toBeVisible();
  await expect(team.locator('.env-select-item-indicator svg')).toHaveCount(0);
  const textStart = (option: typeof starter) =>
    option.evaluate((element) => element.lastElementChild!.getBoundingClientRect().x);
  expect(await textStart(team)).toBeCloseTo(await textStart(starter), 0);
  // The check ends the row, after the label.
  const ends = await starter.evaluate((element) => {
    const check = element.querySelector('.env-select-item-indicator')!.getBoundingClientRect();
    const label = element.lastElementChild!.getBoundingClientRect();
    return check.left >= label.right - 1;
  });
  expect(ends).toBe(true);
  await page.keyboard.press('ArrowDown');
  await expect(team).toBeFocused();
  // The highlight moves to the option the keyboard is on, a fill with no ring of its own, and
  // fades from the chosen one, which keeps only its check mark.
  await expect
    .poll(() => starter.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toBe('rgba(0, 0, 0, 0)');
  expect(await team.evaluate((element) => getComputedStyle(element).outlineColor)).toBe(
    'rgba(0, 0, 0, 0)',
  );
  await expect
    .poll(() => team.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe('rgba(0, 0, 0, 0)');
  await page.keyboard.press('Enter');
  await expect(list).toHaveCount(0);
  await expect(compact).toHaveText('Team');
  await expect(compact).toBeFocused();
  await page.getByRole('button', { name: 'Submit compact form', exact: true }).click();
  await expect
    .poll(async () => JSON.parse((await page.getByTestId('compact-values').textContent())!))
    .toEqual({ compactPlan: 'team' });
  await compact.click();
  await expect(team.locator('.env-select-item-indicator svg')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(compact).toBeFocused();
});
