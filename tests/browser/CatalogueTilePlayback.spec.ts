import { test, expect, type Page } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import { showTile } from './helpers/SiteSpecHelpers';

// A gallery tile that plays its script as the pointer comes in: what it opens, its clicks and its
// cursor.

/** A gallery tile's view: the translate and scale its canvas is drawn at (useFit.ts). */
const viewOf = (canvas: Element) => {
  const [, x, y, scale] =
    (canvas as HTMLElement).style.transform.match(
      /translate\(([-\d.e]+)px, ([-\d.e]+)px\) scale\(([-\d.e]+)\)/,
    ) ?? [];
  return { x: Number(x), y: Number(y), scale: Number(scale) };
};

type PlayFrame = {
  time: number;
  view: { x: number; y: number; scale: number };
  cut: string;
  past: Record<string, number>;
  popups: Record<string, number>[];
};

/**
 * Hovers a gallery tile from rest for `duration` ms and records each frame of its play: its view,
 * where it is cut off, how far what `targets` select reaches past the stage's edges, and how far
 * each popup it opens does. Then rests it, back at its still's scale.
 */
async function playTile(page: Page, name: string, targets: string[], duration = 4500) {
  const tile = page.locator('.catalogue-gallery-tile').filter({
    has: page.locator('.catalogue-gallery-name', { hasText: new RegExp(`^${name}$`) }),
  });
  const canvas = tile.locator('.catalogue-tile-canvas[data-fitted]');
  await showTile(tile);
  await expect(canvas).toHaveCount(1);
  await page.mouse.move(0, 0);
  await expect(tile.locator('[data-playing]')).toHaveCount(0);
  const rest = await canvas.evaluate(viewOf);
  await tile.evaluate((element, targets) => {
    // As viewOf reads it, in the page.
    const view = (canvas: HTMLElement) => {
      const [, x, y, scale] =
        canvas.style.transform.match(
          /translate\(([-\d.e]+)px, ([-\d.e]+)px\) scale\(([-\d.e]+)\)/,
        ) ?? [];
      return { x: Number(x), y: Number(y), scale: Number(scale) };
    };
    const frames: PlayFrame[] = [];
    (element as HTMLElement & { frames?: PlayFrame[] }).frames = frames;
    const stage = element.querySelector('.catalogue-tile-stage')!;
    const start = performance.now();
    const reach = (boxes: DOMRect[]) => {
      const edge = stage.getBoundingClientRect();
      return {
        top: edge.top - Math.min(...boxes.map((box) => box.top)),
        start: edge.left - Math.min(...boxes.map((box) => box.left)),
        end: Math.max(...boxes.map((box) => box.right)) - edge.right,
        bottom: Math.max(...boxes.map((box) => box.bottom)) - edge.bottom,
      };
    };
    const card = ".env-popup, [role='menu'], [role='dialog'], [role='alertdialog']";
    // What the still showed open, drawn as it rests, such as a dialog cut off at its foot: what
    // opens as it plays is judged.
    const rested = new Set(element.querySelectorAll('.catalogue-overlay-layer *'));
    const sample = () => {
      const canvas = element.querySelector<HTMLElement>('.catalogue-tile-canvas');
      if (canvas && element.querySelector('[data-playing]')) {
        // What shows of each, as a scrolled row doesn't.
        const boxes = targets
          .flatMap((selector) => [...canvas.querySelectorAll(selector)])
          .filter((node) => node.checkVisibility({ opacityProperty: true }))
          .map((node) => node.getBoundingClientRect())
          .filter((box) => box.width > 1 && box.height > 1);
        // Each popup that opened and shows, but on its way in or out.
        const popups = [...canvas.querySelectorAll('.catalogue-overlay-layer *')]
          .filter((node) => !rested.has(node))
          .filter((node) => node.matches(card) && !node.parentElement?.closest(card))
          .filter((node) => node.checkVisibility({ opacityProperty: true }))
          .filter((node) => !node.closest('[data-starting-style], [data-ending-style]'))
          .filter((node) => !node.getAnimations().length)
          .map((node) => reach([node.getBoundingClientRect()]));
        frames.push({
          time: performance.now() - start,
          view: view(canvas),
          cut: canvas.dataset.cut ?? '',
          past: boxes.length ? reach(boxes) : { top: 0, start: 0, end: 0, bottom: 0 },
          popups,
        });
      }
      if (element.isConnected) requestAnimationFrame(sample);
    };
    sample();
  }, targets);
  const box = (await tile.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  await expect(tile.locator('[data-playing]')).toHaveCount(1);
  await page.waitForTimeout(duration);
  const frames = await tile.evaluate((element) =>
    (element as HTMLElement & { frames: PlayFrame[] }).frames.splice(0),
  );
  await page.mouse.move(0, 0);
  // About its still's scale: a popup shown open at rest, placed against the window's edge, may
  // come to rest a hair from where it was.
  await expect
    .poll(async () => Math.abs((await canvas.evaluate(viewOf)).scale - rest.scale), {
      message: name,
    })
    .toBeLessThan(0.005);
  // And has come to a stop there.
  await expect
    .poll(() =>
      canvas.evaluate(
        (element) =>
          new Promise<boolean>((resolve) => {
            const { transform } = (element as HTMLElement).style;
            requestAnimationFrame(() =>
              requestAnimationFrame(() =>
                resolve((element as HTMLElement).style.transform === transform),
              ),
            );
          }),
      ),
    )
    .toBe(true);
  return { rest, frames };
}

/**
 * Frames whose view holds for 300 ms either side: where it is drawn, not on its way there, nor in
 * the frame or two a popup shows before the view follows it.
 */
const heldFrames = (frames: PlayFrame[]) =>
  frames.filter((frame) =>
    frames
      .filter(({ time }) => Math.abs(time - frame.time) <= 300)
      .every(
        ({ view }) =>
          view.scale === frame.view.scale &&
          Math.abs(view.x - frame.view.x) < 0.5 &&
          Math.abs(view.y - frame.view.y) < 0.5,
      ),
  );

test("a gallery tile that plays draws out what it opens inside its stage and rests at its still's scale", async ({
  page,
}) => {
  // As a tile plays, its view stays at its still until what its script opens needs more room:
  // then it is drawn out about its trigger, no smaller than a popup's least scale (Gallery.css),
  // and holds there: its scale only falls. Played again, it does the same. A menu closed and
  // opened again from its button keeps its items and its button in view.
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components`);
  const least = 0.84;
  // What each script acts on, by the selectors of its tile (tiles/).
  const cards = {
    Menu: ['.env-menu-item', '.env-button'],
  };
  for (const [name, targets] of Object.entries(cards)) {
    const { rest, frames: first } = await playTile(page, name, targets);
    expect(first.length, name).toBeGreaterThan(20);
    const floor = Math.min(rest.scale, least);
    const outside = heldFrames(first)
      .filter(({ time }) => time > 900)
      .flatMap(({ view: { scale }, past }) => [
        ...(scale < floor - 0.001 ? [`drawn at ${scale}`] : []),
        ...Object.entries(past).flatMap(([side, by]) =>
          by > 1 ? [`${side} ${by} at ${scale}`] : [],
        ),
      ]);
    expect([...new Set(outside)], name).toEqual([]);
    // Drawn out, it is drawn no larger again until it rests.
    const grows = first.filter(
      (frame, index) => index > 0 && frame.view.scale > first[index - 1]!.view.scale,
    );
    expect(grows, name).toEqual([]);
    // Played again, it does the same: it starts at its still and is drawn out as far.
    const { frames: again } = await playTile(page, name, targets);
    expect(again[0]!.view.scale, name).toBeCloseTo(rest.scale, 2);
    expect(again.at(-1)!.view.scale, name).toBeCloseTo(first.at(-1)!.view.scale, 3);
  }
});

test('a popup tile rests open and holds one view from its still through its play', async ({
  page,
}) => {
  // A select, a combobox, a menu bar and a command palette rest with their popup open, framed on
  // it whole; as they play, the list closes and opens again in place, and nothing is drawn smaller
  // or moved (useHeldView, Playback.tsx). So does the avatar pile as its tooltip opens.
  test.setTimeout(120_000);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto(`${siteDevUrl}/components`);
    for (const name of ['Select', 'Combobox', 'Menubar', 'CommandPalette', 'Avatar']) {
      const tile = page.locator('.catalogue-gallery-tile').filter({
        has: page.locator('.catalogue-gallery-name', { hasText: new RegExp(`^${name}$`) }),
      });
      await showTile(tile);
      // At rest, the popup shows open, cut off nowhere; on a phone, where it is larger than the
      // stage at a popup's least, it runs on past the stage's foot or end, fading out there,
      // rather than being drawn smaller, never past its top or start.
      if (name !== 'Avatar') {
        await expect(
          tile
            .locator('.catalogue-overlay-layer')
            .locator('.env-popup, .env-command-palette')
            .first(),
          name,
        ).toBeVisible();
        await expect(tile.locator('.catalogue-tile-canvas[data-fitted]'), name).not.toHaveAttribute(
          'data-cut',
          width === 390 ? /top|start/ : /./,
        );
      }
      const { rest, frames } = await playTile(page, name, [], 4500);
      expect(frames.length, name).toBeGreaterThan(20);
      const moved = frames
        .filter(
          ({ view }) =>
            Math.abs(view.scale - rest.scale) > 0.0005 ||
            Math.abs(view.x - rest.x) > 0.5 ||
            Math.abs(view.y - rest.y) > 0.5,
        )
        .map(({ time, view }) => `${Math.round(time)}: ${JSON.stringify(view)}`);
      expect(moved, `${name} at ${width}`).toEqual([]);
    }
  }
});

test('a gallery tile holds its still as the pointer comes in', async ({ page }) => {
  // The first thing seen as a tile starts to play is what its script does, not the tile moving.
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components`);
  // Its still is framed as its play is (useFit.ts): Accordion's panel opens in place.
  for (const name of ['Tree', 'List', 'Avatar', 'Accordion']) {
    // Just past 300 ms, the first stretch of the play.
    const { rest, frames } = await playTile(page, name, [], 400);
    const moved = frames
      .filter(({ time }) => time <= 300)
      .filter(
        ({ view }) =>
          view.scale !== rest.scale ||
          Math.abs(view.x - rest.x) > 0.5 ||
          Math.abs(view.y - rest.y) > 0.5,
      );
    expect(moved, name).toEqual([]);
  }
});

