# Develop envUI locally

Use this workflow when the task authorizes co-development in an envUI checkout and a consuming application. Ordinary adoption uses a published version; see [setup](setup.md).

1. Run `npm ci` in envUI.
2. Temporarily run `npm install <path-to-envUI>/packages/ui --no-save --install-links=false` from the application, adjusting the path. `--no-save` keeps the manifest and lockfile on the published version.
3. Run `npm run dev:library` in envUI. It rebuilds the compiled package and its type declarations and documentation after each change.
4. Configure Vite for source mode (below) and start the application with it enabled.
5. Use ordinary public imports. Before delivery, return to the published package and validate the packaged consumer path.

## Source mode

The package exports an `envui-source` condition that points every public entry at `src`. With that condition, Vite serves envUI's source files, so a component or CSS change reloads in the running application without a library build or a page refresh. Enable it only for the development server, behind an opt-in variable:

```ts
// Merge into the application's existing Vite configuration.
import { realpathSync } from 'node:fs';
import { defaultClientConditions, defineConfig, searchForWorkspaceRoot } from 'vite';

export default defineConfig(({ command }) => {
  const envUISource = command === 'serve' && process.env.ENVUI_SOURCE === '1';
  const envUIRoot = envUISource ? realpathSync('node_modules/@envsemble/envui') : undefined;
  return {
    resolve: {
      dedupe: ['react', 'react-dom'],
      ...(envUISource && { conditions: ['envui-source', ...defaultClientConditions] }),
    },
    ...(envUISource && { optimizeDeps: { exclude: ['@envsemble/envui'] } }),
    server: {
      ...(envUIRoot && { fs: { allow: [searchForWorkspaceRoot(process.cwd()), envUIRoot] } }),
    },
  };
});
```

Wrap the link, the library watcher and the application server in one script, such as an `npm run dev:envui` script in the application, so one command starts and stops all three.

## Checks while linked

The linked checkout brings its own React, type packages and dependencies. Type checks and unit tests can therefore see two copies of React and fail although the application is correct. Run checks against a packaged build instead: run `npm run build:library` and `npm pack` in `packages/ui`, then install the tarball in the application with `--no-save`. Reinstall the link to continue co-developing.

Installing or removing dependencies in the application replaces the link with the published package; link again afterwards.

The envUI catalogue reads library source directly and updates with `npm run dev`. Keep the application responsible for its routes, data and deployment configuration.

For library changes, follow [library development](library-development.md). For adoption across existing UI, follow [migration](migration.md).
