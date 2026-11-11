import { beforeEach, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Composer.fixture.tsx';
import { addStyle, box, collectErrors, css, keyboard, mouse } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const scope = () => page.getByTestId('composer-light');
const field = (name: string) => scope().getByRole('textbox', { name: `${name} light` });
const input = (name: string) => field(name).element() as HTMLTextAreaElement;
/** The composer root around a field. */
const composerOf = (name: string) => input(name).closest<HTMLElement>('.env-composer')!;
/**
 * A button of a composer by its name, found as each check runs: the action is Send or Stop. Found
 * as an element, since a locator of an element finds it again by its text, which changes.
 */
const buttonOf = (name: string, label: string) =>
  composerOf(name).querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
const sendOf = (name: string) => buttonOf(name, 'Send');
const text = (testId: string) => () => scope().getByTestId(`${testId}-light`).element().textContent;
const value = (name: string) => () => input(name).value;
const isFocused = (locator: Locator | HTMLElement) => expect.element(locator).toHaveFocus();
/** Focuses a field and presses a key in it. */
async function press(name: string, key: string) {
  input(name).focus();
  await keyboard.press(key);
}
async function click(element: Element) {
  const { x, y, width, height } = box(element);
  await mouse.click(x + width / 2, y + height / 2);
}

test('Enter submits, Shift+Enter starts a line and the action stops a running reply', async () => {
  const errors = collectErrors();
  const message = field('Message');
  const composer = () => composerOf('Message');
  const send = () => sendOf('Message');
  const sent = text('composer-sent');
  await expect.element(message).toHaveAttribute('placeholder', 'Ask anything');
  await expect.element(message).toHaveAttribute('enterkeyhint', 'send');
  await expect.element(send()).toHaveAttribute('aria-disabled', 'true');
  await expect.element(send()).toBeDisabled();

  // Blank text never submits, and Enter adds no line to it.
  await message.click();
  await keyboard.press('Enter');
  await message.fill('   ');
  await keyboard.press('Enter');
  expect(value('Message')()).toBe('   ');
  expect(sent()).toBe('');

  await message.fill('');
  await keyboard.type('Quarterly report');
  await keyboard.press('Shift+Enter');
  await keyboard.type('Second line');
  await expect.poll(value('Message')).toBe('Quarterly report\nSecond line');
  await expect.element(send()).toBeEnabled();
  await expect.element(send()).not.toHaveAttribute('aria-disabled');

  await keyboard.press('Enter');
  await expect.poll(sent).toBe('Quarterly report\nSecond line');
  await expect.poll(value('Message')).toBe('');
  await isFocused(message);
  await expect.element(composer()).toHaveAttribute('data-running', '');
  const stop = () => buttonOf('Message', 'Stop');
  await expect.element(stop()).toBeEnabled();
  // The accessible name labels the action; no native tooltip repeats it.
  await expect.element(stop()).not.toHaveAttribute('title');

  // While running, Enter neither submits nor adds a line; the draft waits.
  await keyboard.type('Next question');
  await keyboard.press('Enter');
  await expect.poll(value('Message')).toBe('Next question');
  expect(sent()).toBe('Quarterly report\nSecond line');

  // Stopping from the keyboard keeps focus on the action(), which becomes Send again.
  await keyboard.press('Tab');
  await isFocused(stop());
  await keyboard.press('Space');
  await expect.poll(text('composer-stops')).toBe('1');
  await expect.element(composer()).not.toHaveAttribute('data-running');
  await isFocused(send());
  await keyboard.press('Enter');
  await expect.poll(sent).toBe('Quarterly report\nSecond line | Next question');
  await isFocused(message);
  await expect.poll(value('Message')).toBe('');
  expect(errors).toEqual([]);
});

test(
  'Enter that confirms an input method composition never submits',
  { tags: ['engines'] },
  async () => {
    await field('Message').fill('Aurora');
    // Some input methods report their composition only through the legacy key code.
    for (const legacy of [false, true]) {
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        isComposing: !legacy,
        bubbles: true,
        cancelable: true,
      });
      if (legacy) Object.defineProperty(event, 'keyCode', { value: 229 });
      input('Message').dispatchEvent(event);
      expect(event.defaultPrevented, legacy ? 'keyCode 229' : 'isComposing').toBe(false);
    }
    await new Promise(requestAnimationFrame);
    expect(text('composer-sent')()).toBe('');
    expect(value('Message')()).toBe('Aurora');
  },
);

