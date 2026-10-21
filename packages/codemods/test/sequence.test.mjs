// The transforms run together, in the order the CLI lists them: every fixture of every transform,
// run through all of them, is changed no further by a second run of all of them, and code written
// for 1.0.0-prerelease.0 comes out as its fixture says.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { transforms } from '../src/transforms.mjs';
import { fixtures, fixturesDirectory, packageDirectory, runTransform } from './helpers.mjs';

const order = Object.keys(transforms);
const modules = Object.fromEntries(
  await Promise.all(
    order.map(async (name) => [name, await import(pathToFileURL(transforms[name].file).href)]),
  ),
);
const extension = (path) => path.slice(path.lastIndexOf('.') + 1);

/** Runs every transform that reads the file, in order, and returns the result and its reports. */
function runAll(path, source) {
  const reports = [];
  for (const name of order) {
    if (!transforms[name].extensions.includes(extension(path))) continue;
    const result = runTransform(modules[name], path, source);
    source = result.output;
    reports.push(...result.reports.map((report) => `${name} ${report}`));
  }
  return { output: source, reports };
}

test('the transforms run in the order the README and the migration guide give', () => {
  assert.deepEqual(order, [
    'v1-names',
    'v1-structure',
    'v1-render',
    'v1-stack',
    'v1-props',
    'v1-classes',
  ]);
  const readme = readFileSync(join(packageDirectory, 'README.md'), 'utf8');
  const section = readme.slice(
    readme.indexOf('## Recommended order'),
    readme.indexOf('## v1-names'),
  );
  const mentioned = [...section.matchAll(/envui-codemods (v1-[a-z]+)/g)].map(([, name]) => name);
  assert.deepEqual(mentioned, order);
  const guide = readFileSync(join(packageDirectory, '../../docs/migration.md'), 'utf8');
  const commands = [
    ...guide.matchAll(/^npx @envsemble\/envui-codemods@<version> (v1-[a-z]+) src$/gm),
  ];
  assert.deepEqual(
    commands.map(([, name]) => name),
    order,
  );
});

for (const transform of readdirSync(fixturesDirectory).filter((name) => name !== 'sequence'))
  for (const fixture of fixtures(transform))
    test(`every transform, run twice: ${transform}/${fixture.name}`, () => {
      const once = runAll(fixture.path, fixture.input);
      assert.equal(runAll(fixture.path, once.output).output, once.output);
    });

for (const fixture of fixtures('sequence'))
  test(`every transform over prerelease code: ${fixture.name}`, () => {
    const once = runAll(fixture.path, fixture.input);
    assert.equal(once.output, fixture.output);
    assert.deepEqual(once.reports, fixture.reports);
    assert.equal(runAll(fixture.path, once.output).output, once.output);
  });

test('the sequence fixtures expect their reports', () => {
  for (const fixture of fixtures('sequence'))
    assert.ok(
      existsSync(
        join(fixturesDirectory, 'sequence', `${fixture.name.replace('.', '.reports.')}.json`),
      ),
      fixture.name,
    );
});
