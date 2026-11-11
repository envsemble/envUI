// Generates docs/generated/parts.json, the public part contract: for each component its root class,
// its parts (class names with a one-line description) and its state attributes (`data-*`) with
// their values. The manifest, the docs' anatomy figures and dev mode read it.
//
//   node scripts/docs/GenerateParts.ts           rewrite docs/generated/parts.json
//   node scripts/docs/GenerateParts.ts --check [--base <ref>]
//                                            fail when it differs from its sources, or when a part
//                                            or state the base branch lists has gone without a
//                                            major changeset of @envsemble/envui that names it
//                                            (a value with its attribute). The base is --base, else
//                                            ENVUI_BASE, else the first of the check tiers' default
//                                            bases whose merge-base has the file.
//
// What it derives from the library's source (packages/ui/src):
// - the part classes: the `env-*` literals in class names (`className`, `classNames(…)`, a `class`
//   property, a variable named for a class), with `env-x-${value}` expanded over the value's type;
// - the state attributes: `data-*` attributes set in JSX on an element with a part class, their
//   values from the attribute's type, and the `[data-*]` selectors that the style sheets
//   (src/styles) put on a part class, with the values they compare; their values completed from
//   what the component's modules write in objects of props and an element's dataset;
//   attributes named data-env-ssr-* are private and left out: server markup carries them only until
//   a component reads its layout in the browser; so is data-env-theme-switching, which a theme
//   switch sets on the themed root for a frame;
// - the components: every component and namespace the public entries export, whose parts are the
//   classes that start with `env-<its name in kebab case>`.
//
// What it merges from packages/ui/src/partDescriptions.json, written by hand: the description of every part,
// the root of a component whose root is not `env-<name>`, the shared groups (anatomy that several
// components render, such as the list row of menus and selects) and where a class goes when no
// name places it. A part without a description, or a description without a part, fails.
//
// The color properties: each component's public custom properties for its colors, such as
// --env-button-container, from `colors` in packages/ui/src/partDescriptions.json, with what each colors. Each
// must be registered in the style sheets as a property that doesn't inherit
// (`@property --env-… { syntax: '*'; inherits: false; }`), and every property registered so must
// be listed; they are public and versioned like the parts.
//
// The modules in scripts/docs/parts/ read the TypeScript and the style sheets, assemble the
// contract and compare it with the base branch's.
import { readIfExists, writeIfChanged } from '../build/GeneratedFiles.ts';
import { baseContract, baseOption, pendingChangesets } from './ContractHistory.ts';
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
      `[33mwarning: no part or state removal was checked: ${base.missing}. Fetch the integration branch, or pass --base <ref> or set ENVUI_BASE.[0m`,
    );
  } else {
    const removed = removedParts(base.contract, parts, pendingChangesets());
    const unrecorded = removed.filter((item) => !item.recorded);
    if (removed.length)
      console.log(
        `Gone since ${base.ref}:\n${removed.map((item) => `  ${item.label}${item.recorded ? ' (in a major changeset)' : ''}`).join('\n')}`,
      );
    if (unrecorded.length) {
      console.error(
        `Part classes, state attributes and color properties are public: one that goes is a breaking change. Name each one above that no major changeset of @envsemble/envui names (a value with its attribute) in such a changeset, with what replaces it.`,
      );
      process.exit(1);
    }
    console.log(
      `${partsPath} matches its sources, and every part or state gone since ${base.ref} is in a major changeset.`,
    );
  }
} else {
  writeIfChanged(partsFile, output);
  console.log(
    `Generated ${partsPath}: ${Object.keys(parts.components).length} components and ${Object.keys(parts.shared).length} shared groups.`,
  );
}
