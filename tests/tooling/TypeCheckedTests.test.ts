import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import ts from 'typescript';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const testsDirectory = join(repositoryRoot, 'tests');
const projectsOfTheirOwn = ['component', 'fixture', 'types'];
const untypedAtMost = 59;

const configFile = join(testsDirectory, 'tsconfig.json');
const { config } = ts.parseConfigFileTextToJson(configFile, readFileSync(configFile, 'utf8'));
const exclude: string[] = config.exclude;
const untyped = exclude.filter((path) => !projectsOfTheirOwn.includes(path));

test('every test file left out of type checking exists', () => {
  assert.deepEqual(
    untyped.filter((path) => !existsSync(join(testsDirectory, path))),
    [],
    'Remove these from the exclude list of tests/tsconfig.json.',
  );
});

test('the test files left out of type checking only get fewer', () => {
  assert.ok(
    untyped.length <= untypedAtMost,
    `tests/tsconfig.json leaves ${untyped.length} files out of type checking, more than ${untypedAtMost}: type the new file instead of excluding it.`,
  );
  assert.equal(
    untyped.length,
    untypedAtMost,
    `Fewer files are left out of type checking: lower untypedAtMost to ${untyped.length}.`,
  );
});
