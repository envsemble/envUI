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
      // The page loads again for the next viewport, which needs a running clock.
      await page.clock.resume();
    },
  },
];

export const templateChecks: Record<string, TemplateCheck[]> = {
  'sign-in-page/SignInPage': signIn,
};

export const templateStates: Record<string, TemplateState[]> = {
  'sign-in-page/SignInPage': [{ name: 'empty-submit', act: submitEmpty }],
};
