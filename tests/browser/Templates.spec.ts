import { expect, test, type Page } from '@playwright/test';
import { catalogueUrl } from './Servers';
import { documents } from '../../apps/catalogue/src/Reference';
import { templateChecks } from './TemplateChecks';

/**
 * Every template screen, opened alone at its frame route (?frame=<page>/<Name>), at the desktop
 * width and a phone's, in the comfortable scale: it renders without errors, has the landmarks and
 * headings a page needs, a keyboard path, no unnamed control and no horizontal overflow, and passes
 * its own checks in TemplateChecks.ts. The accessibility scan (tests/accessibility) runs axe over
 * every screen; the visual baseline takes the compact scale.
 */
const screens = documents.flatMap((document) =>
  document.group === 'Templates'
    ? (document.sections ?? []).flatMap((section) =>
        section.blocks.flatMap((block) =>
          block.kind === 'template'
            ? [
                {
                  page: document.id,
                  name: block.name,
                  // The app frame template is a whole screen that is the frame itself.
                  frame: document.id === 'app-frame' ? 'app' : block.frame,
                },
              ]
            : [],
        ),
      )
    : [],
);

const widths = [
  { label: 'desktop', width: 1280, height: 800 },
  { label: 'phone', width: 390, height: 844 },
];
/** Roles that need a name to be usable. */
const namedRoles = [
  'button',
  'link',
  'textbox',
  'searchbox',
  'checkbox',
  'radio',
  'switch',
  'combobox',
  'slider',
  'spinbutton',
  'tab',
  'menuitem',
] as const;

test.describe('in a reader’s other language', () => {
  test.use({ locale: 'cs-CZ' });
  test('template screens format relative times and dates in English, as their text is', async ({
    page,
  }) => {
    for (const [frame, date] of [
      ['index-page/IndexPage', / ago/],
      ['details-page/DetailsPage', /[A-Z][a-z]{2} \d{1,2}, \d{4}/],
    ] as const) {
      await page.goto(`${catalogueUrl}/?${new URLSearchParams({ frame, theme: 'light' })}`);
      const main = page.getByRole('main');
      await expect(main).toContainText(date);
      await expect(main).not.toContainText(/před|měsíc|týdn/);
    }
  });
});

/** The headings' levels in document order, from h1–h6 and role="heading" with aria-level. */
function headingLevels(page: Page) {
  return page
    .locator('main')
    .evaluate((main) =>
      [...main.ownerDocument.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')]
        .filter((element) => (element as HTMLElement).checkVisibility?.() ?? true)
        .map((element) =>
          element.getAttribute('role') === 'heading'
            ? Number(element.getAttribute('aria-level') ?? 2)
            : Number(element.localName.slice(1)),
        ),
    );
}

const scale = 'comfortable';
for (const { page: id, name, frame } of screens)
  test(`${id}/${name} (${scale})`, async ({ page, browserName }) => {
    // Two widths, each with the screen's own checks from a fresh load.
    test.slow();
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(message.text());
    });
    page.on('pageerror', (error) => problems.push(error.message));
    const address = `${catalogueUrl}/?${new URLSearchParams({ frame: `${id}/${name}`, scale, theme: 'light' })}`;
    const load = async () => {
      await page.goto(address);
      await page.locator('[data-template-frame]').waitFor();
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByText('Loading template…')).toHaveCount(0);
    };
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';

    for (const { label, width, height } of widths) {
      await test.step(`${label} ${width} × ${height}`, async () => {
        await page.setViewportSize({ width, height });
        await load();

        // It rendered: no load boundary's message, no missing template.
        await expect(page.getByText(/failed to render|could not load|No template/)).toHaveCount(0);

        // Landmarks: one main; the app frame's navigation, and a banner only where it shows.
        await expect(page.getByRole('main')).toHaveCount(1);
        if (frame === 'app') {
          // On a phone the navigation is a drawer the top bar's trigger opens.
          const phone = width < 768;
          await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(
            phone ? 0 : 1,
          );
          await expect(page.getByRole('banner')).toHaveCount(phone ? 1 : 0);
          if (phone)
            await expect(
              page.getByRole('banner').getByRole('button', { name: 'Open navigation' }),
            ).toHaveCount(1);
        } else await expect(page.getByRole('banner')).toHaveCount(0);

        // Headings: one h1, and no level skipped.
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        const levels = await headingLevels(page);
        expect(levels[0], 'The first heading is the h1').toBe(1);
        for (let index = 1; index < levels.length; index++)
          expect(levels[index], `heading ${index + 1} skips no level`).toBeLessThanOrEqual(
            levels[index - 1] + 1,
          );

        // Keyboard: in the app frame, the first Tab stop is the skip link, which focuses Main.
        // Playwright's WebKit never tabs to links, so there the skip link takes focus directly.
        if (frame === 'app') {
          if (browserName === 'webkit')
            await page.getByRole('link', { name: 'Skip to content' }).focus();
          else await page.keyboard.press(tab);
          const skip = page.locator(':focus');
          await expect(skip).toHaveRole('link');
          await expect(skip).toHaveAccessibleName('Skip to content');
          await page.keyboard.press('Enter');
          await expect(page.getByRole('main')).toBeFocused();
        }

        // No horizontal overflow.
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
          'The screen fits the width',
        ).toBe(true);

        // Every control has a name.
        for (const role of namedRoles)
          for (const control of await page.getByRole(role).all())
            await expect(control, `a ${role} without a name`).toHaveAccessibleName(/\S/);

        // The requested scale, everywhere.
        const scales = await page
          .locator('[data-env-scale]')
          .evaluateAll((elements) =>
            elements.map((element) => element.getAttribute('data-env-scale')),
          );
        expect(new Set(scales)).toEqual(new Set([scale]));

        // A PageHeader's toolbar keeps its controls on one block size.
        for (const toolbar of await page.locator('.env-page-header-toolbar').all()) {
          const sizes = await toolbar
            .locator('button, input, [role="combobox"]')
            .evaluateAll((elements) =>
              elements
                .filter((element) => (element as HTMLElement).offsetParent)
                // A field's box is its control, around the input and its buttons.
                .map((element) => element.closest('.env-text-field-control') ?? element)
                .filter((element, index, all) => all.indexOf(element) === index)
                .map((element) => Math.round(element.getBoundingClientRect().height)),
            );
          expect(new Set(sizes).size, 'Toolbar controls share one height').toBeLessThanOrEqual(1);
        }

        // The screen's own checks, each from the screen as it loads.
        for (const check of templateChecks[`${id}/${name}`] ?? [])
          await test.step(check.name, async () => {
            await load();
            await check.run(page, {
              width,
              scale,
              tab,
              tabReachesLinks: browserName !== 'webkit',
              reload: load,
            });
          });
      });
    }
    expect(problems, 'No console error or page error').toEqual([]);
  });
