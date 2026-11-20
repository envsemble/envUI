import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/PortalContainer.fixture.tsx';
import { collectErrors, nextFrames, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

test(
  'a contained region whose notices fail to load shows none, and a remount tries again',
  { tags: ['once'] },
  async () => {
    const errors = collectErrors();
    await commands.failModule('ContainedToastRoot');
    try {
      const mounted = mount(fixture);
      const layer = page.getByTestId('layer');
      await expect.poll(() => shown(layer.getByRole('menu', { name: 'Actions' }))).toBe(true);
      await commands.moduleRequested('ContainedToastRoot');
      await nextFrames();
      expect(layer.element().querySelectorAll('.env-toast')).toHaveLength(0);
      await commands.releaseModule('ContainedToastRoot');
      mounted.remount();
      await expect
        .poll(() => shown(page.getByTestId('layer').getByText('Changes saved.')))
        .toBe(true);
      expect(errors).toEqual([]);
    } finally {
      await commands.unrouteModule('ContainedToastRoot');
    }
  },
);
