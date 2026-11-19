import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { expect, onTestFinished, test } from 'vitest';
import { page } from 'vitest/browser';
import { Button, Popover, Theme } from '@envsemble/envui';
import { keyboard } from './support/Browser.ts';

function CommentAtCell() {
  const cell = useRef<HTMLTableCellElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Comment on the total</Button>
      <table style={{ marginInlineStart: '30rem' }}>
        <tbody>
          <tr>
            <td ref={cell}>1,240</td>
          </tr>
        </tbody>
      </table>
      <Popover anchor={cell} open={open} onOpenChange={setOpen} title="Comment" side="bottom">
        A comment on the total.
      </Popover>
    </>
  );
}

test('a popover without a trigger opens from code beside its anchor, and closes with Escape', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  onTestFinished(() => {
    root.unmount();
    host.remove();
  });
  flushSync(() =>
    root.render(
      <Theme theme="light">
        <CommentAtCell />
      </Theme>,
    ),
  );
  const opener = page.getByRole('button', { name: 'Comment on the total' });
  await opener.click();
  const popover = page.getByRole('dialog', { name: 'Comment' });
  await expect.element(popover).toBeVisible();
  const cell = host.querySelector('td')!.getBoundingClientRect();
  await expect
    .poll(() => popover.element().getBoundingClientRect().top)
    .toBeGreaterThanOrEqual(cell.bottom);
  const surface = popover.element().getBoundingClientRect();
  expect(surface.left).toBeLessThan(cell.right);
  expect(surface.right).toBeGreaterThan(cell.left);
  expect(opener.element().getAttribute('aria-expanded')).toBeNull();
  await keyboard.press('Escape');
  await expect.poll(() => popover.query()).toBeNull();
});
