// Runtime benchmarks in Chromium: how long envUI takes to render big lists, open popups and switch
// themes, and what a still page keeps doing. The numbers depend on the machine and what else runs
// on it: a measure to compare before and after a change on one machine, not a pass/fail test.
//
//   node scripts/test/MeasureRuntime.ts [--runs <n>] [--only <scenarios>] [--no-build]
//
// It builds, for production with source maps, the benchmarks' fixture page (tests/fixture/perf.html)
// and the site into .cache/perf, serves both with `vite preview` on ENVUI_FIXTURE_PORT and
// ENVUI_SITE_PORT (8779 and 8778 by default), and prints JSON. --no-build serves the last build.
// Each scenario runs once to warm up and then --runs times (7 by default); the median is reported,
// with the fastest and slowest run. --only takes some of table, list, popups, theme and idle.
//
// - table, list: a 1,000-row Table and a 1,000-item List, first render on a fresh page; the table
//   then changes one row. `commit` is React's render and commit (flushSync), `frame` that and the
//   frame after it, both from performance.now().
// - popups: Menu, Select and Popover, from the press (the pointerdown's time) to the frame after
//   the popup is shown, with the long tasks between and the slowest event timing entry.
// - theme: light ↔ dark on the catalogue's Button page, its figures paused, switched as another
//   window would (a storage event): to the frame after, and the style recalculation, layout and
//   script time CDP's Performance domain counts over the next 600 ms.
// - idle: the Button page left still for 5 s, its figures paused, off-screen or playing:
//   requestAnimationFrame calls by caller, and from a trace the frames, timers and layouts, forced
//   ones (synchronous, from script) by where in the source they were forced.
import { availableParallelism, cpus, platform, release } from 'node:os';
import { mkdir, readFile } from 'node:fs/promises';
import { SourceMap } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from '@playwright/test';
import { build, preview, type PreviewServer } from 'vite';

/** What the benchmarks' page (tests/fixture/perf.tsx) gives the script, as window.envuiPerf. */
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

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const outputs = {
  site: resolve(root, '.cache/perf/site'),
  fixture: resolve(root, '.cache/perf/fixture'),
};
const ports = {
  site: Number(process.env.ENVUI_SITE_PORT || 8778),
  fixture: Number(process.env.ENVUI_FIXTURE_PORT || 8779),
};

const args = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const runs = Number(option('--runs') ?? 7);
const allScenarios = ['table', 'list', 'popups', 'theme', 'idle'];
const only = (option('--only') ?? allScenarios.join(',')).split(',');
for (const name of only)
  if (!allScenarios.includes(name))
    throw new Error(`Unknown scenario ${name}: ${allScenarios.join(', ')}.`);
const fresh = !args.includes('--no-build');
const wants = (name: string) => only.includes(name);
const needsSite = wants('theme') || wants('idle');
const needsFixture = wants('table') || wants('list') || wants('popups');

/** Rounded to a tenth of a millisecond. */
const tenth = (value: number) => Math.round(value * 10) / 10;

/** The median of the runs, with the fastest and the slowest, for each number they share. */
function summarize(results: Record<string, number>[]) {
  const summary: Record<string, { median: number; min: number; max: number }> = {};
  for (const key of Object.keys(results[0] ?? {})) {
    const values = results.map((result) => result[key]!).sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);
    const median =
      values.length % 2 ? values[middle]! : (values[middle - 1]! + values[middle]!) / 2;
    summary[key] = { median: tenth(median), min: tenth(values[0]!), max: tenth(values.at(-1)!) };
  }
  return summary;
}

/** Runs a measurement once to warm up and then `runs` times. */
async function repeat(measure: () => Promise<Record<string, number>>) {
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
      configFile: resolve(root, 'tests/fixture/vite.config.ts'),
      build: {
        outDir: outputs.fixture,
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: { input: resolve(root, 'tests/fixture/perf.html') },
      },
    });
  if (needsSite)
    await build({
      ...common,
      root: resolve(root, 'apps/site'),
      configFile: resolve(root, 'apps/site/vite.config.ts'),
      build: { outDir: outputs.site, emptyOutDir: true, sourcemap: true },
    });
}

async function serve(name: 'site' | 'fixture'): Promise<PreviewServer> {
  await mkdir(outputs[name], { recursive: true });
  return preview({
    logLevel: 'warn',
    root: resolve(root, name === 'site' ? 'apps/site' : 'tests/fixture'),
    configFile: resolve(
      root,
      name === 'site' ? 'apps/site/vite.config.ts' : 'tests/fixture/vite.config.ts',
    ),
    build: { outDir: outputs[name] },
    preview: { host: '127.0.0.1', port: ports[name], strictPort: true },
  });
}

const fixtureUrl = (scenario: string) =>
  `http://127.0.0.1:${ports.fixture}/perf.html?scenario=${scenario}`;
const catalogueUrl = `http://127.0.0.1:${ports.site}/components/button`;

async function openFixture(browser: Browser, scenario: string) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(fixtureUrl(scenario));
  await page.waitForFunction(() => 'envuiPerf' in window);
  // The font loads before the measurements, not when their text first asks for it.
  await page.evaluate(() => document.fonts.load("16px 'envUI Geist'").then(() => undefined));
  return page;
}

