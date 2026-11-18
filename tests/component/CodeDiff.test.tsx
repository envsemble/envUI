import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/CodeDiff.fixture.tsx';
import { mount } from './support/Mount.tsx';

const host = (diff: Element) => [...diff.querySelectorAll('*')].find((each) => each.shadowRoot);

function tokenColor(diff: Element, text: string) {
  const token = [...(host(diff)?.shadowRoot?.querySelectorAll('span') ?? [])].find(
    (span) => span.children.length === 0 && span.textContent?.trim() === text,
  );
  return token ? getComputedStyle(token).color : null;
}

test('a code diff keeps its expanded lines and shows no spinner as the theme switches', async () => {
  mount(fixture);
  const scope = page.getByTestId('switched');
  const diff = scope.element().querySelector('.env-code-diff')!;
  await expect.poll(() => diff.hasAttribute('aria-busy')).toBe(false);
  const lines = () => host(diff)?.shadowRoot?.querySelectorAll('[data-line]').length ?? 0;
  await expect.poll(lines).toBeGreaterThan(0);
  const folded = lines();
  const rendersInto = host(diff)!;
  let spinner = false;
  const observer = new MutationObserver(() => {
    if (diff.querySelector('[role=status]')) spinner = true;
  });
  observer.observe(diff, { childList: true, subtree: true });
  rendersInto.shadowRoot!.querySelector<HTMLElement>('[data-expand-button]')!.click();
  await expect.poll(lines).toBeGreaterThan(folded);
  const expanded = lines();
  const light = tokenColor(diff, 'const');
  for (const scheme of ['dark', 'light']) {
    await scope.getByRole('button', { name: 'Switch theme' }).click();
    if (scheme === 'dark') await expect.poll(() => tokenColor(diff, 'const')).not.toBe(light);
    else await expect.poll(() => tokenColor(diff, 'const')).toBe(light);
    expect({ lines: lines(), same: host(diff) === rendersInto, spinner }, scheme).toEqual({
      lines: expanded,
      same: true,
      spinner: false,
    });
  }
  observer.disconnect();
});
