import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Tabs.fixture.tsx';
import * as rtl from '../fixture/TabsRtl.fixture.tsx';
import * as scrolling from '../fixture/TabsScrolling.fixture.tsx';
import { keyboard } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

/** The computed display of the panel each tab of a tab list controls, in order. */
function panelDisplays(list: string) {
  return [
    ...page
      .getByRole('tablist', { name: list, exact: true })
      .element()
      .querySelectorAll('[role="tab"]'),
  ].map((tab) => {
    const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
    return panel ? getComputedStyle(panel).display : 'missing';
  });
}

test('the arrow keys follow the text direction, and a panel keeps the direction around it', async () => {
  mount(rtl);
  for (const name of ['Right-to-left tabs', 'Provider tabs']) {
    const list = page.getByRole('tablist', { name });
    (list.getByRole('tab', { name: 'One' }).element() as HTMLElement).focus();
    // In right-to-left text, from dir or from EnvUIProvider, the next tab is to the left.
    await keyboard.press('ArrowLeft');
    await expect.element(list.getByRole('tab', { name: 'Two' })).toHaveFocus();
    await expect
      .element(list.getByRole('tab', { name: 'Two' }))
      .toHaveAttribute('aria-selected', 'true');
    await keyboard.press('ArrowRight');
    await expect.element(list.getByRole('tab', { name: 'One' })).toHaveFocus();
  }
  // The slider is in a left-to-right region of a right-to-left tab's panel, so → raises it.
  const slider = page.getByRole('slider', { name: 'Volume' });
  (slider.element() as HTMLElement).focus();
  await keyboard.press('ArrowRight');
  await expect.element(slider).toHaveAttribute('aria-valuenow', '51');
});

test(
  'a rail with more tabs than fit starts at its chosen first tab',
  { tags: ['engines'] },
  async () => {
    // The rail measures its tabs from its own start: in a positioned frame set in from the page's
    // start, it once measured them from the frame's and rested scrolled past the chosen tab.
    mount(scrolling);
    const list = page.getByRole('tablist', { name: 'Project views' });
    await expect
      .element(list.getByRole('tab', { name: 'Summary' }))
      .toHaveAttribute('aria-selected', 'true');
    const place = () => {
      const rail = list.element();
      const tab = rail.querySelector('[aria-selected="true"]')!.getBoundingClientRect();
      const frame = rail.getBoundingClientRect();
      return {
        overflows: rail.scrollWidth > rail.clientWidth,
        atStart: rail.scrollLeft === 0,
        inView: tab.left >= frame.left - 0.5 && tab.right <= frame.right + 0.5,
      };
    };
    await expect.poll(place).toEqual({ overflows: true, atStart: true, inView: true });
  },
);

test('filling tabs that keep inactive panels mounted display only the selected panel', async () => {
  mount(fixture);
  for (const theme of ['light', 'dark']) {
    // Tabs nested in a filling panel keep their own layout, and their hidden panel stays hidden.
    await expect.poll(() => panelDisplays(`Canvas layers ${theme}`)).toEqual(['block', 'none']);
    // Alone, and vertical with the list beside a heading through renderList.
    for (const name of [`Filling views ${theme}`, `Vertical filling views ${theme}`]) {
      await expect.poll(() => panelDisplays(name)).toEqual(['flex', 'none', 'none']);
      await page
        .getByRole('tablist', { name, exact: true })
        .getByRole('tab', { name: 'History' })
        .click();
      // The outgoing panel is hidden once it has faded out.
      await expect.poll(() => panelDisplays(name)).toEqual(['none', 'none', 'flex']);
    }
  }
});
