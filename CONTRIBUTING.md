# Contributing to envUI

How to work on envUI itself. The rules every change follows are in [AGENTS.md](AGENTS.md), which leads to the library's and the site's, and how to write a component, pattern or foundation page in [contributing/pages.md](contributing/pages.md).

## Set up

Requires Node.js 24 or newer. From the repository root:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run dev
```

The catalogue opens at [127.0.0.1:8770](http://127.0.0.1:8770), with the Docs under `/docs`, and updates from the library's source as you edit.

| Command               | Does                                                        |
| --------------------- | ----------------------------------------------------------- |
| `npm run dev`         | The catalogue and the Docs, from source                     |
| `npm run build`       | The package, into `packages/ui/dist/`                       |
| `npm run build:site`  | The hosted site, each page pre-rendered, into `dist/site/`  |
| `npm run site:dev`    | The hosted site, built and served at 127.0.0.1:8771         |
| `npm run dev:library` | A watched build of the package, for an app that links envUI |
| `npm run format`      | Prettier on everything                                      |
| `npm run changeset`   | A changelog entry for the change                            |

```text
docs/                The Markdown documentation, which the package ships and the site shows
contributing/        How to write its pages
apps/site/           The website: the catalogue, and the Docs at /docs; hosting/ the Worker and SKILL.md
packages/ui/         @envsemble/envui
packages/eslint-plugin/      @envsemble/eslint-plugin-envui
packages/stylelint-config/   @envsemble/stylelint-config-envui
scripts/             Build, documentation, site, test and release scripts, run by Node as they are
tests/               Unit tests, component tests, the site's browser specs and their fixtures
```

### Use a local envUI in an app

To change envUI and an application together:

1. In the application, `npm install <path-to-envUI>/packages/ui --no-save --install-links=false`, which keeps its manifest and lockfile on the published version.
2. In envUI, `npm run dev:library`, which rebuilds the package after each change.
3. For changes without a rebuild, start the application's Vite server with the package's `envui-source` condition, which points every entry at `src`:

   ```ts
   // vite.config.ts, merged into the application's own
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

The link brings envUI's own React, so the application's type checks and tests may see two; run them against a tarball instead (`npm run build:library`, then `npm pack` in `packages/ui`, installed with `--no-save`). Installing dependencies in the application replaces the link; link again afterwards, and return to the published version before delivering.

## Check a change

| Command                  | When                                                   |
| ------------------------ | ------------------------------------------------------ |
| `npm run check`          | After each change: what the branch changed, fast       |
| `npm run check:affected` | Before pushing: the same in every engine, with builds  |
| `npm run verify`         | Everything, the visual baseline included; needs Docker |

[AGENTS.md](AGENTS.md#checks-three-tiers-never-the-full-suite-every-turn) says what each runs and how to write tests.

## Open a change

1. Branch from `dev`, and keep the change to one purpose.
2. Add a changeset where people using envUI notice the change, as [AGENTS.md](AGENTS.md#record-the-change) says.
3. Run `npm run check:affected`, then open a pull request into `dev`. CI runs once it is ready for review.
