import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

// The drawer form of tests/fixture/Navigation.tsx, and its resizable and nested drawers.

test("a Drawer destination's badge follows its label at the item's end, and names it with the label", async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const nav = page
    .getByTestId('navigation-light')
    .getByRole('navigation', { name: 'Badged drawer' });
  const reports = nav.getByRole('link', { name: 'Reports New', exact: true });
  const label = (await reports.locator('.env-navigation-drawer-label').boundingBox())!;
  const badge = (await reports.locator('.env-badge').boundingBox())!;
  const item = (await reports.boundingBox())!;
  // After the label, at the item's end, with the item's padding after it.
  expect(badge.x).toBeGreaterThanOrEqual(label.x + label.width);
  expect(item.x + item.width - (badge.x + badge.width)).toBeLessThan(24);
  // With a count, the label and the count name the item, and the badge stands before the count.
  const archive = nav.getByRole('link', { name: 'Archive, 2 new', exact: true });
  expect(await archive.evaluate((element) => element.textContent)).toBe('ArchiveBeta 2');
});

test('Drawer heads each run of a group, and Rail and Bar keep the order without headings', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const scope = page.getByTestId('navigation-light');
  const drawer = scope.getByRole('navigation', { name: 'Mail drawer' });
  await expect(drawer.locator('.env-navigation-drawer-group-label')).toHaveText([
    'Folders',
    'Account',
  ]);
  const folders = drawer.getByRole('list', { name: 'Folders' });
  await expect(folders.getByRole('button')).toHaveText(['Starred', 'Archive']);
  await expect(drawer.getByRole('list', { name: 'Account' }).getByRole('button')).toHaveText([
    'Settings',
  ]);
  const order = ['Inbox', 'Drafts', 'Sent', 'Starred', 'Archive', 'Settings'];
  await expect(drawer.locator('.env-navigation-drawer-label')).toHaveText(order);
  const rail = scope.getByRole('navigation', { name: 'Mail rail' });
  await expect(rail.locator('.env-navigation-rail-label')).toHaveText(order);
  await expect(rail.getByRole('heading')).toHaveCount(0);
  // The drawer's group headings are headings, at level 2 by default.
  await expect(drawer.getByRole('heading', { level: 2 })).toHaveText(['Folders', 'Account']);
  await expect(rail.locator('[class*="heading"]')).toHaveCount(0);
  // The drawer keeps its header and footer, and its list takes the height between.
  const box = (locator: Locator) => locator.evaluate((element) => element.getBoundingClientRect());
  const [nav, footer] = [
    await box(drawer),
    await box(drawer.locator('.env-navigation-drawer-footer')),
  ];
  expect(Math.abs(nav.bottom - footer.bottom)).toBeLessThan(16);
});

