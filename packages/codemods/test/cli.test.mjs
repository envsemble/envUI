import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { transforms } from '../src/transforms.mjs';
import { fixturesDirectory, packageDirectory } from './helpers.mjs';

const bin = join(packageDirectory, 'bin', 'envui-codemods.mjs');
const fixture = (transform, file) => join(fixturesDirectory, transform, file);
const read = (path) => readFileSync(path, 'utf8');

let project;

/** Runs the CLI in the temporary project, without colors. */
const cli = (...args) =>
  spawnSync(process.execPath, [bin, ...args], {
    cwd: project,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
  });

const copy = (transform, file, to) => {
  mkdirSync(join(project, to, '..'), { recursive: true });
  cpSync(fixture(transform, file), join(project, to));
};

before(() => {
  project = mkdtempSync(join(tmpdir(), 'envui-codemods-cli-'));
  copy('v1-names', 'menu.input.tsx', 'src/menu.tsx');
  copy('v1-names', 'pager-dynamic.input.tsx', 'src/pager.tsx');
  copy('v1-names', 'menu.input.tsx', 'src/legacy/menu.tsx');
  copy('v1-names', 'menu.input.tsx', 'node_modules/package/menu.tsx');
  copy('v1-names', 'menu.input.tsx', 'dist/menu.tsx');
  copy('v1-classes', 'styles.input.css', 'src/styles.css');
});

after(() => rmSync(project, { recursive: true, force: true }));

test('the package bin is the CLI, runnable through npm bin shims', () => {
  const manifest = JSON.parse(read(join(packageDirectory, 'package.json')));
  assert.deepEqual(manifest.bin, { 'envui-codemods': './bin/envui-codemods.mjs' });
  assert.match(read(bin), /^#!\/usr\/bin\/env node\n/);
});

test('--help, --list and unknown transforms', () => {
  const help = cli('--help');
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage: envui-codemods <transform> \[paths\.\.\.\]/);
  const list = cli('--list');
  assert.equal(list.status, 0);
  assert.match(list.stdout, /^ {2}v1-names {6}\S/m);
  assert.match(list.stdout, /^ {2}v1-structure {2}\S/m);
  assert.match(list.stdout, /^ {2}v1-classes {4}\S/m);
  const unknown = cli('v0-names', 'src');
  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /Unknown transform: v0-names/);
  const option = cli('v1-names', '--fast');
  assert.equal(option.status, 2);
  const map = cli('v1-names', 'src', '--map=missing.json');
  assert.equal(map.status, 2);
  assert.match(map.stderr, /Cannot read the rename map/);
});

test('--dry reports changes and warnings without writing', () => {
  const result = cli('v1-names', 'src', '--dry', '--print', '--ignore-pattern=legacy');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Running in dry mode/);
  // Each file that would change is named, and printed under its name.
  assert.match(result.stdout, /^Would change src[\\/]menu\.tsx$/m);
  assert.match(result.stdout, /^Would change src[\\/]pager\.tsx$/m);
  assert.match(result.stdout, /^==> src[\\/]menu\.tsx <==\n(?:.*\n)*?.*<Menu\.Separator \/>/m);
  assert.doesNotMatch(result.stdout, /legacy/);
  assert.match(
    result.stdout,
    /REP src[\\/]pager\.tsx line 9: DirectionLink has a dynamic, spread or missing direction/,
  );
  assert.match(result.stdout, /REP src[\\/]pager\.tsx line 17: DirectionLink is used outside JSX/);
  assert.match(result.stdout, /0 errors/);
  assert.match(result.stdout, /2 ok/);
  assert.equal(read(join(project, 'src/menu.tsx')), read(fixture('v1-names', 'menu.input.tsx')));
});

test('a run rewrites files and skips node_modules, dist and ignored paths', () => {
  const names = cli('v1-names', '--ignore-pattern=src/legacy/**');
  assert.equal(names.status, 0, names.stderr);
  assert.match(names.stdout, /2 ok/);
  assert.match(names.stdout, /^Changed src[\\/]menu\.tsx$/m);
  // Without --print, only the names.
  assert.doesNotMatch(names.stdout, /==>/);
  assert.equal(read(join(project, 'src/menu.tsx')), read(fixture('v1-names', 'menu.output.tsx')));
  assert.equal(
    read(join(project, 'src/pager.tsx')),
    read(fixture('v1-names', 'pager-dynamic.output.tsx')),
  );
  for (const untouched of ['src/legacy/menu.tsx', 'node_modules/package/menu.tsx', 'dist/menu.tsx'])
    assert.equal(read(join(project, untouched)), read(fixture('v1-names', 'menu.input.tsx')));

  const classes = cli('v1-classes', 'src', '--extensions=css');
  assert.equal(classes.status, 0, classes.stderr);
  assert.match(classes.stdout, /1 ok/);
  assert.equal(
    read(join(project, 'src/styles.css')),
    read(fixture('v1-classes', 'styles.output.css')),
  );
});

