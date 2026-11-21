import { afterEach, beforeEach, expect, test } from 'vitest';
import { page, userEvent, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/DropZone.fixture.tsx';
import { collectErrors, keyboard, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

let errors: string[] = [];
let inputsWhosePickerOpened: HTMLInputElement[] = [];

function standInForPicker(event: MouseEvent) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'file') return;
  event.preventDefault();
  inputsWhosePickerOpened.push(input);
}

beforeEach(() => {
  errors = collectErrors();
  inputsWhosePickerOpened = [];
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

async function chooseInOpenedPicker(files: File[]) {
  await expect.poll(() => inputsWhosePickerOpened.length).toBeGreaterThan(0);
  const input = inputsWhosePickerOpened.shift()!;
  await userEvent.upload(page.elementLocator(input), files);
  return input;
}

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
  await keyboard.press('Tab');
  await expect.element(zone).toHaveFocus();
  await zone.click();
  const input = await chooseInOpenedPicker([file('logo.png', 'image/png')]);
  expect(input.multiple).toBe(false);
  await expect.poll(text('taken-light')).toBe('logo.png');

  for (const key of ['Enter', 'Space']) {
    (zone.element() as HTMLElement).focus();
    await keyboard.press(key);
    await expect.poll(() => inputsWhosePickerOpened.length).toBe(1);
    inputsWhosePickerOpened.shift();
  }
  expect(text('taken-light')()).toBe('logo.png');

  await scope()
    .getByRole('button', { name: /^Attach documents/ })
    .click();
  const several = await chooseInOpenedPicker([
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
    const label = zone.element().querySelector('.env-drop-zone-label')!;
    drag(label, 'dragenter', transfer);
    drag(zone, 'dragleave', transfer);
    await expect.poll(dragOver).toBe(true);
    drag(label, 'dragleave', transfer);
    await expect.poll(dragOver).toBe(false);

    drop(zone, transfer);
    await expect.poll(dragOver).toBe(false);
    await expect.poll(text('taken-light')).toBe('logo.webp');
    expect(text('rejected-light')()).toBe('notes.txt mark.png');
    drop(scope().getByRole('button', { name: /^Attach documents/ }), transfer);
    await expect.poll(text('documents-light')).toBe('logo.webp notes.txt mark.png');

    const pending = scope().getByRole('button', { name: /^Uploading the logo/ });
    await pending.click({ force: true });
    const zones = scope().element().querySelectorAll('.env-drop-zone');
    const one = filesTransfer([['logo.png', 'image/png']]);
    drop(pending, one);
    expect(zones[2]!.hasAttribute('data-drag-over')).toBe(false);
    drop(zones[3]!, one);
    expect(inputsWhosePickerOpened).toHaveLength(0);
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

    const summary = file('summary.pdf', 'application/pdf');
    for (const attempt of [1, 2]) {
      await attachments.click();
      await chooseInOpenedPicker([summary]);
      await expect
        .poll(text('attached-light'))
        .toBe(['report.pdf notes.txt', ...Array(attempt).fill('summary.pdf')].join(' | '));
    }
    await submit();
    await expect.poll(submitted).toBe('summary.pdf');

    drop(attachments, filesTransfer([['photo.png', 'image/png']]));
    await submit();
    await expect.poll(submitted).toBe('summary.pdf');

    await scope().getByRole('button', { name: 'Reset files' }).click();
    await submit();
    await expect.poll(submitted).toBe('');
    drop(attachments, filesTransfer([['photo.png', 'image/png']]));
    await submit();
    await expect.poll(submitted).toBe('');

    const avatar = scope().getByRole('button', { name: /^Drop an avatar here, or browse/ });
    const preview = () => scope().element().querySelector('.fixture-file-preview');
    const submitAvatar = () => scope().getByRole('button', { name: 'Submit avatar' }).click();
    const avatarSubmitted = text('avatar-submitted-light');
    await avatar.click();
    await chooseInOpenedPicker([file('aurora.png', 'image/png')]);
    await expect.poll(() => shown(avatar)).toBe(false);
    await expect.poll(() => preview()?.textContent).toContain('aurora.png');
    await page.elementLocator(preview()!).getByRole('button', { name: 'Replace' }).click();
    await chooseInOpenedPicker([file('mira.png', 'image/png')]);
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
    await avatar.click();
    await chooseInOpenedPicker([file('mira.png', 'image/png')]);
    await expect.poll(() => preview()?.textContent).toContain('mira.png');
    await submitAvatar();
    await expect.poll(avatarSubmitted).toBe('mira.png');
  },
);

test('content inside the zone sits beside its target, takes drops and holds its own controls', async () => {
  mount({ default: fixture.DropZoneContentFixture });
  const target = page.getByRole('button', { name: 'Drop attachments here' });
  const list = page.getByTestId('attachments');
  expect(target.element().contains(list.element())).toBe(false);
  expect(list.element().closest('.env-drop-zone-content')).not.toBeNull();
  drop(list, filesTransfer([['brief.pdf', 'application/pdf']]));
  await expect.poll(() => list.element().textContent).toContain('brief.pdf');
  await page.getByRole('button', { name: 'Remove brief.pdf' }).click();
  await expect.poll(() => list.element().textContent).toBe('');
  await page.getByRole('button', { name: 'Browse' }).click();
  await chooseInOpenedPicker([file('plan.png', 'image/png')]);
  await expect.poll(() => list.element().textContent).toContain('plan.png');
});

test("the application's own region can be the zone, without the target, named by the label", async () => {
  mount({ default: fixture.DropZoneRegionFixture });
  const region = page.getByTestId('region');
  expect(region.element().tagName).toBe('SECTION');
  await expect.element(region).toHaveClass(/own-region/);
  await expect.element(region).toHaveClass(/env-drop-zone/);
  await expect.element(region).toHaveRole('group');
  await expect.element(region).toHaveAccessibleName('Drop files on the table');
  await expect.element(region).toHaveAccessibleDescription('Any file up to 10 MB');
  expect(region.element().querySelector('.env-drop-zone-target')).toBeNull();
  const rows = page.getByTestId('rows');
  const transfer = filesTransfer([['brief.pdf', 'application/pdf']]);
  drag(rows, 'dragenter', transfer);
  await expect.element(region).toHaveAttribute('data-drag-over');
  drag(rows, 'dragover', transfer);
  drag(rows, 'drop', transfer);
  await expect.element(region).not.toHaveAttribute('data-drag-over');
  await expect.poll(() => rows.element().textContent).toContain('brief.pdf');
  await page.getByRole('button', { name: 'Browse' }).click();
  await chooseInOpenedPicker([file('plan.png', 'image/png')]);
  await expect.poll(() => rows.element().textContent).toContain('plan.png');
});