test('a tile that holds its view is framed the same wherever the pointer comes in', async ({
  page,
}) => {
  // Framed at rest on its largest state, such as the avatar pile in the row it spreads into, it
  // shows the same frame from its still through its play and back, whether the pointer comes in at
  // the stage's middle or its corner, and the pile's count and its tooltip show whole.
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components`);
  await expect(page.locator('.catalogue-tile-canvas[data-fitted]').first()).toBeVisible();
  for (const name of [
    'Avatar',
    'Menu',
    'Select',
    'Combobox',
    'Menubar',
    'CommandPalette',
    'MonthPicker',
    'TimePicker',
  ]) {
    const tile = page.locator('.catalogue-gallery-tile').filter({
      has: page.locator('.catalogue-gallery-name', { hasText: new RegExp(`^${name}$`) }),
    });
    const canvas = tile.locator('.catalogue-tile-canvas[data-fitted]');
    await showTile(tile);
    await page.mouse.move(0, 0);
    await expect(canvas).toHaveCount(1);
    const still = () =>
      canvas.evaluate(
        (element: HTMLElement) =>
          new Promise<string>((resolve) => {
            const { transform } = element.style;
            let frames = 20;
            const next = () => {
              if (element.style.transform !== transform) resolve('');
              else if (--frames) requestAnimationFrame(next);
              else resolve(transform);
            };
            requestAnimationFrame(next);
          }),
      );
    await expect.poll(still, { message: name }).not.toBe('');
    const rest = await still();
    for (const [x, y] of [
      [0.5, 0.4],
      [0.97, 0.7],
    ] as const) {
      await showTile(tile);
      const box = (await tile.locator('.catalogue-tile-stage').boundingBox())!;
      await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
      await expect(tile.locator('[data-playing]')).toHaveCount(1);
      const { views, cut } = await tile.evaluate(
        (element, name) =>
          new Promise<{ views: string[]; cut: string[] }>((resolve) => {
            const canvas = element.querySelector<HTMLElement>('.catalogue-tile-canvas')!;
            const stage = element.querySelector('.catalogue-tile-stage')!.getBoundingClientRect();
            const views = new Set<string>();
            const cut = new Set<string>();
            const start = performance.now();
            const sample = () => {
              views.add(canvas.style.transform);
              // The pile's avatars, its count and its tooltip, whole in the stage, and the row the
              // pile spreads into across its middle.
              const row = canvas.querySelector('.env-avatar-group')?.getBoundingClientRect();
              if (row && Math.abs((row.left + row.right) / 2 - (stage.left + stage.right) / 2) > 2)
                cut.add('off the middle');
              if (name === 'Avatar')
                for (const part of canvas.querySelectorAll(
                  '.env-avatar-group > *, .catalogue-overlay-layer .env-tooltip',
                )) {
                  const box = part.getBoundingClientRect();
                  if (
                    part.checkVisibility({ opacityProperty: true }) &&
                    (box.left < stage.left - 0.5 ||
                      box.right > stage.right + 0.5 ||
                      box.top < stage.top - 0.5 ||
                      box.bottom > stage.bottom + 0.5)
                  )
                    cut.add(part.className);
                }
              if (performance.now() - start < 2200) requestAnimationFrame(sample);
              else resolve({ views: [...views], cut: [...cut] });
            };
            sample();
          }),
        name,
      );
      expect(views, `${name}, the pointer in at ${x}, ${y}`).toEqual([rest]);
      expect(cut, `${name}, the pointer in at ${x}, ${y}`).toEqual([]);
      await page.mouse.move(0, 0);
      await expect(tile.locator('[data-playing]')).toHaveCount(0);
      await expect.poll(still, { message: `${name} rests again` }).toBe(rest);
    }
  }
});

test('on a phone, what a playing gallery tile opens shows inside its stage', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${siteDevUrl}/components`);
  for (const name of ['Menubar', 'Select']) {
    const { frames } = await playTile(page, name, []);
    // Past an edge it is cut off at, such as the menu bar's menu at the stage's end, it fades out.
    const outside = heldFrames(frames).flatMap(({ time, popups, cut }) =>
      popups.flatMap((popup) =>
        Object.entries(popup).flatMap(([side, by]) =>
          by > 1 && !cut.split(' ').includes(side)
            ? [`${side} ${Math.round(by)} at ${Math.round(time)}`]
            : [],
        ),
      ),
    );
    expect(outside, name).toEqual([]);
  }
  // A dialog taller than its stage shows from its top, and the view pans down it to what the
  // script presses, so each press lands on what it aims at (useFit.ts).
  expect(await deadClicks(page, ['Dialog', 'ConfirmDialog'])).toEqual([]);
});

