import { expect, type Page } from '@playwright/test';

/**
 * The checks particular to each template screen, by `<page>/<Name>`, which Templates.spec.ts runs
 * after the checks every screen shares, at each width in each scale; and the states the visual
 * baseline captures beside a screen as it loads. P5-0 wrote the sign-in screen's; each template
 * adds its own.
 */
export interface TemplateCheckContext {
  /** The viewport's width: 1280 for the desktop, 390 for a phone. */
  width: number;
  scale: 'comfortable' | 'compact';
  /** WebKit's Tab reaches only fields, as Safari's does by default; Alt+Tab reaches every control. */
  tab: 'Tab' | 'Alt+Tab';
  /** Whether Tab reaches links: Playwright's WebKit skips them even with Alt+Tab. */
  tabReachesLinks: boolean;
  /** Opens the screen again, as it first renders. */
  reload: () => Promise<void>;
}

export interface TemplateCheck {
  name: string;
  run: (page: Page, context: TemplateCheckContext) => Promise<void>;
}

/** A state of a screen the visual baseline captures at the desktop width, in light, both scales. */
export interface TemplateState {
  /** Ends the image's file name: light-compact-desktop-SignInPage-<name>.png. */
  name: string;
  act: (page: Page) => Promise<void>;
}

const focused = (page: Page) => page.locator(':focus');

/** Presses Sign in with both fields empty and waits for the error summary to take focus. */
async function submitEmpty(page: Page) {
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(focused(page)).toContainText('There is a problem');
}

