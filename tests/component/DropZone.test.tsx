import { afterEach, beforeEach, expect, test } from 'vitest';
import { page, userEvent, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/DropZone.fixture.tsx';
import { collectErrors, keyboard, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

let errors: string[] = [];
/** The file inputs whose picker a press opened, in order: the test stands in for the picker. */
let opened: HTMLInputElement[] = [];

/** Takes a file input's click, which would open the system's picker, and records it instead. */
function standInForPicker(event: MouseEvent) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'file') return;
  event.preventDefault();
  opened.push(input);
}

beforeEach(() => {
  errors = collectErrors();
  opened = [];
  document.addEventListener('click', standInForPicker, true);
  mount(fixture);
});

afterEach(() => {
  document.removeEventListener('click', standInForPicker, true);
  expect(errors).toEqual([]);
});

const scope = () => page.getByTestId('drop-zones-light');
const text = (testId: string) => () => page.getByTestId(testId).element().textContent;
const file = (name: string, type: string) => new File(['content'], name, { type });

/** The picker the last press opened, given these files, as a person chooses them. */
async function choose(files: File[]) {
  await expect.poll(() => opened.length).toBeGreaterThan(0);
  const input = opened.shift()!;
  await userEvent.upload(page.elementLocator(input), files);
  return input;
}

/** Files as the browser hands them to a drop, with a name and a type each. */
function filesTransfer(files: Array<[name: string, type: string]>) {
  const transfer = new DataTransfer();
  for (const [name, type] of files) transfer.items.add(file(name, type));
  return transfer;
}

function drag(target: Locator | Element, type: string, dataTransfer: DataTransfer) {
  const element = target instanceof Element ? target : target.element();
  element.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
}

function drop(target: Locator | Element, dataTransfer: DataTransfer) {
  for (const type of ['dragenter', 'dragover', 'drop']) drag(target, type, dataTransfer);
}

test('the zone opens the file picker from a press and the keyboard', async () => {
  const zone = scope().getByRole('button', { name: /^Drop a logo here, or browse/ });
  // The zone is the first tab stop.
  await keyboard.press('Tab');
  await expect.element(zone).toHaveFocus();
  await zone.click();
  const input = await choose([file('logo.png', 'image/png')]);
  expect(input.multiple).toBe(false);
  await expect.poll(text('taken-light')).toBe('logo.png');

  // The keyboard opens the picker as well; closing it without files changes nothing.
  for (const key of ['Enter', 'Space']) {
    (zone.element() as HTMLElement).focus();
    await keyboard.press(key);
    await expect.poll(() => opened.length).toBe(1);
    opened.shift();
  }
  expect(text('taken-light')()).toBe('logo.png');

  await scope()
    .getByRole('button', { name: /^Attach documents/ })
    .click();
  const several = await choose([
    file('brief.pdf', 'application/pdf'),
    file('notes.txt', 'text/plain'),
  ]);
  expect(several.multiple).toBe(true);
  await expect.poll(text('documents-light')).toBe('brief.pdf notes.txt');
});

test(
  'dropped files show the drag-over state and are filtered by accept, and an unavailable zone takes none',
  { tags: ['engines'] },
  async () => {
    const zone = scope().getByRole('button', { name: /^Drop a logo here, or browse/ });
    const root = scope().element().querySelector('.env-drop-zone')!;
    const dragOver = () => root.hasAttribute('data-drag-over');
    const transfer = filesTransfer([
      ['logo.webp', 'image/webp'],
      ['notes.txt', 'text/plain'],
      ['mark.png', 'image/png'],
    ]);
    drag(zone, 'dragenter', transfer);
    await expect.poll(dragOver).toBe(true);
    // Moving over the label inside keeps the state until the files leave the zone.
    const label = zone.element().querySelector('.env-drop-zone-label')!;
    drag(label, 'dragenter', transfer);
    drag(zone, 'dragleave', transfer);
    await expect.poll(dragOver).toBe(true);
    drag(label, 'dragleave', transfer);
    await expect.poll(dragOver).toBe(false);

    drop(zone, transfer);
    await expect.poll(dragOver).toBe(false);
    // Without multiple the zone takes the first matching file and rejects the others.
    await expect.poll(text('taken-light')).toBe('logo.webp');
    expect(text('rejected-light')()).toBe('notes.txt mark.png');
    drop(scope().getByRole('button', { name: /^Attach documents/ }), transfer);
    await expect.poll(text('documents-light')).toBe('logo.webp notes.txt mark.png');

    // A pending zone and a disabled one open nothing and take no files.
    const pending = scope().getByRole('button', { name: /^Uploading the logo/ });
    await pending.click({ force: true });
    const zones = scope().element().querySelectorAll('.env-drop-zone');
    const one = filesTransfer([['logo.png', 'image/png']]);
    drop(pending, one);
    expect(zones[2]!.hasAttribute('data-drag-over')).toBe(false);
    drop(zones[3]!, one);
    expect(opened).toHaveLength(0);
    expect(text('unavailable-light')()).toBe('');
  },
);

