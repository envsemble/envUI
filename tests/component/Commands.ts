import type { BrowserCommand, BrowserCommandContext } from 'vitest/node';
import type { CDPSession, Page, Route } from 'playwright';

/**
 * Commands the component tests run in Node, on the Playwright page that holds the test's frame:
 * input at a point, as a person's mouse, keys and finger give it, and what the page emulates. A
 * point is in the frame's own CSS pixels, as getBoundingClientRect gives it; each command maps it
 * to the page.
 */

/** The frame's offset in the page and its scale, from its CSS pixels to the page's. */
async function frameGeometry(context: BrowserCommandContext) {
  const frame = await context.frame();
  const element = await frame.frameElement();
  const box = (await element.boundingBox())!;
  const width = await frame.evaluate(() => innerWidth);
  return { x: box.x, y: box.y, scale: box.width / width };
}

async function toPage(context: BrowserCommandContext, x: number, y: number) {
  const frame = await frameGeometry(context);
  return { x: frame.x + x * frame.scale, y: frame.y + y * frame.scale };
}

type Button = 'left' | 'right' | 'middle';

const mouseMove: BrowserCommand<[x: number, y: number, steps?: number]> = async (
  context,
  x,
  y,
  steps,
) => {
  const point = await toPage(context, x, y);
  await context.page.mouse.move(point.x, point.y, { steps });
};

const mouseDown: BrowserCommand<[button?: Button]> = async (context, button) => {
  await context.page.mouse.down({ button });
};

const mouseUp: BrowserCommand<[button?: Button]> = async (context, button) => {
  await context.page.mouse.up({ button });
};

const mouseClick: BrowserCommand<
  [x: number, y: number, options?: { button?: Button; clickCount?: number }]
> = async (context, x, y, options) => {
  const point = await toPage(context, x, y);
  await context.page.mouse.click(point.x, point.y, options);
};

/** The wheel turned where the mouse is, by CSS pixels: down and right are positive. */
const mouseWheel: BrowserCommand<[deltaX: number, deltaY: number]> = async (
  context,
  deltaX,
  deltaY,
) => {
  await context.page.mouse.wheel(deltaX, deltaY);
};

const keyPress: BrowserCommand<[key: string]> = async (context, key) => {
  await context.page.keyboard.press(key);
};

const keyDown: BrowserCommand<[key: string]> = async (context, key) => {
  await context.page.keyboard.down(key);
};

const keyUp: BrowserCommand<[key: string]> = async (context, key) => {
  await context.page.keyboard.up(key);
};

const keyType: BrowserCommand<[text: string]> = async (context, text) => {
  await context.page.keyboard.type(text);
};

type Media = Parameters<BrowserCommandContext['page']['emulateMedia']>[0];

const emulateMedia: BrowserCommand<[media: Media]> = async (context, media) => {
  await context.page.emulateMedia(media);
};

/** One Chromium DevTools session per page, which keeps the touch state and emulation it set. */
const sessions = new WeakMap<Page, Promise<CDPSession>>();
function session(context: BrowserCommandContext) {
  const opened = sessions.get(context.page) ?? context.page.context().newCDPSession(context.page);
  sessions.set(context.page, opened);
  return opened;
}

/**
 * A finger at a point and lifted again, through Chromium's touch input: touchStart with the point,
 * touchEnd with none.
 */
const touch: BrowserCommand<[type: 'touchStart' | 'touchEnd', x?: number, y?: number]> = async (
  context,
  type,
  x = 0,
  y = 0,
) => {
  const point = await toPage(context, x, y);
  await (
    await session(context)
  ).send('Input.dispatchTouchEvent', {
    type,
    touchPoints: type === 'touchStart' ? [{ x: Math.round(point.x), y: Math.round(point.y) }] : [],
  });
};