test.describe('Drawer resizable', () => {
  const resizable = `${fixtureUrl}/?fixture=resizable-drawers`;
  const widthOf = async (drawer: Locator) => (await drawer.boundingBox())!.width;

  test('resizes with the arrow keys, Home and End, and a double click resets it', async ({
    page,
  }) => {
    await page.goto(resizable);
    const drawer = page.getByRole('navigation', { name: 'Own width' });
    const handle = drawer.getByRole('separator', { name: 'Resize navigation' });
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    await expect(handle).toHaveAttribute('aria-valuemin', '15');
    await expect(handle).toHaveAttribute('aria-valuemax', '30');
    await expect(handle).toHaveAttribute('aria-valuetext', '17.5 rem');
    // The value keeps its fraction, as its text does.
    await expect(handle).toHaveAttribute('aria-valuenow', '17.5');
    // It starts at the default width, set in the markup, and its handle is on its end edge.
    expect(await widthOf(drawer)).toBeCloseTo(17.5 * 16, 0);
    const drawerBox = (await drawer.boundingBox())!;
    const handleBox = (await handle.boundingBox())!;
    expect(handleBox.x + handleBox.width).toBeCloseTo(drawerBox.x + drawerBox.width, 0);
    expect(handleBox.height).toBeCloseTo(drawerBox.height, 0);
    // The same handle as between Panes, as wide as the drawer's padding: a grip of three dots at
    // its middle, never a line, and focus rings it.
    const grip = await handle.evaluate((element) => {
      const after = getComputedStyle(element, '::after');
      return {
        grip: element.hasAttribute('data-grip'),
        dots: after.backgroundImage.match(/radial-gradient/g)?.length,
        length: parseFloat(after.height),
      };
    });
    expect(grip).toMatchObject({ grip: true, dots: 3 });
    expect(grip.length).toBeLessThan(20);
    expect(handleBox.width).toBeCloseTo(12, 0);

    await handle.focus();
    await expect(handle).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuetext', '18.5 rem');
    expect(await widthOf(drawer)).toBeCloseTo(18.5 * 16, 0);
    await page.keyboard.press('Shift+ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuetext', '15 rem');
    await page.keyboard.press('End');
    await expect(handle).toHaveAttribute('aria-valuetext', '30 rem');
    expect(await widthOf(drawer)).toBeCloseTo(30 * 16, 0);
    await page.keyboard.press('Home');
    await expect(handle).toHaveAttribute('aria-valuetext', '15 rem');
    await handle.dblclick();
    await expect(handle).toHaveAttribute('aria-valuetext', '17.5 rem');

    // A drawer that isn't resizable has no handle and keeps its own width.
    const fixed = page.getByRole('navigation', { name: 'Fixed' });
    await expect(fixed.getByRole('separator')).toHaveCount(0);
    await expect(fixed).not.toHaveAttribute('data-resizable');
    const fixedWidth = await widthOf(fixed);
    expect(fixedWidth).toBeGreaterThanOrEqual(15 * 16 - 0.5);
    expect(fixedWidth).toBeLessThanOrEqual(20 * 16 + 0.5);
  });

  test(
    'follows the pointer, reports the width to the application and keeps to half its container',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(resizable);
      const drawer = page.getByRole('navigation', { name: 'Controlled' });
      const handle = drawer.getByRole('separator', { name: 'Resize mail' });
      await expect(handle).toHaveAttribute('aria-valuetext', '20 rem');
      // Its largest value is what its container's half allows, under its largest width.
      await expect(handle).toHaveAttribute('aria-valuemax', '24');
      await handle.scrollIntoViewIfNeeded();
      const box = (await handle.boundingBox())!;
      const y = box.y + box.height / 2;
      await page.mouse.move(box.x + box.width / 2, y);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 - 32, y, { steps: 4 });
      await expect(handle).toHaveAttribute('data-resizing', '');
      // While dragging, the application hears each width, uncommitted.
      await expect(page.getByTestId('width')).toHaveText('18');
      await expect(page.getByTestId('committed')).toHaveText('');
      expect(await widthOf(drawer)).toBeCloseTo(18 * 16, 0);
      // Its container is 48 rem wide, so it stops at 24 rem, under its largest width.
      await page.mouse.move(box.x + box.width / 2 + 400, y, { steps: 4 });
      await expect(page.getByTestId('width')).toHaveText('24');
      await page.mouse.up();
      await expect(page.getByTestId('committed')).toHaveText('24');
      await expect(handle).not.toHaveAttribute('data-resizing');
      expect(await widthOf(drawer)).toBeCloseTo(24 * 16, 0);
    },
  );

  test(
    'keeps each label and heading on one line, and shows a label cut short in a tooltip and a heading in its title',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(resizable);
      const drawer = page.getByRole('navigation', { name: 'Long labels' });
      const item = drawer.getByRole('link', { name: 'Reviews waiting for the whole team' });
      const label = item.locator('.env-navigation-drawer-label');
      const heading = drawer.locator('.env-navigation-drawer-group-label');
      const isCut = (element: Locator) =>
        element.evaluate((node) => node.scrollWidth > node.clientWidth);
      const tooltip = page.getByRole('tooltip');
      // Wide enough, nothing is cut and no tooltip opens.
      const height = (await item.boundingBox())!.height;
      expect(await isCut(label)).toBe(false);
      await expect(heading).not.toHaveAttribute('title');
      await item.hover();
      await expect(tooltip).toHaveCount(0);
      // Narrowed, the label and heading end in an ellipsis on one line, and the item keeps its height.
      const handle = drawer.getByRole('separator');
      await handle.focus();
      await page.keyboard.press('Home');
      await expect(handle).toHaveAttribute('aria-valuetext', '10 rem');
      await expect.poll(() => isCut(label)).toBe(true);
      expect(await isCut(heading)).toBe(true);
      for (const element of [label, heading]) {
        await expect(element).toHaveCSS('text-overflow', 'ellipsis');
        await expect(element).toHaveCSS('white-space', 'nowrap');
      }
      expect((await item.boundingBox())!.height).toBeCloseTo(height, 0);
      // A heading cut short gives its full text as its title, as it takes no focus for a tooltip.
      await expect(heading).toHaveAttribute('title', (await heading.textContent())!);
      // The full label shows in a tooltip, on hover and on keyboard focus, and names nothing new.
      await item.hover();
      await expect(tooltip).toHaveText('Reviews waiting for the whole team');
      await page.mouse.move(0, 0);
      await expect(tooltip).toHaveCount(0);
      await item.focus();
      await expect(tooltip).toHaveText('Reviews waiting for the whole team');
      await expect(item).toHaveAccessibleName('Reviews waiting for the whole team');
      // A label that isn't cut, Inbox, opens none.
      await handle.focus();
      await expect(tooltip).toHaveCount(0);
      await drawer.getByRole('link', { name: 'Inbox' }).hover();
      await expect(tooltip).toHaveCount(0);
    },
  );

  test('a width that is no number is ignored, and the drawer keeps its default', async ({
    page,
  }) => {
    await page.goto(resizable);
    const drawer = page.getByRole('navigation', { name: 'Not a number' });
    const handle = drawer.getByRole('separator');
    await expect(handle).toHaveAttribute('aria-valuenow', '17.5');
    await expect(handle).toHaveAttribute('aria-valuetext', '17.5 rem');
    expect(
      await drawer.evaluate((element) =>
        element.style.getPropertyValue('--env-navigation-drawer-width'),
      ),
    ).toBe('17.5rem');
    expect(await widthOf(drawer)).toBeCloseTo(17.5 * 16, 0);
  });

  test('in right-to-left text the handle is on the left edge and grows to the left', async ({
    page,
  }) => {
    await page.goto(resizable);
    const drawer = page.getByRole('navigation', { name: 'Right to left' });
    const handle = drawer.getByRole('separator');
    const drawerBox = (await drawer.boundingBox())!;
    expect((await handle.boundingBox())!.x).toBeCloseTo(drawerBox.x, 0);
    await handle.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuetext', '18.5 rem');
    const box = (await handle.boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 16, y, { steps: 2 });
    await page.mouse.up();
    await expect(handle).toHaveAttribute('aria-valuetext', '19.5 rem');
  });
});

