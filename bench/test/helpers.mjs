import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { commitBaseline } from '../lib/prepare.mjs';

const write = (root, files) => {
  for (const [path, content] of Object.entries(files)) {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  }
};

/**
 * Stub packages: just enough declarations for the scorer to type-check an app against envUI,
 * React's JSX runtime, Vite's client types and a third-party headless UI package.
 */
const stubs = {
  'node_modules/vite/package.json': { name: 'vite', version: '0.0.0' },
  'node_modules/vite/client.d.ts': 'interface ImportMetaEnv { readonly MODE: string }\n',
  'node_modules/react/package.json': { name: 'react', version: '0.0.0', types: 'index.d.ts' },
  'node_modules/react/index.d.ts': 'export {};\n',
  'node_modules/react/jsx-runtime.d.ts': `export namespace JSX {
  type Element = any;
  interface IntrinsicElements { [name: string]: any }
  interface ElementChildrenAttribute { children: {} }
}
export declare function jsx(type: any, props: any): any;
export declare function jsxs(type: any, props: any): any;
export declare const Fragment: any;
`,
  'node_modules/@envsemble/envui/package.json': {
    name: '@envsemble/envui',
    version: '0.0.0',
    types: 'index.d.ts',
  },
  'node_modules/@envsemble/envui/index.d.ts': `export interface ButtonProps { children?: unknown; variant?: 'primary' | 'secondary'; onClick?: () => void }
export declare function Button(props: ButtonProps): unknown;
export declare function Dialog(props: { open?: boolean; title?: string; children?: unknown }): unknown;
export declare function Column(props: { gap?: number; children?: unknown }): unknown;
`,
  'node_modules/@base-ui/react/package.json': {
    name: '@base-ui/react',
    version: '0.0.0',
    types: 'index.d.ts',
  },
  'node_modules/@base-ui/react/index.d.ts':
    'export declare const Dialog: { Root(props: { children?: unknown }): unknown; Popup(props: { children?: unknown }): unknown };\n',
};

/**
 * A small app in a fresh temp folder, committed as the base: a tsconfig.json like the fixture's,
 * stub packages and `files`. Returns its directory, base commit and a cleanup function.
 */
export async function makeApp(files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'bench-test-'));
  const appDir = join(root, 'app');
  write(appDir, {
    '.gitignore': 'node_modules\n',
    'package.json': { name: 'app', private: true, type: 'module' },
    'tsconfig.json': {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        types: ['vite/client'],
      },
      include: ['src'],
    },
    'src/main.tsx':
      "import { Column } from '@envsemble/envui';\n\nexport const Root = () => <Column gap={1} />;\n",
    ...stubs,
    ...files,
  });
  const baseCommit = await commitBaseline(appDir);
  return {
    appDir,
    baseCommit,
    root,
    write: (more) => write(appDir, more),
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

export const task = (...envui) => ({
  id: 'test',
  capabilities: envui.map((name) => ({ id: name, label: name, envui: [name] })),
});
