// Load-speed benchmarks of the website as it is hosted: Lighthouse on a sample of pages, each cold
// and with a warm cache, on a phone and a desktop, and a client-side navigation between two pages.
// The numbers depend on the machine and what else runs on it: a measure to compare before and
// after a change on one machine, not a pass/fail test.
//
//   node scripts/test/MeasureSite.ts [--runs <n>] [--only <pages>] [--forms <forms>]
//     [--no-build] [--site <dir>] [--no-navigation] [--label <name>] [--serve] [--report <label>]
//
// It builds the site (`npm run build:site`; --no-build serves the last build, --site <dir> another
// build, such as a copy of the last one kept to compare with) and serves dist/site as Cloudflare
// does: `wrangler dev` runs the Worker and the asset server, with their brotli and
// the cache headers of _headers and Worker.mjs, and an HTTP/2 proxy over TLS in front of it on
// ENVUI_SITE_PERF_PORT (9095 by default) gives the browser the multiplexed connection the hosted
// site has, with a self-signed certificate (made with openssl into .cache/site-perf) that Chromium
// trusts by its key. Lighthouse (npx lighthouse, pinned below) drives Playwright's Chromium.
//
// - Pages: --only takes some of home, components, button, colors, table, docs and docs-button.
// - Forms: mobile (Lighthouse's default: Slow 4G and 4× CPU) and desktop (its desktop preset),
//   both throttled by DevTools, so cached files cost what they cost; --forms picks one.
// - Each page loads cold (Lighthouse clears the cache) and then warm (the same browser, its cache
//   kept: the page revalidated, hashed files from the cache), --runs times (3 by default); the
//   median of each number is reported.
// - Navigation: the catalogue's Button page, loaded and settled, then Checkbox shown as a link
//   does (history.pushState and a popstate event), and the same in the Docs: the time until the
//   new page's heading is painted with no loading placeholder in view, and what it fetched.
//
// It writes every run's numbers to .cache/site-perf/<label>.json as it goes, and prints the medians
// as Markdown tables at the end; --report <label> prints them from that file. Another measurement at
// the same time takes another ENVUI_SITE_PERF_PORT, such as 9105, which uses the next two as well.
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { X509Certificate, createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http';
import { createSecureServer } from 'node:http2';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const lighthouseVersion = '13.6.0';
const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const cache = resolve(root, '.cache/site-perf');
const port = Number(process.env.ENVUI_SITE_PERF_PORT || 9095);
const wranglerPort = port + 1;
const debuggingPort = port + 2;
const origin = `https://localhost:${port}`;

const pages: Record<string, { path: string; title: string }> = {
  home: { path: '/', title: 'Catalogue home' },
  components: { path: '/components', title: 'Components gallery' },
  button: { path: '/components/button', title: 'Button' },
  colors: { path: '/foundations/colors', title: 'Colors' },
  table: { path: '/components/table', title: 'Table' },
  docs: { path: '/docs', title: 'Docs home' },
  'docs-button': { path: '/docs/components/button', title: 'Docs: Button' },
};
const forms = ['mobile', 'desktop'] as const;
type Form = (typeof forms)[number];
/** Lighthouse's mobile throttling, which the navigation applies through CDP as DevTools does. */
const mobileThrottling = {
  latency: 150 * 3.75,
  downloadThroughput: ((1.6 * 1024 * 1024) / 8) * 0.9,
  uploadThroughput: ((750 * 1024) / 8) * 0.9,
  cpu: 4,
};
/** Lighthouse's screens: a Moto G Power for mobile, and its desktop preset's. */
const contextOptions = (form: Form) =>
  form === 'mobile'
    ? {
        viewport: { width: 412, height: 823 },
        deviceScaleFactor: 1.75,
        isMobile: true,
        hasTouch: true,
      }
    : { viewport: { width: 1350, height: 940 } };
/** What a page shows while a part of it loads (template/Loading.tsx); the navigation waits until none
 * is in view. A page showing other placeholders, such as skeletons, adds their class here. */
const loadingSelector = '.site-loading';

const args = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const runs = Number(option('--runs') ?? 3);
const only = (option('--only') ?? Object.keys(pages).join(',')).split(',');
for (const name of only)
  if (!Object.hasOwn(pages, name))
    throw new Error(`Unknown page ${name}: ${Object.keys(pages).join(', ')}.`);
const chosenForms = (option('--forms') ?? forms.join(',')).split(',') as Form[];
for (const form of chosenForms)
  if (!forms.includes(form)) throw new Error(`Unknown form ${form}: ${forms.join(', ')}.`);
const label = option('--label') ?? new Date().toISOString().replace(/[:.]/g, '-');
/** The build served: dist/site, or --site's. */
const site = resolve(root, option('--site') ?? 'dist/site');

const median = (values: number[]) => {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return NaN;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};

/** A command line for the shell, which npm's commands need on Windows. */
const commandLine = (parts: string[]) =>
  parts.map((part) => (/^[\w@./:=,+-]+$/.test(part) ? part : `"${part}"`)).join(' ');

/**
 * Runs a command to its end, failing on a non-zero exit, without blocking: the proxy answers in
 * this process meanwhile.
 */
function run(parts: string[], quiet = false) {
  return new Promise<string>((done, fail) => {
    const child = spawn(commandLine(parts), {
      cwd: root,
      stdio: quiet ? 'pipe' : 'inherit',
      shell: true,
    });
    let output = '';
    child.stdout?.on('data', (chunk: Buffer) => (output += chunk));
    child.stderr?.on('data', (chunk: Buffer) => (output += chunk));
    child.on('error', fail);
    child.on('exit', (code) =>
      code === 0 ? done(output) : fail(new Error(`${commandLine(parts)} failed:\n${output}`)),
    );
  });
}

async function waitFor(url: string) {
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not answering yet.
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error(`${url} did not answer.`);
}

/** The self-signed certificate of localhost, and the hash of its key that Chromium trusts. */
async function certificate() {
  const key = resolve(cache, 'localhost-key.pem');
  const cert = resolve(cache, 'localhost-cert.pem');
  if (!existsSync(cert)) {
    await mkdir(cache, { recursive: true });
    const made = spawnSync(
      'openssl',
      [
        'req',
        '-x509',
        '-newkey',
        'rsa:2048',
        '-nodes',
        '-keyout',
        key,
        '-out',
        cert,
        '-days',
        '3650',
        '-subj',
        '/CN=localhost',
        '-addext',
        'subjectAltName=DNS:localhost,IP:127.0.0.1',
      ],
      { encoding: 'utf8' },
    );
    if (made.status !== 0)
      throw new Error(`openssl, which makes the certificate, failed: ${made.stderr ?? made.error}`);
  }
  const pem = await readFile(cert);
  const spki = new X509Certificate(pem).publicKey.export({ type: 'spki', format: 'der' });
  return {
    key: await readFile(key),
    cert: pem,
    spki: createHash('sha256').update(spki).digest('base64'),
  };
}

const hopByHop = new Set([
  'connection',
  'keep-alive',
  'proxy-connection',
  'transfer-encoding',
  'upgrade',
  'http2-settings',
  'host',
]);
const forwarded = (headers: IncomingHttpHeaders) =>
  Object.fromEntries(
    Object.entries(headers).filter(([name]) => !name.startsWith(':') && !hopByHop.has(name)),
  );

/** An HTTP/2 proxy over TLS in front of wrangler dev, which answers HTTP/1.1. */
async function startProxy() {
  const { key, cert, spki } = await certificate();
  const server = createSecureServer({ key, cert, allowHTTP1: true }, (incoming, outgoing) => {
    const upstream = httpRequest(
      {
        host: '127.0.0.1',
        port: wranglerPort,
        method: incoming.method,
        path: incoming.url,
        headers: {
          ...forwarded(incoming.headers),
          host: `localhost:${port}`,
          // wrangler dev answers with the first encoding listed, gzip of Chromium's; Cloudflare
          // serves brotli to a browser that takes it.
          ...(/\bbr\b/.test(String(incoming.headers['accept-encoding']))
            ? { 'accept-encoding': 'br, gzip' }
            : {}),
        },
      },
      (response) => {
        outgoing.writeHead(response.statusCode ?? 502, forwarded(response.headers));
        response.pipe(outgoing);
      },
    );
    upstream.on('error', () => {
      outgoing.writeHead(502);
      outgoing.end();
    });
    incoming.pipe(upstream);
  });
  await new Promise<void>((done) => server.listen(port, '127.0.0.1', done));
  return { server, spki };
}

function startWrangler() {
  return spawn(
    commandLine([
      'npx',
      'wrangler',
      'dev',
      '--port',
      String(wranglerPort),
      '--ip',
      '127.0.0.1',
      '--log-level',
      'warn',
      '--assets',
      site,
      // Its own state, so measurements on other ports run beside it.
      '--persist-to',
      resolve(cache, `wrangler-${port}`),
    ]),
    { cwd: root, stdio: 'ignore', shell: true },
  );
}

function stop(child: ChildProcess) {
  if (child.exitCode !== null) return;
  if (process.platform === 'win32' && child.pid)
    spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
  else child.kill();
}

interface Audit {
  numericValue?: number;
  details?: { items?: Record<string, unknown>[]; overallSavingsBytes?: number } & Record<
    string,
    unknown
  >;
}
type Report = { audits: Record<string, Audit> };

interface Chain {
  children?: Record<string, Chain>;
}
/** The requests in the longest chain of the network dependency tree, the page included. */
const chainDepth = (chains: Record<string, Chain> | undefined): number =>
  chains ? Math.max(0, ...Object.values(chains).map((chain) => 1 + chainDepth(chain.children))) : 0;
/** The tree of Lighthouse 13's network dependency insight: its first list section's chains. */
const dependencyTree = (audit: Audit | undefined) => {
  const section = audit?.details?.items?.[0] as
    | { value?: { chains?: Record<string, Chain> } }
    | undefined;
  return section?.value?.chains;
};

/** The numbers of one Lighthouse report. */
function numbers(report: Report) {
  const audit = (id: string) => report.audits[id];
  const value = (id: string) => audit(id)?.numericValue ?? NaN;
  const items = (id: string) => audit(id)?.details?.items ?? [];
  const summary = Object.fromEntries(
    items('resource-summary').map((item) => [
      String(item.resourceType),
      { bytes: Number(item.transferSize), requests: Number(item.requestCount) },
    ]),
  );
  const bytes = (type: string) => summary[type]?.bytes ?? 0;
  const bootup = items('bootup-time');
  const breakdown = Object.fromEntries(
    items('mainthread-work-breakdown').map((item) => [String(item.group), Number(item.duration)]),
  );
  const longTasks = items('long-tasks');
  const renderBlocking = items('render-blocking-insight');
  return {
    lcp: value('largest-contentful-paint'),
    fcp: value('first-contentful-paint'),
    tbt: value('total-blocking-time'),
    cls: value('cumulative-layout-shift'),
    speedIndex: value('speed-index'),
    interactive: value('interactive'),
    totalBytes: bytes('total'),
    jsBytes: bytes('script'),
    cssBytes: bytes('stylesheet'),
    fontBytes: bytes('font'),
    imageBytes: bytes('image'),
    otherBytes:
      bytes('total') - bytes('script') - bytes('stylesheet') - bytes('font') - bytes('image'),
    requests: summary.total?.requests ?? 0,
    jsRequests: summary.script?.requests ?? 0,
    cssRequests: summary.stylesheet?.requests ?? 0,
    chainDepth: chainDepth(dependencyTree(audit('network-dependency-tree-insight'))),
    renderBlockingRequests: renderBlocking.length,
    // Script evaluation and parsing of every script, until the page settles.
    jsExecution: bootup.reduce(
      (sum, item) => sum + Number(item.scripting ?? 0) + Number(item.scriptParseCompile ?? 0),
      0,
    ),
    longTasks: longTasks.length,
    longestTask: Math.max(0, ...longTasks.map((item) => Number(item.duration))),
    mainThread: value('mainthread-work-breakdown'),
    scriptEvaluation: breakdown.scriptEvaluation ?? 0,
    scriptParsing: breakdown.scriptParseCompile ?? 0,
    styleLayout: breakdown.styleLayout ?? 0,
    paintCompositeRender: breakdown.paintCompositeRender ?? 0,
    parseHTML: breakdown.parseHTML ?? 0,
    garbageCollection: breakdown.garbageCollection ?? 0,
    otherWork: breakdown.other ?? 0,
  };
}
type Numbers = ReturnType<typeof numbers>;

async function lighthouse(path: string, form: Form, warm: boolean): Promise<Numbers> {
  const output = join(tmpdir(), `envui-site-perf-${process.pid}.json`);
  await run(
    [
      'npx',
      '-y',
      `lighthouse@${lighthouseVersion}`,
      `${origin}${path}`,
      `--port=${debuggingPort}`,
      '--output=json',
      `--output-path=${output}`,
      '--quiet',
      '--only-categories=performance',
      '--throttling-method=devtools',
      ...(form === 'desktop' ? ['--preset=desktop'] : []),
      ...(warm ? ['--disable-storage-reset'] : []),
    ],
    true,
  );
  const report = JSON.parse(await readFile(output, 'utf8')) as Report;
  await rm(output, { force: true });
  return numbers(report);
}

/**
 * A client-side navigation from one page to another, in a fresh context with the form's
 * throttling: from the address change to the frame where the new page's heading is shown with no
 * loading placeholder in view, and the bytes fetched until the network settles.
 */
async function navigation(from: string, to: string, title: string, form: Form) {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${debuggingPort}`);
  const context = await browser.newContext(contextOptions(form));
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  if (form === 'mobile') {
    await session.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: mobileThrottling.latency,
      downloadThroughput: mobileThrottling.downloadThroughput,
      uploadThroughput: mobileThrottling.uploadThroughput,
    });
    await session.send('Emulation.setCPUThrottlingRate', { rate: mobileThrottling.cpu });
  }
  let bytes = 0;
  let requests = 0;
  let counting = false;
  session.on('Network.loadingFinished', (event) => {
    if (!counting) return;
    bytes += event.encodedDataLength;
    requests++;
  });
  await page.goto(`${origin}${from}`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForFunction((selector) => !document.querySelector(selector), loadingSelector, {
    timeout: 60_000,
  });
  // The first page's lazy work, such as code highlighting after its figures, has finished.
  await page.waitForTimeout(1000);
  await page.waitForLoadState('networkidle');
  counting = true;
  const time = await page.evaluate(
    ({ to, title, selector }) =>
      new Promise<number>((done) => {
        const start = performance.now();
        history.pushState(null, '', to);
        dispatchEvent(new PopStateEvent('popstate'));
        const shown = () => {
          const heading = document.querySelector('main h1, h1');
          if (heading?.textContent?.trim() !== title) return false;
          return ![...document.querySelectorAll(selector)].some((element) => {
            const box = element.getBoundingClientRect();
            return box.bottom > 0 && box.top < innerHeight && box.width > 0;
          });
        };
        const frame = () => {
          if (shown()) requestAnimationFrame(() => done(performance.now() - start));
          // A page that never shows is no time at all, rather than a hang.
          else if (performance.now() - start > 60_000) done(NaN);
          else requestAnimationFrame(frame);
        };
        frame();
      }),
    { to, title, selector: loadingSelector },
  );
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  counting = false;
  await context.close();
  await browser.close();
  return { time, bytes, requests };
}

/**
 * The JavaScript and CSS a page loads cold and doesn't use by the time it settles, from Chromium's
 * coverage: bytes as served, before compression. Unthrottled, as throttling doesn't change it.
 */
async function coverage(path: string, form: Form) {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${debuggingPort}`);
  const context = await browser.newContext(contextOptions(form));
  const page = await context.newPage();
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  await page.coverage.startCSSCoverage({ resetOnNavigation: false });
  await page.goto(`${origin}${path}`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page
    .waitForFunction((selector) => !document.querySelector(selector), loadingSelector, {
      timeout: 30_000,
    })
    .catch(() => {});
  const scripts = await page.coverage.stopJSCoverage();
  const styles = await page.coverage.stopCSSCoverage();
  await context.close();
  await browser.close();
  let jsTotal = 0;
  let jsUnused = 0;
  for (const script of scripts) {
    if (!script.url.startsWith(origin) || !script.source) continue;
    jsTotal += script.source.length;
    // Block coverage: ranges never run have count 0; nested ones can overlap.
    const ranges = script.functions
      .flatMap((fn) => fn.ranges)
      .filter((range) => range.count === 0)
      .sort((a, b) => a.startOffset - b.startOffset);
    let end = 0;
    for (const range of ranges) {
      const start = Math.max(range.startOffset, end);
      if (range.endOffset > start) jsUnused += range.endOffset - start;
      end = Math.max(end, range.endOffset);
    }
  }
  let cssTotal = 0;
  let cssUsed = 0;
  for (const style of styles) {
    if (!style.text) continue;
    cssTotal += style.text.length;
    cssUsed += style.ranges.reduce((sum, range) => sum + range.end - range.start, 0);
  }
  return { jsTotal, jsUnused, cssTotal, cssUnused: cssTotal - cssUsed };
}

const fixed = (value: number, digits = 0) => (Number.isFinite(value) ? value.toFixed(digits) : '–');
const kb = (value: number) => fixed(value / 1024, 0);

type Navigation = { time: number; bytes: number; requests: number };
/** Every run's numbers, as the measurement goes and as .cache/site-perf/<label>.json keeps them. */
interface Measurement {
  label: string;
  runs: number;
  lighthouse: string;
  site: string;
  results: Record<string, Record<string, { cold: Numbers[]; warm: Numbers[] }>>;
  unused: Record<string, Awaited<ReturnType<typeof coverage>>>;
  navigations: Record<string, Navigation[]>;
}

/** The medians of a record, as Markdown tables. */
function report({ results, unused, navigations }: Measurement) {
  const medians = (list: Numbers[]) =>
    Object.fromEntries(
      Object.keys(list[0] ?? {}).map((key) => [
        key,
        median(list.map((item) => item[key as keyof Numbers])),
      ]),
    ) as Numbers;
  const lines = [
    '| Form | Page | Cache | LCP | FCP | TBT | CLS | SI | Total KB | JS KB | CSS KB | Font KB | Image KB | Other KB | Requests | Chain | JS exec | Long tasks | Main thread | Script | Style, layout | Paint | Other work |',
    '| --- | --- | --- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |',
  ];
  for (const [form, byPage] of Object.entries(results))
    for (const [name, states] of Object.entries(byPage))
      for (const [state, list] of Object.entries(states)) {
        if (!list.length) continue;
        const n = medians(list);
        lines.push(
          `| ${form} | ${pages[name]?.title ?? name} | ${state} | ${fixed(n.lcp)} | ${fixed(n.fcp)} | ${fixed(n.tbt)} | ${fixed(n.cls, 3)} | ${fixed(n.speedIndex)} | ${kb(n.totalBytes)} | ${kb(n.jsBytes)} | ${kb(n.cssBytes)} | ${kb(n.fontBytes)} | ${kb(n.imageBytes)} | ${kb(n.otherBytes)} | ${fixed(n.requests)} | ${fixed(n.chainDepth)} | ${fixed(n.jsExecution)} | ${fixed(n.longTasks)} | ${fixed(n.mainThread)} | ${fixed(n.scriptEvaluation + n.scriptParsing)} | ${fixed(n.styleLayout)} | ${fixed(n.paintCompositeRender)} | ${fixed(n.otherWork + n.garbageCollection + n.parseHTML)} |`,
        );
      }
  if (Object.keys(unused).length) {
    lines.push(
      '',
      '| Page | JS loaded KB | JS unused KB | CSS loaded KB | CSS unused KB |',
      '| --- | --: | --: | --: | --: |',
    );
    for (const [name, n] of Object.entries(unused))
      lines.push(
        `| ${pages[name]?.title ?? name} | ${kb(n.jsTotal)} | ${kb(n.jsUnused)} | ${kb(n.cssTotal)} | ${kb(n.cssUnused)} |`,
      );
  }
  if (Object.keys(navigations).length) {
    lines.push(
      '',
      '| Navigation, Button to Checkbox | Painted ms | KB fetched | Requests |',
      '| --- | --: | --: | --: |',
    );
    for (const [key, list] of Object.entries(navigations))
      lines.push(
        `| ${key} | ${fixed(median(list.map((item) => item.time)))} | ${kb(median(list.map((item) => item.bytes)))} | ${fixed(median(list.map((item) => item.requests)))} |`,
      );
  }
  return `${lines.join('\n')}\n\nTimes in ms; sizes transferred (compressed), coverage's as served.`;
}

/** Runs a step again once where it fails, such as a Lighthouse run that timed out; else NaN. */
async function retried<T>(step: () => Promise<T>, failed: T): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++)
    try {
      return await step();
    } catch (error) {
      process.stderr.write(`${String(error).slice(0, 300)}\n`);
    }
  return failed;
}

