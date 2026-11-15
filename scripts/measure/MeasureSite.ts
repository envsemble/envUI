import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { X509Certificate, createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http';
import { createSecureServer } from 'node:http2';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';
import { median } from './Median.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

const lighthouseVersion = '13.6.0';
const cache = resolve(repositoryRoot, '.cache/site-perf');
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
const lighthouseMobileThrottling = {
  latency: 150 * 3.75,
  downloadThroughput: ((1.6 * 1024 * 1024) / 8) * 0.9,
  uploadThroughput: ((750 * 1024) / 8) * 0.9,
  cpu: 4,
};
const lighthouseScreenOptions = (form: Form) =>
  form === 'mobile'
    ? {
        viewport: { width: 412, height: 823 },
        deviceScaleFactor: 1.75,
        isMobile: true,
        hasTouch: true,
      }
    : { viewport: { width: 1350, height: 940 } };
const loadingSelector = '.site-loading, .catalogue-tile-loading, [data-site-pending]';

const noneInView = (selector: string) =>
  ![...document.querySelectorAll(selector)].some((element) => {
    const box = element.getBoundingClientRect();
    return box.bottom > 0 && box.top < innerHeight && box.width > 0;
  });

const { values: options } = parseArgs({
  options: {
    runs: { type: 'string', default: '3' },
    only: { type: 'string' },
    forms: { type: 'string' },
    label: { type: 'string' },
    site: { type: 'string' },
    report: { type: 'string' },
    'no-build': { type: 'boolean', default: false },
    'no-navigation': { type: 'boolean', default: false },
    serve: { type: 'boolean', default: false },
  },
});
const runs = Number(options.runs);
const only = (options.only ?? Object.keys(pages).join(',')).split(',');
for (const name of only)
  if (!Object.hasOwn(pages, name))
    throw new Error(`Unknown page ${name}: ${Object.keys(pages).join(', ')}.`);
const chosenForms = (options.forms ?? forms.join(',')).split(',') as Form[];
for (const form of chosenForms)
  if (!forms.includes(form)) throw new Error(`Unknown form ${form}: ${forms.join(', ')}.`);
const label = options.label ?? new Date().toISOString().replace(/[:.]/g, '-');
const site = resolve(repositoryRoot, options.site ?? 'dist/site');

const shellCommandLine = (parts: string[]) =>
  parts.map((part) => (/^[\w@./:=,+-]+$/.test(part) ? part : `"${part}"`)).join(' ');

function runWithoutBlockingTheProxy(parts: string[], quiet = false) {
  return new Promise<string>((done, fail) => {
    const child = spawn(shellCommandLine(parts), {
      cwd: repositoryRoot,
      stdio: quiet ? 'pipe' : 'inherit',
      shell: true,
    });
    let output = '';
    child.stdout?.on('data', (chunk: Buffer) => (output += chunk));
    child.stderr?.on('data', (chunk: Buffer) => (output += chunk));
    child.on('error', fail);
    child.on('exit', (code) =>
      code === 0 ? done(output) : fail(new Error(`${shellCommandLine(parts)} failed:\n${output}`)),
    );
  });
}

async function waitFor(url: string) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const answered = await fetch(url).then(
      (response) => response.ok,
      () => false,
    );
    if (answered) return;
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error(`${url} did not answer.`);
}

