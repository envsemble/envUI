import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';
import { collectErrors } from './helpers/PageErrors';

const composerFixture = `${fixtureUrl}/?fixture=composer`;

/** The composer root around a field. */
function composerOf(field: Locator) {
  return field.locator(
    'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " env-composer ")][1]',
  );
}

test('Enter submits, Shift+Enter starts a line and the action stops a running reply', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.goto(composerFixture);
  const scope = page.getByTestId('composer-light');
  const field = scope.getByRole('textbox', { name: 'Message light' });
  const composer = composerOf(field);
  const send = composer.getByRole('button', { name: 'Send', exact: true });
  const sent = scope.getByTestId('composer-sent-light');
  await expect(field).toHaveAttribute('placeholder', 'Ask anything');
  await expect(field).toHaveAttribute('enterkeyhint', 'send');
  await expect(send).toHaveAttribute('aria-disabled', 'true');
  await expect(send).toBeDisabled();

  // Blank text never submits, and Enter adds no line to it.
  await field.click();
  await page.keyboard.press('Enter');
  await field.fill('   ');
  await page.keyboard.press('Enter');
  await expect(field).toHaveValue('   ');
  await expect(sent).toHaveText('');

  await field.fill('');
  await page.keyboard.type('Quarterly report');
  await page.keyboard.press('Shift+Enter');
  await page.keyboard.type('Second line');
  await expect(field).toHaveValue('Quarterly report\nSecond line');
  await expect(send).toBeEnabled();
  await expect(send).not.toHaveAttribute('aria-disabled');

  await page.keyboard.press('Enter');
  await expect(sent).toHaveText('Quarterly report\nSecond line');
  await expect(field).toHaveValue('');
  await expect(field).toBeFocused();
  await expect(composer).toHaveAttribute('data-running', '');
  const stop = composer.getByRole('button', { name: 'Stop', exact: true });
  await expect(stop).toBeEnabled();
  // The accessible name labels the action; no native tooltip repeats it.
  await expect(stop).not.toHaveAttribute('title');

  // While running, Enter neither submits nor adds a line; the draft waits.
  await page.keyboard.type('Next question');
  await page.keyboard.press('Enter');
  await expect(field).toHaveValue('Next question');
  await expect(sent).toHaveText('Quarterly report\nSecond line');

  // Stopping from the keyboard keeps focus on the action, which becomes Send again.
  await page.keyboard.press('Tab');
  await expect(stop).toBeFocused();
  await page.keyboard.press('Space');
  await expect(scope.getByTestId('composer-stops-light')).toHaveText('1');
  await expect(composer).not.toHaveAttribute('data-running');
  await expect(send).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(sent).toHaveText('Quarterly report\nSecond line | Next question');
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('');
  expect(errors).toEqual([]);
});

for (const signal of ['isComposing', 'keyCode 229'] as const) {
  test(
    `Enter that confirms an input method composition never submits (${signal})`,
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(composerFixture);
      const scope = page.getByTestId('composer-light');
      const field = scope.getByRole('textbox', { name: 'Message light' });
      await field.fill('Aurora');
      const prevented = await field.evaluate((element, legacy) => {
        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          isComposing: !legacy,
          bubbles: true,
          cancelable: true,
        });
        // Some input methods report their composition only through the legacy key code.
        if (legacy) Object.defineProperty(event, 'keyCode', { value: 229 });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      }, signal === 'keyCode 229');
      expect(prevented).toBe(false);
      await expect(scope.getByTestId('composer-sent-light')).toHaveText('');
      await expect(field).toHaveValue('Aurora');
    },
  );
}