test('without onSend, Enter and the send button submit the form and keep the text', async () => {
  const errors = collectErrors();
  const comment = field('Comment');
  const posts = text('composer-posts');
  await expect.element(comment).toHaveAttribute('name', 'message');
  await comment.fill('Quarterly report');
  await press('Comment', 'Enter');
  // The form sends the field under its name, and the text stays until the form resets.
  await expect.poll(posts).toBe('Quarterly report');
  expect(value('Comment')()).toBe('Quarterly report');
  await click(sendOf('Comment'));
  await expect.poll(posts).toBe('Quarterly report | Quarterly report');
  await isFocused(comment);
  await scope().getByRole('button', { name: 'Reset form light' }).click();
  await expect.poll(value('Comment')).toBe('');
  // Blank text never submits the form, and Enter adds no line to it.
  await press('Comment', 'Enter');
  await new Promise(requestAnimationFrame);
  expect(value('Comment')()).toBe('');
  expect(posts()).toBe('Quarterly report | Quarterly report');
  // A held Enter key sends once.
  await comment.fill('Held key');
  input('Comment').focus();
  await keyboard.down('Enter');
  await keyboard.down('Enter');
  await keyboard.down('Enter');
  await keyboard.up('Enter');
  await expect.poll(posts).toBe('Quarterly report | Quarterly report | Held key');
  expect(value('Comment')()).toBe('Held key');
  // Without onSend or a form there is nothing to send: the button is unavailable and Enter
  // starts a new line.
  await expect.element(sendOf('Reply')).toHaveAttribute('aria-disabled', 'true');
  // Touch keyboards keep their usual Enter key.
  await expect.element(field('Reply')).not.toHaveAttribute('enterkeyhint');
  await press('Reply', 'End');
  await keyboard.press('Enter');
  await expect.poll(value('Reply')).toBe('Thanks, that works.\n');
  expect(errors).toEqual([]);
});

test('a pending form action, or pending, holds the next send until it ends, while the field keeps focus and takes typing', async () => {
  const errors = collectErrors();
  const announcement = field('Announcement');
  const send = () => sendOf('Announcement');
  const announcements = text('composer-announcements');
  await announcement.fill('Quarterly report');
  // The action takes a while; Enter again while it runs sends nothing.
  await press('Announcement', 'Enter');
  await keyboard.press('Enter');
  await expect.element(send()).toHaveAttribute('aria-disabled', 'true');
  await click(send());
  // Once it ends, the form resets and clears the composer(), and sending works again.
  await expect.poll(value('Announcement')).toBe('');
  expect(announcements()).toBe('Quarterly report');
  await announcement.fill('Roadmap');
  await expect.element(send()).not.toHaveAttribute('aria-disabled');
  await press('Announcement', 'Enter');
  await expect.poll(value('Announcement')).toBe('');
  await expect.poll(announcements).toBe('Quarterly report | Roadmap');

  // The field joins its form through the form attribute, which the form's status does not reach.
  const detached = field('Detached');
  const detachedSend = () => sendOf('Detached');
  const posts = text('composer-detached');
  await expect.element(detached).toHaveAttribute('form', 'detached-form-light');
  await detached.fill('Quarterly report');
  await press('Detached', 'Enter');
  await expect.poll(posts).toBe('Quarterly report');
  // While the application's request is pending, sending is unavailable, and the field stays
  // editable with focus.
  await expect.element(detachedSend()).toHaveAttribute('aria-disabled', 'true');
  await expect.element(detachedSend()).not.toHaveAttribute('disabled');
  await isFocused(detached);
  await expect.element(detached).toBeEnabled();
  await keyboard.type(' draft');
  await keyboard.press('Enter');
  await click(detachedSend());
  await expect.poll(value('Detached')).toBe('Quarterly report draft');
  expect(posts()).toBe('Quarterly report');
  // Once the request ends, sending works again.
  await scope().getByRole('button', { name: 'Finish request light' }).click();
  await expect.element(detachedSend()).not.toHaveAttribute('aria-disabled');
  await press('Detached', 'Enter');
  await expect.poll(posts).toBe('Quarterly report | Quarterly report draft');
  expect(errors).toEqual([]);
});

test('an invalid field in the form keeps focus when the send is refused', async () => {
  const topic = field('Topic');
  const feedbackField = field('Feedback');
  const send = () => sendOf('Feedback');
  const feedback = text('composer-feedback');
  let invalids = 0;
  topic.element().addEventListener('invalid', () => invalids++);
  await feedbackField.fill('Clearer labels');
  await click(send());
  // The required field is empty: the form is not submitted and focus moves to that field, which
  // reports itself invalid once.
  await isFocused(topic);
  expect(invalids).toBe(1);
  expect(feedback()).toBe('');
  await press('Feedback', 'Enter');
  await isFocused(topic);
  expect(feedback()).toBe('');
  await topic.fill('Navigation');
  await click(send());
  await expect.poll(feedback).toBe('Navigation: Clearer labels');
  await isFocused(feedbackField);
});

