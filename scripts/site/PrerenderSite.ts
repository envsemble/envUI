// Pre-renders every page of the site into the build that `vite build` left in dist/site, so a page
// paints its shell, banner and text from its HTML rather than once the site's script has run. It
// builds the site's server entry (apps/site/src/Server.tsx) into dist/site-server, renders each page
// the site serves with it, and writes dist/site/<route>.html, the home page as index.html, each
// with the head of the client's index.html: its theme bootstrap, the page's title and description,
// and its view's and its figures' style sheets, applied before the first paint. The site's script,
// its view's modules and its content (.vite/page-preloads.json) load once the style sheets have, as
// a script at the end of the body adds them. The host serves /<route> from <route>.html, and answers an
// address with no page with index.html (wrangler.jsonc), which its head hides until the site
// renders that address on the client (main.tsx). It needs no network.
//
//   node scripts/site/PrerenderSite.ts
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { repositoryRoot } from '../RepositoryPaths.ts';

const siteApp = resolve(repositoryRoot, 'apps/site');

/** A page the site serves, as the server entry lists it (Server.tsx). */
interface SitePage {
  /** Its route, such as components/button; the home page's is overview. */
  route: string;
  /** Its address, such as /components/button; the home page's is /. */
  address: string;
  /** The id of the page of docs/ it shows, whose content it loads. */
  document?: string;
  /** The module of its kind's view (pages/ViewModules.ts), such as catalogue. */
  view: string;
}

/** The server entry's build: its module, which renders the site's pages. */
export interface SiteServer {
  sitePages: SitePage[];
  renderPage: (route: string) => Promise<{ title: string; description: string; html: string }>;
}

/** What each page loads, as the client's build found it (envui-content-preload in vite.config.ts). */
interface PagePreloads {
  views: Record<string, { scripts: string[]; styles: string[] }>;
  contents: Record<string, string>;
  figureStyles: Record<string, string[]>;
}

/** A file the page loads once its style sheets have, in the order the loader adds them. */
type Load = ['modulepreload' | 'script', string];

/**
 * Builds the site's server entry into `serverDirectory`, for production, with every module
 * bundled: the library from its source, as the site imports it, and the style sheets left out.
 */
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
      // The client's chunks, which carry a page's parts to the browser, don't matter here.
      rolldownOptions: { output: { codeSplitting: false } },
    },
    ssr: { noExternal: true },
  });
}

/** The server entry's module in `serverDirectory`, as built last. */
export const loadSiteServer = async (serverDirectory: string): Promise<SiteServer> =>
  import(`${pathToFileURL(resolve(serverDirectory, 'Server.js')).href}?built=${Date.now()}`);

