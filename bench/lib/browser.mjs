// The browser step: renders a finished run's app in development, loads envUI's dev mode into it and
// measures it at four widths. One headless Chromium serves the whole run; its pages are reused, and
// nothing is captured as an image. Local only: it starts a dev server on 127.0.0.1 and uploads
// nothing.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer as createNetServer } from 'node:net';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** The widths the docs and the completion checks use. */
export const layoutWidths = ['22rem', '40rem', '60rem', '80rem'];
const rootPx = 16;
const remToPx = (width) => Math.round(parseFloat(width) * rootPx);
/** The window's height while measuring, and its width while the app loads. */
const windowHeight = 800;
const loadWidth = remToPx(layoutWidths.at(-1));
/**
 * How long to wait: for the dev server, for dev mode and the first render (an app that threw and
 * still shows nothing gets `blank` once dev mode is there), and then for the app to settle. The
 * fixture's mocked calls answer within 1.5 s, so the loaded state is measured no
 * sooner than `loaded` after the first render, once nothing is busy and the DOM has been quiet for
 * `quiet`, or at `settle` at the latest.
 */
const timeouts = {
  server: 60_000,
  ready: 45_000,
  blank: 3_000,
  loaded: 1_800,
  settle: 5_000,
  quiet: 300,
};

/**
 * Starts one headless Chromium for a run. `page()` lends a page and `release(page)` takes it back,
 * so a run with four jobs in parallel opens at most four pages, whatever its length.
 */
export async function openBrowser() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: loadWidth, height: windowHeight },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  const idle = [];
  return {
    async page() {
      return idle.pop() ?? (await context.newPage());
    },
    async release(page) {
      page.removeAllListeners('pageerror');
      await page.goto('about:blank').catch(() => {});
      idle.push(page);
    },
    async close() {
      await browser.close();
    },
  };
}

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

/** Vite as the app installed it, so the app's own config and plugins load as in `npm run dev`. */
async function appVite(appDir) {
  const require = createRequire(join(appDir, 'package.json'));
  const manifestFile = require.resolve('vite/package.json');
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  const entry = manifest.exports?.['.'];
  const file =
    typeof entry === 'string' ? entry : (entry?.import?.default ?? entry?.import ?? entry?.default);
  return import(pathToFileURL(join(dirname(manifestFile), file)).href);
}

/**
 * Loads dev mode before the app's own scripts, in development only: an inline module script the
 * dev server resolves like the app's imports. It sets `__benchDevMode` when the readout is there.
 */
const devModePlugin = {
  name: 'bench-dev-mode',
  apply: 'serve',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      const script = `<script type="module">
import('@envsemble/envui/dev').then(
  ({ installDevMode }) => {
    installDevMode({ button: false, shortcut: false, parts: [] });
    window.__benchDevMode = 'ready';
  },
  (error) => { window.__benchDevMode = 'error: ' + (error && error.message ? error.message : error); },
);
</script>`;
      return html.includes('</head>')
        ? html.replace('</head>', `${script}\n</head>`)
        : `${script}\n${html}`;
    },
  },
};

/** The package a bare module specifier names: `@pierre/theme/pierre-dark` is `@pierre/theme`. */
const packageOf = (specifier) =>
  specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];

/**
 * Stands in for envUI's optional peer dependencies that the app hasn't installed. Dev mode's own UI
 * reaches the content entry's code highlighting, whose theme package is an optional peer, so an app
 * without it couldn't load dev mode. The stand-in is an empty module; dev mode's readout doesn't use
 * it. Applied in the dependency optimizer and in the dev server alike.
 */
function missingPeersPlugin(appDir) {
  const require = createRequire(join(appDir, 'package.json'));
  let optional = new Set();
  try {
    const manifest = JSON.parse(
      readFileSync(require.resolve('@envsemble/envui/package.json'), 'utf8'),
    );
    optional = new Set(
      Object.keys(manifest.peerDependenciesMeta ?? {}).filter(
        (name) => manifest.peerDependenciesMeta[name]?.optional,
      ),
    );
  } catch {
    // No envUI installed: nothing to stand in for.
  }
  const missing = new Map();
  const isMissing = (name) => {
    if (!missing.has(name)) {
      let found = true;
      try {
        require.resolve(`${name}/package.json`);
      } catch {
        found = false;
      }
      missing.set(name, !found);
    }
    return missing.get(name);
  };
  const prefix = '\0bench-missing-peer:';
  return {
    name: 'bench-missing-peers',
    resolveId(id) {
      if (/^[./\0]/.test(id)) return null;
      const name = packageOf(id);
      return optional.has(name) && isMissing(name) ? `${prefix}${id}` : null;
    },
    load(id) {
      return id.startsWith(prefix)
        ? 'const missing = { colors: {}, tokenColors: [] };\nexport default missing;\n'
        : null;
    },
  };
}

