// What the site's index.html carries in its head, which every page starts from, the pre-rendered
// ones included (scripts/site/PrerenderSite.ts): the script and style that apply the stored display
// settings before the first paint, the site's description, and in a build, the preload of the
// text's font. The site's Vite config runs these plugins in Node, before anything is built.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { createFirstPaintStyle, headScript } from './display/HeadScripts.ts';
import { siteDescription } from './routes/SiteDescription.ts';

/** envUI's tokens, whose page backgrounds the first paint's style takes. */
const tokensFile = fileURLToPath(
  new URL('../../../packages/ui/src/generated/Tokens.css', import.meta.url),
);

/** The plugins that write index.html's head, in their order in the site's Vite config. */
export function indexHeadPlugins(): Plugin[] {
  return [
    {
      // The stored display settings apply before the catalogue loads (headScript), and the page's
      // background, in its theme, paints from the first frame (createFirstPaintStyle).
      name: 'envui-theme-bootstrap',
      // The script goes right after <meta charset>, which has to stay within the first 1024
      // bytes, and before the styles, so it runs before the first paint.
      transformIndexHtml: {
        order: 'pre',
        handler: (html) => {
          const meta = /<meta charset="utf-8"\s*\/?>/i;
          if (!meta.test(html)) throw new Error('index.html needs <meta charset="UTF-8" />.');
          return html.replace(
            meta,
            (tag) =>
              `${tag}\n    <script>${headScript()}</script>
    <style>${createFirstPaintStyle(readFileSync(tokensFile, 'utf8'))}</style>`,
          );
        },
      },
    },
    {
      // What the site is, in the head: the sentence the site gives a page without a summary
      // (routes/SiteDescription.ts). A pre-rendered page carries its own (PrerenderSite.ts).
      name: 'envui-description',
      transformIndexHtml: () => [
        {
          tag: 'meta',
          attrs: { name: 'description', content: siteDescription },
          injectTo: 'head',
        },
      ],
    },
    {
      // The text's font loads with the page rather than once the style sheets that name it have
      // arrived, so the text shows in it from the first paint more often.
      name: 'envui-font-preload',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler: (_html, { bundle }) =>
          Object.values(bundle ?? {})
            .filter((file) => file.type === 'asset' && file.fileName.endsWith('.woff2'))
            .map((font) => ({
              tag: 'link',
              attrs: {
                rel: 'preload',
                href: `/${font.fileName}`,
                as: 'font',
                type: 'font/woff2',
                crossorigin: '',
              },
              injectTo: 'head' as const,
            })),
      },
    },
  ];
}
