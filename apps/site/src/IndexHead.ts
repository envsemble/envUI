import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { createFirstPaintStyle, headScript } from './display/HeadScripts.ts';
import { siteDescription } from './routes/SiteDescription.ts';

const tokensFile = fileURLToPath(
  new URL('../../../packages/ui/src/generated/Tokens.css', import.meta.url),
);

export function indexHeadPlugins(): Plugin[] {
  return [
    {
      name: 'envui-theme-bootstrap',
      transformIndexHtml: {
        order: 'pre',
        handler: (html) => {
          const charsetMeta = /<meta charset="utf-8"\s*\/?>/i;
          if (!charsetMeta.test(html))
            throw new Error('index.html needs <meta charset="UTF-8" />.');
          return html.replace(
            charsetMeta,
            (tag) =>
              `${tag}\n    <script>${headScript()}</script>
    <style>${createFirstPaintStyle(readFileSync(tokensFile, 'utf8'))}</style>`,
          );
        },
      },
    },
    {
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
