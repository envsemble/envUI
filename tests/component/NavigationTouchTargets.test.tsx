import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { expect, onTestFinished, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import { Breadcrumbs, TableOfContents, Theme } from '@envsemble/envui';
import { box } from './support/Browser.ts';

function render(content: ReactNode) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  onTestFinished(() => {
    root.unmount();
    host.remove();
  });
  flushSync(() => root.render(<Theme theme="light">{content}</Theme>));
  return host;
}

const touchHeight = 44;

const hitArea = (element: Element) => {
  const own = box(element);
  const before = getComputedStyle(element, '::before');
  const inset = (side: string) => Number.parseFloat(before.getPropertyValue(side));
  return before.content === 'none' || before.position !== 'absolute'
    ? { width: own.width, height: own.height }
    : {
        width: Math.round(own.width - inset('left') - inset('right')),
        height: Math.round(own.height - inset('top') - inset('bottom')),
      };
};

test('breadcrumb links and contents links keep their size with a mouse, and are a touch target of 44 px on a touch screen', async () => {
  for (const touch of [false, true]) {
    await commands.emulateTouch(touch);
    try {
      const host = render(
        <>
          <Breadcrumbs
            aria-label={`Trail ${touch}`}
            items={[{ label: 'Docs', href: '#docs' }, { label: 'Install' }]}
          />
          <TableOfContents
            aria-label={`Contents ${touch}`}
            items={[
              { id: 'first', label: 'First' },
              { id: 'second', label: 'Second' },
            ]}
          />
        </>,
      );
      const crumb = page
        .getByRole('navigation', { name: `Trail ${touch}` })
        .getByRole('link', { name: 'Docs' })
        .element();
      const crumbHit = hitArea(crumb);
      if (touch) {
        expect(crumbHit.height).toBeGreaterThanOrEqual(touchHeight);
        expect(crumbHit.width).toBeGreaterThanOrEqual(touchHeight);
      } else {
        expect(crumbHit.height).toBeLessThan(touchHeight);
      }
      expect(box(crumb).height).toBeLessThan(touchHeight);
      await expect
        .poll(() => host.querySelectorAll('.env-table-of-contents-link').length)
        .toBeGreaterThan(0);
      const link = host.querySelector('.env-table-of-contents-link')!;
      if (touch) expect(Math.round(box(link).height)).toBeGreaterThanOrEqual(touchHeight);
      else expect(box(link).height).toBeLessThan(touchHeight);
    } finally {
      await commands.emulateTouch(false);
    }
  }
});