test('without onSend, Enter and the send button submit the form and keep the text', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.goto(composerFixture);
  const scope = page.getByTestId('composer-light');
  const field = scope.getByRole('textbox', { name: 'Comment light' });
  const posts = scope.getByTestId('composer-posts-light');
  await expect(field).toHaveAttribute('name', 'message');
  await field.fill('Quarterly report');
  await field.press('Enter');
  // The form sends the field under its name, and the text stays until the form resets.
  await expect(posts).toHaveText('Quarterly report');
  await expect(field).toHaveValue('Quarterly report');
  await composerOf(field).getByRole('button', { name: 'Send', exact: true }).click();
  await expect(posts).toHaveText('Quarterly report | Quarterly report');
  await expect(field).toBeFocused();
  await scope.getByRole('button', { name: 'Reset form light' }).click();
  await expect(field).toHaveValue('');
  // Blank text never submits the form, and Enter adds no line to it.
  await field.press('Enter');
  await expect(field).toHaveValue('');
  await expect(posts).toHaveText('Quarterly report | Quarterly report');
  // A held Enter key sends once.
  await field.fill('Held key');
  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await expect(posts).toHaveText('Quarterly report | Quarterly report | Held key');
  await expect(field).toHaveValue('Held key');
  // Without onSend or a form there is nothing to send: the button is unavailable and Enter
  // starts a new line.
  const reply = scope.getByRole('textbox', { name: 'Reply light' });
  await expect(
    composerOf(reply).getByRole('button', { name: 'Send', exact: true }),
  ).toHaveAttribute('aria-disabled', 'true');
  // Touch keyboards keep their usual Enter key.
  await expect(reply).not.toHaveAttribute('enterkeyhint');
  await reply.press('End');
  await reply.press('Enter');
  await expect(reply).toHaveValue('Thanks, that works.\n');
  expect(errors).toEqual([]);
});

test('a pending form action holds the next send until it ends', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(composerFixture);
  const scope = page.getByTestId('composer-light');
  const field = scope.getByRole('textbox', { name: 'Announcement light' });
  const send = composerOf(field).getByRole('button', { name: 'Send', exact: true });
  const announcements = scope.getByTestId('composer-announcements-light');
  await field.fill('Quarterly report');
  // The action takes a while; Enter again while it runs sends nothing.
  await field.press('Enter');
  await field.press('Enter');
  await expect(send).toHaveAttribute('aria-disabled', 'true');
  await send.click({ force: true });
  // Once it ends, the form resets and clears the composer, and sending works again.
  await expect(field).toHaveValue('');
  await expect(announcements).toHaveText('Quarterly report');
  await field.fill('Roadmap');
  await expect(send).not.toHaveAttribute('aria-disabled');
  await field.press('Enter');
  await expect(field).toHaveValue('');
  await expect(announcements).toHaveText('Quarterly report | Roadmap');
  expect(errors).toEqual([]);
});

test('pending holds sending while the field keeps focus and takes typing', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(composerFixture);
  const scope = page.getByTestId('composer-light');
  // The field joins its form through the form attribute, which the form's status does not reach.
  const field = scope.getByRole('textbox', { name: 'Detached light' });
  const send = composerOf(field).getByRole('button', { name: 'Send', exact: true });
  const posts = scope.getByTestId('composer-detached-light');
  await expect(field).toHaveAttribute('form', 'detached-form-light');
  await field.fill('Quarterly report');
  await field.press('Enter');
  await expect(posts).toHaveText('Quarterly report');
  // While the application's request is pending, sending is unavailable, and the field stays
  // editable with focus.
  await expect(send).toHaveAttribute('aria-disabled', 'true');
  await expect(send).not.toHaveAttribute('disabled');
  await expect(field).toBeFocused();
  await expect(field).toBeEnabled();
  await page.keyboard.type(' draft');
  await page.keyboard.press('Enter');
  await send.click({ force: true });
  await expect(field).toHaveValue('Quarterly report draft');
  await expect(posts).toHaveText('Quarterly report');
  // Once the request ends, sending works again.
  await scope.getByRole('button', { name: 'Finish request light' }).click();
  await expect(send).not.toHaveAttribute('aria-disabled');
  await field.press('Enter');
  await expect(posts).toHaveText('Quarterly report | Quarterly report draft');
  expect(errors).toEqual([]);
});

