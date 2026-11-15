import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { repositoryRoot } from '../RepositoryPaths.ts';
import type { PagePreloads } from './PagePreloads.ts';
import { siteOrigin } from './SiteAgentFiles.ts';

const siteApp = resolve(repositoryRoot, 'apps/site');

interface SitePage {
  route: string;
  address: string;
  document?: string;
  view: string;
  modules: string[];
}

export interface SiteServer {
  sitePages: SitePage[];
  renderPage: (route: string) => Promise<RenderedPage>;
  renderNotFound: () => Promise<RenderedPage>;
  oldAddresses: { from: string; to: string }[];
}

interface RenderedPage {
  title: string;
  description: string;
  html: string;
  code?: string;
  markdown?: string;
}

type Load = ['modulepreload' | 'script', string];

export async function buildSiteServer(serverDirectory: string) {
  await build({
    root: siteApp,
    configFile: resolve(siteApp, 'vite.config.ts'),
    logLevel: 'warn',
    build: {
      ssr: 'src/Server.tsx',
      outDir: serverDirectory,
      emptyOutDir: true,
      manifest: false,
      copyPublicDir: false,
      minify: false,
      rolldownOptions: { output: { codeSplitting: false } },
    },
    ssr: { noExternal: true, resolve: { conditions: ['envui-source', 'module', 'node'] } },
  });
}

export const loadSiteServer = async (serverDirectory: string): Promise<SiteServer> =>
  import(`${pathToFileURL(resolve(serverDirectory, 'Server.js')).href}?built=${Date.now()}`);

const escapeText = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttribute = (text: string) => escapeText(text).replace(/"/g, '&quot;');

function pageFiles({ address, document, view, modules }: SitePage, preloads: PagePreloads) {
  const moduleFiles = modules.map((module) => {
    const files = preloads.modules[module];
    if (!files) throw new Error(`No files of ${module}, which ${address} loads`);
    return files;
  });
  const scripts = new Set(moduleFiles.flatMap((files) => files.scripts));
  const styles = new Set(moduleFiles.flatMap((files) => files.styles));
  const content = document === undefined ? undefined : preloads.contents[document];
  if (document !== undefined && !content) throw new Error(`No file of the content of ${document}`);
  const figureStyles = (view === 'catalogue' && document && preloads.figureStyles[document]) || [];
  const loads: Load[] = [
    ...[...scripts].map((file): Load => ['modulepreload', `/${file}`]),
    ...(content ? [['modulepreload', `/${content}`] satisfies Load] : []),
  ];
  return { styles: [...new Set([...styles, ...figureStyles])].map((file) => `/${file}`), loads };
}

function siteLoader(loads: Load[]) {
  const add = [
    'var t;',
    "if(e[0]==='script'){t=document.createElement('script');t.type='module';t.src=e[1]}",
    "else{t=document.createElement('link');t.href=e[1];t.rel='modulepreload'}",
    "t.crossOrigin='';document.head.appendChild(t)",
  ].join('');
  return `<script>${JSON.stringify(loads)}.forEach(function(e){${add}})</script>`;
}

function addressCheck(address: string | undefined) {
  const path = address && JSON.stringify(decodeURI(address).replace(/\/+$/, ''));
  const check = [
    'var p=location.pathname;',
    'try{p=decodeURI(p)}catch(e){}',
    path === undefined
      ? ''
      : `if(p.replace(/\\/+$/,'')!==${path}||location.hash.indexOf('#/')===0||/[?&](?:document|skill|section)(?:[=&]|$)/.test(location.search))`,
    "document.documentElement.setAttribute('data-site-unrendered','')",
  ].join('');
  return [
    `<script>(function(){${check}})();</script>`,
    '<style>html[data-site-unrendered] #root{display:none}</style>',
  ];
}

function pageDocument(
  template: string,
  page: SitePage | undefined,
  files: ReturnType<typeof pageFiles>,
  rendered: RenderedPage,
) {
  let html = template;
  const replace = (pattern: RegExp, replacement: (found: string, file: string) => string) => {
    if (!pattern.test(html))
      throw new Error(`index.html has no ${pattern}, which a page replaces.`);
    html = html.replace(pattern, replacement);
  };
  const loads: Load[] = [];
  replace(/\s*<link rel="modulepreload" crossorigin href="([^"]+)">/g, (_, href) => {
    loads.push(['modulepreload', href]);
    return '';
  });
  loads.push(...files.loads);
  replace(/\s*<script type="module" crossorigin src="([^"]+)"><\/script>/, (_, src) => {
    loads.push(['script', src]);
    return '';
  });
  replace(/<title>[^<]*<\/title>/, () => `<title>${escapeText(rendered.title)}</title>`);
  replace(
    /<meta name="description" content="[^"]*">/,
    () => `<meta name="description" content="${escapeAttribute(rendered.description)}">`,
  );
  replace(/<\/style>/, () => `</style>\n    ${addressCheck(page?.address).join('\n    ')}`);
  const styles = files.styles.map(
    (href) => `\n    <link rel="stylesheet" crossorigin href="${href}">`,
  );
  const canonical = page
    ? `\n    <link rel="canonical" href="${escapeAttribute(siteOrigin + page.address)}">`
    : '';
  replace(/\s*<\/head>/, () => `${styles.join('')}${canonical}\n  </head>`);
  const named = page ? ` data-site-page="${escapeAttribute(page.route)}"` : '';
  const root = `<div id="root"${named}>${rendered.html}</div>`;
  const data = [rendered.code, rendered.markdown].map((element) =>
    element ? `\n    ${element}` : '',
  );
  replace(/<div id="root"><\/div>/, () => `${root}${data.join('')}\n    ${siteLoader(loads)}`);
  return html;
}