/**
 * A destination in a closed section: its section is hidden until found. In a
 * browser that knows hidden="until-found" the link is hidden; WebKit skips the section's content
 * instead, which Playwright still counts as visible, so the section itself is checked: hidden, and
 * its content not rendered.
 */
async function expectClosed(link: Locator) {
  await expect
    .poll(() =>
      link.evaluate((element) => {
        const section = element.closest('.env-navigation-drawer-children');
        if (!section?.hasAttribute('hidden')) return false;
        const style = getComputedStyle(section);
        return (
          style.display === 'none' || style.getPropertyValue('content-visibility') === 'hidden'
        );
      }),
    )
    .toBe(true);
}

test.describe('Drawer nested sections', () => {
  // Drawers with sections, in tests/fixture/NestedDrawers.tsx.
  const nested = `${fixtureUrl}/?fixture=nested-drawers`;

  test('the current page’s sections start open, the rest closed with their links in the page', async ({
    page,
  }) => {
    await page.goto(nested);
    const drawer = page.getByRole('navigation', { name: 'Guide' });
    // A section with a page of its own is a link, with a button at its end.
    const signIn = drawer.getByRole('link', { name: 'Sign-in', exact: true });
    await expect(signIn).toHaveAttribute('href', '#sign-in');
    const signInButton = drawer.getByRole('button', { name: 'Sign-in contents' });
    await expect(signInButton).toHaveAttribute('aria-expanded', 'true');
    const passkeys = drawer.getByRole('link', { name: 'Passkeys' });
    await expect(passkeys).toBeVisible();
    await expect(passkeys).toHaveAttribute('aria-current', 'page');
    await expect(passkeys).toHaveAttribute('href', '#passkeys');
    // Nested destinations sit in, indented.
    const indent = (await passkeys.boundingBox())!.x - (await signIn.boundingBox())!.x;
    expect(indent).toBeGreaterThan(8);
    // The open section's button controls the list of its nested destinations.
    const controls = await signInButton.getAttribute('aria-controls');
    await expect(drawer.locator(`[id="${controls}"]`)).toContainText('Passkeys');
    // A section without a page is only its heading, a button; closed, its links stay in the page,
    // hidden until found.
    const billing = drawer.getByRole('button', { name: 'Billing', exact: true });
    await expect(billing).toHaveAttribute('aria-expanded', 'false');
    const invoices = drawer.locator('a[href="#invoices"]');
    await expect(invoices).toHaveCount(1);
    await expectClosed(invoices);
    await expect(invoices.locator('xpath=ancestor::ul[1]')).toHaveAttribute(
      'hidden',
      'until-found',
    );
    // Only the current page reports aria-current.
    await expect(drawer.locator('[aria-current]')).toHaveCount(1);
  });

  test(
    'a section opens and closes from its button, by pointer and keyboard, and its chevron flips',
    { tag: '@engines' },
    async ({ page, browserName }) => {
      // WebKit's Tab reaches only fields, as Safari's does by default; Alt+Tab reaches its buttons.
      const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
      await page.goto(nested);
      const drawer = page.getByRole('navigation', { name: 'Guide' });
      const billing = drawer.getByRole('button', { name: 'Billing', exact: true });
      const chevron = billing.locator('.env-navigation-drawer-chevron');
      const transform = () => chevron.evaluate((element) => getComputedStyle(element).transform);
      // Closed, the chevron points down, and it flips over to point up as Select's does.
      const closed = await transform();
      await billing.click();
      await expect(billing).toHaveAttribute('aria-expanded', 'true');
      await expect(drawer.getByRole('link', { name: 'Plans' })).toBeVisible();
      await expect.poll(transform).not.toBe(closed);
      await billing.click();
      await expect(billing).toHaveAttribute('aria-expanded', 'false');
      await expectClosed(drawer.locator('a[href="#plans"]'));
      await expect.poll(transform).toBe(closed);
      // Keyboard: the section's link, its button, then its open destinations, each a tab stop.
      const signIn = drawer.getByRole('link', { name: 'Sign-in', exact: true });
      const signInButton = drawer.getByRole('button', { name: 'Sign-in contents' });
      const passwords = drawer.getByRole('link', { name: 'Passwords' });
      await signIn.focus();
      await page.keyboard.press(tab);
      await expect(signInButton).toBeFocused();
      // WebKit's Tab never reaches a link, even with Alt, so there only the buttons are checked.
      if (browserName !== 'webkit') {
        await page.keyboard.press(tab);
        await expect(passwords).toBeFocused();
        await page.keyboard.press(`Shift+${tab}`);
      }
      await page.keyboard.press('Enter');
      await expect(signInButton).toHaveAttribute('aria-expanded', 'false');
      await expectClosed(drawer.locator('a[href="#passwords"]'));
      // Closed, Tab passes its destinations by.
      await page.keyboard.press(tab);
      await expect(billing).toBeFocused();
      await page.keyboard.press('Space');
      await expect(billing).toHaveAttribute('aria-expanded', 'true');
      // The button's focus ring stays inside it, clear of the link's label.
      await signInButton.focus();
      const ring = await signInButton.evaluate((element) => {
        const style = getComputedStyle(element);
        return { width: style.outlineWidth, offset: style.outlineOffset };
      });
      expect(ring).toEqual({ width: '2px', offset: '-2px' });
      const label = (await signIn.locator('.env-navigation-drawer-label').boundingBox())!;
      expect(label.x + label.width).toBeLessThanOrEqual((await signInButton.boundingBox())!.x);
    },
  );

  test('a section opens as the current page moves into it, the drawer’s own or the application’s', async ({
    page,
  }) => {
    await page.goto(nested);
    const own = page.getByRole('navigation', { name: 'Guide' });
    await page.getByRole('button', { name: 'Go to invoices' }).click();
    await expect(own.getByRole('button', { name: 'Billing', exact: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(own.getByRole('link', { name: 'Invoices' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    // The sections opened before stay open.
    await expect(own.getByRole('button', { name: 'Sign-in contents' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    // The application's: onExpandedChange asks for the sections, two levels deep.
    const controlled = page.getByRole('navigation', { name: 'Controlled' });
    const expanded = page.getByTestId('expanded');
    await expect(expanded).toHaveText('');
    await page.getByRole('button', { name: 'Go to retries' }).click();
    await expect(expanded).toHaveText('Integrations, #webhooks');
    await expect(controlled.getByRole('link', { name: 'Retries' })).toBeVisible();
    await controlled.getByRole('button', { name: 'Integrations', exact: true }).click();
    await expect(expanded).toHaveText('#webhooks');
    await expectClosed(controlled.locator('a[href="#webhooks"]'));
  });

  test('Rail and Bar show the top level, marking the destination whose section holds the current one', async ({
    page,
  }) => {
    await page.goto(nested);
    for (const name of ['Top rail', 'Top bar']) {
      const nav = page.getByRole('navigation', { name });
      const guide = nav.getByRole('link', { name: 'Guide' });
      await expect(guide).toHaveAttribute('aria-current', 'true');
      await expect(guide).toHaveAttribute('data-current', '');
      await expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
      await expect(nav.getByText('Passkeys')).toHaveCount(0);
    }
  });

  test('under reduced motion, a section and its chevron change at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(nested);
    const drawer = page.getByRole('navigation', { name: 'Guide' });
    const durations = await drawer
      .locator('.env-navigation-drawer-children, .env-navigation-drawer-chevron')
      .evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).transitionDuration),
      );
    expect(durations.length).toBeGreaterThan(0);
    for (const duration of durations)
      expect(duration.split(', ').every((each) => each === '0s')).toBe(true);
  });
});
