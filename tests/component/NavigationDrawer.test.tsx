import { describe, expect, test } from 'vitest';
import { page, server, type Locator } from 'vitest/browser';
import * as resizable from '../fixture/NavigationDrawer.fixture.tsx';
import * as nested from '../fixture/NavigationDrawerNested.fixture.tsx';
import { box, css, keyboard, mouse, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

const widthOf = (drawer: Locator) => box(drawer).width;
const focus = (target: Locator) => (target.element() as HTMLElement).focus();
const text = (testId: string) => () => page.getByTestId(testId).element().textContent;
const tooltip = page.getByRole('tooltip');
const tooltipText = () => tooltip.query()?.textContent ?? null;

describe('Drawer resizable', () => {
  test('resizes with the arrow keys, Home and End, and a double click resets it, from its end edge in either direction', async () => {
    mount(resizable);
    const drawer = page.getByRole('navigation', { name: 'Own width' });
    const handle = drawer.getByRole('separator', { name: 'Resize navigation' });
    await expect.element(handle).toHaveAttribute('aria-orientation', 'vertical');
    await expect.element(handle).toHaveAttribute('aria-valuemin', '15');
    await expect.element(handle).toHaveAttribute('aria-valuemax', '30');
    await expect.element(handle).toHaveAttribute('aria-valuetext', '17.5 rem');
    // The value keeps its fraction, as its text does.
    await expect.element(handle).toHaveAttribute('aria-valuenow', '17.5');
    // It starts at the default width, set in the markup, and its handle is on its end edge.
    expect(widthOf(drawer)).toBeCloseTo(17.5 * 16, 0);
    const drawerBox = box(drawer);
    const handleBox = box(handle);
    expect(handleBox.x + handleBox.width).toBeCloseTo(drawerBox.x + drawerBox.width, 0);
    expect(handleBox.height).toBeCloseTo(drawerBox.height, 0);
    // The same handle as between Panes, as wide as the drawer's padding: a grip of three dots at
    // its middle, never a line, and focus rings it.
    expect(handle.element().hasAttribute('data-grip')).toBe(true);
    expect(css(handle, 'background-image', '::after').match(/radial-gradient/g)).toHaveLength(3);
    expect(parseFloat(css(handle, 'height', '::after'))).toBeLessThan(20);
    expect(handleBox.width).toBeCloseTo(12, 0);

    focus(handle);
    expect(css(handle, 'outline-style')).toBe('solid');
    await keyboard.press('ArrowRight');
    await expect.element(handle).toHaveAttribute('aria-valuetext', '18.5 rem');
    expect(widthOf(drawer)).toBeCloseTo(18.5 * 16, 0);
    await keyboard.press('Shift+ArrowLeft');
    await expect.element(handle).toHaveAttribute('aria-valuetext', '15 rem');
    await keyboard.press('End');
    await expect.element(handle).toHaveAttribute('aria-valuetext', '30 rem');
    expect(widthOf(drawer)).toBeCloseTo(30 * 16, 0);
    await keyboard.press('Home');
    await expect.element(handle).toHaveAttribute('aria-valuetext', '15 rem');
    await handle.dblClick();
    await expect.element(handle).toHaveAttribute('aria-valuetext', '17.5 rem');

    // A drawer that isn't resizable has no handle and keeps its own width.
    const fixed = page.getByRole('navigation', { name: 'Fixed' });
    expect(fixed.getByRole('separator').query()).toBeNull();
    expect(fixed.element().hasAttribute('data-resizable')).toBe(false);
    expect(widthOf(fixed)).toBeGreaterThanOrEqual(15 * 16 - 0.5);
    expect(widthOf(fixed)).toBeLessThanOrEqual(20 * 16 + 0.5);

    // In right-to-left text the handle is on the left edge and grows to the left.
    const rtl = page.getByRole('navigation', { name: 'Right to left' });
    const rtlHandle = rtl.getByRole('separator');
    expect(box(rtlHandle).x).toBeCloseTo(box(rtl).x, 0);
    focus(rtlHandle);
    await keyboard.press('ArrowLeft');
    await expect.element(rtlHandle).toHaveAttribute('aria-valuetext', '18.5 rem');
    const at = box(rtlHandle);
    const y = at.y + at.height / 2;
    await mouse.move(at.x + at.width / 2, y);
    await mouse.down();
    await mouse.move(at.x + at.width / 2 - 16, y, { steps: 2 });
    await mouse.up();
    await expect.element(rtlHandle).toHaveAttribute('aria-valuetext', '19.5 rem');
  });

  test(
    'follows the pointer, reports the width to the application and keeps to half its container',
    { tags: ['engines'] },
    async () => {
      mount(resizable);
      const drawer = page.getByRole('navigation', { name: 'Controlled' });
      const handle = drawer.getByRole('separator', { name: 'Resize mail' });
      await expect.element(handle).toHaveAttribute('aria-valuetext', '20 rem');
      // Its largest value is what its container's half allows, under its largest width.
      await expect.element(handle).toHaveAttribute('aria-valuemax', '24');
      handle.element().scrollIntoView({ block: 'center' });
      const at = box(handle);
      const y = at.y + at.height / 2;
      await mouse.move(at.x + at.width / 2, y);
      await mouse.down();
      await mouse.move(at.x + at.width / 2 - 32, y, { steps: 4 });
      await expect.element(handle).toHaveAttribute('data-resizing', '');
      // While dragging, the application hears each width, uncommitted.
      await expect.poll(text('width')).toBe('18');
      expect(text('committed')()).toBe('');
      expect(widthOf(drawer)).toBeCloseTo(18 * 16, 0);
      // Its container is 48 rem wide, so it stops at 24 rem, under its largest width.
      await mouse.move(at.x + at.width / 2 + 400, y, { steps: 4 });
      await expect.poll(text('width')).toBe('24');
      await mouse.up();
      await expect.poll(text('committed')).toBe('24');
      await expect.element(handle).not.toHaveAttribute('data-resizing');
      expect(widthOf(drawer)).toBeCloseTo(24 * 16, 0);
    },
  );

  test(
    'keeps each label and heading on one line, and shows a label cut short in a tooltip and a heading in its title',
    { tags: ['engines'] },
    async () => {
      mount(resizable);
      const drawer = page.getByRole('navigation', { name: 'Long labels' });
      const item = drawer.getByRole('link', { name: 'Reviews waiting for the whole team' });
      const label = item.element().querySelector('.env-navigation-drawer-label')!;
      const heading = drawer.element().querySelector('.env-navigation-drawer-group-label')!;
      const isCut = (element: Element) => element.scrollWidth > element.clientWidth;
      // Wide enough, nothing is cut and no tooltip opens.
      const height = box(item).height;
      expect(isCut(label)).toBe(false);
      expect(heading.hasAttribute('title')).toBe(false);
      await item.hover();
      await expect.poll(tooltipText).toBeNull();
      // Narrowed, the label and heading end in an ellipsis on one line, and the item keeps its
      // height.
      const handle = drawer.getByRole('separator');
      focus(handle);
      await keyboard.press('Home');
      await expect.element(handle).toHaveAttribute('aria-valuetext', '10 rem');
      await expect.poll(() => isCut(label)).toBe(true);
      expect(isCut(heading)).toBe(true);
      for (const element of [label, heading]) {
        expect(css(element, 'text-overflow')).toBe('ellipsis');
        expect(css(element, 'white-space')).toBe('nowrap');
      }
      expect(box(item).height).toBeCloseTo(height, 0);
      // A heading cut short gives its full text as its title, as it takes no focus for a tooltip.
      await expect.poll(() => heading.getAttribute('title')).toBe(heading.textContent);
      // The full label shows in a tooltip, on hover and on keyboard focus, and names nothing new.
      // The label is cut before the drawer has measured it so, later under load: the hover waits
      // for its tooltip to be on, and comes in afresh, as the pointer resting on the item since the
      // first hover would open nothing.
      await expect.element(item).not.toHaveAttribute('data-trigger-disabled');
      await mouse.move(0, 0);
      await item.hover();
      await expect.poll(tooltipText).toBe('Reviews waiting for the whole team');
      await mouse.move(0, 0);
      await expect.poll(tooltipText).toBeNull();
      focus(item);
      await expect.poll(tooltipText).toBe('Reviews waiting for the whole team');
      await expect.element(item).toHaveAccessibleName('Reviews waiting for the whole team');
      // A label that isn't cut, Inbox, opens none.
      focus(handle);
      await expect.poll(tooltipText).toBeNull();
      await drawer.getByRole('link', { name: 'Inbox' }).hover();
      await expect.poll(tooltipText).toBeNull();
    },
  );
});

/**
 * Whether a destination is in a closed section: its section is hidden until found. In a browser
 * that knows hidden="until-found" the link is hidden; WebKit skips the section's content instead,
 * so the section itself is checked: hidden, and its content not rendered.
 */
function closed(link: Element) {
  const section = link.closest('.env-navigation-drawer-children');
  if (!section?.hasAttribute('hidden')) return false;
  const style = getComputedStyle(section);
  return style.display === 'none' || style.getPropertyValue('content-visibility') === 'hidden';
}
const linkTo = (drawer: Locator, href: string) =>
  drawer.element().querySelector(`a[href="${href}"]`)!;

describe('Drawer nested sections', () => {
  test(
    'a section opens and closes from its button, by pointer and keyboard, and its chevron flips',
    { tags: ['engines'] },
    async () => {
      // WebKit's Tab reaches only fields, as Safari's does by default; Alt+Tab reaches its buttons.
      const tab = server.browser === 'webkit' ? 'Alt+Tab' : 'Tab';
      mount(nested);
      const drawer = page.getByRole('navigation', { name: 'Guide' });
      // Nested destinations sit in, indented, and a closed section's links stay in the page,
      // hidden until found.
      const signIn = drawer.getByRole('link', { name: 'Sign-in', exact: true });
      const passkeys = drawer.getByRole('link', { name: 'Passkeys' });
      expect(shown(passkeys)).toBe(true);
      expect(box(passkeys).x - box(signIn).x).toBeGreaterThan(8);
      expect(linkTo(drawer, '#invoices').closest('ul')!.getAttribute('hidden')).toBe('until-found');
      expect(closed(linkTo(drawer, '#invoices'))).toBe(true);

      const billing = drawer.getByRole('button', { name: 'Billing', exact: true });
      const chevron = billing.element().querySelector('.env-navigation-drawer-chevron')!;
      const transform = () => css(chevron, 'transform');
      // Closed, the chevron points down, and it flips over to point up as Select's does.
      const closedTransform = transform();
      await billing.click();
      await expect.element(billing).toHaveAttribute('aria-expanded', 'true');
      await expect.poll(() => shown(drawer.getByRole('link', { name: 'Plans' }))).toBe(true);
      await expect.poll(transform).not.toBe(closedTransform);
      await billing.click();
      await expect.element(billing).toHaveAttribute('aria-expanded', 'false');
      await expect.poll(() => closed(linkTo(drawer, '#plans'))).toBe(true);
      await expect.poll(transform).toBe(closedTransform);
      // Keyboard: the section's link, its button, then its open destinations, each a tab stop.
      const signInButton = drawer.getByRole('button', { name: 'Sign-in contents' });
      const passwords = drawer.getByRole('link', { name: 'Passwords' });
      focus(signIn);
      await keyboard.press(tab);
      await expect.element(signInButton).toHaveFocus();
      // WebKit's Tab never reaches a link, even with Alt, so there only the buttons are checked.
      if (server.browser !== 'webkit') {
        await keyboard.press(tab);
        await expect.element(passwords).toHaveFocus();
        await keyboard.press(`Shift+${tab}`);
      }
      await keyboard.press('Enter');
      await expect.element(signInButton).toHaveAttribute('aria-expanded', 'false');
      await expect.poll(() => closed(linkTo(drawer, '#passwords'))).toBe(true);
      // Closed, Tab passes its destinations by.
      await keyboard.press(tab);
      await expect.element(billing).toHaveFocus();
      await keyboard.press('Space');
      await expect.element(billing).toHaveAttribute('aria-expanded', 'true');
      // The button's focus ring stays inside it, clear of the link's label.
      focus(signInButton);
      expect({
        width: css(signInButton, 'outline-width'),
        offset: css(signInButton, 'outline-offset'),
      }).toEqual({
        width: '2px',
        offset: '-2px',
      });
      const label = box(signIn.element().querySelector('.env-navigation-drawer-label')!);
      expect(label.x + label.width).toBeLessThanOrEqual(box(signInButton).x);
    },
  );

  test('a section opens as the current page moves into it, the drawer’s own or the application’s', async () => {
    mount(nested);
    const own = page.getByRole('navigation', { name: 'Guide' });
    await page.getByRole('button', { name: 'Go to invoices' }).click();
    await expect
      .element(own.getByRole('button', { name: 'Billing', exact: true }))
      .toHaveAttribute('aria-expanded', 'true');
    await expect
      .element(own.getByRole('link', { name: 'Invoices' }))
      .toHaveAttribute('aria-current', 'page');
    // The sections opened before stay open.
    await expect
      .element(own.getByRole('button', { name: 'Sign-in contents' }))
      .toHaveAttribute('aria-expanded', 'true');
    // The application's: onExpandedChange asks for the sections, two levels deep.
    const controlled = page.getByRole('navigation', { name: 'Controlled' });
    expect(text('expanded')()).toBe('');
    await page.getByRole('button', { name: 'Go to retries' }).click();
    await expect.poll(text('expanded')).toBe('Integrations, #webhooks');
    await expect.poll(() => shown(controlled.getByRole('link', { name: 'Retries' }))).toBe(true);
    await controlled.getByRole('button', { name: 'Integrations', exact: true }).click();
    await expect.poll(text('expanded')).toBe('#webhooks');
    await expect.poll(() => closed(linkTo(controlled, '#webhooks'))).toBe(true);
  });
});