/**
 * What a gallery tile shows that a click can change, as one string: each element's name, its
 * states and its own text, and a field's value, but not what the pointer marks as it hovers and
 * presses, nor what the fit sets as the view moves (useFit.ts).
 */
function tileState(canvas: Element) {
  const states = [
    'aria-current',
    'aria-checked',
    'aria-selected',
    'aria-expanded',
    'aria-pressed',
    'aria-hidden',
    'data-checked',
    'data-selected',
    'data-current',
    'data-open',
    'data-state',
    'data-catalogue-focus',
    'hidden',
    'open',
    'disabled',
  ];
  // What is selected, as the pointer's drag paints it (VirtualSelection.ts) or the page holds it.
  const highlight = (
    CSS as unknown as { highlights?: Map<string, Iterable<Range>> }
  ).highlights?.get('catalogue-selection');
  const selected = `${[...(highlight ?? [])].map(String).join('|')}|${String(getSelection())}`;
  return [...canvas.querySelectorAll('*')]
    .map((element) => {
      const own = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim())
        .join('');
      const value =
        element instanceof HTMLInputElement
          ? `=${element.value}${element.checked ? ' checked' : ''}`
          : element instanceof HTMLTextAreaElement
            ? `=${element.value}`
            : '';
      const marks = states
        .filter((name) => element.hasAttribute(name))
        .map((name) => `${name}=${element.getAttribute(name)}`)
        .join(' ');
      return `${element.localName}[${marks}]${own}${value}`;
    })
    .concat(selected)
    .join('\n');
}

