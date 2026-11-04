import { test, expect } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import { chooseScheme } from './helpers/CatalogueThemes';
import { readReleaseNotes } from '../../scripts/site/ReleaseNotes.ts';
import { renderLlmsText, renderSkill } from '../../scripts/site/SiteAgentFiles.ts';
import { pagesOf } from '../../apps/site/src/navigation/SiteRoutes';
import { version, goTo } from './helpers/SiteSpecHelpers';

test('a guide in the Docs renders shared Markdown and follows relative links', async ({ page }) => {
  await page.goto(`${siteDevUrl}/docs/customizing`);
  await expect(page.getByRole('heading', { name: 'Compose one root', exact: true })).toBeVisible();
  await expect(
    page.getByText('Surface supplies fill, padding and corners', { exact: false }),
  ).toBeVisible();
  await page
    .locator('.site-article')
    .getByRole('link', { name: 'Surface', exact: true })
    .first()
    .click();
  // A link to a component opens its page in the catalogue.
  await expect(page).toHaveURL(/\/components\/surface$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Surface');

  // A guide opens on a page of its own in the Docs, current in their navigation, with its status
  // under its title and beside its name.
  await page.goto(`${siteDevUrl}/docs`);
  await page
    .getByRole('navigation', { name: 'Docs' })
    .getByRole('link', { name: /^Dev mode/ })
    .click();
  await expect(page).toHaveURL(/\/docs\/dev-mode$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dev mode');
  await expect(page.locator('.site-article')).toContainText('installDevMode');
  await expect(page.locator('.site-page-meta').getByText('Alpha', { exact: true })).toBeVisible();
  const navigation = page.getByRole('navigation', { name: 'Docs' });
  await expect(navigation.getByRole('link', { name: /^Dev mode/ })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(navigation.getByRole('link', { name: /^Dev mode/ })).toContainText('Alpha');
  // The address it had on the Get started view, as a hash, leads to the same page as a path.
  await page.goto(`${siteDevUrl}/#/overview/get-started?document=migration&section=documentation`);
  await expect(page).toHaveURL(/\/docs\/migration$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Move an app to envUI');
});

test('palette editing uses public controls and remains temporary and independent between themes', async ({
  page,
}) => {
  // The editable palette, with its tokens and values, is on the colors guide in the Docs.
  await page.goto(`${siteDevUrl}/docs/foundations/colors`);
  const app = page.locator('.site-app');
  const canvasValue = () =>
    app.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--env-color-bg-page').trim(),
    );
  const initialLight = await canvasValue();
  const swatch = page.getByRole('button', { name: /^#[\da-f]{6} page background: pick a color$/ });
  await expect(swatch).toHaveClass(/env-button/);
  await swatch.click();
  const dialog = page.getByRole('dialog', { name: 'Page background', exact: true });
  await expect(dialog.locator('.env-color-picker')).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Hex' }).fill('123456');
  await dialog.getByRole('textbox', { name: 'Hex' }).press('Enter');
  await expect.poll(canvasValue).toBe('#123456');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await chooseScheme(page, 'dark');
  expect(await canvasValue()).not.toBe('#123456');
  await swatch.click();
  await dialog.getByRole('textbox', { name: 'Hex' }).fill('#abcdef');
  await dialog.getByRole('textbox', { name: 'Hex' }).press('Enter');
  await expect.poll(canvasValue).toBe('#abcdef');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await chooseScheme(page, 'light');
  await expect.poll(canvasValue).toBe('#123456');
  await page.reload();
  await expect.poll(canvasValue).toBe(initialLight);
});

test("a page's guide in the Docs complements its page in the catalogue, and Field's shows its whole page", async ({
  page,
}) => {
  // Each pattern's guide in the Docs lists what the application and envUI provide, as plain lists
  // under Accessibility. The address of the page that once listed them all opens the Docs' home,
  // whose navigation lists every page; the home itself repeats none of it.
  await page.goto(`${siteDevUrl}/docs/patterns`);
  await expect(page).toHaveURL(/\/docs$/);
  await expect(page.locator('.site-article').getByRole('link')).toHaveText(['Install and set up']);
  await page.goto(`${siteDevUrl}/docs/patterns/forms`);
  // The Docs show the developer part alone: Compose, what envUI and the application provide,
  // which the catalogue leaves out, and the changelog. None of the catalogue's sections, its
  // figures or Related.
  const main = page.locator('.site-page-column');
  await expect(main.getByRole('heading', { level: 2 })).toHaveText([
    'Import',
    'Usage',
    'Composition',
    'Accessibility',
    'Changelog',
  ]);
  const provides = page.locator('.docs-provides');
  for (const name of ['envUI provides', 'You provide'])
    await expect(provides.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
  await expect(provides.getByRole('listitem').filter({ hasText: 'noValidate' })).toHaveCount(1);
  await expect(
    page.locator(
      '.catalogue-related, .site-figure-section, .site-live-example, .site-article .env-card',
    ),
  ).toHaveCount(0);
  // A foundation's guide maps the words of its page in the catalogue to code, the column the
  // catalogue leaves out, without the words' meanings, which it shows.
  await page.goto(`${siteDevUrl}/docs/foundations/spacing`);
  await expect(main.getByRole('heading', { level: 2 })).toHaveText([
    'Usage',
    'Composition',
    'Customize',
    'Words in code',
  ]);
  const words = page.locator('section[aria-labelledby="words-in-code"] table');
  await expect(words.getByRole('columnheader')).toHaveText(['Words', 'In code']);
  await expect(page.locator('.catalogue-related, .site-figure-section')).toHaveCount(0);
  // Field, which has no page in the catalogue, shows its whole page in the Docs, its sections,
  // then props, part names and changelog, without Related.
  await page.goto(`${siteDevUrl}/docs/components/field`);
  await expect(page.locator('.docs-changelog')).toHaveCount(1);
  await expect(page.locator('[data-section="overview"]')).toHaveCount(1);
  await expect(page.locator('.catalogue-related')).toHaveCount(0);
  // A component's guide shows none of the catalogue's figures, whose Overview shows the component
  // with its code: it goes from its header to Import, then Usage.
  await page.goto(`${siteDevUrl}/docs/components/button`);
  await expect(page.locator('.docs-api .site-live-example-entry')).toHaveCount(0);
  const headings = main.getByRole('heading', { level: 2 });
  await expect(headings.nth(0)).toHaveText('Import');
  await expect(headings.nth(1)).toHaveText('Usage');
  await expect(page.locator('.site-figure-section, .catalogue-related')).toHaveCount(0);
});

test("a page's changelog in the Docs is collapsed, and a link to it opens it", async ({ page }) => {
  await page.goto(`${siteDevUrl}/docs/components/button`);
  const changelog = page.locator('.docs-changelog details');
  await expect(changelog.locator('summary')).toHaveText('Changelog');
  await expect(changelog).not.toHaveAttribute('open');
  await expect(changelog.locator('.docs-changelog-entries')).toBeHidden();
  // Following a link to it on the page opens it, as loading its address does.
  await page.evaluate(() => {
    const link = document.createElement('a');
    link.href = '/docs/components/button#changelog';
    document.querySelector('#site-main')!.append(link);
    link.click();
    link.remove();
  });
  await expect(changelog).toHaveAttribute('open');
  await page.goto(`${siteDevUrl}/docs/patterns/forms#changelog`);
  await expect(page.locator('.docs-changelog details')).toHaveAttribute('open');
  await expect(page.locator('#changelog')).toBeInViewport();
});

test('the props in the Docs link each source file at the revision the site was built from', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/docs/components/button`);
  const link = page.getByRole('link', { name: 'actions/Button.tsx', exact: true });
  // The release tag of a release build, or the commit of any other: never a moving branch.
  const revision = `(?:v${version.replaceAll('.', '\\.')}|[0-9a-f]{40})`;
  await expect(link).toHaveAttribute(
    'href',
    new RegExp(
      `^https://github\\.com/envsemble/envUI/blob/${revision}/packages/ui/src/actions/Button\\.tsx$`,
    ),
  );
});

test("the Docs' home gives a prompt to copy that sets envUI up through the skill the site serves", async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(`${siteDevUrl}/docs`);
  const setup = page.getByRole('region', { name: 'Set up with your agent' });
  const prompt = 'Set up envUI in my app: envui.envsemble.com/SKILL.md';
  await expect(setup).toContainText(prompt);
  await setup.getByRole('button', { name: 'Copy prompt' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(prompt);
  // Under it, the guide for setting envUI up by hand.
  await expect(setup.getByRole('link', { name: 'Install and set up' })).toHaveAttribute(
    'href',
    '/docs/setup',
  );
  // The development server serves the skill and llms.txt as the build writes them.
  const skill = await page.request.get(`${siteDevUrl}/SKILL.md`);
  expect(skill.headers()['content-type']).toBe('text/markdown; charset=utf-8');
  expect(await skill.text()).toBe(renderSkill());
  const llms = await page.request.get(`${siteDevUrl}/llms.txt`);
  expect(await llms.text()).toBe(renderLlmsText());
});

test('a page of the Docs has breadcrumbs, a tree of the Docs open at its section, its contents beside it, and the way to its page in the catalogue', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // An address that names a section in its query, as earlier releases wrote some, opens the
  // section, at the fragment address that links, search and the contents share.
  await page.goto(`${siteDevUrl}/docs/components/button?section=props-Button-variant`);
  await expect(page).toHaveURL(`${siteDevUrl}/docs/components/button#props-Button-variant`);
  await expect(page.locator('[id="props-Button-variant"]')).toBeFocused();
  const banner = page.locator('.site-page-header');
  const trail = banner.getByRole('navigation', { name: 'Breadcrumb' });
  // The section and the group, which the navigation lists, say where the page is and lead nowhere.
  await expect(trail.getByRole('link')).toHaveText(['Docs']);
  await expect(trail).toContainText('Components');
  await expect(trail).toContainText('Actions');
  await expect(trail.locator('[aria-current="page"]')).toHaveText('Button');
  await expect(banner.getByRole('link', { name: 'Catalogue', exact: true })).toHaveAttribute(
    'href',
    '/components/button',
  );
  await expect(
    page.locator('.site-page-actions').getByRole('link', { name: 'Catalogue', exact: true }),
  ).toHaveAttribute('href', '/components/button');
  // The navigation opens the section of the current page, and keeps the others closed.
  const navigation = page.getByRole('navigation', { name: 'Docs' });
  await expect(navigation.getByRole('button', { name: 'Actions' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(navigation.getByRole('button', { name: 'Forms & selection' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(navigation.getByRole('link', { name: 'Button', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  // The contents list the page's sections, each export's props under Props, and mark where the
  // reader is.
  const contents = page.getByRole('navigation', { name: 'On this page' });
  await expect(contents).toBeVisible();
  const props = contents.getByRole('listitem').filter({
    has: page.getByRole('link', { name: 'Props', exact: true }),
  });
  await expect(props.getByRole('link', { name: 'Button', exact: true })).toBeVisible();
  await expect(contents.locator('[aria-current="location"]')).toHaveText('Button');
  // A link of the contents writes the section's fragment, and the address and Back follow it.
  await contents.getByRole('link', { name: 'Usage', exact: true }).click();
  await expect(page).toHaveURL(`${siteDevUrl}/docs/components/button#usage`);
  await expect(page.locator('#usage')).toBeFocused();
  await expect(contents.locator('[aria-current="location"]')).toHaveText('Usage');
  // Docs, the trail's link, leads to their home, which has no contents beside it.
  await trail.getByRole('link', { name: 'Docs', exact: true }).click();
  await expect(page).toHaveURL(`${siteDevUrl}/docs`);
  await expect(contents).toHaveCount(0);
  // A narrower window leaves the contents out.
  await page.goto(`${siteDevUrl}/docs/setup`);
  await expect(contents).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(contents).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('every page of the Docs lists its own sections beside it, each once, at addresses of their own', async ({
  page,
}) => {
  // It opens every page of the Docs, about 20 s.
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/docs`);
  const contents = page.getByRole('navigation', { name: 'On this page' });
  for (const { path, title, kind } of pagesOf('docs')) {
    if (kind === 'docs-home') continue;
    await goTo(page, `/${path}`);
    await expect(page.getByRole('heading', { level: 1 }), path).toHaveAccessibleName(title);
    await expect(page.locator('.site-page-column .site-loading'), path).toHaveCount(0);
    await expect(async () => {
      const report = await contents.evaluate((navigation) => {
        const links = (list: Element) =>
          [...list.children].flatMap((item) => {
            const link = item.querySelector(':scope > a');
            return link ? [link] : [];
          });
        const hrefs = [...navigation.querySelectorAll('a')].map((link) =>
          link.getAttribute('href'),
        );
        const repeated = (values: (string | null)[]) =>
          values.filter((value, index) => values.indexOf(value) !== index);
        // The page's own sections, not an example's or a figure's.
        const sections = [
          ...document.querySelectorAll<HTMLElement>('.site-page-column h2[id]'),
        ].filter(
          (heading) =>
            !heading.closest(
              '.site-live-example, .catalogue-open-example, .catalogue-specimen, .env-dialog',
            ),
        );
        return {
          // Each level lists a heading's label and address once, and the whole list each address once.
          repeatedLabels: [...navigation.querySelectorAll('ol, ul')].flatMap((list) =>
            repeated(links(list).map((link) => link.textContent)),
          ),
          repeatedAddresses: repeated(hrefs),
          // Each address leads to one element of the page.
          ambiguous: hrefs.filter(
            (href) =>
              document.querySelectorAll(`[id="${CSS.escape(href!.slice(1))}"]`).length !== 1,
          ),
          // The top level is the page's sections, in its order.
          top: links(navigation.querySelector('ol, ul')!).map((link) => link.getAttribute('href')),
          sections: sections.map((heading) => `#${heading.id}`),
        };
      });
      expect(report.repeatedLabels, path).toEqual([]);
      expect(report.repeatedAddresses, path).toEqual([]);
      expect(report.ambiguous, path).toEqual([]);
      expect(report.top, path).toEqual(report.sections);
    }).toPass({ timeout: 5000 });
  }
});

test("the Docs' Changelog page lists each release's highlights, newest first, and their links reach sections of the Docs", async ({
  page,
}) => {
  const releases = readReleaseNotes();
  // The catalogue's old address opens it.
  await page.goto(`${siteDevUrl}/changelog`);
  await expect(page).toHaveURL(`${siteDevUrl}/docs/changelog`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Changelog');
  await expect(page.getByRole('heading', { level: 2, name: 'Highlights' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Every change' })).toBeVisible();
  const versions = page.locator('.docs-releases h3 .docs-release-version');
  await expect(versions).toHaveText(releases.map((release) => release.version));

  // Every link of the notes leads to a page of the Docs with the section it names.
  const hrefs = await page
    .locator('.docs-releases a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
  const sections = new Map<string, Set<string>>();
  for (const href of hrefs) {
    expect(href, href).toMatch(/^\/docs\/changelog(?:#|$)/);
    const [path, section] = href.split('#');
    sections.set(path, new Set([...(sections.get(path) ?? []), ...(section ? [section] : [])]));
  }
  expect([...sections.keys()]).toEqual(['/docs/changelog']);
  for (const [path, ids] of sections) {
    await page.goto(`${siteDevUrl}${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const id of ids)
      await expect(page.locator(`[id="${id}"]`), `${path}#${id}`).toBeAttached();
  }
});
