import { resolve } from 'node:path';
import { Node, Project } from 'ts-morph';
import { GeneratedOutput } from '../build/GeneratedFiles.ts';
import { baseOption } from '../Git.ts';
import { yellow } from '../Terminal.ts';
import {
  baseContract,
  bumpsLibrary,
  recordsBreakingChange,
  names,
  pendingChangesets,
} from './ContractHistory.ts';
import { libraryEntryPoints } from './LibraryEntryPoints.ts';
import { exportsFile, libraryDirectory, repositoryPath } from '../RepositoryPaths.ts';

const exportsPath = repositoryPath(exportsFile);

type ExportsRecord = Record<string, Record<string, string>>;

function kindOf(declaration: Node) {
  if (Node.isSourceFile(declaration)) return 'namespace';
  if (Node.isFunctionDeclaration(declaration)) return 'function';
  if (Node.isVariableDeclaration(declaration)) return 'const';
  if (Node.isClassDeclaration(declaration)) return 'class';
  if (Node.isInterfaceDeclaration(declaration)) return 'interface';
  if (Node.isTypeAliasDeclaration(declaration)) return 'type';
  if (Node.isEnumDeclaration(declaration)) return 'enum';
  if (Node.isModuleDeclaration(declaration)) return 'namespace';
  return declaration.getKindName();
}

function buildExports(): ExportsRecord {
  const project = new Project({ tsConfigFilePath: resolve(libraryDirectory, 'tsconfig.json') });
  const record: ExportsRecord = {};
  const entryPoints = libraryEntryPoints().sort((a, b) => a.specifier.localeCompare(b.specifier));
  for (const { specifier, file } of entryPoints) {
    const exported = [...project.getSourceFileOrThrow(file).getExportedDeclarations()];
    record[specifier] = Object.fromEntries(
      exported
        .map(([name, declarations]) => {
          const kinds = [...new Set(declarations.map(kindOf))].sort();
          return [name, kinds.join(' ')] as const;
        })
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
  }
  return record;
}

function exportedNames(record: ExportsRecord | undefined) {
  const all = new Map<string, { name: string; kind: string }>();
  for (const [specifier, exported] of Object.entries(record ?? {}))
    for (const [name, kind] of Object.entries(exported))
      all.set(`${specifier}: ${name}`, { name, kind });
  return all;
}

export function changedExports(
  before: ExportsRecord | undefined,
  after: ExportsRecord,
  changesets: string[] = [],
) {
  const was = exportedNames(before);
  const now = exportedNames(after);
  const anyChangeset = changesets.some(bumpsLibrary);
  const major = changesets.filter(recordsBreakingChange);
  const changes: { label: string; recorded: boolean }[] = [];
  for (const [label, { name, kind }] of was) {
    const current = now.get(label);
    if (current?.kind === kind) continue;
    changes.push({
      label: current ? `${label} (${kind}, now ${current.kind})` : `${label} (${kind}, gone)`,
      recorded: major.some((text) => names(text, name)),
    });
  }
  for (const [label, { kind }] of now)
    if (!was.has(label))
      changes.push({ label: `${label} (${kind}, added)`, recorded: anyChangeset });
  return changes;
}

if (import.meta.main) {
  const record = buildExports();
  const output = `${JSON.stringify(record, null, 2)}\n`;
  const check = process.argv.includes('--check');
  const generated = new GeneratedOutput({
    check,
    regenerate: 'npm run docs:exports',
    advice: 'or, for a name only another module or a test needs, move it to an internal/ module',
  });
  generated.writeOrCheck(exportsFile, output);
  generated.exitIfStale();
  if (!check) {
    console.log(
      `Generated ${exportsPath}: ${exportedNames(record).size} exports of ${Object.keys(record).length} entry points.`,
    );
  } else {
    const base = baseContract<ExportsRecord>(exportsPath, baseOption());
    if (!base.contract) {
      console.log(`${exportsPath} matches its sources.`);
      console.warn(
        yellow(
          `warning: no change of the exports was checked: ${base.missing}. Fetch the integration branch, or pass --base <ref> or set ENVUI_BASE.`,
        ),
      );
    } else {
      const changes = changedExports(base.contract, record, pendingChangesets());
      if (changes.length)
        console.log(
          `Changed since ${base.ref}:\n${changes.map((change) => `  ${change.label}${change.recorded ? ' (in a changeset)' : ''}`).join('\n')}`,
        );
      if (changes.some((change) => !change.recorded)) {
        console.error(
          'The entry points’ exports are public API. Record each change above in a changeset of @envsemble/envui: an added name in any, and a name that goes or changes its kind in a major one, or under a `Breaking changes:` section, that names it.',
        );
        process.exit(1);
      }
      console.log(
        `${exportsPath} matches its sources, and every change since ${base.ref} is in a changeset.`,
      );
    }
  }
}