/**
 * Plays a gallery's tiles one after another, each for one loop of its script, and returns, for
 * each tile whose pointer clicks, the clicks after which nothing in it changed by the time of its
 * next press or 700 ms later: a click that misses what it aims at, such as one that a box clipped
 * away takes, leaves the tile as it was.
 */
async function deadClicks(page: Page, names: string[]) {
  const dead: string[] = [];
  for (const name of names) {
    const tile = page.locator('.catalogue-gallery-tile').filter({
      has: page.locator('.catalogue-gallery-name', { hasText: new RegExp(`^${name}$`) }),
    });
    const canvas = tile.locator('.catalogue-tile-canvas[data-fitted]');
    await showTile(tile);
    await expect(canvas, name).toHaveCount(1);
    await page.mouse.move(0, 0);
    await expect(tile.locator('[data-playing]')).toHaveCount(0);
    await canvas.evaluate((element, source) => {
      const state = new Function(`return (${source})`)() as (canvas: Element) => string;
      const log = { clicks: 0, dead: [] as string[], left: false, pressed: false };
      (element as HTMLElement & { clickLog?: typeof log }).clickLog = log;
      let before: string | null = null;
      let down = { x: 0, y: 0, time: 0 };
      let pending: { after: string; timer: number } | null = null;
      const settle = () => {
        if (!pending) return;
        window.clearTimeout(pending.timer);
        if (state(element) === before) log.dead.push(pending.after);
        pending = null;
      };
      element.addEventListener(
        'pointerdown',
        (event) => {
          if (event.isTrusted) return;
          settle();
          log.pressed = true;
          before = state(element);
          const { clientX: x, clientY: y } = event as PointerEvent;
          down = { x, y, time: performance.now() };
        },
        true,
      );
      element.addEventListener(
        'click',
        (event) => {
          if (event.isTrusted) return;
          // A click step holds the button 90 ms where it is (PointerPlan.ts); a longer press,
          // such as a card's, shows its pressed state, and a drag, such as a slider's, moves.
          const { clientX: x, clientY: y } = event as MouseEvent;
          if (performance.now() - down.time > 160 || Math.hypot(x - down.x, y - down.y) > 3) return;
          log.clicks++;
          const target = event.target as Element;
          const label =
            `${target.localName}.${[...target.classList].join('.')} ` +
            `"${target.textContent?.trim().slice(0, 20)}"`;
          pending = { after: label, timer: window.setTimeout(settle, 700) };
        },
        true,
      );
      // The script ends as its pointer leaves the preview, with no element it goes to.
      element.addEventListener(
        'pointerout',
        (event) => {
          if (!event.isTrusted && !(event as PointerEvent).relatedTarget) log.left = true;
        },
        true,
      );
    }, tileState.toString());
    const box = (await tile.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 8);
    await expect(tile.locator('[data-playing]')).toHaveCount(1);
    // One loop: until the pointer leaves, or a while for a tile whose pointer never presses.
    const started = Date.now();
    await expect
      .poll(
        () =>
          canvas.evaluate((element) => {
            const log = (element as HTMLElement & { clickLog: { left: boolean; pressed: boolean } })
              .clickLog;
            return log.left;
          }),
        { timeout: 15_000, intervals: [200] },
      )
      .toBe(true)
      .catch(() => undefined);
    if (Date.now() - started < 800) await page.waitForTimeout(800);
    await page.waitForTimeout(750);
    const log = await canvas.evaluate(
      (element) =>
        (element as HTMLElement & { clickLog: { clicks: number; dead: string[] } }).clickLog,
    );
    await page.mouse.move(0, 0);
    dead.push(...log.dead.map((click) => `${name}: ${click}`));
  }
  return dead;
}

