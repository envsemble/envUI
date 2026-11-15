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
  await expect.element(block.element().querySelector('pre')!).toHaveAccessibleName('sh code');
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
