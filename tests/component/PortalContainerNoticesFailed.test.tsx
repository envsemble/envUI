import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/PortalContainer.fixture.tsx';
import { collectErrors, nextFrames, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

// A file of its own: the frame keeps a module it has loaded, so this test needs one that hasn't
// loaded the notices' module yet.
test('a contained region whose notices fail to load shows none, and a remount tries again', async () => {
  const errors = collectErrors();
  await commands.failModule('PictureNotice');
  try {
    const mounted = mount(fixture);
    const layer = page.getByTestId('layer');
    await expect.poll(() => shown(layer.getByRole('menu', { name: 'Actions' }))).toBe(true);
    await commands.moduleRequested('PictureNotice');
    // Usually the component has handled the rejection two frames later.
    await nextFrames();
    expect(layer.element().querySelectorAll('.env-toast')).toHaveLength(0);
    await commands.releaseModule('PictureNotice');
    mounted.remount();
    await expect
      .poll(() => shown(page.getByTestId('layer').getByText('Changes saved.')))
      .toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await commands.unrouteModule('PictureNotice');
  }
});
