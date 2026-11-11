// Pre-renders every page of the site into the build that `vite build` left in dist/site, so a page
// paints its shell, banner and text from its HTML rather than once the site's script has run. It
// builds the site's server entry (apps/site/src/Server.tsx) into dist/site-server, renders each page
// the site serves with it, and writes dist/site/<route>.html, the home page as index.html, each
// with the head of the client's index.html: its theme bootstrap, the page's title and description,
// its view's, parts' and figures' style sheets, applied before the first paint, and its canonical
// address. The site's script, its view's and parts' modules and its content
// (.vite/page-preloads.json) load once the style sheets have, as a script at the end of the body
// adds them. The host serves /<route> from <route>.html, redirects the old addresses _redirects
// lists, and answers any other address with 404.html, Page not found, with a 404 status
// (wrangler.jsonc), which its head hides until the site renders that address on the client, the
// page an old address leads to or Page not found (main.tsx). It needs no network.
//
//   node scripts/site/PrerenderSite.ts
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { repositoryRoot } from '../RepositoryPaths.ts';
import type { PagePreloads } from './PagePreloads.ts';
import { siteOrigin } from './SiteAgentFiles.ts';

const siteApp = resolve(repositoryRoot, 'apps/site');

/** A page the site serves, as the server entry lists it (Server.tsx). */
interface SitePage {
  /** Its route, such as components/button; the home page's is overview. */
  route: string;
  /** Its address, such as /components/button; the home page's is /. */
  address: string;
  /** The id of the page of docs/ it shows, whose content it loads. */
  document?: string;
  /** The name of the module of its kind's view (pages/PageLoading.ts), such as catalogue. */
  view: string;
  /**
   * The paths in the site app of the modules it loads before it hydrates: its view's and those of
   * the parts of it that load on their own and that it renders, such as src/pages/docs/Changelog.tsx.
   */
  modules: string[];
}

/** The server entry's build: its module, which renders the site's pages. */
export interface SiteServer {
  sitePages: SitePage[];
  renderPage: (route: string) => Promise<RenderedPage>;
  /** Page not found, which the host answers an address with no page with. */
  renderNotFound: () => Promise<RenderedPage>;
  /** The old addresses the host redirects, each with the address of the page it leads to. */
  oldAddresses: { from: string; to: string }[];
}

/**
 * A page pre-rendered: its tab's title and description, the HTML of the site's root, its code and
 * its Markdown.
 */
interface RenderedPage {
  title: string;
  description: string;
  html: string;
  /** The element that carries the tokens of its code, highlighted as it rendered (PageCode.ts). */
  code?: string;
  /** The element that carries the trees of its Markdown, parsed as it rendered (PageMarkdownTrees.ts). */
  markdown?: string;
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
    // The server resolves the library from its source too: Vite gives the site's resolve.conditions
    // to the browser's build only, and without envui-source here the package's name would bring in
    // packages/ui/dist beside the source the site's internal imports reach, two copies of every
    // context, and the server would render whatever the last library build was.
    ssr: { noExternal: true, resolve: { conditions: ['envui-source', 'module', 'node'] } },
  });
}

/** The server entry's module in `serverDirectory`, as built last. */
export const loadSiteServer = async (serverDirectory: string): Promise<SiteServer> =>
  import(`${pathToFileURL(resolve(serverDirectory, 'Server.js')).href}?built=${Date.now()}`);

const escapeText = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttribute = (text: string) => escapeText(text).replace(/"/g, '&quot;');

/**
 * The files of a page's view, parts and content: the style sheets of its view and parts, which its
 * head links, as its text is there to paint, and a catalogue page's figures' sheets after them, in
 * the order each figure's module would bring them; and what the page loads once they have, its
 * view's and parts' modules and its content. A figure's sheets apply with the page's first paint:
 * each figure's module would otherwise bring its sheets as it loads, after the page has painted,
 * and a sheet applied then lays out the whole page again, a long pause on a phone. They are small
 * beside the view's.
 */
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
  // A sheet the view or a part shares is linked once, with theirs.
  return { styles: [...new Set([...styles, ...figureStyles])].map((file) => `/${file}`), loads };
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
 * address with no page with 404.html, whose address is never its page's (no `address`), and an old
 * address, such as an old hash address at the root or one whose query names a document, a skill or a section (routes/OldAddresses.ts), may
 * lead to another page than its file's or another place on it. main.tsx then renders the address's
 * page on the client and shows the root again. Any other query, such as `scale` or a campaign's
 * `utm_source`, leaves the page as it is.
 */
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

/**
 * The client's index.html with a page's head, its rendered root and its loader; without a page,
 * Page not found's, which the browser renders on its own rather than hydrating (main.tsx).
 */
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
  replace(/<\/style>/, () => `</style>\n    ${addressCheck(page?.address).join('\n    ')}`);
  // After the site's own style sheet, whose cascade layers their sheets build on.
  const styles = files.styles.map(
    (href) => `\n    <link rel="stylesheet" crossorigin href="${href}">`,
  );
  // The page's one address, for search engines and link previews, whichever address served it.
  const canonical = page
    ? `\n    <link rel="canonical" href="${escapeAttribute(siteOrigin + page.address)}">`
    : '';
  replace(/\s*<\/head>/, () => `${styles.join('')}${canonical}\n  </head>`);
  const named = page ? ` data-site-page="${escapeAttribute(page.route)}"` : '';
  const root = `<div id="root"${named}>${rendered.html}</div>`;
  // The tokens of its code and the trees of its Markdown, which the site gives before it hydrates,
  // ahead of the script that starts it.
  const data = [rendered.code, rendered.markdown].map((element) =>
    element ? `\n    ${element}` : '',
  );
  replace(/<div id="root"><\/div>/, () => `${root}${data.join('')}\n    ${siteLoader(loads)}`);
  return html;
}

/**
 * The host's redirects of old addresses (_redirects), permanent, each to the page it leads to. An
 * old address it doesn't list, such as an old view of a page, gets 404.html, in which the browser
 * renders the page it leads to.
 */
export const redirectsFile = (redirects: SiteServer['oldAddresses']) =>
  redirects.map(({ from, to }) => `${encodeURI(from)} ${to} 301\n`).join('');

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
