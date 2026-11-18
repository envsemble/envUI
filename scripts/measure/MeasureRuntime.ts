import { availableParallelism, cpus, platform, release } from 'node:os';
import { mkdir, readFile } from 'node:fs/promises';
import { SourceMap } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium, type Browser, type Page } from '@playwright/test';
import { build, preview, type PreviewServer } from 'vite';
import { median } from './Median.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

interface PerfPage {
  mount(): Promise<Record<string, number>>;
  update(index: number): Promise<Record<string, number>>;
  arm(kind: string): void;
  result(): Promise<Record<string, number>>;
  shown(kind: string): boolean;
}
declare global {
  interface Window {
    envuiPerf: PerfPage;
  }
}

const outputs = {
  site: resolve(repositoryRoot, '.cache/perf/site'),
  fixture: resolve(repositoryRoot, '.cache/perf/fixture'),
};
const ports = {
  site: Number(process.env.ENVUI_SITE_PORT || 8778),
  fixture: Number(process.env.ENVUI_FIXTURE_PORT || 8779),
};

const { values: options } = parseArgs({
  options: {
    runs: { type: 'string', default: '7' },
    only: { type: 'string' },
    'no-build': { type: 'boolean', default: false },
  },
});
const runs = Number(options.runs);
const allScenarios = ['table', 'list', 'popups', 'theme', 'idle', 'resize'];
const only = (options.only ?? allScenarios.join(',')).split(',');
for (const name of only)
  if (!allScenarios.includes(name))
    throw new Error(`Unknown scenario ${name}: ${allScenarios.join(', ')}.`);
const fresh = !options['no-build'];
const wants = (name: string) => only.includes(name);
const needsSite = wants('theme') || wants('idle') || wants('resize');
const needsFixture = wants('table') || wants('list') || wants('popups');

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

function summarize(results: Record<string, number>[]) {
  const summary: Record<string, { median: number; min: number; max: number }> = {};
  for (const key of Object.keys(results[0] ?? {})) {
    const values = results.map((result) => result[key]).sort((a, b) => a - b);
    summary[key] = {
      median: roundToTenth(median(values)),
      min: roundToTenth(values[0]),
      max: roundToTenth(values[values.length - 1]),
    };
  }
  return summary;
}

async function warmUpThenRepeat(measure: () => Promise<Record<string, number>>) {
  await measure();
  const results: Record<string, number>[] = [];
  for (let run = 0; run < runs; run += 1) results.push(await measure());
  return summarize(results);
}

async function buildPages() {
  const common = { logLevel: 'warn' as const, mode: 'production' };
  if (needsFixture)
    await build({
      ...common,
      configFile: resolve(repositoryRoot, 'tests/fixture/vite.config.ts'),
      build: {
        outDir: outputs.fixture,
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: { input: resolve(repositoryRoot, 'tests/fixture/perf.html') },
      },
    });
  if (needsSite)
    await build({
      ...common,
      root: resolve(repositoryRoot, 'apps/site'),
      configFile: resolve(repositoryRoot, 'apps/site/vite.config.ts'),
      build: { outDir: outputs.site, emptyOutDir: true, sourcemap: true },
    });
}

async function serve(name: 'site' | 'fixture'): Promise<PreviewServer> {
  await mkdir(outputs[name], { recursive: true });
  return preview({
    logLevel: 'warn',
    root: resolve(repositoryRoot, name === 'site' ? 'apps/site' : 'tests/fixture'),
    configFile: resolve(
      repositoryRoot,
      name === 'site' ? 'apps/site/vite.config.ts' : 'tests/fixture/vite.config.ts',
    ),
    build: { outDir: outputs[name] },
    preview: { host: '127.0.0.1', port: ports[name], strictPort: true },
  });
}

const fixtureUrl = (scenario: string) =>
  `http://127.0.0.1:${ports.fixture}/perf.html?scenario=${scenario}`;
const siteUrl = (path: string) => `http://127.0.0.1:${ports.site}/${path}`;
const catalogueUrl = siteUrl('components/button');

