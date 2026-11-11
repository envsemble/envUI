import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Messages.fixture.tsx';
import { defaultMessages } from '../../packages/ui/src/foundations/messages/defaultMessages.ts';
import { box, keyboard, mouse, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

// The pseudo-locale check: tests/fixture/Messages.fixture.tsx renders the components whose strings
// come from EnvUIProvider's messages with every message replaced by ⟦namespace.key⟧. No English
// default may be left in their text, names, descriptions, titles, placeholders or value texts. As
// each batch moves a family's strings into messages, it adds the family's components to the
// fixture.

beforeEach(() => {
  mount(fixture);
});

/** Every string default, as people would read it. */
const englishDefaults = new Set(
  Object.values(defaultMessages)
    .flatMap((keys) => Object.values(keys))
    .filter((value): value is string => typeof value === 'string'),
);

/** The texts of the page: its text nodes and the attributes people read. */
function pageTexts() {
  const texts: string[] = [];
  const attributes = ['aria-label', 'aria-description', 'title', 'placeholder', 'aria-valuetext'];
  for (const element of document.querySelectorAll('body *')) {
    for (const node of element.childNodes)
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
        texts.push(node.textContent.trim());
    for (const attribute of attributes) {
      const value = element.getAttribute(attribute);
      if (value) texts.push(value.trim());
    }
  }
  return texts;
}

const root = () => page.getByTestId('messages');
const textOf = (selector: string) => () => document.querySelector(selector)?.textContent;

test('no English default is left under a provider that sets every message', async () => {
  // ConfirmButton announces its armed state.
  await root().getByRole('button', { name: 'Remove', exact: true }).click();
  await expect
    .poll(
      () =>
        root()
          .getByRole('status')
          .elements()
          .filter((status) => status.textContent?.includes('⟦confirmButton.armed⟧')).length,
    )
    .toBe(1);
  // CopyButton shows its result in a tooltip.
  const copy = box(root().getByRole('button', { name: '⟦copyButton.copy⟧' }));
  await mouse.move(copy.x + copy.width / 2, copy.y + copy.height / 2);
  // The notices show from an effect, more than the visible limit, so the hidden count shows too.
  await expect.poll(pageTexts).toContain('⟦toast.hidden⟧');
  const found = pageTexts();
  const left = found.filter((text) => englishDefaults.has(text));
  expect(left).toEqual([]);
  expect(found).toContain('⟦dialog.close⟧');
  expect(found).toContain('⟦themePreference.toDark⟧');
  for (const key of [
    'searchField.clear',
    'textarea.resize',
    'textarea.resizeDescription',
    'combobox.clear',
    'combobox.remove',
    'datePicker.clear',
    'timePicker.clear',
    'monthPicker.clear',
    'calendar.previousMonth',
    'calendar.nextMonth',
    'composer.send',
    'colorPicker.formatButton',
    'colorPicker.hex',
    'colorPicker.hexField',
    'colorPicker.copy',
    'colorPicker.swatches',
    'colorPicker.button',
    'panelDock.minimize',
    'panelDock.maximize',
    'panelDock.closeWindow',
    'panelDock.minimized',
    'panelDock.open',
    'panelDock.close',
    'panelDock.resize',
    'codeBlock.title',
    'codeBlock.copy',
    'codeBlock.label',
    'markdown.table',
    'markdown.taskDone',
    'markdown.taskOpen',
    'markdownEditor.views',
    'markdownEditor.write',
    'markdownEditor.preview',
    'markdownEditor.toolbar',
    'editor.bold',
    'editor.undo',
  ])
    expect(found).toContain(`⟦${key}⟧`);
  for (const marked of [
    '⟦avatarGroup.label⟧',
    '⟦avatarGroup.more⟧',
    '⟦rating.label⟧',
    '⟦diffStat.label⟧',
    '⟦message.sending⟧',
    '⟦message.failed⟧',
    '⟦calendarHeatmap.less⟧',
    '⟦calendarHeatmap.more⟧',
    '⟦relativeTime.now⟧',
    '⟦alert.dismiss⟧',
    '⟦common.loading⟧',
    '⟦toast.dismiss⟧',
    '⟦toast.hidden⟧',
    '⟦toast.regionBottomEnd⟧',
    '⟦toast.regionTopCenter⟧',
    '⟦panes.resize⟧',
    '⟦panes.back⟧',
    '⟦scaffold.skipToContent⟧',
    '⟦scaffold.skipToNavigation⟧',
  ])
    expect(found).toContain(marked);
  // CommandPalette invites a search through its status before people type.
  await root().getByRole('button', { name: 'Open palette' }).click();
  const status = page.getByRole('dialog', { name: 'Go to' }).getByRole('status');
  await expect.poll(() => status.query()?.textContent).toBe('⟦commandPalette.emptyQuery⟧');
});

test('the app parts take their names, labels and announcements from the provider', async () => {
  // A reorderable list names its handles and announces a move.
  const handle = root().getByRole('list', { name: 'Order' }).getByRole('button').first();
  await expect.element(handle).toHaveAccessibleName('⟦list.reorder⟧');
  // The dialog open from the start takes focus as it opens: the handle takes it after.
  await expect.poll(() => document.activeElement?.closest('[role="dialog"]')).not.toBeNull();
  (handle.element() as HTMLElement).focus();
  const announcer = textOf('.env-list-announcer');
  await keyboard.press('Space');
  await expect.poll(announcer).toBe('⟦list.lifted⟧');
  await keyboard.press('ArrowDown');
  await expect.poll(announcer).toBe('⟦list.moved⟧');
  await keyboard.press('Escape');
  await expect.poll(announcer).toBe('⟦list.cancelled⟧');
  // The confirm dialog's cancel button.
  await root().getByRole('button', { name: 'Open confirm' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect
    .poll(() => shown(dialog.getByRole('button', { name: '⟦confirmDialog.cancel⟧' })))
    .toBe(true);
  await keyboard.press('Escape');
  await expect.poll(() => shown(dialog)).toBe(false);
});

test('messages written inline keep the context while they stay the same', async () => {
  const probe = page.getByTestId('inline-probe');
  await expect.element(probe).toHaveTextContent('⟦inline.loading⟧');
  // The count is written in an effect, after the first paint.
  await expect.poll(() => probe.element().getAttribute('data-renders')).toMatch(/^\d+$/);
  const before = probe.element().getAttribute('data-renders');
  const rerender = page.getByRole('button', { name: /⟦rerender⟧/ });
  for (const count of [1, 2, 3]) {
    await rerender.click();
    await expect.poll(() => rerender.element().textContent).toBe(`⟦rerender⟧ ${count}`);
  }
  expect(probe.element().getAttribute('data-renders')).toBe(before);
});