const escapeText = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttribute = (text: string) => escapeText(text).replace(/"/g, '&quot;');

/**
 * The files of a page's view and content: the view's style sheets, which its head links, as its
 * text is there to paint, and a catalogue page's figures' sheets after them, in the order each
 * figure's module would bring them; and what the page loads once they have, its view's modules
 * and its content. A figure's sheets apply with the page's first paint: each figure's module
 * would otherwise bring its sheets as it loads, after the page has painted, and a sheet applied
 * then lays out the whole page again, a long pause on a phone. They are small beside the view's.
 */
function pageFiles({ address, document, view: kind }: SitePage, preloads: PagePreloads) {
  const view = preloads.views[kind];
  if (!view) throw new Error(`No files of the view ${kind}, which ${address} shows`);
  const content = document === undefined ? undefined : preloads.contents[document];
  if (document !== undefined && !content) throw new Error(`No file of the content of ${document}`);
  const figureStyles = (kind === 'catalogue' && document && preloads.figureStyles[document]) || [];
  const loads: Load[] = [
    ...view.scripts.map((file): Load => ['modulepreload', `/${file}`]),
    ...(content ? [['modulepreload', `/${content}`] satisfies Load] : []),
  ];
  // A sheet the view shares is linked once, with the view's.
  const styles = [...new Set([...view.styles, ...figureStyles])];
  return { styles: styles.map((file) => `/${file}`), loads };
}

/**
 * The script at the end of a page's body that adds what the page doesn't need to paint: the
 * site's script and the modules it starts with. It runs once the style sheets before it have
 * loaded, so they, the font and the page's text come first, rather than sharing a slow connection
 * with the scripts.
 */
function siteLoader(loads: Load[]) {
  const add = [
    'var t;',
    "if(e[0]==='script'){t=document.createElement('script');t.type='module';t.src=e[1]}",
    "else{t=document.createElement('link');t.href=e[1];t.rel='modulepreload'}",
    "t.crossOrigin='';document.head.appendChild(t)",
  ].join('');
  return `<script>${JSON.stringify(loads)}.forEach(function(e){${add}})</script>`;
}

/**
 * The head's script that hides the root where the address is not its page's: the host answers an
 * address with no page with index.html, the home page's, and an old address, such as an old hash
 * address or one that names a document in its query, may lead to another page than its file's.
 * main.tsx then renders the address's page on the client and shows the root again. A query of
 * `scale` alone is the page's own.
 */
function addressCheck(address: string) {
  const path = JSON.stringify(decodeURI(address).replace(/\/+$/, ''));
  const check = [
    'var p=location.pathname;',
    'try{p=decodeURI(p)}catch(e){}',
    `if(p.replace(/\\/+$/,'')!==${path}||location.hash.indexOf('#/')===0||/[?&](?!scale=)[^&]/.test(location.search))`,
    "document.documentElement.setAttribute('data-site-unrendered','')",
  ].join('');
  return [
    `<script>(function(){${check}})();</script>`,
    '<style>html[data-site-unrendered] #root{display:none}</style>',
  ];
}

/** The client's index.html with a page's head, its rendered root and its loader. */
function pageDocument(
  template: string,
  page: SitePage,
  files: ReturnType<typeof pageFiles>,
  rendered: { title: string; description: string; html: string },
) {
  let html = template;
  const replace = (pattern: RegExp, replacement: (found: string, file: string) => string) => {
    if (!pattern.test(html))
      throw new Error(`index.html has no ${pattern}, which a page replaces.`);
    html = html.replace(pattern, replacement);
  };
  // The site's script and the modules Vite links for it load with the page's own (siteLoader).
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
  // After the theme bootstrap and the first paint's style, which open the head.
  replace(/<\/style>/, () => `</style>\n    ${addressCheck(page.address).join('\n    ')}`);
  // After the site's own style sheet, whose cascade layers their sheets build on.
  const styles = files.styles.map(
    (href) => `\n    <link rel="stylesheet" crossorigin href="${href}">`,
  );
  replace(/\s*<\/head>/, () => `${styles.join('')}\n  </head>`);
  const root = `<div id="root" data-site-page="${escapeAttribute(page.route)}">${rendered.html}</div>`;
  replace(/<div id="root"><\/div>/, () => `${root}\n    ${siteLoader(loads)}`);
  return html;
}

/** The file a page's address is served from: index.html for the home page's, /. */
export const pageFile = (address: string) =>
  address === '/' ? 'index.html' : `${decodeURI(address).slice(1)}.html`;

/**
 * Pre-renders every page of the client's build in `siteDirectory` with the server entry built
 * into `serverDirectory`, writing each beside index.html. Resolves to the number of pages.
 */
export async function prerenderSite(siteDirectory: string, serverDirectory: string) {
  await buildSiteServer(serverDirectory);
  const server = await loadSiteServer(serverDirectory);
  // The client's index.html, kept beside Vite's manifest for a build that is pre-rendered again,
  // as a watched one is when a rebuild leaves index.html as it was.
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
    // A file the build left out, such as a chunk that held only style sheets, would not be found.
    for (const linked of [...files.styles, ...files.loads.map(([, href]) => href)])
      if (!existsSync(resolve(siteDirectory, `.${linked}`)))
        throw new Error(`${page.address} links ${linked}, which the build doesn't have.`);
    const file = resolve(siteDirectory, pageFile(page.address));
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, pageDocument(template, page, files, rendered));
  }
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