test('an invalid field in the form keeps focus when the send is refused', async ({ page }) => {
  await page.goto(composerFixture);
  const scope = page.getByTestId('composer-light');
  const topic = scope.getByRole('textbox', { name: 'Topic light' });
  const field = scope.getByRole('textbox', { name: 'Feedback light' });
  const send = composerOf(field).getByRole('button', { name: 'Send', exact: true });
  const feedback = scope.getByTestId('composer-feedback-light');
  await topic.evaluate((element) => {
    element.dataset.invalids = '0';
    element.addEventListener('invalid', () => {
      element.dataset.invalids = String(Number(element.dataset.invalids) + 1);
    });
  });
  await field.fill('Clearer labels');
  await send.click();
  // The required field is empty: the form is not submitted and focus moves to that field, which
  // reports itself invalid once.
  await expect(topic).toBeFocused();
  await expect(topic).toHaveAttribute('data-invalids', '1');
  await expect(feedback).toHaveText('');
  await field.focus();
  await field.press('Enter');
  await expect(topic).toBeFocused();
  await expect(feedback).toHaveText('');
  await topic.fill('Navigation');
  await send.click();
  await expect(feedback).toHaveText('Navigation: Clearer labels');
  await expect(field).toBeFocused();
});

for (const sizing of ['native', 'measured'] as const) {
  test(
    `the field grows with its lines up to the maximum, then scrolls (${sizing})`,
    { tag: '@engines' },
    async ({ page }) => {
      if (sizing === 'measured') await withoutContentSizing(page);
      await expectGrowth(page);
      const field = page.getByRole('textbox', { name: 'Message light' });
      expect(await field.evaluate((element) => element.style.blockSize !== '')).toBe(
        sizing === 'measured',
      );
    },
  );
}

/** Browsers without native content sizing for fields measure the text instead. */
async function withoutContentSizing(page: Page) {
  await page.addInitScript(() => {
    const supports = CSS.supports.bind(CSS);
    CSS.supports = ((property: string, value?: string) =>
      property === 'field-sizing'
        ? false
        : value === undefined
          ? supports(property)
          : supports(property, value)) as typeof CSS.supports;
    const style = document.createElement('style');
    style.textContent = '.env-composer-input { field-sizing: fixed !important; }';
    (document.head ?? document.documentElement).append(style);
  });
}

