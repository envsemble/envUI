import { relative } from 'node:path';
import type { Plugin } from 'vite';

interface ModuleFiles {
  scripts: string[];
  styles: string[];
}

export interface PagePreloads {
  modules: Record<string, ModuleFiles>;
  contents: Record<string, string>;
  figureStyles: Record<string, string[]>;
}

export function pagePreloadsPlugin(): Plugin {
  return {
    name: 'envui-page-preloads',
    apply: 'build',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
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
        const started = new Set<string>();
        const imported = (name: string, into: Set<string>) => {
          if (into.has(name)) return;
          into.add(name);
          for (const next of byName.get(name)?.imports ?? []) imported(next, into);
        };
        for (const chunk of chunks) if (chunk.isEntry) imported(chunk.fileName, started);
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