for (const [route, parts] of [
  ['/components', 8],
  ['/patterns', 3],
] as const)
  for (let part = 0; part < parts; part++)
    test(`every click a ${route.slice(1)} gallery tile's script makes changes it (${part + 1} of ${parts})`, async ({
      page,
    }) => {
      // Each scripted click reaches what it aims at, as a person's would (VirtualPointer.ts), and
      // changes something: a value, a state, a popup opening or closing, the text it shows.
      test.setTimeout(150_000);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${siteDevUrl}${route}`);
      const tiles = page.locator('.catalogue-gallery-tile');
      await expect(tiles.first()).toBeVisible();
      const names = (await tiles.locator('.catalogue-gallery-name').allTextContents()).filter(
        (_, index) => index % parts === part,
      );
      expect(await deadClicks(page, names)).toEqual([]);
    });

test("a playing preview draws its pointer's cursor over its stage, gone at rest and when paused", async ({
  page,
}) => {
  // A gallery's card: the cursor shows on its stage while the card plays, and goes as it rests.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components`);
  const tile = page.locator('.catalogue-gallery-tile').filter({
    has: page.locator('.catalogue-gallery-name', { hasText: /^Select$/ }),
  });
  await showTile(tile);
  await expect(tile.locator('.catalogue-tile-canvas[data-fitted]')).toHaveCount(1);
  const cursor = page.locator('.catalogue-pointer-cursor');
  await expect(cursor).toHaveCount(0);
  const box = (await tile.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  const onStage = tile.locator(
    '.catalogue-tile-stage > .catalogue-pointer-layer > .catalogue-pointer-cursor',
  );
  await expect(onStage).toBeVisible();
  // Its tip is where the pointer no one sees is, inside the stage.
  const stage = (await tile.locator('.catalogue-tile-stage').boundingBox())!;
  const tip = (await onStage.boundingBox())!;
  expect(tip.x).toBeGreaterThanOrEqual(stage.x - 1);
  expect(tip.x).toBeLessThanOrEqual(stage.x + stage.width);
  await page.mouse.move(0, 0);
  await expect(cursor).toHaveCount(0);
  // A page's animated figure: its cursor shows while it plays in view, and goes when it is paused.
  await page.goto(`${siteDevUrl}/components/menu`);
  const figure = page.locator('.catalogue-motion-stage').filter({
    has: page.locator('.catalogue-motion-pause'),
  });
  await figure.first().scrollIntoViewIfNeeded();
  await expect(figure.first().locator('.catalogue-pointer-cursor')).toBeVisible();
  await figure.first().hover();
  await figure.first().locator('.catalogue-motion-pause').click();
  await expect(figure.first().locator('.catalogue-pointer-cursor')).toHaveCount(0);
});

test('a playing pointer that carries a file names it in a chip beside its cursor until the drop', async ({
  page,
}) => {
  // DropZone's card carries report.pdf in, over the zone, and drops it (tiles/DropZone.tsx).
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components`);
  const tile = page.locator('.catalogue-gallery-tile').filter({
    has: page.locator('.catalogue-gallery-name', { hasText: /^DropZone$/ }),
  });
  await showTile(tile);
  await expect(tile.locator('.catalogue-tile-canvas[data-fitted]')).toHaveCount(1);
  const chip = tile.locator('.catalogue-pointer-cursor .catalogue-pointer-file');
  await expect(chip).toHaveCount(0);
  const box = (await tile.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  await expect(chip).toHaveText('report.pdf');
  // Dropped, the zone uploads it, and the chip is gone while the cursor stays.
  await expect(tile.locator('.env-drop-zone')).toContainText('Uploading');
  await expect(chip).toHaveCount(0);
  await expect(tile.locator('.catalogue-pointer-cursor')).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(tile.locator('.catalogue-pointer-cursor')).toHaveCount(0);
});