async function expectGrowth(page: Page) {
  await page.goto(composerFixture);
  const field = page.getByRole('textbox', { name: 'Message light' });
  const action = composerOf(field).getByRole('button', { name: 'Send' });
  const height = async () => (await field.boundingBox())!.height;
  const single = await height();
  // One line lines up with the round action beside it.
  expect(single).toBeCloseTo((await action.boundingBox())!.height, 0);
  const lineHeight = await field.evaluate((element) =>
    parseFloat(getComputedStyle(element).lineHeight),
  );
  await field.fill('One\nTwo\nThree');
  await expect.poll(height).toBeCloseTo(single + 2 * lineHeight, 0);
  await field.fill(Array.from({ length: 14 }, (_, index) => `Line ${index + 1}`).join('\n'));
  // Eight rows by default; further lines scroll inside the field.
  await expect.poll(height).toBeCloseTo(single + 7 * lineHeight, 0);
  expect(await field.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await field.fill('');
  await expect.poll(height).toBeCloseTo(single, 0);

  // A composer with two to four rows starts at two and stops at four.
  const note = page.getByRole('textbox', { name: 'Note light' });
  const noteHeight = async () => (await note.boundingBox())!.height;
  await note.fill('');
  const two = await noteHeight();
  expect(two).toBeCloseTo(single + lineHeight, 0);
  await note.fill('1\n2\n3\n4\n5\n6');
  await expect.poll(noteHeight).toBeCloseTo(single + 3 * lineHeight, 0);
  // A narrower field wraps the text onto more lines and grows with them.
  await note.fill('Quarterly report '.repeat(6).trim());
  const wide = await noteHeight();
  await page.setViewportSize({ width: 360, height: 900 });
  await expect.poll(noteHeight).toBeGreaterThan(wide);
}

test('an uncontrolled composer sends from its button, clears and describes the field', async ({
  page,
}) => {
  await page.goto(composerFixture);
  const scope = page.getByTestId('composer-light');
  const field = scope.getByRole('textbox', { name: 'Note light' });
  const composer = composerOf(field);
  await expect(field).toHaveValue('Draft note');
  await expect(field).toHaveAccessibleDescription('Attachments up to 10 MB');
  await expect(composer.getByRole('button', { name: 'Attach files' })).toBeVisible();
  // The action row sits below the field, the start content before the action.
  const fieldBox = (await field.boundingBox())!;
  const attachBox = (await composer.getByRole('button', { name: 'Attach files' }).boundingBox())!;
  const sendBox = (await composer.getByRole('button', { name: 'Send' }).boundingBox())!;
  expect(attachBox.y).toBeGreaterThanOrEqual(fieldBox.y + fieldBox.height - 1);
  expect(Math.abs(attachBox.y - sendBox.y)).toBeLessThan(1);
  expect(attachBox.x).toBeLessThan(sendBox.x);

  // Start content lines up with the field's text: the icon of a leading icon button, or text.
  const textStart = await field.evaluate(
    (element) =>
      element.getBoundingClientRect().left + parseFloat(getComputedStyle(element).paddingLeft),
  );
  const icon = (await composer
    .getByRole('button', { name: 'Attach files' })
    .locator('svg')
    .boundingBox())!;
  expect(icon.x).toBeCloseTo(textStart, 0);
  const reply = scope.getByRole('textbox', { name: 'Reply light' });
  const replyStart = await reply.evaluate(
    (element) =>
      element.getBoundingClientRect().left + parseFloat(getComputedStyle(element).paddingLeft),
  );
  const replyTo = await scope.getByTestId('composer-reply-to-light').evaluate((element) => {
    const range = element.ownerDocument.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().left;
  });
  expect(replyTo).toBeCloseTo(replyStart, 0);

  await composer.getByRole('button', { name: 'Send' }).click();
  await expect(scope.getByTestId('composer-notes-light')).toHaveText('Draft note');
  await expect(field).toHaveValue('');
  await expect(field).toBeFocused();
  await expect(composer.getByRole('button', { name: 'Send' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );

  // A press on the surface around the field places the caret in it.
  await page.getByRole('textbox', { name: 'Message light' }).focus();
  const surface = composer.locator('.env-composer-surface');
  const surfaceBox = (await surface.boundingBox())!;
  await page.mouse.click(surfaceBox.x + surfaceBox.width / 2, surfaceBox.y + 3);
  await expect(field).toBeFocused();

  const disabled = scope.getByRole('textbox', { name: 'Disabled light' });
  await expect(disabled).toBeDisabled();
  await expect(composerOf(disabled).getByRole('button', { name: 'Send' })).toBeDisabled();
});

test('composers fit a narrow viewport and wrap long words', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(composerFixture);
  const field = page.getByRole('textbox', { name: 'Message light' });
  await field.fill('A'.repeat(120));
  const composer = composerOf(field);
  const surface = (await composer.locator('.env-composer-surface').boundingBox())!;
  const action = (await composer.getByRole('button', { name: 'Send' }).boundingBox())!;
  expect(action.x + action.width).toBeLessThanOrEqual(surface.x + surface.width);
  expect(await field.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true });

  test('the action grows to the touch height, and the field takes the larger text', async ({
    page,
  }) => {
    await page.goto(composerFixture);
    const field = page.getByRole('textbox', { name: 'Message light' });
    const action = composerOf(field).getByRole('button', { name: 'Send' });
    // Like every button, the action is 2.75 rem tall and wide, and its box is its hit area.
    await expect(action).toHaveCSS('width', '44px');
    await expect(action).toHaveCSS('height', '44px');
    await expect(field).toHaveCSS('font-size', '16px');
    expect((await field.boundingBox())!.height).toBeCloseTo(40, 0);
  });
});