const loadFontBeforeMeasuring = (page: Page) =>
  page.evaluate(() => document.fonts.load("16px 'envUI Geist'").then(() => undefined));

async function openFixture(browser: Browser, scenario: string) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(fixtureUrl(scenario));
  await page.waitForFunction(() => 'envuiPerf' in window);
  await loadFontBeforeMeasuring(page);
  return page;
}

async function firstRender(browser: Browser, scenario: 'table' | 'list') {
  return warmUpThenRepeat(async () => {
    const page = await openFixture(browser, scenario);
    const result = await page.evaluate(() => window.envuiPerf.mount());
    await page.close();
    return result;
  });
}

async function rowUpdate(browser: Browser) {
  const page = await openFixture(browser, 'table');
  await page.evaluate(() => window.envuiPerf.mount());
  let row = 0;
  const result = await warmUpThenRepeat(async () => {
    row = (row + 137) % 1000;
    return page.evaluate((index) => window.envuiPerf.update(index), row);
  });
  await page.close();
  return result;
}

async function popups(browser: Browser) {
  const page = await openFixture(browser, 'popups');
  const triggers = {
    menu: page.locator('[data-perf-trigger="menu"]'),
    select: page.locator('[data-perf-trigger="select"] [role="combobox"]'),
    popover: page.locator('[data-perf-trigger="popover"]'),
  };
  const results: Record<string, Record<string, { median: number; min: number; max: number }>> = {};
  for (const [kind, trigger] of Object.entries(triggers) as [
    keyof typeof triggers,
    typeof triggers.menu,
  ][]) {
    const box = (await trigger.boundingBox())!;
    results[kind] = await warmUpThenRepeat(async () => {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 100)));
      await page.evaluate((which) => window.envuiPerf.arm(which), kind);
      await page.mouse.down();
      await page.mouse.up();
      const result = await page.evaluate(() => window.envuiPerf.result());
      await page.keyboard.press('Escape');
      await page.waitForFunction((which) => !window.envuiPerf.shown(which), kind);
      return result;
    });
  }
  await page.close();
  return results;
}

const storageKeys = { theme: 'envui-site-theme', motion: 'envui-site-motion' };

async function openCatalogue(
  browser: Browser,
  theme: string,
  motion: 'paused' | 'playing',
  { url = catalogueUrl, before }: { url?: string; before?: () => void } = {},
) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  if (before) await context.addInitScript(before);
  await context.addInitScript(
    ({ keys, theme, motion }) => {
      localStorage.setItem(keys.theme, theme);
      localStorage.setItem(keys.motion, motion);
      const idle = { counting: false, total: 0, callers: {} as Record<string, number> };
      (window as unknown as { envuiIdle: typeof idle }).envuiIdle = idle;
      const request = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (callback) => {
        if (idle.counting) {
          idle.total += 1;
          const caller = new Error().stack?.split('\n')[2]?.trim() ?? 'unknown';
          idle.callers[caller] = (idle.callers[caller] ?? 0) + 1;
        }
        return request(callback);
      };
    },
    { keys: storageKeys, theme, motion },
  );
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return page;
}

const settle = (page: Page, milliseconds: number) =>
  page.evaluate((delay) => new Promise((resolve) => setTimeout(resolve, delay)), milliseconds);

async function metrics(page: Page) {
  const session = await page.context().newCDPSession(page);
  await session.send('Performance.enable');
  return async () => {
    const { metrics: list } = await session.send('Performance.getMetrics');
    const value = (name: string) => list.find((metric) => metric.name === name)?.value ?? 0;
    return {
      recalcStyle: value('RecalcStyleDuration') * 1000,
      recalcStyleCount: value('RecalcStyleCount'),
      layout: value('LayoutDuration') * 1000,
      layoutCount: value('LayoutCount'),
      script: value('ScriptDuration') * 1000,
      task: value('TaskDuration') * 1000,
    };
  };
}

function difference<T extends Record<string, number>>(after: T, before: T) {
  return Object.fromEntries(
    Object.entries(after).map(([key, value]) => [key, value - before[key]]),
  ) as T;
}

