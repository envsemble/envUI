// The browser step: renders a finished run's app in development, loads envUI's dev mode into it and
// measures it at four widths. One headless Chromium serves the whole run, with a new context for
// each result; nothing is captured as an image. The result's dev server runs in a child process
// with the agent's environment, and listens on 127.0.0.1. Local only: it uploads nothing.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createServer as createNetServer } from 'node:net';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { agentEnv } from './agents.mjs';
import { killTree } from './process.mjs';

/** The widths the docs and the completion checks use. */
export const layoutWidths = ['22rem', '40rem', '60rem', '80rem'];
const rootPx = 16;
const remToPx = (width) => Math.round(parseFloat(width) * rootPx);
/** The window's height while measuring, and its width while the app loads. */
const windowHeight = 800;
const loadWidth = remToPx(layoutWidths.at(-1));
/**
 * How long to wait: the whole step (`total`), the dev server, dev mode and the first render (an
 * app that threw and still shows nothing gets `blank` once it's clear), and then for the app to
 * settle. The fixture's mocked calls answer within 1.5 s, so the loaded state is measured no
 * sooner than `loaded` after the first render, once nothing is busy and the DOM has been quiet for
 * `quiet`, or at `settle` at the latest.
 */
const timeouts = {
  total: 120_000,
  server: 60_000,
  ready: 45_000,
  blank: 3_000,
  loaded: 1_800,
  settle: 5_000,
  quiet: 300,
  close: 10_000,
};
const devServerScript = fileURLToPath(new URL('./dev-server.mjs', import.meta.url));
const isWindows = process.platform === 'win32';

/**
 * Math.random, seeded, before the app's scripts: the fixture's mocked calls fail at random, and a
 * result must render the same way every time it is measured.
 */
function seedRandom() {
  let state = 0x2026_1021;
  Math.random = () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Starts one headless Chromium for a run; `context()` opens a fresh context for one result. */
export async function openBrowser() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  return {
    async context() {
      const context = await browser.newContext({
        viewport: { width: loadWidth, height: windowHeight },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
      });
      await context.addInitScript(seedRandom);
      return context;
    },
    async close() {
      await browser.close();
    },
  };
}

/** A failure of the benchmark's own machinery, not of the result: its parts are not scored. */
class HarnessError extends Error {}