/** Browsers without native content sizing for fields measure the text instead. */
function withoutContentSizing() {
  const original = CSS.supports;
  const supports = original.bind(CSS) as (property: string, value?: string) => boolean;
  CSS.supports = ((property: string, value?: string) =>
    property === 'field-sizing'
      ? false
      : value === undefined
        ? supports(property)
        : supports(property, value)) as typeof CSS.supports;
  addStyle('.env-composer-input { field-sizing: fixed !important; }');
  return () => {
    CSS.supports = original;
  };
}

async function expectGrowth() {
  const message = field('Message');
  const height = () => box(message).height;
  const single = height();
  // One line lines up with the round action beside it.
  expect(single).toBeCloseTo(box(sendOf('Message')).height, 0);
  const lineHeight = parseFloat(css(message, 'line-height'));
  await message.fill('One\nTwo\nThree');
  await expect.poll(height).toBeCloseTo(single + 2 * lineHeight, 0);
  await message.fill(Array.from({ length: 14 }, (_, index) => `Line ${index + 1}`).join('\n'));
  // Eight rows by default; further lines scroll inside the field.
  await expect.poll(height).toBeCloseTo(single + 7 * lineHeight, 0);
  expect(input('Message').scrollHeight > input('Message').clientHeight).toBe(true);
  await message.fill('');
  await expect.poll(height).toBeCloseTo(single, 0);

  // A composer with two to four rows starts at two and stops at four.
  const note = field('Note');
  const noteHeight = () => box(note).height;
  await note.fill('');
  const two = noteHeight();
  expect(two).toBeCloseTo(single + lineHeight, 0);
  await note.fill('1\n2\n3\n4\n5\n6');
  await expect.poll(noteHeight).toBeCloseTo(single + 3 * lineHeight, 0);
  // A narrower field wraps the text onto more lines and grows with them.
  await note.fill('Quarterly report '.repeat(6).trim());
  const wide = noteHeight();
  await page.viewport(360, 900);
  await expect.poll(noteHeight).toBeGreaterThan(wide);
}

test(
  'the field grows with its lines up to the maximum, then scrolls, sized natively or measured',
  { tags: ['engines'] },
  async () => {
    await expectGrowth();
    expect(input('Message').style.blockSize).toBe('');
    const restore = withoutContentSizing();
    try {
      await page.viewport(1440, 1000);
      mount(fixture);
      await expectGrowth();
      expect(input('Message').style.blockSize).not.toBe('');
    } finally {
      restore();
    }
  },
);

test('an uncontrolled composer sends from its button, clears and describes the field', async () => {
  const note = field('Note');
  const attach = () => buttonOf('Note', 'Attach files');
  const send = () => sendOf('Note');
  expect(value('Note')()).toBe('Draft note');
  await expect.element(note).toHaveAccessibleDescription('Attachments up to 10 MB');
  // The action row sits below the field, the start content before the action().
  const fieldBox = box(note);
  const attachBox = box(attach());
  const sendBox = box(send());
  expect(attachBox.y).toBeGreaterThanOrEqual(fieldBox.y + fieldBox.height - 1);
  expect(Math.abs(attachBox.y - sendBox.y)).toBeLessThan(1);
  expect(attachBox.x).toBeLessThan(sendBox.x);

  // Start content lines up with the field's text: the icon of a leading icon button, or text.
  const textStart = (name: string) =>
    input(name).getBoundingClientRect().left + parseFloat(css(input(name), 'padding-left'));
  expect(box(attach().querySelector('svg')!).x).toBeCloseTo(textStart('Note'), 0);
  const range = document.createRange();
  range.selectNodeContents(scope().getByTestId('composer-reply-to-light').element());
  expect(range.getBoundingClientRect().left).toBeCloseTo(textStart('Reply'), 0);

  await click(send());
  await expect.poll(text('composer-notes')).toBe('Draft note');
  await expect.poll(value('Note')).toBe('');
  await isFocused(note);
  expect(send().getAttribute('aria-disabled')).toBe('true');

  // A press on the surface around the field places the caret in it.
  input('Message').focus();
  const surface = box(composerOf('Note').querySelector('.env-composer-surface')!);
  await mouse.click(surface.x + surface.width / 2, surface.y + 3);
  await isFocused(note);

  const disabled = field('Disabled');
  await expect.element(disabled).toBeDisabled();
  await expect.element(sendOf('Disabled')).toBeDisabled();
});

test('on a coarse pointer, the action grows to the touch height, and the field takes the larger text', async () => {
  await commands.emulateTouch(true);
  try {
    const message = field('Message');
    const action = () => sendOf('Message');
    // Like every button, the action is 2.75 rem tall and wide, and its box is its hit area.
    await expect.poll(() => css(action(), 'width')).toBe('44px');
    expect(css(action(), 'height')).toBe('44px');
    expect(css(message, 'font-size')).toBe('16px');
    expect(box(message).height).toBeCloseTo(40, 0);
  } finally {
    await commands.emulateTouch(false);
  }
});