async function themeSwitch(browser: Browser) {
  const page = await openCatalogue(browser, 'light', 'paused');
  await settle(page, 1500);
  const read = await metrics(page);
  let theme = 'light';
  const switchOnce = async () => {
    theme = theme === 'light' ? 'dark' : 'light';
    const before = await read();
    const switched = await page.evaluate(
      ({ key, theme }) =>
        new Promise<{ toPaint: number; transitions: number }>((resolve) => {
          const start = performance.now();
          const root = document.documentElement;
          const done = () =>
            requestAnimationFrame(() => {
              const channel = new MessageChannel();
              channel.port1.onmessage = () =>
                resolve({
                  toPaint: performance.now() - start,
                  transitions: document.getAnimations().length,
                });
              channel.port2.postMessage(undefined);
            });
          const observer = new MutationObserver(() => {
            if (root.dataset.envTheme !== theme) return;
            observer.disconnect();
            done();
          });
          observer.observe(root, { attributes: true, attributeFilter: ['data-env-theme'] });
          localStorage.setItem(key, theme);
          window.dispatchEvent(
            new StorageEvent('storage', { key, newValue: theme, storageArea: localStorage }),
          );
        }),
      { key: storageKeys.theme, theme },
    );
    await settle(page, 600);
    return { ...switched, ...difference(await read(), before) };
  };
  const toDark: Record<string, number>[] = [];
  const toLight: Record<string, number>[] = [];
  await switchOnce();
  await switchOnce();
  for (let run = 0; run < runs; run += 1) {
    toDark.push(await switchOnce());
    toLight.push(await switchOnce());
  }
  const tracedSwitchEvents = await traceMainThread(
    browser,
    page,
    async () => void (await switchOnce()),
  );
  const recalcs = named(tracedSwitchEvents, 'UpdateLayoutTree');
  const largest = recalcs.reduce<TraceEvent | undefined>(
    (found, event) => ((event.dur ?? 0) > (found?.dur ?? 0) ? event : found),
    undefined,
  );
  await page.context().close();
  return {
    'light → dark': summarize(toDark),
    'dark → light': summarize(toLight),
    traced: {
      styleRecalcs: recalcs.length,
      largestRecalcMs: roundToTenth((largest?.dur ?? 0) / 1000),
      largestRecalcElements: largest?.args?.elementCount ?? 0,
    },
  };
}

interface TraceFrame {
  functionName?: string;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
}
interface TraceEvent {
  name: string;
  ph: string;
  pid: number;
  tid: number;
  ts: number;
  dur?: number;
  args?: {
    name?: string;
    elementCount?: number;
    beginData?: { stackTrace?: TraceFrame[] };
    data?: { stackTrace?: TraceFrame[] };
  };
}

async function traceMainThread(browser: Browser, page: Page, during: () => Promise<void>) {
  await browser.startTracing(page, {
    categories: [
      'devtools.timeline',
      'disabled-by-default-devtools.timeline',
      'disabled-by-default-devtools.timeline.stack',
    ],
  });
  await during();
  const trace = JSON.parse((await browser.stopTracing()).toString('utf8')) as {
    traceEvents: TraceEvent[];
  };
  const rendererMainThreads = new Set(
    trace.traceEvents
      .filter((event) => event.name === 'thread_name' && event.args?.name === 'CrRendererMain')
      .map((event) => `${event.pid}:${event.tid}`),
  );
  return trace.traceEvents.filter((event) => rendererMainThreads.has(`${event.pid}:${event.tid}`));
}

const endOfBeginEndPairPhase = 'E';
const named = (events: TraceEvent[], name: string) =>
  events.filter((event) => event.name === name && event.ph !== endOfBeginEndPairPhase);