async function main() {
  const file = resolve(cache, `${label}.json`);
  const from = option('--report');
  if (from) {
    console.log(report(JSON.parse(await readFile(resolve(cache, `${from}.json`), 'utf8'))));
    return;
  }
  if (!args.includes('--no-build') && !option('--site')) await run(['npm', 'run', 'build:site']);
  const wrangler = startWrangler();
  const { server, spki } = await startProxy();
  const profile = join(tmpdir(), `envui-site-perf-profile-${process.pid}`);
  const chrome = spawn(
    chromium.executablePath(),
    [
      '--headless=new',
      `--remote-debugging-port=${debuggingPort}`,
      `--user-data-dir=${profile}`,
      `--ignore-certificate-errors-spki-list=${spki}`,
      // Chromium's own extensions' service workers break Playwright's connection over CDP.
      '--disable-extensions',
      '--disable-component-extensions-with-background-pages',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  const cleanUp = () => {
    stop(chrome);
    server.close();
    stop(wrangler);
  };
  process.once('SIGINT', () => {
    cleanUp();
    process.exit(130);
  });
  try {
    await waitFor(`http://127.0.0.1:${wranglerPort}/`);
    await waitFor(`http://127.0.0.1:${debuggingPort}/json/version`);
    if (args.includes('--serve')) {
      console.log(`Serving ${site} at ${origin}, Chromium's DevTools on port ${debuggingPort}.`);
      await new Promise(() => {});
    }
    const record: Measurement = {
      label,
      runs,
      lighthouse: lighthouseVersion,
      site,
      results: {},
      unused: {},
      navigations: {},
    };
    // Every run is kept as it ends, so a measurement that stops keeps what it measured.
    await mkdir(cache, { recursive: true });
    const save = () => writeFile(file, `${JSON.stringify(record, null, 2)}\n`);
    // A first load, not counted, so the server and the browser have started.
    await retried(() => coverage(pages[only[0]!]!.path, 'desktop'), undefined);
    const failed = numbers({ audits: {} });
    const nothing = Object.fromEntries(Object.keys(failed).map((key) => [key, NaN])) as Numbers;
    for (const form of chosenForms)
      for (const name of only) {
        const entry = { cold: [] as Numbers[], warm: [] as Numbers[] };
        (record.results[form] ??= {})[name] = entry;
        for (let index = 0; index < runs; index++) {
          const path = pages[name]!.path;
          entry.cold.push(await retried(() => lighthouse(path, form, false), nothing));
          entry.warm.push(await retried(() => lighthouse(path, form, true), nothing));
          await save();
          process.stderr.write(`${form} ${name} ${index + 1}/${runs}\n`);
        }
      }
    for (const name of only) {
      const unused = await retried(() => coverage(pages[name]!.path, 'desktop'), undefined);
      if (unused) record.unused[name] = unused;
    }
    await save();
    if (!args.includes('--no-navigation'))
      for (const form of chosenForms)
        for (const [key, start, to, title] of [
          ['catalogue', '/components/button', '/components/checkbox', 'Checkbox'],
          ['docs', '/docs/components/button', '/docs/components/checkbox', 'Checkbox'],
        ] as const) {
          const list = (record.navigations[`${form} ${key}`] = [] as Navigation[]);
          for (let index = 0; index < runs; index++)
            list.push(
              await retried(() => navigation(start, to, title, form), {
                time: NaN,
                bytes: NaN,
                requests: NaN,
              }),
            );
          await save();
          process.stderr.write(`${form} navigation ${key}\n`);
        }
    console.log(report(record));
    console.log(`Every run: ${file}`);
  } finally {
    cleanUp();
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

await main();
