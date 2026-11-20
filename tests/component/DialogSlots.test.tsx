import { useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { expect, onTestFinished, test } from 'vitest';
import { page } from 'vitest/browser';
import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogClose,
  Kbd,
  Sheet,
  Theme,
  useDialogPending,
} from '@envsemble/envui';

function render(content: ReactNode) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const remove = () => {
    root.unmount();
    host.remove();
  };
  onTestFinished(remove);
  flushSync(() => root.render(<Theme theme="light">{content}</Theme>));
  return remove;
}

const rect = (element: Element) => element.getBoundingClientRect();

const order = (dialog: Element, selector: string) =>
  [...dialog.querySelectorAll(selector)].map(
    (element) => element.getAttribute('aria-label') ?? element.textContent,
  );

function TrackedSave() {
  const pending = useDialogPending();
  return <Button data-pending-read={String(pending)}>Save</Button>;
}

test('a dialog puts content at the start of its actions and around its title, and can move its close button to the heading or leave it out', async () => {
  const closeRename = render(
    <Dialog
      defaultOpen
      title="Rename project"
      headerStart={<Button variant="ghost">Back</Button>}
      headerEnd={<Button variant="ghost">More</Button>}
      actionsStart={
        <Button tone="danger" variant="outline">
          Delete
        </Button>
      }
      actions={<TrackedSave />}
      pending
    />,
  );
  const rename = page.getByRole('dialog', { name: 'Rename project' });
  await expect.element(rename).toBeInTheDocument();
  expect(order(rename.element(), '.env-dialog-heading > *')).toEqual([
    'Back',
    'Rename project',
    'More',
  ]);
  expect(order(rename.element(), '.env-dialog-actions > *')).toEqual(['Delete', 'Close', 'Save']);
  const actionsStart = rename.element().querySelector('.env-dialog-actions-start')!;
  const close = rename.getByRole('button', { name: 'Close' }).element();
  expect(rect(actionsStart).right).toBeLessThanOrEqual(rect(close).left);
  const more = rename.getByRole('button', { name: 'More' }).element();
  const heading = rename.element().querySelector('.env-dialog-heading')!;
  expect(rect(more).right).toBeCloseTo(rect(heading).right, 0);
  await expect
    .element(rename.getByRole('button', { name: 'Save' }))
    .toHaveAttribute('data-pending-read', 'true');
  closeRename();

  const closePreview = render(
    <Dialog defaultOpen title="Preview" closeButtonPlacement="heading" />,
  );
  const preview = page.getByRole('dialog', { name: 'Preview' });
  await expect.element(preview).toBeInTheDocument();
  const corner = preview.element().querySelector('.env-dialog-heading .env-icon-button');
  expect(corner?.getAttribute('aria-label')).toBe('Close');
  expect(preview.element().querySelector('.env-dialog-actions')).toBeNull();
  closePreview();

  render(
    <Dialog
      defaultOpen
      aria-label="Search"
      closeButton={false}
      actions={<DialogClose>Done</DialogClose>}
    />,
  );
  const search = page.getByRole('dialog', { name: 'Search' });
  await expect.element(search).toBeInTheDocument();
  expect(search.element().querySelector('.env-dialog-heading')).toBeNull();
  expect(order(search.element(), '.env-dialog-actions > *')).toEqual(['Done']);
  await search.getByRole('button', { name: 'Done' }).click();
  await expect.poll(() => search.query()).toBeNull();
});

test('a sheet puts content at the start of its actions and around its title, before its close button', async () => {
  render(
    <Sheet
      defaultOpen
      title="Inspector"
      headerStart={<Button variant="ghost">Back</Button>}
      headerEnd={<Button variant="ghost">Open full page</Button>}
      actionsStart={<Button variant="ghost">Reset</Button>}
    />,
  );
  const sheet = page.getByRole('dialog', { name: 'Inspector' });
  await expect.element(sheet).toBeInTheDocument();
  expect(order(sheet.element(), '.env-dialog-heading > *')).toEqual([
    'Back',
    'Inspector',
    'Open full page',
    'Close',
  ]);
  expect(order(sheet.element(), '.env-dialog-actions > *')).toEqual(['Reset']);
});

function ShortcutConfirm() {
  const [open, setOpen] = useState(true);
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title="Delete Northwind?"
      tone="danger"
      confirmLabel={
        <>
          Delete project <Kbd>⌘⏎</Kbd>
        </>
      }
      cancelLabel={<>Keep it</>}
      onConfirm={() => undefined}
    />
  );
}

test('a confirm dialog’s button labels take content beside their words', async () => {
  render(<ShortcutConfirm />);
  const dialog = page.getByRole('alertdialog', { name: 'Delete Northwind?' });
  await expect.element(dialog).toBeInTheDocument();
  const confirm = dialog.getByRole('button', { name: /^Delete project/ });
  expect(confirm.element().querySelector('kbd, .env-kbd')).not.toBeNull();
  await expect.element(dialog.getByRole('button', { name: 'Keep it' })).toBeInTheDocument();
});