const sourceMaps = new Map<string, Promise<{ map: SourceMap; directory: string } | null>>();
async function originalSourcePosition(url: string | undefined, line: number, column: number) {
  if (!url) return 'unknown';
  const address = new URL(url);
  const output = address.port === String(ports.site) ? outputs.site : outputs.fixture;
  const file = resolve(output, `.${address.pathname}`);
  if (!sourceMaps.has(file))
    sourceMaps.set(
      file,
      readFile(`${file}.map`, 'utf8').then(
        (text) => ({ map: new SourceMap(JSON.parse(text)), directory: dirname(file) }),
        () => null,
      ),
    );
  const loaded = await sourceMaps.get(file);
  const entry = loaded?.map.findEntry(line - 1, column - 1);
  if (!loaded || !entry || !('originalSource' in entry))
    return `${address.pathname}:${line}:${column}`;
  const source = relative(
    repositoryRoot,
    resolve(loaded.directory, entry.originalSource),
  ).replaceAll('\\', '/');
  return `${source}:${entry.originalLine + 1}`;
}

const leadingFramesToMap = 8;

async function sourceWhereStackStarts(stack: TraceFrame[] | undefined) {
  if (!stack?.length) return 'unknown';
  const frames = await Promise.all(
    stack
      .slice(0, leadingFramesToMap)
      .map((frame) =>
        originalSourcePosition(frame.url, frame.lineNumber ?? 0, frame.columnNumber ?? 0),
      ),
  );
  const own = frames.findIndex((frame) => !frame.includes('node_modules'));
  return frames.slice(0, Math.max(1, own + 1)).join(' < ');
}

async function sourceOfErrorStackLine(line: string) {
  const match = /\(?(https?:\/\/[^\s)]+):(\d+):(\d+)\)?$/.exec(line);
  return match ? originalSourcePosition(match[1], Number(match[2]), Number(match[3])) : line;
}

const tally = (entries: string[]) =>
  Object.fromEntries(
    Object.entries(
      entries.reduce<Record<string, number>>((counts, key) => {
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {}),
    ).sort((first, second) => second[1] - first[1]),
  );

async function idle(browser: Browser, figures: 'paused' | 'offScreen' | 'playing') {
  const page = await openCatalogue(browser, 'light', figures === 'paused' ? 'paused' : 'playing');
  if (figures !== 'offScreen')
    await page.evaluate(() =>
      document.querySelector('.catalogue-motion-stage')?.scrollIntoView({ block: 'center' }),
    );
  await settle(page, 2000);
  const inView = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('.catalogue-motion-stage')).filter((stage) => {
        const box = stage.getBoundingClientRect();
        return box.bottom > 0 && box.top < innerHeight;
      }).length,
  );
  const read = await metrics(page);
  let frames = { total: 0, callers: {} as Record<string, number> };
  let counters = await read();
  const events = await traceMainThread(browser, page, async () => {
    const before = await read();
    await page.evaluate(() => {
      (window as unknown as { envuiIdle: { counting: boolean } }).envuiIdle.counting = true;
    });
    await settle(page, 5000);
    frames = await page.evaluate(() => {
      const idle = (
        window as unknown as {
          envuiIdle: { counting: boolean; total: number; callers: Record<string, number> };
        }
      ).envuiIdle;
      idle.counting = false;
      return { total: idle.total, callers: idle.callers };
    });
    counters = difference(await read(), before);
  });
  await page.context().close();
  const stackOf = (event: TraceEvent) =>
    event.args?.beginData?.stackTrace ?? event.args?.data?.stackTrace;
  const forced = [...named(events, 'Layout'), ...named(events, 'UpdateLayoutTree')].filter(
    (event) => stackOf(event)?.length,
  );
  const requested: string[] = [];
  for (const [line, count] of Object.entries(frames.callers)) {
    const at = await sourceOfErrorStackLine(line);
    for (let index = 0; index < count; index += 1) requested.push(at);
  }
  return {
    figuresInView: inView,
    animationFramesRequested: frames.total,
    requestedBy: tally(requested),
    animationFramesFired: named(events, 'FireAnimationFrame').length,
    timersFired: named(events, 'TimerFire').length,
    layouts: named(events, 'Layout').length,
    styleRecalcs: named(events, 'UpdateLayoutTree').length,
    forcedLayouts: forced.length,
    forcedBy: tally(
      await Promise.all(forced.map((event) => sourceWhereStackStarts(stackOf(event)))),
    ),
    scriptMs: roundToTenth(counters.script),
    styleMs: roundToTenth(counters.recalcStyle),
    layoutMs: roundToTenth(counters.layout),
  };
}