/** Coarse pointers and touch, as a phone's: Chromium's touch emulation, on or off. */
const emulateTouch: BrowserCommand<[enabled: boolean]> = async (context, enabled) => {
  await (
    await session(context)
  ).send('Emulation.setTouchEmulationEnabled', { enabled, maxTouchPoints: 1 });
};

/**
 * The module an option loads where it is used, matched by the name of its source file, held back
 * as a slow network would or failing as offline. A route lives on the page, which the frames of
 * test files running at once may share, so each test's route answers its own frame's requests
 * only and passes on the rest, and `unrouteModule` ends it.
 */
const moduleFile = (name: string) => new RegExp(String.raw`/${name}\.tsx?(?:\?|$)`);

interface ModuleRoute {
  handler: (route: Route) => Promise<void>;
  /** Resolves once the frame has asked for the module. */
  requested: Promise<void>;
  /** Lets it load: the held request, and every request from now on. */
  release: () => void;
}
const routes = new Map<string, ModuleRoute>();
const routeKey = (context: BrowserCommandContext, name: string) => `${context.sessionId} ${name}`;

async function routeModule(context: BrowserCommandContext, name: string, mode: 'hold' | 'fail') {
  const frame = await context.frame();
  let requested!: () => void;
  let released = false;
  let release = () => {
    released = true;
  };
  const entry: ModuleRoute = {
    requested: new Promise((resolve) => (requested = resolve)),
    release: () => release(),
    handler: async (route) => {
      if (route.request().frame() !== frame) return route.fallback();
      requested();
      if (released) return route.continue();
      if (mode === 'fail') return route.abort();
      await new Promise<void>((resolve) => {
        release = () => {
          released = true;
          resolve();
        };
      });
      await route.continue();
    },
  };
  routes.set(routeKey(context, name), entry);
  await context.page.route(moduleFile(name), entry.handler);
}

const holdModule: BrowserCommand<[name: string]> = (context, name) =>
  routeModule(context, name, 'hold');

const failModule: BrowserCommand<[name: string]> = (context, name) =>
  routeModule(context, name, 'fail');

/** Resolves once the frame has asked for the module: held, or failed. */
const moduleRequested: BrowserCommand<[name: string]> = async (context, name) => {
  await routes.get(routeKey(context, name))?.requested;
};

/** Lets a held module load, or a failing one load from now on. */
const releaseModule: BrowserCommand<[name: string]> = (context, name) => {
  routes.get(routeKey(context, name))?.release();
};

const unrouteModule: BrowserCommand<[name: string]> = async (context, name) => {
  const entry = routes.get(routeKey(context, name));
  if (!entry) return;
  routes.delete(routeKey(context, name));
  await context.page.unroute(moduleFile(name), entry.handler);
};

/**
 * The text on the system clipboard, read in the page that holds the test's frame, which may read
 * it once granted: the frame may only write. Chromium only.
 */
const clipboardText: BrowserCommand<[]> = async (context) => {
  await context.page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  return context.page.evaluate(() => navigator.clipboard.readText());
};

/**
 * The contrast gate's Node side (tests/contrast/Gate.ts), loaded only by the test that asks for
 * it: the colors a theme's pairs name, and the measure of the colors the browser resolved.
 */
const contrastColors: BrowserCommand<[theme: string]> = async (_, theme) =>
  (await import('../contrast/Gate.ts')).contrastColors(theme);

const measureContrast: BrowserCommand<
  [theme: string, resolved: Record<string, string | null>, canvas: string]
> = async (_, theme, resolved, canvas) =>
  (await import('../contrast/Gate.ts')).measureContrast(theme, resolved, canvas);

export const commands = {
  mouseMove,
  mouseDown,
  mouseUp,
  mouseClick,
  mouseWheel,
  keyPress,
  keyDown,
  keyUp,
  keyType,
  emulateMedia,
  emulateTouch,
  touch,
  holdModule,
  failModule,
  moduleRequested,
  releaseModule,
  unrouteModule,
  clipboardText,
  contrastColors,
  measureContrast,
};

export type Commands = typeof commands;
