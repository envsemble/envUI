# Contributing to envUI

How to work on envUI itself. [AGENTS.md](AGENTS.md) has the commands, where things are and the rules the code doesn't hold; [contributing/pages.md](contributing/pages.md) how to write a page.

## Set up

Requires Node.js 24 or newer:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run dev
```

The catalogue opens at [127.0.0.1:8770](http://127.0.0.1:8770), with the Docs under `/docs`, and follows the library's source as you edit.

| Command               | Does                                                        |
| --------------------- | ----------------------------------------------------------- |
| `npm run build`       | The package, into `packages/ui/dist/`                       |
| `npm run build:site`  | The hosted site, each page pre-rendered, into `dist/site/`  |
| `npm run site:dev`    | The hosted site, built and served at 127.0.0.1:8771         |
| `npm run dev:library` | A watched build of the package, for an app that links envUI |
| `npm run format`      | Prettier on everything                                      |

## Use a local envUI in an app

In the application, `npm install <path-to-envUI>/packages/ui --no-save --install-links=false`, and in envUI `npm run dev:library`. To skip the rebuild, start the application's Vite server with `ENVUI_SOURCE=1` and the package's `envui-source` condition:

```ts
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

The link brings envUI's own React; run the application's type checks and tests against a packed tarball instead. Installing dependencies in the application replaces the link.

## Open a change

1. Branch from `dev`, and keep the change to one purpose.
2. Add a changeset where people using envUI notice the change, as [AGENTS.md](AGENTS.md#record-the-change) says.
3. Run `npm run check:affected`, then open a pull request into `dev`. CI runs once it is ready for review.