/** A free port on 127.0.0.1. */
function freePort() {
  return new Promise((resolve, reject) => {
    const server = createNetServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

/**
 * Starts the result's dev server in a child process with the agent's environment; its process is
 * in `run.server` from the start, so it is stopped however the step ends. Resolves with its URL.
 */
async function startServer({ appDir, tmpDir, env, run }) {
  const port = await freePort();
  run.alive();
  const child = spawn(
    process.execPath,
    [devServerScript, appDir, String(port), join(tmpDir, 'vite-cache')],
    {
      cwd: appDir,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: !isWindows,
      windowsHide: true,
    },
  );
  run.server = child;
  return new Promise((resolve, reject) => {
    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => {
      out += chunk;
      const ready = /^READY (\S+)/m.exec(out);
      if (ready) resolve(ready[1]);
      const failed = /^ERROR (.*)$/m.exec(out);
      if (failed) reject(new HarnessError(`the dev server did not start: ${failed[1]}`));
    });
    child.stderr.on('data', (chunk) => {
      err = `${err}${chunk}`.slice(-2000);
    });
    child.on('error', (error) =>
      reject(new HarnessError(`the dev server did not start: ${error.message}`)),
    );
    child.on('exit', (code) =>
      reject(
        new HarnessError(
          `the dev server exited with ${code}${err.trim() ? `: ${err.trim().slice(-300)}` : ''}`,
        ),
      ),
    );
  });
}

// ---------------------------------------------------------------------------------------------
// In the page. These functions are serialized into the page, so they use nothing from outside.

/** Waits until dev mode is installed and the app has rendered something, or gives up. */
function pageState() {
  const mode = window.__benchDevMode ?? null;
  const overlay = document.querySelector('vite-error-overlay');
  const root = document.getElementById('root') ?? document.body;
  const rendered = Array.from(root.querySelectorAll('*')).some((element) => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  });
  return { mode, overlay: Boolean(overlay), rendered };
}

/** Resolves once the DOM has been quiet for `quiet` ms, or after `limit` ms. */
function waitForQuiet({ quiet, limit }) {
  return new Promise((resolve) => {
    let timer;
    const done = () => {
      observer.disconnect();
      clearTimeout(timer);
      clearTimeout(cap);
      resolve();
    };
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(done, quiet);
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    timer = setTimeout(done, quiet);
    const cap = setTimeout(done, limit);
  });
}

/**
 * Measures the page at the window's current width: dev mode's `layout.at()` at that width, the
 * page's own horizontal overflow, and the task's rendered checks. Returns plain data.
 */
function measureHere({ width, checks }) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const normalize = (text) => text.replace(/\s+/g, ' ').trim().toLowerCase();
  const isVisible = (element) => {
    if (!element.isConnected) return false;
    if (
      typeof element.checkVisibility === 'function' &&
      !element.checkVisibility({ checkVisibilityCSS: true, opacityProperty: true })
    )
      return false;
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && box.right > 0 && box.left < window.innerWidth;
  };
  /**
   * The visible elements that hold a text: its own element, or the nearest `within` around it,
   * and `up` levels above that, such as a heading's container.
   */
  const anchors = ({ text, within, up = 0 }) => {
    const needle = normalize(text);
    const found = [];
    const add = (start) => {
      let element = within ? (start?.closest(within) ?? null) : start;
      for (let level = 0; level < up && element; level += 1) element = element.parentElement;
      if (element && !found.includes(element) && isVisible(element)) found.push(element);
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode())
      if (normalize(node.textContent ?? '').includes(needle)) add(node.parentElement);
    // Labels given by attributes, such as an icon button's or a rail item's aria-label.
    for (const element of document.querySelectorAll('[aria-label]'))
      if (normalize(element.getAttribute('aria-label') ?? '').includes(needle)) add(element);
    return found;
  };
  const first = (spec) => anchors(spec)[0] ?? null;
  const toRem = (px) => Math.round((px / rem) * 100) / 100;
  const boxOf = (element) => element.getBoundingClientRect();
  const describe = (spec) =>
    `"${spec.text}"${spec.within ? ` in ${spec.within}` : ''}${spec.up ? ` (${spec.up} up)` : ''}`;

  /**
   * The benchmark's own check of hand-rolled layout: flex and grid containers that are neither
   * envUI's layout nodes (`data-env-layout`) nor envUI's parts (an `env-*` class), in the app's
   * root, as dev mode checks its nodes. A container whose child sticks out while it neither scrolls
   * nor clips has `child-overflow`; one whose content is wider than it while it doesn't scroll has
   * `content-overflow`. Only the deepest container with a problem is reported.
   */
  const handRolledProblems = () => {
    const root = document.getElementById('root') ?? document.body;
    const isEnvui = (element) =>
      element.hasAttribute('data-env-layout') ||
      Array.from(element.classList).some((name) => name.startsWith('env-'));
    const label = (element) =>
      `${element.tagName.toLowerCase()}${element.classList.length ? `.${element.classList[0]}` : ''}`;
    const pathOf = (element) => {
      const steps = [];
      for (let at = element; at && at !== root && steps.length < 4; at = at.parentElement)
        steps.unshift(label(at));
      return `hand-rolled ${steps.join(' > ')}`;
    };
    const found = new Map();
    for (const element of root.querySelectorAll('*')) {
      if (isEnvui(element) || !isVisible(element)) continue;
      const style = getComputedStyle(element);
      if (!/^(inline-)?(flex|grid)$/.test(style.display)) continue;
      const scrolls = ['auto', 'scroll'].includes(style.overflowX);
      if (scrolls) continue;
      const box = element.getBoundingClientRect();
      const spills =
        style.overflowX === 'visible' &&
        Array.from(element.children).some((child) => {
          const position = getComputedStyle(child).position;
          if (position === 'fixed' || position === 'absolute' || !isVisible(child)) return false;
          const inner = child.getBoundingClientRect();
          return inner.right > box.right + 1 || inner.left < box.left - 1;
        });
      const wider = element.scrollWidth - element.clientWidth;
      if (spills)
        found.set(element, {
          rule: 'child-overflow',
          message: `${pathOf(element)}: a child sticks out of this hand-rolled ${style.display} container, which neither scrolls nor clips.`,
        });
      else if (wider > 1)
        found.set(element, {
          rule: 'content-overflow',
          message: `${pathOf(element)}: its content is ${toRem(wider)}rem wider than this hand-rolled ${style.display} container, which doesn't scroll.`,
        });
    }
    const problems = [];
    for (const [element, problem] of found) {
      const inner = [...found.keys()].some((other) => other !== element && element.contains(other));
      if (!inner)
        problems.push({
          ...problem,
          node: `hand-rolled ${label(element)}`,
          path: pathOf(element),
        });
    }
    return problems;
  };

  const evaluate = (check) => {
    switch (check.check) {
      case 'visible': {
        const missing = check.text.filter((text) => !first({ text, within: check.within }));
        return missing.length
          ? { pass: false, detail: `not visible: ${missing.map((text) => `"${text}"`).join(', ')}` }
          : { pass: true };
      }
      case 'relation': {
        const a = first(check.a);
        const b = first(check.b);
        if (!a || !b)
          return { pass: false, detail: `not visible: ${describe(a ? check.b : check.a)}` };
        const ra = boxOf(a);
        const rb = boxOf(b);
        const tolerance = 1;
        const overlapY = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top) > 0;
        const holds = {
          'left-of': ra.right <= rb.left + tolerance,
          'right-of': ra.left >= rb.right - tolerance,
          above: ra.bottom <= rb.top + tolerance,
          below: ra.top >= rb.bottom - tolerance,
          beside: overlapY && (ra.right <= rb.left + tolerance || ra.left >= rb.right - tolerance),
        }[check.relation];
        return holds
          ? { pass: true }
          : {
              pass: false,
              detail: `${describe(check.a)} is not ${check.relation} ${describe(check.b)}`,
            };
      }
      case 'exclusive': {
        const shown = check.anchors.filter((spec) => first(spec));
        return shown.length === 1
          ? { pass: true }
          : {
              pass: false,
              detail: `${shown.length} of ${check.anchors.map(describe).join(', ')} visible, expected one`,
            };
      }
      case 'columns': {
        const elements = check.text.map((text) => first({ text, within: check.within }));
        const missing = check.text.filter((_, index) => !elements[index]);
        if (missing.length)
          return {
            pass: false,
            detail: `not visible: ${missing.map((text) => `"${text}"`).join(', ')}`,
          };
        const lefts = [];
        for (const element of elements) {
          const left = boxOf(element).left;
          if (!lefts.some((known) => Math.abs(known - left) < 8)) lefts.push(left);
        }
        const count = lefts.length;
        const pass =
          (check.min === undefined || count >= check.min) &&
          (check.max === undefined || count <= check.max);
        return pass ? { pass } : { pass, detail: `${count} columns` };
      }
      case 'size': {
        const element = first(check.anchor);
        if (!element) return { pass: false, detail: `not visible: ${describe(check.anchor)}` };
        const size = toRem(boxOf(element).width);
        const pass =
          (check.minWidth === undefined || size >= check.minWidth) &&
          (check.maxWidth === undefined || size <= check.maxWidth);
        return pass ? { pass } : { pass, detail: `${describe(check.anchor)} is ${size}rem wide` };
      }
      case 'centered': {
        const element = first(check.anchor);
        if (!element) return { pass: false, detail: `not visible: ${describe(check.anchor)}` };
        const box = boxOf(element);
        const start = box.left;
        const end = document.documentElement.clientWidth - box.right;
        const off = toRem(Math.abs(start - end));
        return off <= (check.tolerance ?? 1.5)
          ? { pass: true }
          : { pass: false, detail: `${describe(check.anchor)} is ${off}rem off centre` };
      }
      case 'busy': {
        const busy = Array.from(document.querySelectorAll('[aria-busy="true"]')).some(isVisible);
        return busy ? { pass: true } : { pass: false, detail: 'nothing visible is aria-busy' };
      }
      default:
        return { pass: false, detail: `unknown check ${check.check}` };
    }
  };

  const result = { width, checks: checks.map((check) => ({ key: check.key, ...evaluate(check) })) };
  if (width === null) return result;
  // The page itself wider than the window: a horizontal scrollbar on the whole page.
  const scrolling = document.scrollingElement ?? document.documentElement;
  const wider = scrolling.scrollWidth - window.innerWidth;
  result.pageOverflow = wider > 1 ? toRem(wider) : 0;
  result.handRolled = handRolledProblems();
  const layout = window.envui?.layout;
  if (!layout) {
    result.error = 'dev mode is not installed';
    return result;
  }
  try {
    const [reading] = layout.at([width]);
    result.windowClass = reading.windowClass;
    result.problems = reading.problems;
  } catch (error) {
    result.error = `layout.at failed: ${error?.message ?? error}`;
  }
  return result;
}