/** Starts the app's dev server; its dependency cache goes to the run's temp folder. */
async function startServer(appDir, tmpDir) {
  const vite = await appVite(appDir);
  const port = await freePort();
  const missingPeers = missingPeersPlugin(appDir);
  const server = await vite.createServer({
    root: appDir,
    mode: 'development',
    configLoader: 'runner',
    cacheDir: join(tmpDir, 'vite-cache'),
    logLevel: 'silent',
    clearScreen: false,
    plugins: [devModePlugin, missingPeers],
    optimizeDeps: {
      include: ['@envsemble/envui/dev'],
      rolldownOptions: { plugins: [missingPeers] },
    },
    server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false, watch: null },
  });
  await server.listen();
  return { server, url: `http://127.0.0.1:${port}/` };
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
  /** The visible elements that hold a text: its own element, or the nearest `within` around it. */
  const anchors = ({ text, within }) => {
    const needle = normalize(text);
    const found = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!normalize(node.textContent ?? '').includes(needle)) continue;
      let element = node.parentElement;
      if (within) element = element?.closest(within) ?? null;
      if (element && !found.includes(element) && isVisible(element)) found.push(element);
    }
    // Labels given by attributes, such as an icon button's or a rail item's aria-label.
    for (const element of document.querySelectorAll('[aria-label]')) {
      if (!normalize(element.getAttribute('aria-label') ?? '').includes(needle)) continue;
      const target = within ? element.closest(within) : element;
      if (target && !found.includes(target) && isVisible(target)) found.push(target);
    }
    return found;
  };
  const first = (spec) => anchors(spec)[0] ?? null;
  const toRem = (px) => Math.round((px / rem) * 100) / 100;
  const boxOf = (element) => element.getBoundingClientRect();
  const describe = (spec) => `"${spec.text}"${spec.within ? ` in ${spec.within}` : ''}`;

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
 * Renders one run's app and measures it. Returns `{ rendered, error, widths, problems, checks,
 * durationMs }`: whether the app rendered at all, dev mode's readings and the page's overflow per
 * width, the distinct problems, and each rendered check's outcome.
 */
export async function checkRendered({ browser, appDir, tmpDir, task }) {
  const started = Date.now();
  const checks = renderedChecks(task);
  const outcome = { rendered: false, error: null, widths: [], problems: [], checks: [] };
  const pageErrors = [];
  let dev;
  let page;
  try {
    dev = await withTimeout(
      startServer(appDir, tmpDir),
      timeouts.server,
      'the dev server did not start',
    );
    page = await browser.page();
    page.on('pageerror', (error) => pageErrors.push(String(error?.message ?? error)));
    await page.setViewportSize({ width: loadWidth, height: windowHeight });
    await page.goto(dev.url, { waitUntil: 'load', timeout: timeouts.ready });
    // Dev mode and the app's first render, whichever comes last. Once dev mode is there, an app
    // that threw and still shows nothing is given `blank` more, not the whole wait.
    const deadline = Date.now() + timeouts.ready;
    let readyAt = null;
    let state = await page.evaluate(pageState);
    while (
      Date.now() < deadline &&
      !state.overlay &&
      !(state.mode && state.rendered) &&
      !String(state.mode ?? '').startsWith('error') &&
      !(readyAt && pageErrors.length && Date.now() - readyAt > timeouts.blank)
    ) {
      await page.waitForTimeout(50);
      state = await page.evaluate(pageState);
      if (state.mode === 'ready') readyAt ??= Date.now();
    }
    if (state.overlay) throw new Error('the dev server showed a build error');
    if (String(state.mode ?? '').startsWith('error')) throw new Error(`dev mode: ${state.mode}`);
    if (state.mode !== 'ready') throw new Error('dev mode did not load');
    if (!state.rendered)
      throw new Error(
        `the app rendered nothing${pageErrors.length ? `: ${pageErrors[0].slice(0, 200)}` : ''}`,
      );
    outcome.rendered = true;
    const firstRender = Date.now();

    // While loading: measured at once, at the width the app loaded at.
    const loading = checks.filter((check) => check.state === 'loading');
    if (loading.length) {
      const reading = await page.evaluate(measureHere, { width: null, checks: loading });
      for (const result of reading.checks)
        outcome.checks.push({ ...result, width: 'loading', state: 'loading' });
    }

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
        problems: reading.problems ?? [],
        error: reading.error ?? null,
      });
      for (const result of reading.checks) outcome.checks.push({ ...result, width });
    }
    outcome.problems = distinctProblems(outcome.widths);
  } catch (error) {
    outcome.error = String(error?.message ?? error).slice(0, 400);
  } finally {
    if (page) await browser.release(page);
    if (dev) await dev.server.close().catch(() => {});
  }
  outcome.pageErrors = pageErrors.slice(0, 5).map((message) => message.slice(0, 300));
  outcome.durationMs = Date.now() - started;
  return outcome;
}

function withTimeout(promise, ms, message) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}
