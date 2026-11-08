// The pages as the package ships them (compileDocument and compileDocumentation).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compileDocument, compileDocumentation } from '../../scripts/docs/GenerateDocumentation.ts';
import {
  pageFixture,
  switchBody,
  switchFrontmatter,
  switchProps,
} from './DocumentationFixtures.mjs';

test('a filled-in source keeps its fence closed, with backticks in its source', async () => {
  await pageFixture(async ({ page, read, examples }) => {
    const source = "export default function Basic() {\n  return <Code>{'```'}</Code>;\n}\n";
    await writeFile(join(examples, 'switch', 'Basic.tsx'), source);
    // Text right after the empty fence, without a blank line.
    await writeFile(
      page,
      switchFrontmatter +
        switchBody.replace('```tsx source=Basic\n\n```\n', '```tsx source=Basic\n```\nAfter it.\n'),
    );
    const documents = read();
    const compiled = compileDocument(documents[1], documents, { props: switchProps, examples });
    assert.ok(compiled.includes(`\`\`\`\`tsx source=Basic\n${source}\`\`\`\`\nAfter it.\n`));
  });
});

/** Whether `text` has `line` as one whole line. */
const hasLine = (text, line) => text.split('\n').includes(line);

test('Table ships each example once, by name in its frontmatter, its rules and legends, and no changelog', () => {
  const compiled = compileDocumentation();
  const table = compiled.get('components/table.md');
  // Its examples are listed in the frontmatter, with their roles and captions, and still ship; a
  // run of figures is a line naming them; Compose keeps the code of its one source example.
  assert.ok(hasLine(table, '  ProjectStatus: overview'));
  assert.ok(compiled.has('examples/table/ProjectStatus.tsx'));
  assert.doesNotMatch(table, /^`{3,}tsx (?:example|do|dont|anatomy|variants|figure)=/m);
  assert.match(table, /^`{3,}tsx source=ProjectStatus$/m);
  assert.ok(hasLine(table, "Examples: NumbersAligned (do), NumbersUnaligned (don't)."));
  assert.ok(
    hasLine(
      table,
      '  NumbersAligned: { role: do, caption: "Numbers aligned to the end, so the digits line up down the column." }',
    ),
  );
  assert.ok(hasLine(table, '1. **Region** (`env-table-region`)'));
  assert.ok(hasLine(table, 'Native props: `<table>`.'));
  assert.doesNotMatch(table, /^## (?:Changelog|Related)/m);
});

test("the Import leads with the page's own export, and leaves a companion to the code that imports it", () => {
  const compiled = compileDocumentation();
  const button = compiled.get('components/button.md');
  assert.ok(
    button.includes("### Import\n\n```tsx\nimport { Button } from '@envsemble/envui';\n```"),
  );
  assert.ok(hasLine(button, "import { IconButton } from '@envsemble/envui';"));
  assert.ok(hasLine(button, "import { ButtonGroup } from '@envsemble/envui';"));
});

test('a page ships the whole file, in its order, with code once', () => {
  const compiled = compileDocumentation();
  const button = compiled.get('components/button.md');
  // The frontmatter lists every example once, with its role and caption, and what to use instead.
  assert.ok(hasLine(button, 'examples: # Each file is examples/button/<Name>.tsx.'));
  assert.ok(hasLine(button, '  CreateProject: overview'));
  assert.ok(
    hasLine(
      button,
      '  OnePrimaryAction: { role: do, caption: "One primary button per group, at the end of its actions." }',
    ),
  );
  assert.ok(hasLine(button, 'avoidWhen:'));
  assert.ok(compiled.has('examples/button/CreateProject.tsx'));
  // The sections in the catalogue's order, the plain ones first and Compose last, then the props.
  const headings = [...button.matchAll(/^## (.*)$/gm)].map(([, title]) => title);
  assert.deepEqual(headings, [
    'Variants',
    'Anatomy',
    'Behaviour',
    'Rules',
    'Accessibility',
    'Compose',
    'Props',
    'Part names',
    'Color properties',
    'Strings',
  ]);
  // Its strings are generated from envUI's messages, ConfirmButton's among them.
  assert.match(button, /^\| `messages\.confirmButton\.[a-z]\w*` \| /m);
  // The generated lists are the page's one list of its parts and color properties.
  assert.ok(hasLine(button, '- `env-button`: The button.'));
  assert.match(button, /^- `--env-button-container`: /m);
  // A run of figures is a line that names them; no figure's code ships in the page.
  assert.ok(
    hasLine(
      button,
      "Examples: OnePrimaryAction (do), SeveralPrimaryActions (don't), ExplainWhatIsMissing (do), DisabledUntilValid (don't).",
    ),
  );
  assert.doesNotMatch(button, /^`{3,}tsx (?:figure|example|do|dont|anatomy|variants)=/m);
  assert.ok(hasLine(button, '1. **Container** (`env-button`)'));
  assert.ok(hasLine(button, '### You provide'));
  assert.match(button, /^Also `end`, `size`, .* as on Button\.$/m);
  // A pattern's canonical example ships once, in full, in Compose.
  const forms = compiled.get('patterns/forms.md');
  assert.equal(forms.match(/^`{3,}tsx source=ErrorSummary$/gm)?.length, 1);
  // A foundation's figures are the catalogue's: their legends ship, and the frontmatter lists only
  // those with an example file, their code, which ships and is named before the legend.
  const spacing = compiled.get('foundations/spacing.md');
  assert.ok(spacing.includes('\n1. **Tight, inside a group**: '));
  assert.ok(hasLine(spacing, 'examples: # Each file is examples/spacing/<Name>.tsx.'));
  assert.ok(hasLine(spacing, '  Grouping: example'));
  assert.ok(!hasLine(spacing, '  Shapes: example'));
  assert.ok(spacing.includes('\nExample: Grouping.\n\n1. **Tight, inside a group**: '));
  assert.ok(compiled.has('examples/spacing/Grouping.tsx'));
  assert.ok(spacing.includes('\n| More room between these | The next larger step'));
});