// ---------------------------------------------------------------------------------------------

/**
 * The rendered checks of a task, flattened: each with the capability it belongs to, the widths it
 * applies at (all four by default) and the state it is measured in (`loaded` by default, or
 * `loading`, measured as soon as the app has rendered).
 */
export function renderedChecks(task) {
  return (task.capabilities ?? []).flatMap((capability) =>
    (capability.rendered ?? []).map((check, index) => ({
      ...check,
      capability: capability.id,
      key: `${capability.id}#${index}`,
      at: check.at ?? layoutWidths,
      state: check.state ?? 'loaded',
    })),
  );
}

/** The problems a reading found, keyed so that one problem seen at several widths counts once. */
export function distinctProblems(widths) {
  const problems = new Map();
  for (const reading of widths) {
    if (reading.pageOverflow)
      problems.set('page-overflow|page', {
        rule: 'page-overflow',
        path: 'page',
        message: `The page is ${reading.pageOverflow}rem wider than the window at ${reading.width}, so the whole page scrolls sideways.`,
        widths: [...(problems.get('page-overflow|page')?.widths ?? []), reading.width],
      });
    for (const problem of reading.problems ?? []) {
      const key = `${problem.rule}|${problem.path}`;
      const known = problems.get(key);
      if (known) known.widths.push(reading.width);
      else problems.set(key, { ...problem, widths: [reading.width] });
    }
  }
  return [...problems.values()];
}

