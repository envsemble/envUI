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
      // The sample's service answers after a timer, which the test runs on.
      await page.clock.install();
      await reload();
      const email = page.getByRole('textbox', { name: 'Email address' });
      const password = page.getByRole('textbox', { name: 'Password' });
      const button = page.getByRole('button', { name: 'Sign in', exact: true });
      await email.fill('alex.morgan@example.com');
      await password.fill('a wrong password');
      // Show password shows it, and says so by its pressed state.
      const show = page.getByRole('button', { name: 'Show password' });
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
      await trigger.click();
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

export const templateChecks: Record<string, TemplateCheck[]> = {
  'app-frame/AppFrame': appFrame,
  'sign-in-page/SignInPage': signIn,
};

export const templateStates: Record<string, TemplateState[]> = {
  'sign-in-page/SignInPage': [{ name: 'empty-submit', act: submitEmpty }],
};
