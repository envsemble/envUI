// Generates docs/generated/exports.json, the record of the library's public API: every name each
// entry point of packages/ui/package.json exports, with its kind, sorted. The entry points reach
// their modules through `export *`, so whatever a component module exports is public; this record
// makes each change to that list visible in review.
//
//   node scripts/docs/GenerateExports.ts           rewrite docs/generated/exports.json
//   node scripts/docs/GenerateExports.ts --check [--base <ref>]
//                                            fail when it differs from the source, or when a name
//                                            changed since the base branch without a changeset of
//                                            @envsemble/envui: a name that is added needs one, and
//                                            a name that goes or changes its kind a major one that
//                                            names it. The base is found as for the parts
//                                            (scripts/docs/GenerateParts.ts).
import { resolve } from 'node:path';
import { Node, Project } from 'ts-morph';
import { readIfExists, writeIfChanged } from '../build/GeneratedFiles.ts';
import {
  baseContract,
  baseOption,
  bumpsLibrary,
  isMajor,
  names,
  pendingChangesets,
} from './ContractHistory.ts';
import { libraryEntryPoints } from './LibraryEntryPoints.ts';
import { libraryDirectory, repositoryRoot } from '../RepositoryPaths.ts';

const exportsPath = 'docs/generated/exports.json';
const exportsFile = resolve(repositoryRoot, exportsPath);

/** Each entry point's exported names and their kinds, by the specifier applications import. */
type ExportsRecord = Record<string, Record<string, string>>;

/** The kind of an exported declaration, as the record names it. */
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
  // Every entry point, by specifier, so the record reads in the same order whatever the manifest's.
  const entryPoints = libraryEntryPoints().sort((a, b) => a.specifier.localeCompare(b.specifier));
  for (const { specifier, file } of entryPoints) {
    const exported = [...project.getSourceFileOrThrow(file).getExportedDeclarations()];
    record[specifier] = Object.fromEntries(
      exported
        .map(([name, declarations]) => {
          // A name can be a value and a type at once, such as a const and its type.
          const kinds = [...new Set(declarations.map(kindOf))].sort();
          return [name, kinds.join(' ')] as const;
        })
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
  }
  return record;
}

/** Each name of a record, as `specifier: name`, with its kind. */
function exportedNames(record: ExportsRecord | undefined) {
  const all = new Map<string, { name: string; kind: string }>();
  for (const [specifier, exported] of Object.entries(record ?? {}))
    for (const [name, kind] of Object.entries(exported))
      all.set(`${specifier}: ${name}`, { name, kind });
  return all;
}

/**
 * What changed between two records: each name added, and each name gone or of another kind, with
 * whether pending changesets record it: an addition by any changeset of @envsemble/envui, a removal
 * or a change of kind by a major one that names it. Pure, for the tests.
 */
export function changedExports(
  before: ExportsRecord | undefined,
  after: ExportsRecord,
  changesets: string[] = [],
) {
  const was = exportedNames(before);
  const now = exportedNames(after);
  const anyChangeset = changesets.some(bumpsLibrary);
  const major = changesets.filter(isMajor);
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
  if (!process.argv.includes('--check')) {
    writeIfChanged(exportsFile, output);
    console.log(
      `Generated ${exportsPath}: ${exportedNames(record).size} exports of ${Object.keys(record).length} entry points.`,
    );
  } else {
    if (readIfExists(exportsFile) !== output) {
      console.error(
        `${exportsPath} differs from the library's source. Run \`npm run docs:exports\` and commit the result.`,
      );
      process.exit(1);
    }
    const base = baseContract<ExportsRecord>(exportsPath, baseOption());
    if (!base.contract) {
      console.log(`${exportsPath} matches its sources.`);
      console.warn(
        `[33mwarning: no change of the exports was checked: ${base.skipped.join('; ')}. Fetch the integration branch, or pass --base <ref> or set ENVUI_BASE.[0m`,
      );
    } else {
      const changes = changedExports(base.contract, record, pendingChangesets());
      if (changes.length)
        console.log(
          `Changed since ${base.ref}:\n${changes.map((change) => `  ${change.label}${change.recorded ? ' (in a changeset)' : ''}`).join('\n')}`,
        );
      if (changes.some((change) => !change.recorded)) {
        console.error(
          'The entry points’ exports are public API. Record each change above in a changeset of @envsemble/envui: an added name in any, and a name that goes or changes its kind in a major one that names it.',
        );
        process.exit(1);
      }
      console.log(
        `${exportsPath} matches its sources, and every change since ${base.ref} is in a changeset.`,
      );
    }
  }
}
