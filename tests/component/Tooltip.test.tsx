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
} from './Browser.ts';
import { mount } from './Mount.tsx';

/**
 * Opens the fixture once its web fonts are in, the medium weight of the buttons' labels included:
 * a font that arrives later moves the triggers from under the pointer, as on a busy machine.
 * Wide enough that the fixture's first row holds every trigger up to the right-to-left ones, so a
 * popover has room at their end, and the menu and popover triggers below sit under no text.
 */
async function openTooltips(search?: string) {
  await page.viewport(1360, 720);
  mount(fixture, { search });
  await document.fonts.load('1em "envUI Geist"');
  await document.fonts.load('500 1em "envUI Geist"');
  await document.fonts.ready;
}

/** The texts of the tooltips in the page. */
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
/**
 * Waits past a tooltip's delay of 0 and the frames it would render in, where a test proves that
 * none opens meanwhile: a timer runs after those of the same delay set before it.
 */
const pastOpening = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
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
      // align="start" lines its start up with the control's, below it.
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

      // A control named by mixed content counts as named, read from the page as the tooltip opens.
      const archiveAll = button('Archive A');
      await archiveAll.hover();
      await tooltipIs('Moves every item out of the list');
      await expect
        .element(archiveAll)
        .toHaveAccessibleDescription('Moves every item out of the list');
      await leave();
      await noTooltip();

      // So does one a hidden label that aria-labelledby references names, and a control of the
      // application's own that takes a trigger prop.
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
      // Text hidden from assistive technology is no part of the name the tooltip repeats.
      const exportButton = button('Export');
      await exportButton.hover();
      await tooltipIs('Export');
      await expect.element(exportButton).not.toHaveAttribute('aria-describedby');
      await leave();
      await noTooltip();
      // A name that changes with the tooltip while it is open still counts as its words.
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
      // Counts what starts watching the stand-ins of the disabled toggle and link.
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
        // Renders the whole page, the two disabled controls unchanged.
        await button('Toggle seats').click();
        await expect.element(button('Invite member')).toBeEnabled();
        await button('Toggle seats').click();
        await expect.element(button('Invite member')).toHaveAttribute('aria-disabled', 'true');
        expect(watched).toBe(0);
      } finally {
        MutationObserver.prototype.observe = observe;
      }
      // The stand-in still follows its control's state.
      await button('Toggle pinned').click();
      await expect.element(pin).toHaveAttribute('aria-pressed', 'false');
    });

    test('a disabled control is one named, disabled tab stop that opens its tooltip, with valid ARIA and its name kept', async () => {
      const invite = button('Invite member');
      // One control for assistive technology: the wrapper, which carries the name and the state.
      expect(invite.elements()).toHaveLength(1);
      await expect.element(invite).toHaveClass('env-tooltip-disabled-target', { exact: true });
      await expect.element(invite).toHaveAttribute('aria-disabled', 'true');
      await expect.element(invite).toHaveAttribute('tabindex', '0');
      focus(invite);
      await tooltipIs('No seats left');
      await expect.element(invite).toHaveAccessibleDescription('No seats left');
      await keyboard.press('Escape');
      await noTooltip();

      // The wrapper takes the role of what it wraps, such as a link.
      const billing = page.getByRole('link', { name: 'Billing' });
      expect(billing.elements()).toHaveLength(1);
      await expect.element(billing).toHaveClass('env-tooltip-disabled-target', { exact: true });
      await expect.element(billing).toHaveAttribute('aria-disabled', 'true');

      // A disabled toggle's wrapper stands in as the button, pressed. With the wrappers rendered,
      // none takes a role that needs a state it lacks, such as a checkbox without aria-checked.
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
      // A disabled checkbox has no stand-in: the checkbox itself stays exposed, checked and
      // disabled, and its wrapper is no tab stop.
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

      // The stand-in hides the control it names by mixed content; the name, read from the hidden
      // control, stays, with no render loop.
      const archiveAll = button('Archive all B');
      await expect.element(archiveAll).toHaveClass('env-tooltip-disabled-target', { exact: true });
      await expect.element(archiveAll).toHaveAttribute('aria-disabled', 'true');
      let mutations = 0;
      const observer = new MutationObserver((records) => (mutations += records.length));
      observer.observe(archiveAll.element(), { attributes: true, subtree: true, childList: true });
      // Thirty frames, each of which a loop would render in.
      for (let frame = 0; frame < 15; frame++) await nextFrames();
      observer.disconnect();
      expect(mutations).toBeLessThan(10);
      focus(archiveAll);
      await tooltipIs('Nothing to archive');
      await expect.element(archiveAll).toHaveAccessibleDescription('Nothing to archive');

      // Enabled, the control itself is the trigger again.
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
      // The menu button's props and ref reach the button through the Tooltip.
      await expect.element(more).toHaveAttribute('aria-haspopup', 'menu');
      await expect.element(more).not.toHaveAttribute('aria-expanded', 'true');

      // Hover: the tooltip shows the button's name, so it describes nothing.
      await more.hover();
      await tooltipIs('More actions');
      await expect.element(more).not.toHaveAttribute('aria-describedby');

      // A press opens the menu once and closes the tooltip, which stays closed while the menu is
      // open.
      await more.click();
      await isShown(menu);
      await noTooltip();
      await expect.element(more).toHaveAttribute('aria-expanded', 'true');
      await expect.element(more).toHaveAttribute('aria-controls', menu.element().id);
      expect(counts()).toBe('1 presses, 1 menu opens, 0 popover opens');
      // The menu opens beside the button, which the Tooltip's ref reached.
      const [trigger, popup] = [box(more), box(menu)];
      expect(popup.y).toBeGreaterThanOrEqual(trigger.y + trigger.height - 1);
      // The pointer leaving and coming back onto the button opens no tooltip while the menu is
      // open.
      await leave();
      await more.hover();
      await pastOpening();
      expect(shown(menu)).toBe(true);
      expect(tooltips()).toEqual([]);

      // Esc closes the menu first and returns focus to the button, which opens no tooltip: one Esc.
      await keyboard.press('Escape');
      await isGone(menu);
      await expect.element(more).toHaveFocus();
      await expect.element(more).toHaveAttribute('aria-expanded', 'false');
      await pastOpening();
      expect(tooltips()).toEqual([]);
      // The pointer coming back onto the button opens it again.
      await leave();
      await more.hover();
      await tooltipIs('More actions');
      await leave();
      await noTooltip();

      // Keyboard: focus opens the tooltip at once; Enter opens the menu in its place, Esc closes
      // the menu and focus returns to the button.
      focus(button('Filters'));
      await keyboard.press('Shift+Tab');
      await expect.element(more).toHaveFocus();
      // The Filters tooltip may still be fading out.
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

      // Its own name stays; the tooltip describes it while open.
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
      // The pointer leaving and coming back onto the button opens no tooltip while the popover
      // is open.
      await leave();
      await filters.hover();
      await pastOpening();
      expect(shown(popover)).toBe(true);
      expect(tooltips()).toEqual([]);

      // Esc closes the popover first and returns focus to the button, which opens no tooltip.
      await keyboard.press('Escape');
      await isGone(popover);
      await expect.element(filters).toHaveFocus();
      await expect.element(filters).toHaveAttribute('aria-expanded', 'false');
      await pastOpening();
      expect(tooltips()).toEqual([]);

      // Focus from the keyboard opens the tooltip; Enter opens the popover in its place.
      await leave();
      focus(button('More actions'));
      await keyboard.press('Tab');
      await expect.element(filters).toHaveFocus();
      // The More actions tooltip may still be fading out.
      await isShown(page.getByRole('tooltip', { name: 'Show only some items' }));
      await keyboard.press('Enter');
      await isShown(popover);
      await noTooltip();
      await keyboard.press('Escape');
      await isGone(popover);
      await expect.element(filters).toHaveFocus();

      // Once a click outside closes the popover and moves focus away, focus on its trigger opens
      // the tooltip.
      const archive = button('Archive');
      await filters.click();
      await isShown(popover);
      await archive.click();
      await isGone(popover);
      // WebKit doesn't focus a button it clicks, and returns focus to the trigger instead.
      (archive.element() as HTMLElement).focus();
      await leave();
      // Focus from code, as an application gives it, rather than the popover's returning focus.
      (filters.element() as HTMLElement).focus({ focusVisible: true } as FocusOptions);
      await isShown(page.getByRole('tooltip', { name: 'Show only some items' }));
    });

    test('a tooltip stays open while the pointer moves onto it', async () => {
      await button('Archive').hover();
      await tooltipIs('Moves it out of the list');
      const positioner = document.querySelector('.env-tooltip-positioner')!;
      expect(getComputedStyle(positioner).pointerEvents).not.toBe('none');
      // Hovering the tooltip itself keeps it, so its text can be read or magnified (WCAG 1.4.13):
      // past the tooltip's closing delay, it is still open.
      const popup = box(document.querySelector('.env-tooltip')!);
      await mouse.move(popup.x + popup.width / 2, popup.y + popup.height / 2, { steps: 4 });
      stopTimers();
      await passTime(600);
      expect(tooltips()).toEqual(['Moves it out of the list']);
      vi.useRealTimers();
      await mouse.move(0, 0);
      await noTooltip();
    });

    // In Chromium alone: the other engines' pages take no touch input here.
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

  test('around a HoverCard, or as its trigger, shows no tooltip but the card, and says while developing what a Tooltip cannot do', async () => {
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
    // The child that takes no props or ref, as a string, a Fragment or a component that drops the
    // ref, and a Tooltip around a HoverCard, are each reported once.
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
  });

  test('Tooltip keeps opening on hover after its control is enabled or disabled', async () => {
    mount(adoption);
    const invite = button('Invite member');
    const toggle = button('Toggle seats');
    const texts = () =>
      [...document.querySelectorAll('.env-tooltip')].map((tooltip) => tooltip.textContent);
    await toggle.click();
    await expect.element(invite).toBeDisabled();
    // Disabled, the control is the wrapper that carries its name and reports it disabled.
    await expect.element(invite).toHaveClass('env-tooltip-disabled-target', { exact: true });
    await invite.hover();
    await expect.poll(texts).toEqual(['No seats left']);
    await leave();
    await expect.poll(texts).toEqual([]);
    // Enabled again, the control itself is the trigger, and hovering it opens the tooltip.
    await toggle.click();
    await expect.element(invite).toBeEnabled();
    await invite.hover();
    await expect.poll(texts).toEqual(['Invite a member']);
  });
});
