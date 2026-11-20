import { readIfExists, writeIfChanged } from '../build/GeneratedFiles.ts';
import { baseOption } from '../Git.ts';
import { yellow } from '../Terminal.ts';
import { baseContract, lastReleaseContract, pendingChangesets } from './ContractHistory.ts';
import {
  buildParts,
  partsFile,
  partsPath,
  serializeParts,
  type PartsContract,
} from './parts/Contract.ts';
import { removedParts } from './parts/ContractComparison.ts';

const check = process.argv.includes('--check');
const { parts, problems } = buildParts();
const output = serializeParts(parts);
if (problems.length) {
  console.error(
    `The part contract has problems:\n${problems.map((line) => `  ${line}`).join('\n')}`,
  );
  process.exit(1);
}
if (check) {
  if (readIfExists(partsFile) !== output) {
    console.error(
      `${partsPath} differs from the library's source. Run \`npm run docs:parts\` and commit the result.`,
    );
    process.exit(1);
  }
  const base = baseContract<PartsContract>(partsPath, baseOption());
  if (!base.contract) {
    console.log(`${partsPath} matches its sources.`);
    console.warn(
      yellow(
        `warning: no part or state removal was checked: ${base.missing}. Fetch the integration branch, or pass --base <ref> or set ENVUI_BASE.`,
      ),
    );
  } else {
    const release = lastReleaseContract<PartsContract>(partsPath, baseOption());
    const removed = removedParts(base.contract, parts, pendingChangesets(), release?.contract);
    const unrecorded = removed.filter((item) => !item.recorded);
    if (removed.length)
      console.log(
        `Gone since ${base.ref}:\n${removed.map((item) => `  ${item.label}${item.recorded ? ' (in a breaking change)' : ''}`).join('\n')}`,
      );
    if (unrecorded.length) {
      console.error(
        `Part classes, state attributes and color properties are public: one that goes is a breaking change. Name each one above that no changeset of @envsemble/envui records as breaking (a major one, or one with a "Breaking changes:" section) in such a changeset, naming it (a value with its attribute), with what replaces it.`,
      );
      process.exit(1);
    }
    console.log(
      `${partsPath} matches its sources, and every part or state gone since ${base.ref}${release ? ` that ${release.tag} shipped` : ''} is recorded as a breaking change.`,
    );
  }
} else {
  writeIfChanged(partsFile, output);
  console.log(
    `Generated ${partsPath}: ${Object.keys(parts.components).length} components and ${Object.keys(parts.shared).length} shared groups.`,
  );
}