/**
 * Renders one run's app and measures it, within `total` at most. Returns `{ rendered, error,
 * harnessError, widths, problems, checks, pageErrors, durationMs }`: whether the app rendered at
 * all, dev mode's readings, the page's overflow and the hand-rolled containers' problems per
 * width, the distinct problems, and each rendered check's outcome. `error` says why a result
 * didn't render (a build error, or nothing on the page); `harnessError` says why the step itself
 * failed (the dev server, dev mode, or the time limit), and then nothing of it is scored.
 */
export async function checkRendered({ browser, appDir, tmpDir, task, env }) {
  const started = Date.now();
  mkdirSync(tmpDir, { recursive: true });
  const outcome = {
    rendered: false,
    error: null,
    harnessError: null,
    widths: [],
    problems: [],
    checks: [],
    pageErrors: [],
  };
  // What the step holds, released by whichever ends first, the step or its time limit; a resource
  // created after that is released at once.
  const run = {
    aborted: false,
    server: null,
    context: null,
    alive() {
      if (run.aborted) throw new HarnessError('the browser step was stopped');
    },
    async release() {
      run.aborted = true;
      if (run.server) {
        killTree(run.server.pid);
        run.server = null;
      }
      const context = run.context;
      run.context = null;
      if (context) await withTimeout(context.close(), timeouts.close, 'close').catch(() => {});
    },
  };
  let timer;
  try {
    await Promise.race([
      measureRun({
        browser,
        appDir,
        tmpDir,
        task,
        env: env ?? agentEnv({ tmpDir, homeDir: join(tmpDir, 'home') }),
        run,
        outcome,
      }).finally(() => run.release()),
      new Promise((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new HarnessError(`the browser step took longer than ${timeouts.total / 1000} s`),
            ),
          timeouts.total,
        );
      }),
    ]);
  } catch (error) {
    const message = String(error?.message ?? error).slice(0, 400);
    if (error instanceof HarnessError) {
      outcome.harnessError = message;
      outcome.rendered = false;
    } else outcome.error = message;
  } finally {
    clearTimeout(timer);
    await run.release();
  }
  outcome.pageErrors = outcome.pageErrors.slice(0, 5).map((message) => message.slice(0, 300));
  outcome.durationMs = Date.now() - started;
  return outcome;
}