const signIn: TemplateCheck[] = [
  {
    name: 'Tab follows the screen, from the email address to the caption’s links',
    async run(page, { tab, tabReachesLinks }) {
      const path: [string, string | RegExp][] = [
        ['textbox', 'Email address'],
        ['textbox', 'Password'],
        ['button', 'Show password'],
        ['checkbox', 'Keep me signed in'],
        ['button', 'Sign in'],
        ['link', 'Forgot your password?'],
        ['link', 'Continue with single sign-on'],
        ['link', 'terms of use'],
        ['link', 'privacy notice'],
      ];
      for (const [role, name] of path.filter(([role]) => tabReachesLinks || role !== 'link')) {
        await page.keyboard.press(tab);
        await expect(focused(page), `${role} ${name}`).toHaveAccessibleName(name);
        await expect(focused(page)).toHaveRole(role as 'link');
      }
    },
  },
  {
    name: 'an empty submit lists both errors in a summary that takes focus, and its links reach the fields',
    async run(page) {
      await submitEmpty(page);
      const summary = page.locator('.env-alert', { hasText: 'There is a problem' });
      await expect(summary).toBeFocused();
      await expect(summary.getByRole('heading', { level: 2 })).toHaveText('There is a problem');
      // Read once, as it takes focus: neither an alert nor a live region.
      await expect(page.getByRole('alert')).toHaveCount(0);
      const email = page.getByRole('textbox', { name: 'Email address' });
      const password = page.getByRole('textbox', { name: 'Password' });
      await expect(email).toHaveAttribute('aria-invalid', 'true');
      await expect(password).toHaveAttribute('aria-invalid', 'true');
      await expect(email).toHaveAccessibleDescription(/Enter your email address/);
      await summary.getByRole('link', { name: 'Enter your email address' }).click();
      await expect(email).toBeFocused();
      // Typing a right value clears the field's error at once.
      await email.fill('alex.morgan@example.com');
      await expect(email).not.toHaveAttribute('aria-invalid', 'true');
      // The summary keeps the error still to fix.
      await expect(summary.getByRole('link')).toHaveText(['Enter your password']);
      await page.getByRole('link', { name: 'Enter your password' }).click();
      await expect(password).toBeFocused();
    },
  },
  {
    name: 'one wrong field takes focus, and Enter in it says the error in a status',
    async run(page) {
      const email = page.getByRole('textbox', { name: 'Email address' });
      const password = page.getByRole('textbox', { name: 'Password' });
      const status = page.getByRole('main').getByRole('status');
      await email.fill('alex.morgan@example.com');
      // Pressed from elsewhere, focus moves to the field, which reads its error; the status stays empty.
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await expect(password).toBeFocused();
      await expect(password).toHaveAttribute('aria-invalid', 'true');
      await expect(page.getByText('There is a problem')).toHaveCount(0);
      await expect(status).toHaveText('');
      // Enter in the field: focus is already there, so the polite status says the error.
      await password.press('Enter');
      await expect(status).toHaveText('Enter your password');
      await expect(status).toHaveAttribute('role', 'status');
    },
  },
  {
    name: 'Sign in stays enabled and pending, and wrong credentials move focus to an unannounced Alert',
    async run(page, { reload }) {
      // The sample's service answers after a timer, which the test runs on. An installed clock
      // still runs on its own, so it is stopped too: the answer comes only when the test runs the
      // timer, however long the steps before take. Nothing waits on a timer yet, so the second it
      // skips to stop changes nothing. It runs again at the end.
      await page.clock.install();
      await reload();
      await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
      const email = page.getByRole('textbox', { name: 'Email address' });
      const password = page.getByRole('textbox', { name: 'Password' });
      const button = page.getByRole('button', { name: 'Sign in', exact: true });
      await email.fill('alex.morgan@example.com');
      await password.fill('a wrong password');
      // Show password shows it, and says so by its pressed state; its tooltip names the icon.
      const show = page.getByRole('button', { name: 'Show password' });
      await show.hover();
      await expect(page.getByRole('tooltip')).toHaveText('Show password');
      await show.click();
      await expect(show).toHaveAttribute('aria-pressed', 'true');
      await expect(password).toHaveAttribute('type', 'text');
      await button.click();
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expect(button).not.toHaveAttribute('disabled');
      await page.clock.runFor(1300);
      const refusal = focused(page);
      await expect(refusal).toContainText('Your email address or password is wrong');
      await expect(page.getByRole('alert')).toHaveCount(0);
      // What people entered stays.
      await expect(email).toHaveValue('alex.morgan@example.com');
      await expect(password).toHaveValue('a wrong password');
      await password.fill('northwind-demo');
      await button.click();
      await page.clock.runFor(1300);
      await expect(page.getByRole('main').getByRole('status')).toHaveText(
        'Signed in as alex.morgan@example.com.',
      );
      await expect(page.getByText('Your email address or password is wrong')).toHaveCount(0);
      // The page loads again for the next viewport, which needs a running clock.
      await page.clock.resume();
    },
  },
];

