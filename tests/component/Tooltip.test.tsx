import { beforeEach, describe, expect, test, vi } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as fixture from '../fixture/Tooltip.fixture.tsx';
import {
  box,
  collectErrors,
  keyboard,
  mouse,
  nextFrames,
  passTime,
  shown,
  stopTimers,
  waitOnRealTime,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

async function openTooltips(search?: string) {
  await page.viewport(1360, 720);
  mount(fixture, { search });
  await document.fonts.load('1em "envUI Geist"');
  await document.fonts.load('500 1em "envUI Geist"');
  await document.fonts.ready;
}

const tooltips = () =>
  page
    .getByRole('tooltip')
    .elements()
    .map((tooltip) => tooltip.textContent);
const tooltipIs = (text: string) => expect.poll(tooltips).toEqual([text]);
const noTooltip = () => expect.poll(tooltips).toEqual([]);
const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isGone = (locator: Locator) => expect.poll(() => locator.elements().length).toBe(0);
const focus = (locator: Locator) => (locator.element() as HTMLElement).focus();
const leave = () => mouse.move(1, 1);
const pastOpening = async () => {
  await waitOnRealTime(0);
  await nextFrames();
};
const button = (name: string) => page.getByRole('button', { name, exact: true });

describe('Tooltip', () => {
  describe('in the tooltip fixture', () => {
    beforeEach(async () => {
      await openTooltips();
    });

    test('a controlled tooltip opens from the application, lines up by align and says why it closes', async () => {
      const control = button('Filter tour');
      await button('Tour step').click();
      await tooltipIs('Filters live here');
      const [own, popup] = [box(control), box(page.getByRole('tooltip'))];
      expect(Math.abs(popup.x - own.x)).toBeLessThanOrEqual(1);
      expect(popup.y).toBeGreaterThan(own.y);
      focus(control);
      await keyboard.press('Escape');
      await noTooltip();
      expect(page.getByTestId('tour-reasons').element().textContent).toContain('close escape-key');
    });

    test('describes a named control while open, and adds nothing that repeats its name', async () => {
      const archive = button('Archive');
      await expect.element(archive).not.toHaveAttribute('aria-describedby');
      await archive.hover();
      await tooltipIs('Moves it out of the list');
      await expect.element(archive).toHaveAccessibleDescription('Moves it out of the list');
      await leave();
      await noTooltip();
      await expect.element(archive).not.toHaveAttribute('aria-describedby');

      const archiveAll = button('Archive A');
      await archiveAll.hover();
      await tooltipIs('Moves every item out of the list');
      await expect
        .element(archiveAll)
        .toHaveAccessibleDescription('Moves every item out of the list');
      await leave();
      await noTooltip();

      for (const [name, description] of [
        ['Rename file', 'Gives the file a new name'],
        ['Badge button', 'Shows the badge'],
      ] as const) {
        const control = button(name);
        await control.hover();
        await tooltipIs(description);
        await expect.element(control).toHaveAccessibleDescription(description);
        await leave();
        await noTooltip();
      }

      const remove = page.getByRole('button', { name: 'Delete' });
      await remove.hover();
      await tooltipIs('Delete');
      await expect.element(remove).not.toHaveAttribute('aria-describedby');
    });

    test('reads the name as assistive technology does, and follows it while open', async () => {
      const exportButton = button('Export');
      await exportButton.hover();
      await tooltipIs('Export');
      await expect.element(exportButton).not.toHaveAttribute('aria-describedby');
      await leave();
      await noTooltip();
      const copy = page.getByRole('button', { name: 'Copy link' });
      focus(copy);
      await tooltipIs('Copy link');
      await expect.element(copy).not.toHaveAttribute('aria-describedby');
      await keyboard.press('c');
      await tooltipIs('Copied');
      const copied = page.getByRole('button', { name: 'Copied' });
      await expect.element(copied).toHaveAccessibleName('Copied');
      await expect.element(copied).not.toHaveAttribute('aria-describedby');
    });

    test("a disabled control's stand-in isn't read again on each render of the page", async () => {
      const pin = button('Pin');
      await expect.element(pin).toHaveAttribute('aria-pressed', 'true');
      let watched = 0;
      const observe = MutationObserver.prototype.observe;
      MutationObserver.prototype.observe = function (target, options) {
        if (
          target instanceof Element &&
          target.closest(
            '.env-tooltip-disabled-target:is([aria-label="Pin"], [aria-label="Billing"])',
          )
        )
          watched += 1;
        return observe.call(this, target, options);
      };
      try {
        await button('Toggle seats').click();
        await expect.element(button('Invite member')).toBeEnabled();
        await button('Toggle seats').click();
        await expect.element(button('Invite member')).toHaveAttribute('aria-disabled', 'true');
        expect(watched).toBe(0);
      } finally {
        MutationObserver.prototype.observe = observe;
      }
      await button('Toggle pinned').click();
      await expect.element(pin).toHaveAttribute('aria-pressed', 'false');
    });

    test('a disabled control is one named, disabled tab stop that opens its tooltip, with valid ARIA and its name kept', async () => {
      const invite = button('Invite member');
      expect(invite.elements()).toHaveLength(1);
      await expect.element(invite).toHaveClass('env-tooltip-disabled-target', { exact: true });
      await expect.element(invite).toHaveAttribute('aria-disabled', 'true');
      await expect.element(invite).toHaveAttribute('tabindex', '0');
      focus(invite);
      await tooltipIs('No seats left');
      await expect.element(invite).toHaveAccessibleDescription('No seats left');
      await keyboard.press('Escape');
      await noTooltip();

      const billing = page.getByRole('link', { name: 'Billing' });
      expect(billing.elements()).toHaveLength(1);
      await expect.element(billing).toHaveClass('env-tooltip-disabled-target', { exact: true });
      await expect.element(billing).toHaveAttribute('aria-disabled', 'true');

      const pin = button('Pin');
      expect(pin.elements()).toHaveLength(1);
      await expect.element(pin).toHaveClass('env-tooltip-disabled-target', { exact: true });
      await expect.element(pin).toHaveAttribute('aria-disabled', 'true');
      await expect.element(pin).toHaveAttribute('aria-pressed', 'true');
      const roles = [...document.querySelectorAll('.env-tooltip-disabled-target')].map((wrapper) =>
        wrapper.getAttribute('role'),
      );
      expect(roles.length).toBeGreaterThan(0);
      for (const role of roles) expect([null, 'button', 'link', 'tab', 'menuitem']).toContain(role);
      const notify = page.getByRole('checkbox', { name: 'Notify owners' });
      expect(notify.elements()).toHaveLength(1);
      await expect.element(notify).toBeChecked();
      await expect.element(notify).toBeDisabled();
      const wrapper = page.elementLocator(
        notify.element().closest('.env-tooltip-disabled-target')!,
      );
      await expect.element(wrapper).not.toHaveAttribute('role');
      await expect.element(wrapper).not.toHaveAttribute('tabindex');
      await wrapper.hover();
      await tooltipIs('Owners are always notified');
      await leave();
      await noTooltip();

      const archiveAll = button('Archive all B');
      await expect.element(archiveAll).toHaveClass('env-tooltip-disabled-target', { exact: true });
      await expect.element(archiveAll).toHaveAttribute('aria-disabled', 'true');
      let mutations = 0;
      const observer = new MutationObserver((records) => (mutations += records.length));
      observer.observe(archiveAll.element(), { attributes: true, subtree: true, childList: true });
      for (let frame = 0; frame < 15; frame++) await nextFrames();
      observer.disconnect();
      expect(mutations).toBeLessThan(10);
      focus(archiveAll);
      await tooltipIs('Nothing to archive');
      await expect.element(archiveAll).toHaveAccessibleDescription('Nothing to archive');

      await button('Toggle seats').click();
      await expect.element(invite).toBeEnabled();
      await expect.element(invite).not.toHaveClass('env-tooltip-disabled-target');
    });

    test(
      'in right-to-left text, inline-end opens tooltips and popovers to the left of the trigger',
      { tags: ['engines'] },
      async () => {
        const forward = button('Forward');
        await forward.hover();
        await tooltipIs('Next step');
        const tooltip = page.getByRole('tooltip');
        expect(tooltip.element().closest('[dir]')!.getAttribute('dir')).toBe('rtl');
        const endsLeftOf = (popup: Locator, trigger: Locator) => () =>
          box(popup).x + box(popup).width <= box(trigger).x + 1;
        await expect.poll(endsLeftOf(tooltip, forward)).toBe(true);
        await leave();

        const details = button('Details rtl');
        await details.click();
        const popover = page.getByRole('dialog', { name: 'Step details' });
        await isShown(popover);
        await expect.poll(endsLeftOf(popover, details)).toBe(true);
      },
    );

    test('names an icon-only menu trigger, which keeps its menu, ARIA and focus', async () => {
      const more = button('More actions');
      const menu = page.getByRole('menu', { name: 'Row actions' });
      const counts = () => page.getByTestId('overlay-counts').element().textContent;
      await expect.element(more).toHaveAttribute('aria-haspopup', 'menu');
      await expect.element(more).not.toHaveAttribute('aria-expanded', 'true');

      await more.hover();
      await tooltipIs('More actions');
      await expect.element(more).not.toHaveAttribute('aria-describedby');

      await more.click();
      await isShown(menu);
      await noTooltip();
      await expect.element(more).toHaveAttribute('aria-expanded', 'true');
      await expect.element(more).toHaveAttribute('aria-controls', menu.element().id);
      expect(counts()).toBe('1 presses, 1 menu opens, 0 popover opens');
      const [trigger, popup] = [box(more), box(menu)];
      expect(popup.y).toBeGreaterThanOrEqual(trigger.y + trigger.height - 1);
      await leave();
      await more.hover();
      await pastOpening();
      expect(shown(menu)).toBe(true);
      expect(tooltips()).toEqual([]);

      await keyboard.press('Escape');
      await isGone(menu);
      await expect.element(more).toHaveFocus();
      await expect.element(more).toHaveAttribute('aria-expanded', 'false');
      await pastOpening();
      expect(tooltips()).toEqual([]);
      await leave();
      await more.hover();
      await tooltipIs('More actions');
      await leave();
      await noTooltip();

      focus(button('Filters'));
      await keyboard.press('Shift+Tab');
      await expect.element(more).toHaveFocus();
      await isShown(page.getByRole('tooltip', { name: 'More actions' }));
      await keyboard.press('Enter');
      await isShown(menu);
      await expect.element(page.getByRole('menuitem', { name: 'Rename' })).toHaveFocus();
      await noTooltip();
      await keyboard.press('Escape');
      await isGone(menu);
      await expect.element(more).toHaveFocus();
      expect(counts()).toBe('2 presses, 2 menu opens, 0 popover opens');
    });

    test('around a popover, describes its named icon-only trigger, which keeps its popover, and opens on focus once a click outside closed it', async () => {
      const filters = button('Filters');
      const popover = page.getByRole('dialog', { name: 'Filters' });
      await expect.element(filters).toHaveAttribute('aria-haspopup', 'dialog');
      await expect.element(filters).toHaveAttribute('aria-expanded', 'false');

      await filters.hover();
      await tooltipIs('Show only some items');
      await expect.element(filters).toHaveAccessibleName('Filters');
      await expect.element(filters).toHaveAccessibleDescription('Show only some items');

      await filters.click();
      await isShown(popover);
      await noTooltip();
      await expect.element(filters).toHaveAttribute('aria-expanded', 'true');
      await expect.element(filters).toHaveAttribute('aria-controls', popover.element().id);
      expect(page.getByTestId('overlay-counts').element().textContent).toBe(
        '0 presses, 0 menu opens, 1 popover opens',
      );
      await expect.element(popover.getByRole('button', { name: 'Only open items' })).toHaveFocus();
      await leave();
      await filters.hover();
      await pastOpening();
      expect(shown(popover)).toBe(true);
      expect(tooltips()).toEqual([]);

      await keyboard.press('Escape');
      await isGone(popover);
      await expect.element(filters).toHaveFocus();
      await expect.element(filters).toHaveAttribute('aria-expanded', 'false');
      await pastOpening();
      expect(tooltips()).toEqual([]);

      await leave();
      focus(button('More actions'));
      await keyboard.press('Tab');
      await expect.element(filters).toHaveFocus();
      await isShown(page.getByRole('tooltip', { name: 'Show only some items' }));
      await keyboard.press('Enter');
      await isShown(popover);
      await noTooltip();
      await keyboard.press('Escape');
      await isGone(popover);
      await expect.element(filters).toHaveFocus();

      const archive = button('Archive');
      await filters.click();
      await isShown(popover);
      await archive.click();
      await isGone(popover);
      (archive.element() as HTMLElement).focus();
      await leave();
      (filters.element() as HTMLElement).focus({ focusVisible: true } as FocusOptions);
      await isShown(page.getByRole('tooltip', { name: 'Show only some items' }));
    });

    test('a tooltip stays open while the pointer moves onto it', async () => {
      await button('Archive').hover();
      await tooltipIs('Moves it out of the list');
      const positioner = document.querySelector('.env-tooltip-positioner')!;
      expect(getComputedStyle(positioner).pointerEvents).not.toBe('none');
      const popup = box(document.querySelector('.env-tooltip')!);
      await mouse.move(popup.x + popup.width / 2, popup.y + popup.height / 2, { steps: 4 });
      stopTimers();
      await passTime(600);
      expect(tooltips()).toEqual(['Moves it out of the list']);
      vi.useRealTimers();
      await mouse.move(0, 0);
      await noTooltip();
    });

    test('a tap opens the menu or popover and no tooltip', async () => {
      await commands.emulateTouch(true);
      try {
        const tap = async (locator: Locator) => {
          const target = box(locator);
          await commands.touch(
            'touchStart',
            target.x + target.width / 2,
            target.y + target.height / 2,
          );
          await commands.touch('touchEnd');
        };
        await tap(button('More actions'));
        await isShown(page.getByRole('menu', { name: 'Row actions' }));
        expect(page.getByTestId('overlay-counts').element().textContent).toBe(
          '1 presses, 1 menu opens, 0 popover opens',
        );
        expect(tooltips()).toEqual([]);
        await keyboard.press('Escape');
        await isGone(page.getByRole('menu'));

        await tap(button('Filters'));
        await isShown(page.getByRole('dialog', { name: 'Filters' }));
        await pastOpening();
        expect(tooltips()).toEqual([]);
      } finally {
        await commands.emulateTouch(false);
      }
    });
  });

  test(
    'around a HoverCard, or as its trigger, shows no tooltip but the card, and says while developing what a Tooltip cannot do',
    { tags: ['once'] },
    async () => {
      const errors = collectErrors();
      await openTooltips('warnings');
      for (const [name, card] of [
        ['Ada Lovelace', 'Ada card'],
        ['Alan Turing', 'Alan card'],
      ] as const) {
        await page.getByRole('link', { name }).hover();
        await isShown(page.getByText(card));
        await pastOpening();
        expect(tooltips()).toEqual([]);
        await leave();
        await isGone(page.getByText(card));
      }
      expect(document.body.textContent).toContain('Plain text');
      await expect.element(button('In a fragment')).toBeInTheDocument();
      await expect.element(button('Ref-less')).toBeInTheDocument();
      const reports = errors.filter((error) => error.startsWith('envUI: A Tooltip'));
      expect(reports).toHaveLength(4);
      const all = reports.join(' ');
      expect(all).toContain('it got string');
      expect(all).toContain('it got a Fragment');
      expect(all).toContain("child, RefLessButton, doesn't pass the ref");
      expect(all).toContain('around a HoverCard');
    },
  );

  test('Tooltip keeps opening on hover after its control is enabled or disabled', async () => {
    mount(adoption);
    const invite = button('Invite member');
    const toggle = button('Toggle seats');
    const texts = () =>
      [...document.querySelectorAll('.env-tooltip')].map((tooltip) => tooltip.textContent);
    await toggle.click();
    await expect.element(invite).toBeDisabled();
    await expect.element(invite).toHaveClass('env-tooltip-disabled-target', { exact: true });
    await invite.hover();
    await expect.poll(texts).toEqual(['No seats left']);
    await leave();
    await expect.poll(texts).toEqual([]);
    await toggle.click();
    await expect.element(invite).toBeEnabled();
    await invite.hover();
    await expect.poll(texts).toEqual(['Invite a member']);
  });
});
