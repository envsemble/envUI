import { test, expect } from '@playwright/test';
import { siteBuildUrl } from '../helpers/Servers';
import { requireSite, serveSite, siteUrl } from '../helpers/HostedSite';
import { chooseScheme } from '../helpers/CatalogueThemes';
import { renderLlmsText, renderSkill } from '../../../scripts/site/SiteAgentFiles.ts';
import { allPages, sectionHome, catalogueSections } from '../../../apps/site/src/routes/SiteRoutes';
import { displayStorageKeys } from '../../../apps/site/src/display/DisplayStorage';
import { goTo, openSite, showFigures } from '../helpers/SiteSpecHelpers';

test('the hosted build opens every page of the catalogue and the Docs without network or script errors', async ({
  page,
  context,
}) => {
  // It renders every page of both areas, about 15 s on a fast machine and over 30 s on a busy one.
  test.slow();
  requireSite();
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Nothing loads from elsewhere: every request but the site's own is refused.
  await context.route(/^https?:/, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await serveSite(page);
  await page.goto(`${siteUrl}/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
  await expect(
    page.locator('.site-footer').getByRole('navigation', { name: 'Footer' }),
  ).toContainText('Changelog');
  for (const { path, title, kind, area } of allPages) {
    await goTo(page, path === 'overview' ? '/' : `/${path}`);
    await expect(page.getByRole('heading', { level: 1 }), path).toHaveAccessibleName(
      kind === 'home' ? 'envUI' : title,
    );
    await expect(page.getByText('This page failed to render')).toHaveCount(0);
    // A page of the catalogue links into the Docs only through its banner's Docs button and the
    // Docs link at its top end, not from its content, the links generated from its frontmatter
    // included, such as Built from. An example's links are the application's, such as a document's
    // at /docs/launch-plan in rich text, and stay in place.
    if (area === 'catalogue' && kind !== 'home')
      expect(
        await page
          .locator('.site-main .site-article a[href^="/docs"]')
          .evaluateAll(
            (links) =>
              links.filter(
                (link) =>
                  !link.closest(
                    '.site-live-example, .site-verdict-stage, .site-anatomy-subject, .catalogue-open-example, .catalogue-tile-stage, .catalogue-specimen',
                  ),
              ).length,
          ),
        path,
      ).toBe(0);
  }
  // A deep link loads its page, in the Docs too, and the setup guide's old address its home.
  await page.goto(`${siteUrl}/docs/setup`);
  await expect(page).toHaveURL(`${siteUrl}/docs`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install and set up');
  await expect(page.locator('.env-code-block').first()).toContainText('@envsemble:registry');
  // The files for coding agents are at the root, as text rather than the page.
  const agentFiles = await page.evaluate(async () =>
    Promise.all(
      ['/SKILL.md', '/llms.txt'].map(async (path) => {
        const response = await fetch(path);
        return { type: response.headers.get('Content-Type'), text: await response.text() };
      }),
    ),
  );
  expect(agentFiles).toEqual([
    { type: 'text/markdown; charset=utf-8', text: renderSkill() },
    { type: 'text/plain; charset=utf-8', text: renderLlmsText() },
  ]);
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('1rem "envUI Geist"'))).toBe(true);
});

test('a live example keeps its state when the theme changes', async ({ page }) => {
  // The 0.x preview of text fields opens the TextField page, whose live examples follow the
  // documentation's theme.
  await page.goto(`${siteBuildUrl}/components/input/preview`);
  const example = page.getByRole('group', { name: 'TextField example', exact: true });
  const projectName = example.getByRole('textbox', { name: 'Project name', exact: true });
  await projectName.fill('Winter release');
  await chooseScheme(page, 'dark');
  await expect(example).toHaveAttribute('data-env-theme', 'dark');
  await expect(projectName).toHaveValue('Winter release');
  for (const width of [1920, 1440, 960, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(example).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await expect(projectName).toHaveValue('Winter release');
  const navigationTrigger = page.getByRole('button', { name: 'Open navigation' });
  const mobileNavigation = page.getByRole('dialog', { name: 'Catalogue', exact: true });
  // Opened by a press or from the keyboard, Escape returns focus to the trigger, also in WebKit,
  // where a press focuses no button, and with focus elsewhere before.
  for (const by of ['press', 'keyboard'] as const) {
    await projectName.focus();
    if (by === 'press') await navigationTrigger.click();
    else {
      await navigationTrigger.focus();
      await page.keyboard.press('Enter');
    }
    await expect(mobileNavigation).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(mobileNavigation).toHaveCount(0);
    await expect(navigationTrigger, by).toBeFocused();
  }
  await navigationTrigger.click();
  await mobileNavigation.getByRole('button', { name: 'Close navigation', exact: true }).click();
  await expect(mobileNavigation).toHaveCount(0);
  await expect(navigationTrigger).toBeFocused();
  await navigationTrigger.click();
  await mobileNavigation.getByRole('link', { name: 'TextField', exact: true }).click();
  await expect(mobileNavigation).toHaveCount(0);
  await expect
    .poll(() =>
      page.locator('#site-main').evaluate((main) => main.contains(document.activeElement)),
    )
    .toBe(true);
  await expect(projectName).toHaveValue('Winter release');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(mobileNavigation).toHaveCount(0);
  await expect(page.locator('.site-sidebar')).toBeVisible();
  // The 0.x preview of checkboxes opens the Checkbox page, whose live example keeps its state.
  await goTo(page, '/components/checkbox/preview');
  const archived = page
    .getByRole('group', { name: 'Checkbox example', exact: true })
    .getByRole('checkbox', { name: 'Include archived projects' });
  await archived.check();
  await chooseScheme(page, 'light');
  await expect(archived).toBeChecked();
  // The 0.x route of disclosures opens the Disclosure page, whose live example keeps its state.
  await goTo(page, '/components/notes/preview');
  const disclosure = page.getByRole('group', { name: 'Disclosure example', exact: true });
  await disclosure.locator('summary').click();
  await chooseScheme(page, 'dark');
  await expect(disclosure).toHaveAttribute('data-env-theme', 'dark');
  await expect(disclosure.locator('details')).toHaveAttribute('open', '');
});

test('the navigation holds the wordmark and search, the page the other area and Display, and there is no top bar', async ({
  page,
}) => {
  for (const [address, other, brand] of [
    // In the catalogue the wordmark tops the rail; the Docs, which have no rail, put it in the
    // drawer. The bar is the same on every page of a part, also on one with the Design | Code
    // switch in its banner.
    ['/components', 'Docs', 'Catalogue'],
    ['/components/button', 'Docs', 'Catalogue'],
    ['/docs/tokens', 'Catalogue', 'Docs'],
  ] as const) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openSite(page, `${siteBuildUrl}${address}`);
    await expect(page.getByRole('banner')).toHaveCount(0);
    const wordmark = page
      .getByRole('navigation', { name: brand })
      .getByRole('link', { name: /^envUI( Docs)? home$/ });
    const search = page.locator('.site-sidebar').getByRole('button', { name: /^Search/ });
    await expect(wordmark, address).toBeInViewport();
    await expect(search, address).toBeInViewport();
    // The wordmark and search share the first row.
    const [mark, field] = await Promise.all([wordmark.boundingBox(), search.boundingBox()]);
    expect(Math.abs(mark!.y + mark!.height / 2 - (field!.y + field!.height / 2))).toBeLessThan(4);
    expect(mark!.x + mark!.width).toBeLessThanOrEqual(field!.x);
    // Search is as wide as its content; in the catalogue it is centred in the drawer, and the
    // drawer's first item starts level with the rail's first destination.
    const drawer = (await page.locator('.site-sidebar').boundingBox())!;
    expect(field!.width).toBeLessThan(drawer.width - 24);
    // The list may be scrolled to the current page: where it starts is where its first item does.
    const first = (await page.locator('.site-sidebar .env-navigation-drawer-list').boundingBox())!;
    if (brand === 'Catalogue') {
      const left = field!.x - drawer.x;
      const right = drawer.x + drawer.width - (field!.x + field!.width);
      expect(Math.abs(left - right), address).toBeLessThan(2);
      const destination = (await page
        .locator('.catalogue-rail .env-navigation-rail-item')
        .first()
        .boundingBox())!;
      expect(Math.abs(first.y - destination.y), address).toBeLessThan(1);
    }
    // The other area and the Display menu are ghost buttons at the page's top end.
    const actions = page.locator('.site-page-actions');
    for (const control of [
      actions.getByRole('link', { name: other, exact: true }),
      actions.getByRole('button', { name: 'Display', exact: true }),
    ]) {
      await expect(control, address).toBeInViewport();
      expect((await control.boundingBox())!.x, address).toBeGreaterThan(640);
    }
    // The theme is in the Display menu alone.
    await expect(page.getByRole('button', { name: /^Switch to/ })).toHaveCount(0);

    // A narrow window shows the menu button, the wordmark and search at the page's top start, and
    // the other area and Display as icon buttons at its top end.
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.getByRole('button', { name: 'Open navigation', exact: true });
    const compact = page.locator('.site-compact-controls');
    for (const [control, start] of [
      [menu, true],
      [compact.getByRole('link', { name: /^envUI( Docs)? home$/ }), true],
      [compact.getByRole('button', { name: /^Search/ }), true],
      [actions.getByRole('link', { name: other, exact: true }), false],
      [actions.getByRole('button', { name: 'Display', exact: true }), false],
    ] as const) {
      const box = await control.boundingBox();
      expect(box, address).not.toBeNull();
      expect(box!.x, address).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, address).toBeLessThanOrEqual(390);
      expect(box!.x < 195, address).toBe(start);
    }
    await menu.click();
    const sheet = page.getByRole('dialog', {
      name: address.startsWith('/docs') ? 'Docs' : 'Catalogue',
    });
    await expect(sheet.getByRole('button', { name: /^Search/ })).toBeInViewport();
    // The sheet's close button ends the wordmark's row rather than standing on a row of its own.
    const close = sheet.getByRole('button', { name: 'Close navigation', exact: true });
    const sheetMark = sheet.getByRole('link', { name: /^envUI( Docs)? home$/ });
    const [closeBox, markBox] = await Promise.all([close.boundingBox(), sheetMark.boundingBox()]);
    expect(
      Math.abs(closeBox!.y + closeBox!.height / 2 - (markBox!.y + markBox!.height / 2)),
      address,
    ).toBeLessThan(4);
    await close.click();
    await expect(sheet).toHaveCount(0);
  }
});

test('settings stored under the keys of before move to their keys now, and still apply', async ({
  page,
}) => {
  // A reader's settings from when the site was called the catalogue, and its drawer the site's.
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', 'yes');
    localStorage.setItem('envui-catalogue-theme', 'dark');
    localStorage.setItem('envui-catalogue-scale', 'compact');
    localStorage.setItem('envui-catalogue-drawer-width-site', '25');
  });
  await page.goto(`${siteBuildUrl}/components/button`);
  await expect(page.locator('html')).toHaveAttribute('data-env-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-env-scale', 'compact');
  const stored = await page.evaluate(() => ({ ...localStorage }));
  expect(stored).toMatchObject({
    [displayStorageKeys.theme]: 'dark',
    [displayStorageKeys.scale]: 'compact',
    'envui-site-drawer-width-catalogue': '25',
  });
  expect(Object.keys(stored).filter((key) => key.startsWith('envui-catalogue-'))).toEqual([]);
});

test("every label and heading of the catalogue's and the Docs' drawers fits on one line at the default width", async ({
  page,
}) => {
  // A fresh page has no width stored, so each drawer starts at its default width.
  await page.setViewportSize({ width: 1440, height: 1000 });
  // The Overview, a destination of one page, has no drawer.
  const sections = catalogueSections.filter((section) => section !== 'Overview');
  for (const path of [...sections.map((section) => sectionHome(section).path), 'docs']) {
    await page.goto(`${siteBuildUrl}/${path}`);
    const drawer = page.locator('.site-sidebar');
    await expect(drawer.locator('.env-navigation-drawer-item').first()).toBeVisible();
    // Every section open, so the labels of each one's pages are measured too.
    const closed = drawer.locator('button[aria-expanded="false"]');
    while ((await closed.count()) > 0) await closed.first().click();
    // The drawer keeps each on one line, cut short where it doesn't fit: none may be cut.
    const cut = await drawer
      .locator('.env-navigation-drawer-label, .env-navigation-drawer-group-label')
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.scrollWidth > element.clientWidth)
          .map((element) => element.textContent),
      );
    expect(cut, path).toEqual([]);
  }
});

test('the navigation shows the current page, and focus moves to the page only on a route change', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${siteBuildUrl}/components/tree`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tree');
  // The rail marks the page's destination, and the drawer beside it lists the destination's pages.
  await expect(
    page.getByRole('navigation', { name: 'Catalogue' }).locator('[aria-current="page"]'),
  ).toHaveText('Components');
  const navigation = page.getByRole('navigation', { name: 'Components' });
  // The current page's link is scrolled into view as the navigation mounts.
  const current = navigation.locator('[aria-current="page"]');
  await expect(current).toHaveText(/Tree/);
  await expect(current).toBeInViewport();
  // The first page loaded leaves focus at the start of the document.
  const main = page.getByRole('main');
  await expect(main).not.toBeFocused();
  // The drawer's groups open and close as the Docs' do: the current page's open, the others closed
  // until the reader opens one.
  const actions = navigation.getByRole('button', { name: 'Actions', exact: true });
  await expect(actions).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation.getByRole('link', { name: 'Button', exact: true })).toBeHidden();
  await actions.click();
  await navigation.getByRole('link', { name: 'Button', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  await expect(main).toBeFocused();
  // A destination of the rail opens its first page, the page of all its pages, and the drawer
  // lists its pages.
  await page
    .getByRole('navigation', { name: 'Catalogue' })
    .getByRole('link', { name: 'Foundations', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Foundations');
  const foundations = page.getByRole('navigation', { name: 'Foundations' });
  await expect(foundations.getByRole('link', { name: 'Typography' })).toBeVisible();
  await foundations.getByRole('link', { name: 'Colors & themes', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Colors & themes');
  // The Docs have a navigation of their own, and the switch in the banner leads to the same
  // subject in the other part and back.
  const partSwitch = page.getByRole('navigation', { name: 'Design or code' });
  await partSwitch.getByRole('link', { name: 'Code', exact: true }).click();
  await expect(page).toHaveURL(`${siteBuildUrl}/docs/foundations/colors`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Colors & themes');
  await expect(page.getByRole('navigation', { name: 'Catalogue' })).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Docs' }).getByRole('link', { name: 'Design tokens' }),
  ).toBeVisible();
  await partSwitch.getByRole('link', { name: 'Design', exact: true }).click();
  await expect(page).toHaveURL(`${siteBuildUrl}/foundations/colors`);
  await expect(page.getByRole('navigation', { name: 'Catalogue' })).toBeVisible();
});

test("the catalogue's drawer comes in beside the rail, goes again and brings in another destination's list, and the page beside it never moves", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${siteBuildUrl}/components`);
  const drawer = page.locator('.site-sidebar');
  const list = drawer.locator('.env-navigation-drawer-list');
  const rail = page.getByRole('navigation', { name: 'Catalogue' });
  const bodyStart = () =>
    page.locator('.env-scaffold-body').evaluate((body) => body.getBoundingClientRect().left);
  // The first page shows it at once.
  await expect(list).toBeVisible();
  await expect(drawer).not.toHaveAttribute('data-site-drawer');
  const besideDrawer = await bodyStart();
  // Records, on every frame from now on until the next recording, the drawer's motion, its list's
  // opacity, where the page beside it starts, how many drawers there are and where search is; and
  // the fades of the list, whatever the frames: each transition of its opacity as it starts, with
  // the drawer's motion then, and each animation of it the page starts, with its keyframes. A busy
  // page's frames can come further apart than a fade lasts, so no frame need show one midway.
  type Fade = [kind: string, motion: string, opacities: number[]];
  const record = () =>
    page.evaluate(() => {
      type Recording = {
        frames: [string, number, number, number, number][];
        fades: Fade[];
        stop: () => void;
      };
      const state = window as unknown as { recording?: Recording };
      state.recording?.stop();
      const recording: Recording = { frames: [], fades: [], stop: () => {} };
      state.recording = recording;
      const list = '.site-sidebar > .env-navigation-drawer-list';
      const motion = () =>
        document.querySelector<HTMLElement>('.site-sidebar')?.dataset.siteDrawer ?? 'still';
      const transition = (event: TransitionEvent) => {
        if ((event.target as Element).matches(list) && event.propertyName === 'opacity')
          recording.fades.push(['transition', motion(), []]);
      };
      // The list's new entries come in through the Web Animations API (useDrawerMotion.ts).
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (keyframes, options) {
        if (this.matches(list) && Array.isArray(keyframes))
          recording.fades.push([
            'animation',
            motion(),
            keyframes.map((keyframe) => Number(keyframe.opacity)),
          ]);
        return animate.call(this, keyframes, options);
      };
      document.addEventListener('transitionrun', transition, true);
      let frame = 0;
      const tick = () => {
        const sidebar = document.querySelector<HTMLElement>('.site-sidebar');
        const items = sidebar?.querySelector('.env-navigation-drawer-list');
        recording.frames.push([
          sidebar ? (sidebar.dataset.siteDrawer ?? 'still') : 'none',
          items ? Number(getComputedStyle(items).opacity) : 0,
          document.querySelector('.env-scaffold-body')!.getBoundingClientRect().left,
          document.querySelectorAll('.site-sidebar').length,
          document
            .querySelector('.site-drawer-search, .site-page-search-button')!
            .getBoundingClientRect().left,
        ]);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      recording.stop = () => {
        cancelAnimationFrame(frame);
        document.removeEventListener('transitionrun', transition, true);
        Element.prototype.animate = animate;
      };
    });
  const recorded = () =>
    page.evaluate(
      () =>
        (
          window as unknown as {
            recording: { frames: [string, number, number, number, number][]; fades: Fade[] };
          }
        ).recording,
    );
  const frames = async () => (await recorded()).frames;
  /** Whether the list faded from 0 to 1 opacity or back: a transition, or an animation. */
  const faded = (fades: Fade[], motion: string, from: number, to: number) =>
    fades.some(
      ([kind, during, opacities]) =>
        during === motion &&
        (kind === 'transition' || (opacities[0] === from && opacities.at(-1) === to)),
    );
  // To the Overview, which has none, it fades out laid over the page, which takes its room at once.
  await record();
  await rail.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeAttached();
  await expect(drawer).toHaveCount(0);
  const { frames: out, fades: outFades } = await recorded();
  const leaving = out.filter(([motion]) => motion === 'leaving');
  expect(leaving.length).toBeGreaterThan(0);
  // From its full opacity, through a transition, to none.
  expect(out[0]![1]).toBe(1);
  expect(faded(outFades, 'leaving', 1, 0)).toBe(true);
  const besideRail = out.at(-1)![2];
  expect(besideRail).toBeLessThan(besideDrawer);
  expect(leaving.every(([, , start]) => start === besideRail)).toBe(true);
  // Back to Components, it fades in beside the rail, and the page starts beside it from its first
  // frame.
  await record();
  await rail.getByRole('link', { name: 'Components', exact: true }).click();
  await expect
    .poll(async () => (await frames()).some(([motion]) => motion === 'entering'))
    .toBe(true);
  await expect(drawer).not.toHaveAttribute('data-site-drawer');
  const { frames: backFrames, fades: backFades } = await recorded();
  const back = backFrames.filter(([motion]) => motion !== 'none');
  // From none while it waits for the page to paint, through a transition, to its full opacity.
  expect(back.filter(([motion]) => motion === 'arriving').map(([, opacity]) => opacity)).toContain(
    0,
  );
  expect(faded(backFades, 'entering', 0, 1)).toBe(true);
  expect(back.at(-1)![1]).toBe(1);
  expect(back.every(([, , start]) => start === besideDrawer)).toBe(true);
  const searchAt = backFrames.at(-1)![4];
  // To Patterns, which has a drawer too, the panel stays and the new list comes in once the page
  // has painted: one drawer and one list all along, search and the page where they were.
  await record();
  await rail.getByRole('link', { name: 'Patterns', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Patterns' })).toBeVisible();
  await expect
    .poll(async () => (await frames()).some(([motion]) => motion === 'switching'))
    .toBe(true);
  await expect(drawer).not.toHaveAttribute('data-site-drawer');
  const { frames: switched, fades: switchFades } = await recorded();
  expect(faded(switchFades, 'switching', 0, 1)).toBe(true);
  expect(switched.at(-1)![1]).toBe(1);
  expect(
    switched.every(
      ([, , start, drawers, search]) =>
        start === besideDrawer && drawers === 1 && search === searchAt,
    ),
  ).toBe(true);
  // A page of the same destination, such as a pattern from its gallery, changes which is current,
  // and nothing moves.
  await record();
  await page.locator('.catalogue-gallery-link').first().click();
  await expect(page).not.toHaveURL(`${siteBuildUrl}/patterns`);
  await expect(page.getByRole('navigation', { name: 'Patterns' })).toBeVisible();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  expect((await frames()).every(([motion, opacity]) => motion === 'still' && opacity === 1)).toBe(
    true,
  );
  expect(await bodyStart()).toBe(besideDrawer);
});

test("a catalogue page has its contents beside it from 56rem, in the Docs' column, and a banner as wide as theirs", async ({
  page,
}) => {
  const contents = page.getByRole('navigation', { name: 'On this page' });
  const topLevel = () =>
    contents.evaluate((navigation) =>
      [...navigation.querySelector('ol, ul')!.children].map(
        (item) => item.querySelector(':scope > a')?.textContent,
      ),
    );
  // A component's page lists its sections, none of their subsections, and marks where the reader
  // is; a link scrolls to its section.
  await page.goto(`${siteBuildUrl}/components/button`);
  await expect(contents).toBeVisible();
  await expect
    .poll(topLevel)
    .toEqual(['Overview', 'Variants', 'Anatomy', 'Behaviour', 'Rules', 'Accessibility', 'Related']);
  await expect(contents.locator('li li')).toHaveCount(0);
  await expect(contents.locator('[aria-current="location"]')).toHaveText('Overview');
  await contents.getByRole('link', { name: 'Rules', exact: true }).click();
  await expect(page).toHaveURL(`${siteBuildUrl}/components/button#rules`);
  await expect(contents.locator('[aria-current="location"]')).toHaveText('Rules');
  // The banner, the page's column and the contents beside it are laid out as in the Docs: the
  // banner is its column less the gutters, level with the top of the contents, and the contents
  // take the rest of the pane, so a banner is as wide as the Docs' wherever the pane and the
  // contents, which are one width on every page, are as wide.
  const layout = () =>
    page.evaluate(() => {
      const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const [banner, column, contents, pane] = [
        '.site-page-banner',
        '.site-page-column',
        '.site-contents',
        '.site-page-layout',
      ].map(box);
      return {
        rest: pane.width - banner.width - contents.width,
        inset: banner.left - column.left,
        end: column.right - banner.right,
        level: contents.top - banner.top,
      };
    });
  await contents.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(contents.locator('[aria-current="location"]')).toHaveText('Overview');
  const catalogue = await layout();
  expect(catalogue.end).toBeCloseTo(catalogue.inset, 1);
  await goTo(page, '/docs/components/button');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  await expect(contents).toBeVisible();
  await expect(async () => {
    const docs = await layout();
    for (const key of Object.keys(catalogue) as (keyof typeof catalogue)[])
      expect(docs[key], key).toBeCloseTo(catalogue[key], 1);
  }).toPass();
  // The index pages, whose groups the drawer lists, have no contents, and their galleries take the
  // width; nor has the overview, which has no drawer either, and no pager: its cards lead on.
  await goTo(page, '/components');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Components');
  await expect(contents).toHaveCount(0);
  await goTo(page, '/');
  await expect(page.locator('.catalogue-overview-hero')).toBeVisible();
  await expect(contents).toHaveCount(0);
  await expect(page.locator('.site-sidebar')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Catalogue' })).toBeVisible();
  await expect(page.locator('.site-page-navigation')).toHaveCount(0);
  // A pane narrower than 56rem leaves them out, as in the Docs.
  await goTo(page, '/patterns/forms');
  await expect(contents).toBeVisible();
  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(contents).toBeHidden();
});

test("a catalogue page's contents list none of its figures' headings, a do and don't pair's included", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const contents = page.getByRole('navigation', { name: 'On this page' });
  // Card's do and don't pairs hold cards with headings of their own.
  await page.goto(`${siteBuildUrl}/components/card`);
  await showFigures(page);
  await expect(contents.getByRole('link', { name: 'Rules', exact: true })).toBeVisible();
  await expect(page.locator('.site-verdict-stage :is(h2, h3)').first()).toBeAttached();
  const inFigures = await contents.evaluate((navigation) =>
    [...navigation.querySelectorAll('a[href^="#"]')].flatMap((link) => {
      const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      return heading?.closest('.site-live-example, .site-verdict-stage, .site-anatomy-stage')
        ? [link.textContent]
        : [];
    }),
  );
  expect(inFigures).toEqual([]);
});

test("a page's contents are whole from its first render, pre-rendered or followed to, while its later sections are outlines", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // The contents in the first frame that paints the heading of Button's page at
  // `globalThis.awaited`, a path, and how many of its sections are still to show; scripts/test/CheckContents.ts checks
  // every page the same way, with the parts held back.
  await page.addInitScript(() => {
    const state = globalThis as {
      awaited?: string;
      firstContents?: string[];
      pending?: number;
    };
    const take = () => {
      requestAnimationFrame(take);
      if (state.firstContents || location.pathname !== state.awaited) return;
      // A page followed to paints its own heading once its view replaces the page before.
      if (document.querySelector('.site-page-column h1')?.textContent !== 'Button') return;
      state.firstContents = [...document.querySelectorAll('.site-contents-list a')].map(
        (link) => `${link.getAttribute('href')} ${link.textContent}`,
      );
      state.pending = document.querySelectorAll('[data-site-pending]').length;
    };
    requestAnimationFrame(take);
  });
  const contentsOf = async () => {
    // A pre-rendered page's figures render as they near the view.
    await showFigures(page);
    await expect(page.locator('[data-site-pending], .site-loading')).toHaveCount(0);
    const loaded = await page
      .locator('.site-contents-list a')
      .evaluateAll((links) =>
        links.map((link) => `${link.getAttribute('href')} ${link.textContent}`),
      );
    expect(loaded.length).toBeGreaterThan(3);
    // Each leads to one of the page's headings.
    const targets = await page.evaluate(
      (hrefs) => hrefs.map((href) => document.getElementById(href.slice(1))?.tagName),
      loaded.map((entry) => entry.split(' ')[0]),
    );
    expect(targets.every((tag) => tag === 'H2')).toBe(true);
    return loaded;
  };
  const firstRender = () =>
    page
      .waitForFunction(() => (globalThis as { firstContents?: string[] }).firstContents)
      .then((handle) => handle.jsonValue());
  for (const [path, from] of [
    ['/components/button', '/components/link'],
    ['/docs/components/button', '/docs/components/link'],
  ] as const) {
    // Pre-rendered, the page's HTML holds the contents, beside the page and under its banner,
    // before any script runs, as its first render does; every section is there.
    await page.addInitScript((awaited) => {
      (globalThis as { awaited?: string }).awaited = awaited;
    }, path);
    await page.goto(`${siteBuildUrl}${path}`);
    const first = await firstRender();
    const loaded = await contentsOf();
    expect(first).toEqual(loaded);
    const html = await (await page.request.get(`${siteBuildUrl}${path}`)).text();
    const inHtml = [...html.matchAll(/<a [^>]*class="env-table-of-contents-link"[^>]*>/g)].map(
      ([link]) => /href="([^"]*)"/.exec(link)?.[1],
    );
    const hrefs = loaded.map((entry) => entry.split(' ')[0]);
    expect(inHtml).toEqual([...hrefs, ...hrefs]);
    // Followed to from another page, it renders in the browser, its sections after the first one
    // after another, each its outline meanwhile, and its contents are whole all the same.
    await openSite(page, `${siteBuildUrl}${from}`);
    await page.evaluate(() => {
      (globalThis as { firstContents?: string[] }).firstContents = undefined;
    });
    await page
      .getByRole('navigation', { name: path.startsWith('/docs') ? 'Docs' : 'Components' })
      .getByRole('link', { name: 'Button', exact: true })
      .click();
    expect(await firstRender()).toEqual(loaded);
    expect(await page.evaluate(() => (globalThis as { pending?: number }).pending)).toBeGreaterThan(
      0,
    );
    expect(await contentsOf()).toEqual(loaded);
  }
});

test('the theme in the Display menu switches the whole page and keeps the canvas full height', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1400 });
  await page.goto(`${siteBuildUrl}/components/checkbox/preview`);
  const root = page.locator('html');
  const panes = page.locator('.catalogue-specimen-area');
  // The 0.x preview opens the Checkbox page, whose live example follows the theme with its state.
  const example = page.getByRole('group', { name: 'Checkbox example', exact: true });
  const archived = example.getByRole('checkbox', { name: 'Include archived projects' });
  await archived.check();
  await chooseScheme(page, 'dark');
  await expect(root).toHaveAttribute('data-env-theme', 'dark');
  await expect(example).toHaveAttribute('data-env-theme', 'dark');
  await expect(example).toHaveCount(1);
  await expect(archived).toBeChecked();
  await expect(page.locator('.docs-theme-label')).toHaveCount(0);

  for (const width of [1920, 960, 390]) {
    await page.setViewportSize({ width, height: 1400 });
    // The content fills the frame's body, which fills the window below the top bar.
    const canvas = await page.locator('.site-main').evaluate((main) => {
      const body = main.closest('.env-scaffold-body')!;
      return {
        height: main.getBoundingClientRect().height,
        body: body.clientHeight,
        bottom: body.getBoundingClientRect().bottom,
        background: getComputedStyle(main).backgroundImage,
      };
    });
    expect(canvas.height).toBeGreaterThanOrEqual(canvas.body - 1);
    expect(Math.abs(canvas.bottom - 1400)).toBeLessThan(1);
    expect(canvas.background).toBe('none');
  }

  await page.setViewportSize({ width: 1920, height: 1000 });
  await goTo(page, '/foundations/colors');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Colors & themes');
  // The role swatches show each role in the reader's theme, and follow it.
  const pageSwatch = page.locator('.catalogue-role-swatch > span').first();
  const swatchColor = () =>
    pageSwatch.evaluate((swatch) => getComputedStyle(swatch).backgroundColor);
  const darkColor = await swatchColor();
  await chooseScheme(page, 'light');
  await expect(root).toHaveAttribute('data-env-theme', 'light');
  await expect.poll(swatchColor).not.toBe(darkColor);
  await chooseScheme(page, 'dark');
  await expect(root).toHaveAttribute('data-env-theme', 'dark');
  // The setup guide, in the Docs, keeps the theme.
  await goTo(page, '/getting-started');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install and set up');
  await expect(root).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes).toHaveCount(0);
});

test("the Display menu stays open while a page's figures play, and they go on once it closes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // The Menu page's overview rests open and its figures press their menus open as they play.
  await page.goto(`${siteBuildUrl}/components/menu`);
  const overview = page.locator('.catalogue-overlay-layer [role="menu"]').first();
  await expect(overview).toBeVisible();
  await page.getByRole('button', { name: 'Display', exact: true }).click();
  const display = page.getByRole('menu').filter({ hasText: 'Contrast' });
  await expect(display).toBeVisible();
  // Their presses would count as presses outside it; held, they leave it open.
  await page.waitForTimeout(3000);
  await expect(display).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(display).toHaveCount(0);
  await expect(overview).toBeVisible();
});