export const redirectsFile = (redirects: SiteServer['oldAddresses']) =>
  redirects.map(({ from, to }) => `${encodeURI(from)} ${to} 301\n`).join('');

export const pageFile = (address: string) =>
  address === '/' ? 'index.html' : `${decodeURI(address).slice(1)}.html`;

export async function prerenderSite(siteDirectory: string, serverDirectory: string) {
  await buildSiteServer(serverDirectory);
  const server = await loadSiteServer(serverDirectory);
  const kept = resolve(siteDirectory, '.vite/index.html');
  let template = await readFile(resolve(siteDirectory, 'index.html'), 'utf8');
  if (!template.includes('data-site-page=')) await writeFile(kept, template);
  else if (existsSync(kept)) template = await readFile(kept, 'utf8');
  else
    throw new Error(
      `${siteDirectory} is pre-rendered already: build the site again with npm run build:site.`,
    );
  const preloads: PagePreloads = JSON.parse(
    await readFile(resolve(siteDirectory, '.vite/page-preloads.json'), 'utf8'),
  );
  for (const page of server.sitePages) {
    const rendered = await server.renderPage(page.route);
    const files = pageFiles(page, preloads);
    for (const linked of [...files.styles, ...files.loads.map(([, href]) => href)])
      if (!existsSync(resolve(siteDirectory, `.${linked}`)))
        throw new Error(`${page.address} links ${linked}, which the build doesn't have.`);
    const file = resolve(siteDirectory, pageFile(page.address));
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, pageDocument(template, page, files, rendered));
  }
  const notFound = await server.renderNotFound();
  await writeFile(
    resolve(siteDirectory, '404.html'),
    pageDocument(template, undefined, { styles: [], loads: [] }, notFound),
  );
  await writeFile(resolve(siteDirectory, '_redirects'), redirectsFile(server.oldAddresses));
  return server.sitePages.length;
}

if (import.meta.main) {
  if (process.argv.length > 2) throw new Error('Usage: PrerenderSite.ts');
  const started = performance.now();
  const count = await prerenderSite(
    resolve(repositoryRoot, 'dist/site'),
    resolve(repositoryRoot, 'dist/site-server'),
  );
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  console.log(`Pre-rendered ${count} pages into dist/site in ${seconds} s.`);
}