/** A big list's first render, on a fresh page each run. */
async function firstRender(browser: Browser, scenario: 'table' | 'list') {
  return repeat(async () => {
    const page = await openFixture(browser, scenario);
    const result = await page.evaluate(() => window.envuiPerf.mount());
    await page.close();
    return result;
  });
}

/** One row of the 1,000-row table changing, a different row each run. */
async function rowUpdate(browser: Browser) {
  const page = await openFixture(browser, 'table');
  await page.evaluate(() => window.envuiPerf.mount());
  let row = 0;
  const result = await repeat(async () => {
    row = (row + 137) % 1000;
    return page.evaluate((index) => window.envuiPerf.update(index), row);
  });
  await page.close();
  return result;
}

/** Each popup opened by a press, then closed with Escape before the next. */
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
    results[kind] = await repeat(async () => {
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

/**
 * A fresh page of the catalogue, with the theme and the figures' playback stored before it loads,
 * and requestAnimationFrame counted by caller while `window.envuiIdle.counting` is on.
 */
async function openCatalogue(browser: Browser, theme: string, motion: 'paused' | 'playing') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
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
  await page.goto(catalogueUrl);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return page;
}

const settle = (page: Page, milliseconds: number) =>
  page.evaluate((delay) => new Promise((resolve) => setTimeout(resolve, delay)), milliseconds);

/** CDP's counters of style, layout and script time, in milliseconds, and their counts. */
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
    Object.entries(after).map(([key, value]) => [key, value - before[key]!]),
  ) as T;
}

/** Light ↔ dark on the Button page, as a choice made in another window applies. */
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
              // The colours that ease to the new theme, each restyled every frame until done.
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
  // Each run switches there and back; the two directions are reported apart.
  const toDark: Record<string, number>[] = [];
  const toLight: Record<string, number>[] = [];
  await switchOnce();
  await switchOnce();
  for (let run = 0; run < runs; run += 1) {
    toDark.push(await switchOnce());
    toLight.push(await switchOnce());
  }
  // One more switch, traced: its largest style recalculation, and how many it took.
  const events = await traced(browser, page, async () => void (await switchOnce()));
  const recalcs = named(events, 'UpdateLayoutTree');
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
      largestRecalcMs: tenth((largest?.dur ?? 0) / 1000),
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

/** The page's main thread's trace events while `during` runs. */
async function traced(browser: Browser, page: Page, during: () => Promise<void>) {
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
  // The renderer's CrRendererMain.
  const main = new Set(
    trace.traceEvents
      .filter((event) => event.name === 'thread_name' && event.args?.name === 'CrRendererMain')
      .map((event) => `${event.pid}:${event.tid}`),
  );
  return trace.traceEvents.filter((event) => main.has(`${event.pid}:${event.tid}`));
}

/** The events of a name, each once: a begin and its end count as one. */
const named = (events: TraceEvent[], name: string) =>
  events.filter((event) => event.name === name && event.ph !== 'E');

/** Maps a built file's position to the source it came from, through the build's source maps. */
const sourceMaps = new Map<string, Promise<{ map: SourceMap; directory: string } | null>>();
async function original(url: string | undefined, line: number, column: number) {
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
  const source = relative(root, resolve(loaded.directory, entry.originalSource)).replaceAll(
    '\\',
    '/',
  );
  return `${source}:${entry.originalLine + 1}`;
}

/** Where a stack starts, in the source: its first frames, from envUI or the site where any are. */
async function where(stack: TraceFrame[] | undefined) {
  if (!stack?.length) return 'unknown';
  const frames = await Promise.all(
    stack
      .slice(0, 8)
      .map((frame) => original(frame.url, frame.lineNumber ?? 0, frame.columnNumber ?? 0)),
  );
  const own = frames.findIndex((frame) => !frame.includes('node_modules'));
  return frames.slice(0, Math.max(1, own + 1)).join(' < ');
}

/** "at name (url:line:column)" from Error.stack, mapped to the source. */
async function caller(line: string) {
  const match = /\(?(https?:\/\/[^\s)]+):(\d+):(\d+)\)?$/.exec(line);
  return match ? original(match[1], Number(match[2]), Number(match[3])) : line;
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

/** The Button page left still for 5 s: what runs, and where it forces layout. */
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
  const events = await traced(browser, page, async () => {
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
    const at = await caller(line);
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
    forcedBy: tally(await Promise.all(forced.map((event) => where(stackOf(event))))),
    scriptMs: tenth(counters.script),
    styleMs: tenth(counters.recalcStyle),
    layoutMs: tenth(counters.layout),
  };
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
  // One line for each measurement's median, fastest and slowest.
  console.log(
    JSON.stringify(report, null, 2).replace(
      /\{\s+"median": ([\d.]+),\s+"min": ([\d.]+),\s+"max": ([\d.]+)\s+\}/g,
      '{ "median": $1, "min": $2, "max": $3 }',
    ),
  );
} finally {
  await browser.close();
  await Promise.all(servers.map((server) => server.close()));
}
