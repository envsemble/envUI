import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/ContainerSize.fixture.tsx';
import { mount } from './Mount.tsx';

const text = (testId: string) => () => page.getByTestId(testId).element().textContent;

test(
  'useContainerSize follows the content and border box along the writing mode',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    await expect.poll(text('content-size')).toBe('276 × 76');
    await expect.poll(text('border-size')).toBe('300 × 100');
    // In vertical text the inline size is the height: the box is 200 px wide and 80 px tall.
    await expect.poll(text('vertical-size')).toBe('80 × 200');
    await page.getByRole('button', { name: 'Widen the box' }).click();
    await expect.poll(text('content-size')).toBe('396 × 76');
    await expect.poll(text('border-size')).toBe('420 × 100');
  },
);