function countReactRendersThroughDevToolsHook() {
  interface Fiber {
    tag: number;
    flags: number;
    child: Fiber | null;
    sibling: Fiber | null;
    alternate: Fiber | null;
  }
  const renders = { counting: false, commits: 0, components: 0 };
  (window as unknown as { envuiRenders: typeof renders }).envuiRenders = renders;
  const functionComponent = 0;
  const classComponent = 1;
  const forwardRef = 11;
  const memoComponent = 14;
  const simpleMemoComponent = 15;
  const performedWorkFlag = 1;
  const components = new Set([
    functionComponent,
    classComponent,
    forwardRef,
    memoComponent,
    simpleMemoComponent,
  ]);
  const mounted = (first: Fiber | null) => {
    for (let fiber = first; fiber; fiber = fiber.sibling) {
      if (components.has(fiber.tag)) renders.components += 1;
      mounted(fiber.child);
    }
  };
  const updated = (parent: Fiber) => {
    for (let fiber = parent.child; fiber; fiber = fiber.sibling) {
      const before = fiber.alternate;
      if (!before) {
        if (components.has(fiber.tag)) renders.components += 1;
        mounted(fiber.child);
        continue;
      }
      if (components.has(fiber.tag) && fiber.flags & performedWorkFlag) renders.components += 1;
      const reactBailedOutKeepingChildren = fiber.child === before.child;
      if (!reactBailedOutKeepingChildren) updated(fiber);
    }
  };
  Object.assign(window, {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: {
      supportsFiber: true,
      isDisabled: false,
      renderers: new Map(),
      inject: () => 1,
      checkDCE() {},
      onScheduleFiberRoot() {},
      onCommitFiberUnmount() {},
      onPostCommitFiberRoot() {},
      setStrictMode() {},
      onCommitFiberRoot(_id: number, root: { current: Fiber }) {
        if (!renders.counting) return;
        renders.commits += 1;
        const current = root.current;
        if (current.alternate && current.child !== current.alternate.child) updated(current);
      },
    },
  });
}

interface DragRecord {
  frames: number[];
  longFrames: number;
  moves: number;
  commits: number;
  components: number;
}
declare global {
  interface Window {
    envuiRenders: { counting: boolean; commits: number; components: number };
    envuiDrag: DragRecord & { stop(): DragRecord };
  }
}

