import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { expect, onTestFinished, test } from 'vitest';
import { page } from 'vitest/browser';
import { Pager, Theme } from '@envsemble/envui';

function renderPager(width: string) {
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
        <div style={{ inlineSize: width }}>
          <Pager.Root aria-label={`Pager ${width}`}>
            <Pager.Previous href="#install">Install the command line tools</Pager.Previous>
            <Pager.Next href="#deploy">Deploy your first application</Pager.Next>
          </Pager.Root>
        </div>
      </Theme>,
    ),
  );
  return page.getByRole('navigation', { name: `Pager ${width}` });
}

test('previous and next sit side by side where they fit, and stack as rows of the pager’s width, the previous first, where they wrap', async () => {
  const wide = renderPager('60rem');
  const narrow = renderPager('22.5rem');
  await expect.element(narrow).toHaveAttribute('data-stacked', '');
  expect(wide.element().hasAttribute('data-stacked')).toBe(false);
  const boxes = (nav: typeof wide) =>
    [...nav.element().querySelectorAll('.env-pager-link')].map((link) =>
      link.getBoundingClientRect(),
    );
  const [widePrevious, wideNext] = boxes(wide);
  expect(widePrevious.top).toBe(wideNext.top);
  expect(widePrevious.right).toBeLessThanOrEqual(wideNext.left);
  const pager = narrow.element().getBoundingClientRect();
  const [previous, next] = boxes(narrow);
  expect(previous.bottom).toBeLessThanOrEqual(next.top);
  for (const link of [previous, next]) {
    expect(link.left).toBeCloseTo(pager.left, 0);
    expect(link.width).toBeCloseTo(pager.width, 0);
  }
});