test(
  'a named zone submits the files it took, or those an application keeps, with a native form',
  { tags: ['engines'] },
  async () => {
    const attachments = scope().getByRole('button', { name: 'Add attachments' });
    const submit = () => scope().getByRole('button', { name: 'Submit files' }).click();
    const submitted = text('files-submitted-light');
    drop(
      attachments,
      filesTransfer([
        ['report.pdf', 'application/pdf'],
        ['photo.png', 'image/png'],
        ['notes.txt', 'text/plain'],
      ]),
    );
    await submit();
    await expect.poll(submitted).toBe('report.pdf notes.txt');

    // Choosing the same file again hands it over again; the form submits it once.
    const summary = file('summary.pdf', 'application/pdf');
    for (const attempt of [1, 2]) {
      await attachments.click();
      await choose([summary]);
      await expect
        .poll(text('attached-light'))
        .toBe(['report.pdf notes.txt', ...Array(attempt).fill('summary.pdf')].join(' | '));
    }
    await submit();
    await expect.poll(submitted).toBe('summary.pdf');

    // Files the zone rejects leave the files it holds as they were.
    drop(attachments, filesTransfer([['photo.png', 'image/png']]));
    await submit();
    await expect.poll(submitted).toBe('summary.pdf');

    await scope().getByRole('button', { name: 'Reset files' }).click();
    await submit();
    await expect.poll(submitted).toBe('');
    drop(attachments, filesTransfer([['photo.png', 'image/png']]));
    await submit();
    await expect.poll(submitted).toBe('');

    // An application that keeps the chosen file submits it, through a reset too, and its
    // inputRef opens the hidden zone's picker.
    const avatar = scope().getByRole('button', { name: /^Drop an avatar here, or browse/ });
    const preview = () => scope().element().querySelector('.fixture-file-preview');
    const submitAvatar = () => scope().getByRole('button', { name: 'Submit avatar' }).click();
    const avatarSubmitted = text('avatar-submitted-light');
    await avatar.click();
    await choose([file('aurora.png', 'image/png')]);
    await expect.poll(() => shown(avatar)).toBe(false);
    await expect.poll(() => preview()?.textContent).toContain('aurora.png');
    await page.elementLocator(preview()!).getByRole('button', { name: 'Replace' }).click();
    await choose([file('mira.png', 'image/png')]);
    await expect.poll(() => preview()?.textContent).toContain('mira.png');
    await submitAvatar();
    await expect.poll(avatarSubmitted).toBe('mira.png');
    await scope().getByRole('button', { name: 'Reset avatar' }).click();
    await submitAvatar();
    await expect.poll(avatarSubmitted).toBe('mira.png');
    await page.elementLocator(preview()!).getByRole('button', { name: 'Remove' }).click();
    await expect.poll(() => shown(avatar)).toBe(true);
    await submitAvatar();
    await expect.poll(avatarSubmitted).toBe('');
    // The same file can be chosen again after removing it.
    await avatar.click();
    await choose([file('mira.png', 'image/png')]);
    await expect.poll(() => preview()?.textContent).toContain('mira.png');
    await submitAvatar();
    await expect.poll(avatarSubmitted).toBe('mira.png');
  },
);