async function resizeDrawer(browser: Browser, path: string) {
  const page = await openCatalogue(browser, 'light', 'paused', {
    url: siteUrl(path),
    before: countReactRendersThroughDevToolsHook,
  });
  await settle(page, 1500);
  const read = await metrics(page);
  const session = await page.context().newCDPSession(page);
  const handle = page.locator('.site-sidebar .env-navigation-drawer-resize-handle');
  const moves = 100;
  const step = 1.5;
  const frameTime = 1000 / 60;
  const mouseAt125HzInterval = 1000 / 125;
  const mouse = (
    type: 'mouseMoved' | 'mousePressed' | 'mouseReleased',
    x: number,
    y: number,
    buttons: number,
  ) =>
    session.send('Input.dispatchMouseEvent', {
      type,
      x,
      y,
      buttons,
      button: type === 'mouseMoved' && !buttons ? 'none' : 'left',
      clickCount: type === 'mouseMoved' ? 0 : 1,
    });
  let direction = 1;
  const dragOnce = async () => {
    const box = (await handle.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await mouse('mouseMoved', x, y, 0);
    await mouse('mousePressed', x, y, 1);
    await page.evaluate(() => {
      const drag = { frames: [] as number[], longFrames: 0, moves: 0, commits: 0, components: 0 };
      let on = true;
      const frame = (time: number) => {
        drag.frames.push(time);
        if (on) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      const onMove = () => (drag.moves += 1);
      document.addEventListener('pointermove', onMove, { capture: true });
      const observer = new PerformanceObserver((list) => {
        drag.longFrames += list.getEntries().length;
      });
      observer.observe({ type: 'long-animation-frame' });
      Object.assign(window.envuiRenders, { counting: true, commits: 0, components: 0 });
      window.envuiDrag = Object.assign(drag, {
        stop() {
          on = false;
          document.removeEventListener('pointermove', onMove, { capture: true });
          observer.disconnect();
          window.envuiRenders.counting = false;
          return { ...drag, ...window.envuiRenders };
        },
      });
    });
    const before = await read();
    const sent: Promise<unknown>[] = [];
    for (let move = 1; move <= moves; move += 1) {
      sent.push(mouse('mouseMoved', x + direction * move * step, y, 1));
      await new Promise((resolve) => setTimeout(resolve, mouseAt125HzInterval));
    }
    await Promise.all(sent);
    await page.evaluate(function waitForTheFrameThatDrawsTheLastMove() {
      return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const counters = difference(await read(), before);
    const record = await page.evaluate(() => window.envuiDrag.stop());
    await mouse('mouseReleased', x + direction * moves * step, y, 0);
    direction = -direction;
    await settle(page, 300);
    const gaps = record.frames.slice(1).map((time, index) => time - record.frames[index]);
    const frames = Math.max(1, gaps.length);
    const perMove = Math.max(1, record.moves);
    return {
      droppedFrames: gaps.reduce(
        (sum, gap) => sum + Math.max(0, Math.round(gap / frameTime) - 1),
        0,
      ),
      longestFrame: Math.max(0, ...gaps),
      longAnimationFrames: record.longFrames,
      pointermoves: record.moves,
      commitsPerMove: record.commits / perMove,
      componentsPerMove: record.components / perMove,
      scriptPerFrame: counters.script / frames,
      stylePerFrame: counters.recalcStyle / frames,
      layoutPerFrame: counters.layout / frames,
      layoutsPerFrame: counters.layoutCount / frames,
    };
  };
  const result = await warmUpThenRepeat(dragOnce);
  await page.context().close();
  return result;
}

if (fresh) await buildPages();
const servers: PreviewServer[] = [];
if (needsFixture) servers.push(await serve('fixture'));
if (needsSite) servers.push(await serve('site'));
const browser = await chromium.launch();
try {
  const report: Record<string, unknown> = {
    measured: new Date().toISOString(),
    note: 'Machine-dependent: compare runs on one machine; not a pass/fail test. Times in ms.',
    machine: {
      cpu: cpus()[0]?.model.trim(),
      threads: availableParallelism(),
      os: `${platform()} ${release()}`,
      chromium: browser.version(),
    },
    runs,
  };
  if (wants('table'))
    report.table = {
      firstRender: await firstRender(browser, 'table'),
      oneRowUpdate: await rowUpdate(browser),
    };
  if (wants('list')) report.list = { firstRender: await firstRender(browser, 'list') };
  if (wants('popups')) report.popups = await popups(browser);
  if (wants('theme')) report.themeSwitch = await themeSwitch(browser);
  if (wants('idle'))
    report.idle = {
      paused: await idle(browser, 'paused'),
      offScreen: await idle(browser, 'offScreen'),
      playing: await idle(browser, 'playing'),
    };
  if (wants('resize'))
    report.resizeDrawer = {
      catalogue: await resizeDrawer(browser, 'components/button'),
      docs: await resizeDrawer(browser, 'docs/components/button'),
    };
  const medianMinMaxOnSeveralLines =
    /\{\s+"median": ([\d.]+),\s+"min": ([\d.]+),\s+"max": ([\d.]+)\s+\}/g;
  console.log(
    JSON.stringify(report, null, 2).replace(
      medianMinMaxOnSeveralLines,
      '{ "median": $1, "min": $2, "max": $3 }',
    ),
  );
} finally {
  await browser.close();
  await Promise.all(servers.map((server) => server.close()));
}