async function selfSignedCertificate() {
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

const brotliFirstAsCloudflareServes = (acceptEncoding: string | undefined) =>
  /\bbr\b/.test(String(acceptEncoding)) ? { 'accept-encoding': 'br, gzip' } : {};

async function startHttp2ProxyOverTls() {
  const { key, cert, spki } = await selfSignedCertificate();
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
          ...brotliFirstAsCloudflareServes(incoming.headers['accept-encoding']),
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
  const ownStateSoOtherPortsRunBeside = resolve(cache, `wrangler-${port}`);
  return spawn(
    shellCommandLine([
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
      '--persist-to',
      ownStateSoOtherPortsRunBeside,
    ]),
    { cwd: repositoryRoot, stdio: 'ignore', shell: true },
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
type Report = {
  audits: Record<string, Audit>;
  categories?: { performance?: { score?: number | null } };
};

interface Chain {
  children?: Record<string, Chain>;
}
const chainDepth = (chains: Record<string, Chain> | undefined): number =>
  chains ? Math.max(0, ...Object.values(chains).map((chain) => 1 + chainDepth(chain.children))) : 0;
const dependencyTree = (audit: Audit | undefined) => {
  const section = audit?.details?.items?.[0] as
    { value?: { chains?: Record<string, Chain> } } | undefined;
  return section?.value?.chains;
};

function lighthouseNumbers(report: Report) {
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
    score: (report.categories?.performance?.score ?? NaN) * 100,
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
type Numbers = ReturnType<typeof lighthouseNumbers>;

async function lighthouse(path: string, form: Form, warm: boolean): Promise<Numbers> {
  const output = join(tmpdir(), `envui-site-perf-${process.pid}.json`);
  await runWithoutBlockingTheProxy(
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
  return lighthouseNumbers(report);
}

const readerHoverBeforePress = 300;
const firstPageLazyWorkSettleTime = 1000;

async function navigation(from: string, form: Form, to?: string) {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${debuggingPort}`);
  const context = await browser.newContext(lighthouseScreenOptions(form));
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  if (form === 'mobile') {
    await session.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: lighthouseMobileThrottling.latency,
      downloadThroughput: lighthouseMobileThrottling.downloadThroughput,
      uploadThroughput: lighthouseMobileThrottling.uploadThroughput,
    });
    await session.send('Emulation.setCPUThrottlingRate', { rate: lighthouseMobileThrottling.cpu });
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
  await page.waitForFunction(noneInView, loadingSelector, { timeout: 60_000 });
  await page.waitForTimeout(firstPageLazyWorkSettleTime);
  await page.waitForLoadState('networkidle');
  const title = (await page.locator('h1').first().textContent())?.trim();
  const link = page.locator('.site-page-navigation a').last();
  if (!to) {
    await link.scrollIntoViewIfNeeded();
    await page.evaluate(() =>
      addEventListener(
        'pointerdown',
        () => ((window as { pressed?: number }).pressed ??= performance.now()),
        {
          capture: true,
        },
      ),
    );
  }
  counting = true;
  if (!to && form === 'desktop') {
    await link.hover();
    await page.waitForTimeout(readerHoverBeforePress);
    await link.click();
  } else if (!to) await link.tap();
  const time = await page.evaluate(
    ({ to, title, selector, inView }) =>
      new Promise<number>((done) => {
        let start = performance.now();
        if (to) {
          history.pushState(null, '', to);
          dispatchEvent(new PopStateEvent('popstate'));
        } else start = (window as { pressed?: number }).pressed ?? start;
        const noneInView = (0, eval)(inView) as (selector: string) => boolean;
        const neverShownTimeout = 60_000;
        const shown = () => {
          const ownHeadingNotSkeletons = document.querySelector(
            'main h1:not(.site-loading *), h1:not(.site-loading *)',
          );
          if (
            !ownHeadingNotSkeletons?.textContent?.trim() ||
            ownHeadingNotSkeletons.textContent.trim() === title
          )
            return false;
          return noneInView(selector);
        };
        const frame = () => {
          if (shown()) requestAnimationFrame(() => done(performance.now() - start));
          else if (performance.now() - start > neverShownTimeout) done(NaN);
          else requestAnimationFrame(frame);
        };
        frame();
      }),
    { to, title, selector: loadingSelector, inView: `(${noneInView})` },
  );
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  counting = false;
  await context.close();
  await browser.close();
  return { time, bytes, requests };
}

async function unthrottledColdLoadCoverage(path: string, form: Form) {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${debuggingPort}`);
  const context = await browser.newContext(lighthouseScreenOptions(form));
  const page = await context.newPage();
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  await page.coverage.startCSSCoverage({ resetOnNavigation: false });
  await page.goto(`${origin}${path}`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForFunction(noneInView, loadingSelector, { timeout: 30_000 }).catch(() => {});
  const scripts = await page.coverage.stopJSCoverage();
  const styles = await page.coverage.stopCSSCoverage();
  await context.close();
  await browser.close();
  let jsTotal = 0;
  let jsUnused = 0;
  for (const script of scripts) {
    if (!script.url.startsWith(origin) || !script.source) continue;
    jsTotal += script.source.length;
    const neverRunRanges = script.functions
      .flatMap((fn) => fn.ranges)
      .filter((range) => range.count === 0)
      .sort((a, b) => a.startOffset - b.startOffset);
    let end = 0;
    for (const range of neverRunRanges) {
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
interface Measurement {
  label: string;
  runs: number;
  lighthouse: string;
  site: string;
  results: Record<string, Record<string, { cold: Numbers[]; warm: Numbers[] }>>;
  unused: Record<string, Awaited<ReturnType<typeof unthrottledColdLoadCoverage>>>;
  navigations: Record<string, Navigation[]>;
}

function reportAsMarkdownTables({ results, unused, navigations }: Measurement) {
  const medians = (list: Numbers[]) =>
    Object.fromEntries(
      Object.keys(list[0] ?? {}).map((key) => [
        key,
        median(list.map((item) => item[key as keyof Numbers])),
      ]),
    ) as Numbers;
  const lines = [
    '| Form | Page | Cache | Score | LCP | FCP | TBT | CLS | SI | Total KB | JS KB | CSS KB | Font KB | Image KB | Other KB | Requests | Chain | JS exec | Long tasks | Main thread | Script | Style, layout | Paint | Other work |',
    '| --- | --- | --- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |',
  ];
  for (const [form, byPage] of Object.entries(results))
    for (const [name, states] of Object.entries(byPage))
      for (const [state, list] of Object.entries(states)) {
        if (!list.length) continue;
        const n = medians(list);
        lines.push(
          `| ${form} | ${pages[name]?.title ?? name} | ${state} | ${fixed(n.score)} | ${fixed(n.lcp)} | ${fixed(n.fcp)} | ${fixed(n.tbt)} | ${fixed(n.cls, 3)} | ${fixed(n.speedIndex)} | ${kb(n.totalBytes)} | ${kb(n.jsBytes)} | ${kb(n.cssBytes)} | ${kb(n.fontBytes)} | ${kb(n.imageBytes)} | ${kb(n.otherBytes)} | ${fixed(n.requests)} | ${fixed(n.chainDepth)} | ${fixed(n.jsExecution)} | ${fixed(n.longTasks)} | ${fixed(n.mainThread)} | ${fixed(n.scriptEvaluation + n.scriptParsing)} | ${fixed(n.styleLayout)} | ${fixed(n.paintCompositeRender)} | ${fixed(n.otherWork + n.garbageCollection + n.parseHTML)} |`,
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
      '| Navigation from Button: by its Next link, or the address to Checkbox | Painted ms | KB fetched | Requests |',
      '| --- | --: | --: | --: |',
    );
    for (const [key, list] of Object.entries(navigations))
      lines.push(
        `| ${key} | ${fixed(median(list.map((item) => item.time)))} | ${kb(median(list.map((item) => item.bytes)))} | ${fixed(median(list.map((item) => item.requests)))} |`,
      );
  }
  return `${lines.join('\n')}\n\nTimes in ms; sizes transferred (compressed), coverage's as served.`;
}

async function retriedOnce<T>(step: () => Promise<T>, failed: T): Promise<T> {
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
  const from = options.report;
  if (from) {
    console.log(
      reportAsMarkdownTables(JSON.parse(await readFile(resolve(cache, `${from}.json`), 'utf8'))),
    );
    return;
  }
  if (!options['no-build'] && !options.site)
    await runWithoutBlockingTheProxy(['npm', 'run', 'build:site']);
  const wrangler = startWrangler();
  const { server, spki } = await startHttp2ProxyOverTls();
  const extensionsOffSoPlaywrightKeepsItsCdpConnection = [
    '--disable-extensions',
    '--disable-component-extensions-with-background-pages',
  ];
  const profile = join(tmpdir(), `envui-site-perf-profile-${process.pid}`);
  const chrome = spawn(
    chromium.executablePath(),
    [
      '--headless=new',
      `--remote-debugging-port=${debuggingPort}`,
      `--user-data-dir=${profile}`,
      `--ignore-certificate-errors-spki-list=${spki}`,
      ...extensionsOffSoPlaywrightKeepsItsCdpConnection,
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
    if (options.serve) {
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
    await mkdir(cache, { recursive: true });
    const save = () => writeFile(file, `${JSON.stringify(record, null, 2)}\n`);
    const uncountedWarmUpLoad = () => unthrottledColdLoadCoverage(pages[only[0]].path, 'desktop');
    await retriedOnce(uncountedWarmUpLoad, undefined);
    const failed = lighthouseNumbers({ audits: {} });
    const nothing = Object.fromEntries(Object.keys(failed).map((key) => [key, NaN])) as Numbers;
    for (const form of chosenForms)
      for (const name of only) {
        const entry = { cold: [] as Numbers[], warm: [] as Numbers[] };
        (record.results[form] ??= {})[name] = entry;
        for (let index = 0; index < runs; index++) {
          const path = pages[name].path;
          entry.cold.push(await retriedOnce(() => lighthouse(path, form, false), nothing));
          entry.warm.push(await retriedOnce(() => lighthouse(path, form, true), nothing));
          await save();
          process.stderr.write(`${form} ${name} ${index + 1}/${runs}\n`);
        }
      }
    for (const name of only) {
      const unused = await retriedOnce(
        () => unthrottledColdLoadCoverage(pages[name].path, 'desktop'),
        undefined,
      );
      if (unused) record.unused[name] = unused;
    }
    await save();
    if (!options['no-navigation'])
      for (const form of chosenForms)
        for (const [key, start, to] of [
          ['catalogue link', '/components/button', undefined],
          ['docs link', '/docs/components/button', undefined],
          ['catalogue address', '/components/button', '/components/checkbox'],
          ['docs address', '/docs/components/button', '/docs/components/checkbox'],
        ] as const) {
          const list = (record.navigations[`${form} ${key}`] = [] as Navigation[]);
          for (let index = 0; index < runs; index++)
            list.push(
              await retriedOnce(() => navigation(start, form, to), {
                time: NaN,
                bytes: NaN,
                requests: NaN,
              }),
            );
          await save();
          process.stderr.write(`${form} navigation ${key}\n`);
        }
    console.log(reportAsMarkdownTables(record));
    console.log(`Every run: ${file}`);
  } finally {
    cleanUp();
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

await main();
