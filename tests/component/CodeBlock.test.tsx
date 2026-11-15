import { afterEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/CodeBlock.fixture.tsx';
import { mount } from './support/Mount.tsx';

function recordClipboard(mode: 'available' | 'neither') {
  const writes: string[] = [];
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value:
      mode === 'available' ? { writeText: async (text: string) => void writes.push(text) } : {},
  });
  document.execCommand = () => false;
  return writes;
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard');
  Reflect.deleteProperty(document, 'execCommand');
});

test('a code block copies its source and says so', async () => {
  const writes = recordClipboard('available');
  mount(fixture);
  const block = page.getByTestId('install');
  await expect
    .element(block.element().querySelector('pre')!)
    .toHaveAccessibleName('Plain text code');
  await block.getByRole('button', { name: 'Copy code' }).click();
  await expect.poll(() => writes).toEqual(['npm install @envsemble/envui\nnpm run build']);
  await expect.element(block.getByRole('button', { name: 'Code copied' })).toBeVisible();
  await expect.element(block.getByRole('status')).toHaveTextContent('Copied.');
});

test(
  'a code block that cannot copy selects its code for people to copy',
  { tags: ['engines'] },
  async () => {
    recordClipboard('neither');
    mount(fixture);
    const block = page.getByTestId('install');
    await block.getByRole('button', { name: 'Copy code' }).click();
    await expect
      .element(block.getByRole('status'))
      .toHaveTextContent('Code selected. Use your keyboard or context menu to copy.');
    expect(document.getSelection()?.toString()).toMatch(
      /^npm install @envsemble\/envui\s+npm run build\s*$/,
    );
    await expect.element(block.getByRole('button', { name: 'Copy code' })).toBeVisible();
  },
);

test('CodeBlock shows its source as plain text, HighlightedCodeBlock colors it by its language', async () => {
  mount(fixture);
  const plain = page.getByTestId('install').element().querySelector('code')!;
  expect(plain.children).toHaveLength(0);
  expect(plain.textContent).toBe('npm install @envsemble/envui\nnpm run build');
  const highlighted = page.getByTestId('highlighted');
  await expect
    .element(highlighted.element().querySelector('pre')!)
    .toHaveAccessibleName('answer.ts');
  await expect
    .poll(() => highlighted.element().querySelectorAll('code span').length)
    .toBeGreaterThan(1);
  expect(highlighted.element().querySelector('code')!.textContent).toBe('const answer = 42;');
});
