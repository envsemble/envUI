import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const benchDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(benchDir, '../packages/ui/src');
const readJson = (path) => JSON.parse(readFileSync(join(benchDir, path), 'utf8'));
const { tasks } = readJson('tasks.json');
const { aliases } = readJson('scoring/aliases.json');

/** The value and type exports of envUI's entry points the scorer reads, from the source. */
function sourceExports() {
  const entries = ['index.ts', 'content.ts', 'rich-text.ts', 'diff.ts'].map((file) =>
    join(sourceDir, file),
  );
  const program = ts.createProgram(entries, {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const names = new Set();
  for (const entry of entries) {
    const symbol = checker.getSymbolAtLocation(program.getSourceFile(entry));
    for (const exported of checker.getExportsOfModule(symbol)) names.add(exported.name);
  }
  return names;
}

describe('tasks and aliases', () => {
  const exported = sourceExports();

  it('name only exports envUI has', () => {
    const missing = [];
    for (const task of tasks)
      for (const capability of task.capabilities)
        for (const name of capability.envui ?? [])
          if (!exported.has(name.split('.')[0])) missing.push(`${task.id}: ${name}`);
    for (const [alias, targets] of Object.entries(aliases))
      for (const name of targets)
        if (name !== '@icons' && !exported.has(name)) missing.push(`alias ${alias}: ${name}`);
    assert.deepEqual(missing, []);
  });
});
