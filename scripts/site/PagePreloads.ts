// What each pre-rendered page loads beside the site's script rather than once that has arrived and
// run, as the client's build finds it: the files the module of its kind's view imports, and those
// of the parts of it that load on their own and that the server renders (pages/PageLoading.ts), the
// file of its content (generated/pages/<id>.json), and on a catalogue page the style sheets of its
// figures (examples/<id>/, specimens/<id>/ and what they import), which apply with its first paint.
// The build writes them to dist/site/.vite/page-preloads.json, from which PrerenderSite.ts links
// each pre-rendered page's files in its head.
import { relative } from 'node:path';
import type { Plugin } from 'vite';

/** The files a module brings: its scripts and their style sheets, but those the site starts with. */
interface ModuleFiles {
  scripts: string[];
  styles: string[];
}

/** What each page loads, as the client's build found it (pagePreloadsPlugin). */
export interface PagePreloads {
  /** The files of each module the site's start loads on its own, by its path in the site app. */
  modules: Record<string, ModuleFiles>;
  /** The file of each page's content, by the page's id. */
  contents: Record<string, string>;
  /** The style sheets of each catalogue page's figures, by the page's id. */
  figureStyles: Record<string, string[]>;
}

/** The plugin that writes .vite/page-preloads.json as the client's build ends. */
export function pagePreloadsPlugin(): Plugin {
  return {
    name: 'envui-page-preloads',
    apply: 'build',
    generateBundle: {
      // After Vite drops the chunks that held only style sheets, which pages import as sheets.
      order: 'post',
      handler(_options, bundle) {
        // The server's build renders the pages, and loads nothing.
        if (this.environment.config.consumer !== 'client') return;
        const chunks = Object.values(bundle).filter((file) => file.type === 'chunk');
        const contents: PagePreloads['contents'] = {};
        for (const file of chunks) {
          const page = /[\\/]generated[\\/]pages[\\/]([\w-]+)\.json$/.exec(
            file.facadeModuleId ?? '',
          )?.[1];
          if (page) contents[page] = file.fileName;
        }
        const byName = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
        // What the site's script loads itself, which the views' files leave out.
        const started = new Set<string>();
        const imported = (name: string, into: Set<string>) => {
          if (into.has(name)) return;
          into.add(name);
          for (const next of byName.get(name)?.imports ?? []) imported(next, into);
        };
        for (const chunk of chunks) if (chunk.isEntry) imported(chunk.fileName, started);
        // The files of each module the site's start loads on its own, by its path in the site
        // app, such as src/pages/docs/DocsPages.tsx: a view's or a part's, and what it imports,
        // but the start's.
        const modules: PagePreloads['modules'] = {};
        for (const name of started)
          for (const lazy of byName.get(name)?.dynamicImports ?? []) {
            const module = byName.get(lazy)?.facadeModuleId;
            if (!module || !/\.tsx?$/.test(module)) continue;
            const scripts = new Set<string>();
            imported(lazy, scripts);
            const files = [...scripts].filter((file) => !started.has(file));
            const styles = files.flatMap((file) => [
              ...(byName.get(file)?.viteMetadata?.importedCss ?? []),
            ]);
            modules[relative(this.environment.config.root, module).replaceAll('\\', '/')] = {
              scripts: files,
              styles: [...new Set(styles)],
            };
          }
        // The style sheets the site starts with, which a page's figures' sheets leave out.
        const startedStyles = new Set(
          [...started].flatMap((name) => [...(byName.get(name)?.viteMetadata?.importedCss ?? [])]),
        );
        const figureStyles: PagePreloads['figureStyles'] = {};
        for (const chunk of chunks) {
          const page = /[\\/]src[\\/](?:examples|specimens)[\\/]([\w-]+)[\\/]/.exec(
            chunk.facadeModuleId ?? '',
          )?.[1];
          if (!page || !contents[page]) continue;
          const files = new Set<string>();
          imported(chunk.fileName, files);
          // With the modules of the options its components set, which load as they render,
          // such as a table's column resizing.
          for (const name of [...files])
            for (const option of byName.get(name)?.dynamicImports ?? [])
              if (/[\\/]packages[\\/]ui[\\/]/.test(byName.get(option)?.facadeModuleId ?? ''))
                imported(option, files);
          const styles = new Set(figureStyles[page]);
          for (const name of files)
            for (const style of byName.get(name)?.viteMetadata?.importedCss ?? [])
              if (!startedStyles.has(style)) styles.add(style);
          figureStyles[page] = [...styles].sort();
        }
        const preloads: PagePreloads = { modules, contents, figureStyles };
        this.emitFile({
          type: 'asset',
          fileName: '.vite/page-preloads.json',
          source: JSON.stringify(preloads),
        });
      },
    },
  };
}