async function measureRun({ browser, appDir, tmpDir, task, env, run, outcome }) {
  const checks = renderedChecks(task);
  const pageErrors = outcome.pageErrors;
  const url = await withTimeout(
    startServer({ appDir, tmpDir, env, run }),
    timeouts.server,
    'the dev server did not start in time',
    HarnessError,
  );
  run.alive();
  run.context = await browser.context();
  if (run.aborted) await run.release();
  run.alive();
  const page = await run.context.newPage();
  page.on('pageerror', (error) => pageErrors.push(String(error?.message ?? error)));
  await page.goto(url, { waitUntil: 'load', timeout: timeouts.ready }).catch((error) => {
    throw new HarnessError(`the page did not load: ${error.message}`);
  });

  // The loading checks as soon as the app has rendered; then dev mode and the loaded state. An app
  // that threw and still shows nothing is given `blank` after its error, not the whole wait.
  const loading = checks.filter((check) => check.state === 'loading');
  const deadline = Date.now() + timeouts.ready;
  let firstError = null;
  let firstRender = null;
  let state;
  for (;;) {
    run.alive();
    state = await page.evaluate(pageState);
    if (state.rendered && firstRender === null) {
      firstRender = Date.now();
      if (loading.length) {
        const reading = await page.evaluate(measureHere, { width: null, checks: loading });
        for (const result of reading.checks)
          outcome.checks.push({ ...result, width: 'loading', state: 'loading' });
      }
    }
    if (pageErrors.length) firstError ??= Date.now();
    if (state.overlay) break;
    if (String(state.mode ?? '').startsWith('error')) break;
    if (state.mode === 'ready' && state.rendered) break;
    if (!state.rendered && firstError && Date.now() - firstError > timeouts.blank) break;
    if (Date.now() > deadline) break;
    await page.waitForTimeout(50);
  }
  if (state.overlay) throw new Error('the dev server showed a build error');
  if (!state.rendered)
    throw new Error(
      `the app rendered nothing${pageErrors.length ? `: ${pageErrors[0].slice(0, 200)}` : ''}`,
    );
  if (String(state.mode ?? '').startsWith('error'))
    throw new HarnessError(`dev mode: ${state.mode}`);
  if (state.mode !== 'ready') throw new HarnessError('dev mode did not load');
  outcome.rendered = true;

  // Loaded: the mocked calls answered, nothing busy and the DOM quiet, within a limit.
  const settleBy = firstRender + timeouts.settle;
  await page.waitForTimeout(Math.max(0, firstRender + timeouts.loaded - Date.now()));
  await page
    .waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, {
      timeout: Math.max(1, settleBy - Date.now()),
    })
    .catch(() => {});
  await page.evaluate(waitForQuiet, {
    quiet: timeouts.quiet,
    limit: Math.max(timeouts.quiet, settleBy - Date.now()),
  });

  for (const width of layoutWidths) {
    run.alive();
    // The window takes the width, so the app's own media queries respond as well as container
    // queries; layout.at() then measures with the root at that width.
    await page.setViewportSize({ width: remToPx(width), height: windowHeight });
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    const here = checks.filter((check) => check.state === 'loaded' && check.at.includes(width));
    const reading = await page.evaluate(measureHere, { width, checks: here });
    outcome.widths.push({
      width,
      windowClass: reading.windowClass ?? null,
      pageOverflow: reading.pageOverflow,
      problems: [...(reading.problems ?? []), ...(reading.handRolled ?? [])],
      error: reading.error ?? null,
    });
    for (const result of reading.checks) outcome.checks.push({ ...result, width });
  }
  outcome.problems = distinctProblems(outcome.widths);
}

function withTimeout(promise, ms, message, ErrorType = Error) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new ErrorType(message)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}