test('--map runs a transform with another map', () => {
  writeFileSync(
    join(project, 'notice.json'),
    JSON.stringify({ exports: { '@envsemble/envui': { Notice: 'Alert' } } }),
  );
  writeFileSync(
    join(project, 'src/notice.tsx'),
    "import { Input, Notice } from '@envsemble/envui';\n\nexport const parts = [Input, Notice];\n",
  );
  const result = cli('v1-names', 'src/notice.tsx', '--map=notice.json');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    read(join(project, 'src/notice.tsx')),
    "import { Input, Alert } from '@envsemble/envui';\n\nexport const parts = [Input, Alert];\n",
  );
});

test('a file that does not parse fails the run', () => {
  writeFileSync(
    join(project, 'src/broken.tsx'),
    "import { Input } from '@envsemble/envui';\n<<<\n",
  );
  const result = cli('v1-names', 'src/broken.tsx');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /1 errors/);
});

test('declaration files parse in every transform', () => {
  mkdirSync(join(project, 'types'), { recursive: true });
  writeFileSync(
    join(project, 'types/index.d.ts'),
    "import type { InputProps } from '@envsemble/envui';\n\nexport const field: InputProps;\nexport function render(props: InputProps): void;\n",
  );
  for (const transform of Object.keys(transforms)) {
    const result = cli(transform, 'types', '--dry');
    assert.equal(result.status, 0, `${transform}: ${result.stdout}${result.stderr}`);
    assert.match(result.stdout, /0 errors/, transform);
  }
  assert.match(cli('v1-names', 'types').stdout, /1 ok/);
  assert.match(read(join(project, 'types/index.d.ts')), /export const field: TextFieldProps;/);
});

test('the usage, the README and the migration guide run the transforms in one order', () => {
  const order = cli('--help')
    .stdout.match(/Run (v1-[\s\S]*?), then type-check\./)[1]
    .match(/v1-[a-z-]+/g);
  assert.deepEqual([...order].sort(), Object.keys(transforms).sort());
  const readme = read(join(packageDirectory, 'README.md'));
  const steps = readme.slice(readme.indexOf('## Recommended order'), readme.indexOf('## v1-names'));
  assert.deepEqual(
    steps.match(/envui-codemods (v1-[a-z-]+)/g).map((run) => run.split(' ')[1]),
    order,
  );
  const guide = read(join(packageDirectory, '../../docs/migration.md'));
  const commands = guide.slice(guide.indexOf('## Upgrade from envUI 0.x to 1.0'));
  assert.deepEqual(
    commands
      .slice(0, commands.indexOf('```\n', commands.indexOf('```sh') + 5))
      .match(/@<version> (v1-[a-z-]+) src\n/g)
      .map((run) => run.split(' ')[1]),
    order,
  );
});

test('the README has each section once, with one per transform', () => {
  const readme = read(join(packageDirectory, 'README.md'));
  const headings = readme.match(/^#{1,2} .+$/gm);
  assert.deepEqual(
    headings.filter((heading, index) => headings.indexOf(heading) !== index),
    [],
    'a heading appears twice',
  );
  assert.equal(headings.filter((heading) => heading.startsWith('# ')).length, 1);
  for (const name of Object.keys(transforms)) assert.ok(headings.includes(`## ${name}`), name);
  for (const section of ['## The rename map', '## Limitations'])
    assert.ok(headings.includes(section), section);
  // Each paragraph and list item once: a pasted copy repeats them.
  const blocks = readme.split(/\n(?:\n|(?=- ))/).filter((block) => block.trim().length > 80);
  assert.deepEqual(
    blocks.filter((block, index) => blocks.indexOf(block) !== index),
    [],
    'a paragraph appears twice',
  );
});

test('v1-classes tells test files by their path below their project, wherever the run starts', () => {
  const app = join(project, 'tests', 'app');
  mkdirSync(join(app, 'src'), { recursive: true });
  mkdirSync(join(app, 'e2e'), { recursive: true });
  writeFileSync(join(app, 'package.json'), '{}');
  const source = "find('.env-app-sidebar');\n";
  writeFileSync(join(app, 'src', 'find.ts'), source);
  writeFileSync(join(app, 'e2e', 'find.ts'), source);
  // The project's own folder is in a `tests` folder, which makes none of its files a test file.
  assert.equal(cli('v1-classes', 'tests/app').status, 0);
  assert.equal(read(join(app, 'src', 'find.ts')), source);
  assert.equal(read(join(app, 'e2e', 'find.ts')), "find('.env-sidebar');\n");
  // A test folder scanned on its own is still one.
  writeFileSync(join(app, 'e2e', 'find.ts'), source);
  assert.equal(cli('v1-classes', 'tests/app/e2e').status, 0);
  assert.equal(read(join(app, 'e2e', 'find.ts')), "find('.env-sidebar');\n");
});
