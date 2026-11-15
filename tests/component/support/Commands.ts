import type { BrowserCommand, BrowserCommandContext } from 'vitest/node';
import type { CDPSession, Frame, Page, Route } from 'playwright';
import type * as Gate from '../../contrast/Gate.ts';

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

const mouseFling: BrowserCommand<
  [fromX: number, fromY: number, toX: number, toY: number, steps: number]
> = async (context, fromX, fromY, toX, toY, steps) => {
  const [from, to] = [await toPage(context, fromX, fromY), await toPage(context, toX, toY)];
  const { mouse } = context.page;
  await mouse.move(from.x, from.y);
  await mouse.down();
  await mouse.move(to.x, to.y, { steps });
  await mouse.up();
};

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

const sessions = new WeakMap<Page, Promise<CDPSession>>();
function session(context: BrowserCommandContext) {
  const opened = sessions.get(context.page) ?? context.page.context().newCDPSession(context.page);
  sessions.set(context.page, opened);
  return opened;
}

const touch: BrowserCommand<
  [type: 'touchStart' | 'touchMove' | 'touchEnd', x?: number, y?: number]
> = async (context, type, x = 0, y = 0) => {
  const point = await toPage(context, x, y);
  await (
    await session(context)
  ).send('Input.dispatchTouchEvent', {
    type,
    touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(point.x), y: Math.round(point.y) }],
  });
};

const emulateTouch: BrowserCommand<[enabled: boolean]> = async (context, enabled) => {
  await (
    await session(context)
  ).send('Emulation.setTouchEmulationEnabled', { enabled, maxTouchPoints: 1 });
};

const moduleFile = (name: string) => new RegExp(String.raw`/${name}\.tsx?(?:\?|$)`);

interface ModuleRoute {
  handler: (route: Route) => Promise<void>;
  requested: Promise<void>;
  release: () => void;
}
const routes = new Map<string, ModuleRoute>();
const routeKey = (context: BrowserCommandContext, name: string) => `${context.sessionId} ${name}`;

const probePath = '/__envui_interception_probe__';
async function interceptionApplies(context: BrowserCommandContext, frame: Frame) {
  const probe = (route: Route) => route.fulfill({ status: 204, headers: { 'x-envui-probe': '1' } });
  await context.page.route(`**${probePath}`, probe);
  try {
    const deadline = Date.now() + 5_000;
    while (Date.now() < deadline) {
      const intercepted = await frame.evaluate(
        (url) =>
          fetch(url, { cache: 'no-store' }).then(
            (response) => response.headers.has('x-envui-probe'),
            () => false,
          ),
        probePath,
      );
      if (intercepted) return;
    }
    throw new Error('The page does not intercept requests 5 s after a route was added');
  } finally {
    await context.page.unroute(`**${probePath}`, probe);
  }
}

async function routeModule(
  context: BrowserCommandContext,
  name: string,
  mode: 'hold' | 'fail',
  standIn?: string,
) {
  const frame = await context.frame();
  let requested!: () => void;
  let released = false;
  let release = () => {
    released = true;
  };
  const answer = (route: Route) =>
    standIn === undefined
      ? route.continue()
      : route.fulfill({ contentType: 'application/javascript', body: standIn });
  const entry: ModuleRoute = {
    requested: new Promise((resolve) => (requested = resolve)),
    release: () => release(),
    handler: async (route) => {
      if (route.request().frame() !== frame) return route.fallback();
      requested();
      if (released) return answer(route);
      if (mode === 'fail') return route.abort();
      await new Promise<void>((resolve) => {
        release = () => {
          released = true;
          resolve();
        };
      });
      await answer(route);
    },
  };
  routes.set(routeKey(context, name), entry);
  await context.page.route(moduleFile(name), entry.handler);
  await interceptionApplies(context, frame);
}

const holdModule: BrowserCommand<[name: string]> = (context, name) =>
  routeModule(context, name, 'hold');

const failModule: BrowserCommand<[name: string]> = (context, name) =>
  routeModule(context, name, 'fail');

const holdModuleAs: BrowserCommand<[name: string, source: string]> = (context, name, source) =>
  routeModule(context, name, 'hold', source);

const moduleRequested: BrowserCommand<[name: string]> = async (context, name) => {
  await routes.get(routeKey(context, name))?.requested;
};

const releaseModule: BrowserCommand<[name: string]> = (context, name) => {
  routes.get(routeKey(context, name))?.release();
};

const unrouteModule: BrowserCommand<[name: string]> = async (context, name) => {
  const entry = routes.get(routeKey(context, name));
  if (!entry) return;
  routes.delete(routeKey(context, name));
  await context.page.unroute(moduleFile(name), entry.handler);
};

const clipboardText: BrowserCommand<[], string> = async (context) => {
  await context.page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  return context.page.evaluate(() => navigator.clipboard.readText());
};

const contrastColors: BrowserCommand<[theme?: string], Record<string, string>> = async (_, theme) =>
  (await import('../../contrast/Gate.ts')).contrastColors(theme);

const measureContrast: BrowserCommand<
  [theme: string, resolved: Record<string, string | null>, canvas: string],
  ReturnType<typeof Gate.measureContrast>
> = async (_, theme, resolved, canvas) =>
  (await import('../../contrast/Gate.ts')).measureContrast(theme, resolved, canvas);

export const commands = {
  mouseMove,
  mouseDown,
  mouseUp,
  mouseClick,
  mouseWheel,
  mouseFling,
  keyPress,
  keyDown,
  keyUp,
  keyType,
  emulateMedia,
  emulateTouch,
  touch,
  holdModule,
  holdModuleAs,
  failModule,
  moduleRequested,
  releaseModule,
  unrouteModule,
  clipboardText,
  contrastColors,
  measureContrast,
};

export type Commands = typeof commands;