const appFrame: TemplateCheck[] = [
  {
    name: 'the trigger collapses the sidebar to a rail on a desktop, and opens it as a drawer on a phone',
    async run(page, { width }) {
      const primary = page.locator('.env-sidebar', {
        has: page.getByRole('link', { name: 'Home' }),
      });
      if (width >= 768) {
        // The sidebar is docked open, and the current destination is marked.
        await expect(page.getByRole('link', { name: 'Home' })).toHaveAttribute(
          'aria-current',
          'page',
        );
        await page.getByRole('button', { name: 'Collapse sidebar' }).click();
        await expect(primary).toHaveAttribute('data-rail', '');
        // The rail keeps its destinations, by name.
        await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible();
        await page.mouse.move(width - 10, 400);
        await page.getByRole('button', { name: 'Expand sidebar' }).click();
        await expect(primary).not.toHaveAttribute('data-rail', '');
        return;
      }
      // On a phone the top bar's trigger opens the navigation in a drawer; a destination closes it
      // and moves focus to Main.
      await page.getByRole('banner').getByRole('button', { name: 'Open navigation' }).click();
      const drawer = page.getByRole('dialog', { name: 'Primary' });
      await expect(drawer).toBeVisible();
      await drawer.getByRole('link', { name: 'Projects' }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByRole('main')).toBeFocused();
    },
  },
  {
    name: 'search opens the palette, which finds pages and projects',
    async run(page, { width }) {
      const trigger =
        width >= 768
          ? page
              .getByRole('navigation', { name: 'Primary' })
              .getByRole('button', { name: /Search/ })
          : page.getByRole('banner').getByRole('button', { name: /Search/ });
      // From the keyboard, so focus is on the trigger in every engine (Safari doesn't focus a
      // clicked button), and returns to it when the palette closes.
      await trigger.focus();
      await page.keyboard.press('Enter');
      const search = page.getByRole('combobox', { name: 'Search' });
      await expect(search).toBeFocused();
      await search.fill('web');
      await expect(page.getByRole('option')).toHaveCount(1);
      await expect(page.getByRole('option')).toContainText('Website refresh');
      await search.fill('zzz');
      await expect(page.getByText('No matching pages or projects')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    },
  },
];

const settings: TemplateCheck[] = [
  {
    name: 'the page’s own sidebar in Main keeps its own state and adds no skip link or region to the frame',
    async run(page, { width }) {
      // The frame's skip links: content and, beside a phone's drawer, the frame's sidebar; nothing
      // for the page's.
      await expect(page.getByRole('link', { name: /^Skip to / })).toHaveText(
        width < 768 ? ['Skip to content'] : ['Skip to content', 'Skip to Primary'],
      );
      const sections = page.getByRole('navigation', { name: 'Settings sections' });
      if (width < 768) {
        // On a phone it hides, and opening the frame's drawer shows only the frame's navigation.
        await expect(sections).toHaveCount(0);
        await page.getByRole('banner').getByRole('button', { name: 'Open navigation' }).click();
        await expect(page.getByRole('dialog', { name: 'Primary' })).toBeVisible();
        await expect(page.getByRole('dialog')).toHaveCount(1);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        return;
      }
      await expect(sections).toBeVisible();
      // Each sidebar is its navigation landmark.
      const own = sections;
      const frame = page.getByRole('navigation', { name: 'Primary' });
      await expect(own).toHaveAttribute('data-state', 'expanded');
      // Collapsing the frame's sidebar leaves the page's alone, and the page's has no trigger.
      await page.getByRole('button', { name: 'Collapse sidebar' }).click();
      await expect(frame).toHaveAttribute('data-rail', '');
      await expect(own).toHaveAttribute('data-state', 'expanded');
      await expect(own).not.toHaveAttribute('data-rail', '');
      await expect(page.getByRole('button', { name: /sidebar/ })).toHaveCount(1);
      await page.mouse.move(width - 10, 400);
      await page.getByRole('button', { name: 'Expand sidebar' }).click();
      // A section's item moves focus to its heading and marks it as the location in the page.
      await sections.getByRole('link', { name: 'Appearance' }).click();
      await expect(page.getByRole('heading', { name: 'Appearance', level: 2 })).toBeFocused();
      await expect(sections.getByRole('link', { name: 'Appearance' })).toHaveAttribute(
        'aria-current',
        'location',
      );
      await expect(sections.locator('[aria-current]')).toHaveCount(1);
    },
  },
  {
    name: 'the sections’ navigation hides below lg, and above it sticks and follows scrolling',
    async run(page, { width }) {
      const sections = page.getByRole('navigation', { name: 'Settings sections' });
      // Hidden below the lg breakpoint, as on a tablet at 834.
      await page.setViewportSize({ width: 834, height: 900 });
      await expect(sections).toHaveCount(0);
      await page.setViewportSize({ width, height: 800 });
      if (width < 1024) return;
      const profile = sections.getByRole('link', { name: 'Profile' });
      await expect(profile).toHaveAttribute('aria-current', 'location');
      const top = (await sections.boundingBox())!.y;
      // Scrolled until the notifications' heading is near the top, the navigation marks them.
      const notifications = page.getByRole('heading', { name: 'Notifications', level: 2 });
      await page.mouse.move(width - 200, 400);
      await page.mouse.wheel(0, (await notifications.boundingBox())!.y - 150);
      await expect(sections.getByRole('link', { name: 'Notifications' })).toHaveAttribute(
        'aria-current',
        'location',
      );
      // Scrolled to the end, the short last section is marked, and the navigation stays in view.
      await page
        .getByRole('heading', { name: 'Danger zone', level: 2 })
        .evaluate((heading) => heading.scrollIntoView({ block: 'start' }));
      await expect(sections.getByRole('link', { name: 'Danger zone' })).toHaveAttribute(
        'aria-current',
        'location',
      );
      await expect(profile).not.toHaveAttribute('aria-current');
      const box = (await sections.boundingBox())!;
      expect(box.y, 'The navigation sticks in view').toBeGreaterThanOrEqual(0);
      expect(box.y).toBeLessThanOrEqual(top);
      // Back at the top, the profile is marked again.
      await page
        .getByRole('heading', { name: 'Profile', level: 2 })
        .evaluate((heading) => heading.scrollIntoView({ block: 'end' }));
      await expect(profile).toHaveAttribute('aria-current', 'location');
    },
  },
  {
    name: 'the notification switches sit beside their text, and the empty status adds no line',
    async run(page) {
      const switches = page.getByRole('list', { name: 'Email notifications' }).getByRole('switch');
      const boxes = await switches.evaluateAll((elements) =>
        elements.map((element) => {
          const box = (element.closest('.env-switch') ?? element).getBoundingClientRect();
          return { x: Math.round(box.x), width: Math.round(box.width) };
        }),
      );
      expect(new Set(boxes.map(({ x }) => x)).size, 'Every switch at one inline position').toBe(1);
      expect(new Set(boxes.map(({ width }) => width)).size, 'Every switch one width').toBe(1);
      // The empty status sits beside Save profile and Cancel, not on a line of its own.
      const form = page.getByRole('form', { name: 'Profile' });
      const save = (await form.getByRole('button', { name: 'Save profile' }).boundingBox())!;
      const status = (await form.getByRole('status').boundingBox())!;
      expect(status.y + status.height).toBeLessThanOrEqual(save.y + save.height + 1);
    },
  },
  {
    name: 'a notification switch applies at once, and the weekly summary says so in a toast',
    async run(page) {
      const summary = page.getByRole('switch', { name: 'Weekly summary' });
      await expect(summary).not.toBeChecked();
      await summary.click();
      await expect(summary).toBeChecked();
      await expect(page.getByRole('heading', { name: 'Weekly summary turned on.' })).toBeVisible();
      const comments = page.getByRole('switch', { name: 'Comments' });
      await comments.click();
      await expect(comments).not.toBeChecked();
      await expect(page.getByRole('heading', { name: /turned/ })).toHaveCount(1);
    },
  },
  {
    name: 'Save profile lists two errors in a summary, says one in the status after Enter, and saves pending',
    async run(page, { reload }) {
      await page.clock.install();
      await reload();
      const name = page.getByRole('textbox', { name: 'Name', exact: true });
      const email = page.getByRole('textbox', { name: 'Email address' });
      const save = page.getByRole('button', { name: 'Save profile' });
      await name.fill('');
      await email.fill('');
      await expect(page.getByText('Unsaved changes')).toBeVisible();
      await save.click();
      const problem = page.locator('.env-alert', { hasText: 'There is a problem' });
      await expect(problem).toBeFocused();
      await problem.getByRole('link', { name: 'Enter your email address' }).click();
      await expect(email).toBeFocused();
      await email.fill('alex.morgan@example.com');
      await expect(email).not.toHaveAttribute('aria-invalid', 'true');
      await name.press('Enter');
      await expect(name).toBeFocused();
      await expect(page.getByRole('main').getByRole('status').first()).toHaveText(
        'Enter your name',
      );
      await name.fill('Sam Lee');
      await save.click();
      await expect(save).toHaveAttribute('aria-busy', 'true');
      await expect(save).not.toHaveAttribute('disabled');
      await page.clock.runFor(1100);
      await expect(page.getByRole('heading', { name: 'Profile saved.' })).toBeVisible();
      await expect(page.getByText('Unsaved changes')).toHaveCount(0);
    },
  },
  {
    name: 'deleting the workspace asks for its name, and Enter in the field confirms',
    async run(page) {
      const open = page.getByRole('button', { name: 'Delete workspace…' });
      await open.click();
      const dialog = page.getByRole('alertdialog', { name: 'Delete the Northwind workspace?' });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
      const field = dialog.getByRole('textbox', { name: 'Workspace name' });
      await field.fill('North');
      await field.press('Enter');
      await expect(field).toHaveAccessibleDescription(/Enter Northwind to confirm/);
      await expect(dialog).toBeVisible();
      await field.fill('Northwind');
      await field.press('Enter');
      await expect(dialog).toHaveCount(0);
      await expect(page.getByText('Northwind workspace deleted.')).toBeVisible();
    },
  },
];

/** Types a query that matches no project and waits for the empty state. */
async function searchForNothing(page: Page) {
  await page.getByRole('searchbox', { name: 'Search projects' }).fill('roadmap');
  await expect(page.getByRole('heading', { name: 'No matching projects' })).toBeVisible();
}

const indexPage: TemplateCheck[] = [
  {
    name: 'search filters the projects, says how many in a status, and no results offers to clear',
    async run(page) {
      const status = page.getByRole('main').getByRole('status').first();
      await expect(status).toHaveText('24 projects');
      const search = page.getByRole('searchbox', { name: 'Search projects' });
      await search.fill('report');
      await expect(status).toHaveText('1 project found');
      await expect(page.getByRole('link', { name: 'Quarterly report' })).toBeVisible();
      await searchForNothing(page);
      await expect(status).toHaveText('0 projects found');
      await expect(page.getByRole('table')).toHaveCount(0);
      await expect(page.getByText('Nothing matches “roadmap”', { exact: false })).toBeVisible();
      await page.getByRole('main').getByRole('button', { name: 'Clear filters' }).last().click();
      await expect(search).toBeFocused();
      await expect(search).toHaveValue('');
      await expect(status).toHaveText('24 projects');
    },
  },
  {
    name: 'sorting sets aria-sort, and ten projects show per page',
    async run(page, { width }) {
      const table = page.getByRole('table', { name: 'Projects' });
      await expect(table.getByRole('row')).toHaveCount(11);
      if (width < 768) {
        // The rows stack, so a Select sorts them.
        await page.getByRole('combobox', { name: 'Sort by' }).click();
        await page.getByRole('option', { name: 'Name, A to Z' }).click();
        await expect(table.getByRole('row').nth(1)).toContainText('Accessibility review');
        return;
      }
      const name = page.getByRole('columnheader', { name: /Name/ });
      const updated = page.getByRole('columnheader', { name: /Updated/ });
      await expect(updated).toHaveAttribute('aria-sort', 'descending');
      await expect(name).toHaveAttribute('aria-sort', 'none');
      await name.getByRole('button').click();
      await expect(name).toHaveAttribute('aria-sort', 'ascending');
      await expect(updated).toHaveAttribute('aria-sort', 'none');
      await expect(table.getByRole('row').nth(1)).toContainText('Accessibility review');
      await page
        .getByRole('navigation', { name: 'Project pages' })
        .getByRole('button', { name: /Next/ })
        .click();
      await expect(table.getByRole('row').nth(1)).toContainText('Mobile release');
    },
  },
  {
    name: 'selecting rows shows the bulk actions; archive offers Undo, and delete asks first',
    async run(page) {
      const status = page.getByRole('main').getByRole('status').first();
      await page.getByRole('checkbox', { name: 'Select Website refresh' }).check();
      await page.getByRole('checkbox', { name: 'Select Design system' }).check();
      await expect(status).toHaveText('2 selected');
      await expect(page.getByRole('checkbox', { name: 'Select this page' })).toHaveAttribute(
        'aria-checked',
        'mixed',
      );
      await expect(page.getByRole('row', { name: /Website refresh/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await page.getByRole('button', { name: 'Archive 2 projects' }).click();
      await expect(page.getByRole('heading', { name: '2 projects archived.' })).toBeVisible();
      // The bulk buttons went, so focus moves to "Select this page".
      await expect(page.getByRole('checkbox', { name: 'Select this page' })).toBeFocused();
      await expect(page.getByRole('link', { name: 'Website refresh' })).toHaveCount(0);
      await expect(status).toHaveText('22 projects');
      await page.getByRole('button', { name: 'Undo' }).click();
      await expect(page.getByRole('link', { name: 'Website refresh' })).toBeVisible();
      // Delete asks, naming the count, with Cancel first; Escape keeps the projects.
      await page.getByRole('checkbox', { name: 'Select this page' }).check();
      await expect(status).toHaveText('10 selected');
      const remove = page.getByRole('button', { name: 'Delete 10 projects…' });
      await remove.click();
      const dialog = page.getByRole('alertdialog', { name: 'Delete 10 projects?' });
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(remove).toBeFocused();
      await remove.click();
      await dialog.getByRole('button', { name: 'Delete 10 projects' }).click();
      await expect(dialog).toHaveCount(0);
      await expect(status).toHaveText('14 projects');
      await expect(page.getByRole('checkbox', { name: 'Select this page' })).toBeFocused();
    },
  },
  {
    name: 'a row’s menu button has a tooltip, and its delete names the project',
    async run(page, { width }) {
      const more = page.getByRole('button', { name: 'More actions for Website refresh' });
      if (width >= 768) {
        await more.hover();
        await expect(page.getByRole('tooltip')).toHaveText('More actions');
      }
      await more.click();
      await page.getByRole('menuitem', { name: 'Delete project…' }).click();
      const dialog = page.getByRole('alertdialog', { name: 'Delete Website refresh?' });
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(more).toBeFocused();
    },
  },
  {
    name: 'archiving from a row’s menu moves focus to the next row’s menu button',
    async run(page) {
      const first = page.getByRole('button', { name: 'More actions for Website refresh' });
      const second = page.getByRole('button', { name: 'More actions for Design system' });
      await first.focus();
      await page.keyboard.press('Enter');
      await page.getByRole('menuitem', { name: 'Archive' }).click();
      await expect(page.getByRole('heading', { name: 'Website refresh archived.' })).toBeVisible();
      await expect(page.getByRole('menu')).toHaveCount(0);
      await expect(second).toBeFocused();
      // Deleting from a row's menu does the same.
      await second.click();
      await page.getByRole('menuitem', { name: 'Delete project…' }).click();
      const dialog = page.getByRole('alertdialog', { name: 'Delete Design system?' });
      await expect(dialog).toContainText('This deletes the project’s documents');
      await dialog.getByRole('button', { name: 'Delete project' }).click();
      await expect(dialog).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'More actions for Quarterly report' }),
      ).toBeFocused();
    },
  },
  {
    name: 'archiving the last rows of a filtered list moves focus to the empty state’s action',
    async run(page) {
      const search = page.getByRole('searchbox', { name: 'Search projects' });
      // The label shows, not only a placeholder.
      await expect(page.getByText('Search projects', { exact: true })).toBeVisible();
      await search.fill('report');
      // The only row, from its menu: no row is left to take focus.
      await page.getByRole('button', { name: 'More actions for Quarterly report' }).click();
      await page.getByRole('menuitem', { name: 'Archive' }).click();
      const clear = page.getByRole('main').getByRole('button', { name: 'Clear filters' });
      await expect(page.getByRole('heading', { name: 'No matching projects' })).toBeVisible();
      await expect(clear).toBeFocused();
      await page.getByRole('button', { name: 'Undo' }).click();
      // In bulk: "Select this page" goes with the rows.
      await page.getByRole('checkbox', { name: 'Select this page' }).check();
      await page.getByRole('button', { name: 'Archive 1 project' }).click();
      await expect(page.getByRole('heading', { name: 'No matching projects' })).toBeVisible();
      await expect(clear).toBeFocused();
    },
  },
];

const detailsPage: TemplateCheck[] = [
  {
    name: 'the panel sits beside the tabs on a desktop and below them on a phone',
    async run(page, { width }) {
      const tabs = page.getByRole('tablist', { name: 'Project views' });
      const panel = page.getByRole('complementary', { name: 'Details' });
      const main = (await tabs.boundingBox())!;
      const side = (await panel.boundingBox())!;
      if (width >= 768) expect(side.x).toBeGreaterThan(main.x + main.width);
      else expect(side.y).toBeGreaterThan(main.y + main.height);
      await expect(page.getByRole('main').getByRole('link', { name: 'Projects' })).toBeVisible();
    },
  },
  {
    name: 'the tabs switch views, archive offers Undo, and delete asks first',
    async run(page) {
      await page.getByRole('tab', { name: 'Activity' }).click();
      await expect(page.getByRole('heading', { name: 'Activity', level: 2 })).toBeVisible();
      await expect(page.getByRole('list', { name: 'Activity' }).getByRole('listitem')).toHaveCount(
        4,
      );
      const more = page.getByRole('button', { name: 'More actions' });
      await more.click();
      await page.getByRole('menuitem', { name: 'Archive' }).click();
      await expect(page.getByRole('heading', { name: 'Website refresh archived.' })).toBeVisible();
      await expect(page.getByText('Archived', { exact: true }).first()).toBeVisible();
      await page.getByRole('button', { name: 'Undo' }).click();
      await expect(page.getByText('Archived', { exact: true })).toHaveCount(0);
      await more.click();
      await page.getByRole('menuitem', { name: 'Delete project…' }).click();
      const dialog = page.getByRole('alertdialog', { name: 'Delete Website refresh?' });
      await dialog.getByRole('button', { name: 'Delete project' }).click();
      await expect(dialog).toHaveCount(0);
      await expect(page.getByRole('main').getByRole('status').first()).toHaveText(
        'Website refresh deleted. Going back to Projects.',
      );
    },
  },
];

const dashboardPage: TemplateCheck[] = [
  {
    name: 'the period changes the figures, and the alerts panel says it is empty',
    async run(page) {
      const figures = page.getByRole('group', { name: 'Figures for the last 30 days' });
      await expect(figures).toContainText('286');
      await page.getByRole('combobox', { name: 'Period' }).click();
      await page.getByRole('option', { name: 'Last 7 days' }).click();
      await expect(page.getByRole('group', { name: 'Figures for the last 7 days' })).toContainText(
        '64',
      );
      await expect(page.getByRole('region', { name: 'Alerts' })).toContainText('No alerts');
      for (const name of ['Activity', 'Storage', 'Goals', 'Recent documents', 'Due soon'])
        await expect(page.getByRole('region', { name })).toBeVisible();
      await expect(page.getByRole('meter', { name: 'Storage used' })).toHaveAttribute(
        'aria-valuetext',
        '68 of 100 gigabytes used',
      );
    },
  },
  {
    name: 'a trend’s tone says whether the change is good news, and due dates come from Intl',
    async run(page) {
      const trend = (label: string) =>
        page.locator('.env-stat', { hasText: label }).locator('.env-stat-trend');
      // 30 days: more open tasks is bad news.
      await expect(trend('Open tasks')).toHaveAttribute('data-direction', 'up');
      await expect(trend('Open tasks')).toHaveAttribute('data-tone', 'danger');
      await page.getByRole('combobox', { name: 'Period' }).click();
      await page.getByRole('option', { name: 'Last 7 days' }).click();
      // 7 days: fewer open tasks and a shorter lead time are good news.
      await expect(trend('Open tasks')).toHaveAttribute('data-tone', 'success');
      await expect(trend('Median lead time')).toHaveAttribute('data-direction', 'down');
      await expect(trend('Median lead time')).toHaveAttribute('data-tone', 'success');
      await page.getByRole('combobox', { name: 'Period' }).click();
      await page.getByRole('option', { name: 'Last 90 days' }).click();
      await expect(trend('Median lead time')).toHaveAttribute('data-tone', 'danger');
      const due = await page.evaluate(() =>
        new Intl.DateTimeFormat(undefined, {
          day: 'numeric',
          month: 'short',
          timeZone: 'UTC',
        }).format(new Date('2026-03-06T00:00:00Z')),
      );
      await expect(page.getByRole('region', { name: 'Due soon' })).toContainText(`Due ${due}`);
    },
  },
];

const notFound: TemplateCheck[] = [
  {
    name: 'it names the address and offers home and search',
    async run(page) {
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
      await expect(page.getByRole('main')).toContainText('/projects/website-redesign');
      await expect(page.getByRole('link', { name: 'Go to home' })).toHaveAttribute('href', '/');
      await expect(page.getByRole('link', { name: 'Search', exact: true })).toHaveAttribute(
        'href',
        '/search?q=website+redesign',
      );
    },
  },
];

const noAccess: TemplateCheck[] = [
  {
    name: 'Request access is pending, never disabled, then a status says who will hear',
    async run(page, { reload }) {
      await page.clock.install();
      await reload();
      const request = page.getByRole('button', { name: 'Request access' });
      await request.click();
      await expect(request).toHaveAttribute('aria-busy', 'true');
      await expect(request).not.toHaveAttribute('disabled');
      await page.clock.runFor(900);
      const status = page.getByRole('main').getByRole('status').first();
      await expect(status).toHaveText('Request sent. Priya Shah will get an email.');
      await expect(request).toHaveCount(0);
      // The button went, so focus moves to the status that replaced it.
      await expect(status).toBeFocused();
    },
  },
];

const errorPage: TemplateCheck[] = [
  {
    name: 'it says what happened, offers Try again first and shows the reference',
    async run(page, { tab }) {
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Something went wrong');
      // It replaced the application, so Main takes focus as it mounts.
      await expect(page.getByRole('main')).toBeFocused();
      await page.keyboard.press(tab);
      await expect(page.getByRole('button', { name: 'Try again' })).toBeFocused();
      await expect(page.getByRole('main')).toContainText('NW-7F3A-2C91');
    },
  },
];

export const templateChecks: Record<string, TemplateCheck[]> = {
  'index-page/IndexPage': indexPage,
  'details-page/DetailsPage': detailsPage,
  'dashboard-page/DashboardPage': dashboardPage,
  'error-pages/NotFoundPage': notFound,
  'error-pages/NoAccessPage': noAccess,
  'error-pages/ErrorPage': errorPage,

  'settings-page/SettingsPage': settings,
  'app-frame/AppFrame': appFrame,
  'sign-in-page/SignInPage': signIn,
};

export const templateStates: Record<string, TemplateState[]> = {
  'index-page/IndexPage': [{ name: 'no-results', act: searchForNothing }],
  'sign-in-page/SignInPage': [{ name: 'empty-submit', act: submitEmpty }],
};
