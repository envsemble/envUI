import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { libraryModules } from '../scripts/ClientModules.mjs';

// envUI and React Server Components: each module that uses client-only React APIs starts with
// 'use client', the entry points carry no directive, the build keeps the directives where they
// are, and a server component's module graph imports the package and renders envUI on the server.

const repository = fileURLToPath(new URL('../', import.meta.url));
const dist = join(repository, 'packages/ui/dist');
const modules = await libraryModules();

/** The entry points, whose `export *` and `export * as` lines a server component imports through. */
const entries = ['index', 'content', 'diff', 'rich-text', 'theme-bootstrap', 'icons/index'];

const startsWithDirective = (code) => /^\s*(['"])use client\1;?/.test(code);

test("every module that uses client-only APIs, and only such a module, says 'use client'", () => {
  const missing = modules
    .filter((module) => module.reasons.length > 0 && !module.client)
    .map((module) => `${module.file} ${module.reasons[0]}`);
  const needless = modules
    .filter((module) => module.reasons.length === 0 && module.client)
    .map((module) => module.file);
  assert.deepEqual(missing, [], 'Run node scripts/ClientModules.mjs, or npm run icons:generate.');
  assert.deepEqual(needless, [], 'These modules use nothing client-only.');
  for (const entry of entries) {
    const module = modules.find(({ file }) => file.replace(/\.tsx?$/, '') === entry);
    assert.ok(module, entry);
    assert.equal(module.client, false, `${entry} stays a server module`);
  }
  // Menu.Item is a part of a client module; the Menu namespace is an `export * as` in the entry.
  assert.ok(modules.find(({ file }) => file === 'navigation/Menu.tsx').client);
});

test('the build keeps each directive at the top of its module, and adds none', async () => {
  assert.ok(existsSync(join(dist, 'index.js')), 'Build the library first: npm run build:library.');
  for (const module of modules) {
    const built = join(dist, module.file.replace(/\.tsx?$/, '.js'));
    if (!existsSync(built)) continue;
    assert.equal(
      startsWithDirective(await readFile(built, 'utf8')),
      module.client,
      `dist/${module.file.replace(/\.tsx?$/, '.js')}`,
    );
  }
});

test('a server component imports envUI and renders it on the server', () => {
  const output = execFileSync(
    process.execPath,
    [
      '--conditions=react-server',
      '--import',
      './tests/rsc/ClientReferences.mjs',
      'tests/rsc/ServerRender.mjs',
    ],
    { cwd: repository, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  );
  const result = JSON.parse(output);
  // A part reached through its namespace is a client reference, which the server sends as such.
  assert.equal(result.menuItem, true);
  // Plain functions stay functions on the server.
  assert.equal(result.themeBootstrapScript, 'string');
  assert.equal(result.bootstrapEntryScript, 'string');
  assert.equal(result.relativeTime, '3 hours ago');
  for (const [entry, survey] of Object.entries(result.surveys)) {
    assert.deepEqual(survey.failed, [], `${entry}: every server component renders on the server`);
    assert.ok(survey.client.length > 0, `${entry} has client components`);
  }
  const main = result.surveys['@envsemble/envui'];
  for (const name of ['Badge', 'Card', 'Text', 'Button', 'Alert', 'List.Item', 'Stat.Root'])
    assert.ok(main.server.includes(name), `${name} renders on the server`);
  for (const name of ['Menu.Item', 'Theme', 'Dialog', 'Table.Root', 'useToast'])
    assert.ok(main.client.includes(name), `${name} is a client reference`);
  // The page's client components receive only what a server can send them.
  const page = JSON.stringify(result.page);
  assert.match(page, /"client":"navigation\/Menu\.js#Item"/);
  assert.match(page, /"client":"icons\/Home\.js#Home"/);
  assert.match(page, /"element":"div","props":\{"role":"status","className":"env-alert"/);
});
