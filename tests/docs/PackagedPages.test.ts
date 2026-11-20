import assert from 'node:assert/strict';
import { test } from 'node:test';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compileDocument, compileDocumentation } from '../../scripts/docs/Compiler.ts';
import { samplePage, switchBody, switchFrontmatter, switchProps } from './DocumentationSamples.ts';

test('a filled-in source keeps its fence closed, with backticks in its source', async () => {
  await samplePage(async ({ page, read, examples }) => {
    const source = "export default function Basic() {\n  return <Code>{'```'}</Code>;\n}\n";
    await writeFile(join(examples, 'switch', 'Basic.tsx'), source);
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

const hasLine = (text, line) => text.split('\n').includes(line);

test('Table ships each example once, by name in its frontmatter, its legends and keys, and no changelog', () => {
  const compiled = compileDocumentation();
  const table = compiled.get('components/table.md');
  assert.ok(hasLine(table, '  WorkItems: overview'));
  assert.ok(compiled.has('examples/table/WorkItems.tsx'));
  assert.doesNotMatch(table, /^`{3,}tsx (?:example|do|dont|anatomy|variants|figure|source)=/m);
  assert.ok(table.includes('\n### Sort by a column\n\nExample: SortableColumns.\n'));
  assert.doesNotMatch(table, /^### Loading$/m);
  assert.ok(hasLine(table, '1. **Region** (`env-table-region`)'));
  assert.match(table, /^\| <kbd>Home<\/kbd>, <kbd>End<\/kbd> on a resize handle +\| /m);
  assert.ok(hasLine(table, 'Native props: `<table>`.'));
  assert.doesNotMatch(table, /^## (?:Changelog|Related|Rules)$/m);
});

test('the Import names every export a page documents, one to a line where they are many', () => {
  const compiled = compileDocumentation();
  const button = compiled.get('components/button.md');
  assert.ok(
    button.includes(
      "### Import\n\n```tsx\nimport {\n  Button,\n  ButtonGroup,\n  ConfirmButton,\n  CopyButton,\n  IconButton,\n} from '@envsemble/envui';\n```",
    ),
  );
});

test('a page ships the whole file, in its order, with code once', () => {
  const compiled = compileDocumentation();
  const button = compiled.get('components/button.md');
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
  const headings = [...button.matchAll(/^## (.*)$/gm)].map(([, title]) => title);
  assert.deepEqual(headings, [
    'Variants',
    'Anatomy',
    'Behaviour',
    'Rules',
    'Compose',
    'Props',
    'Part names',
    'Color properties',
    'Strings',
  ]);
  assert.match(button, /^\| `messages\.confirmButton\.[a-z]\w*` \| /m);
  assert.ok(hasLine(button, '- `env-button`: The button.'));
  assert.match(button, /^- `--env-button-container`: /m);
  assert.ok(hasLine(button, 'Examples: NarrowActions, FillSidebar.'));
  assert.ok(hasLine(button, 'Example: OnePrimaryAction (do).'));
  assert.doesNotMatch(button, /^`{3,}tsx (?:figure|example|do|dont|anatomy|variants)=/m);
  assert.ok(hasLine(button, '1. **Container** (`env-button`)'));
  assert.match(button, /^Also `start`, `end`, `size`, .* as on Button\.$/m);
  const spacing = compiled.get('foundations/spacing.md');
  assert.ok(spacing.includes('\n1. **Tight, inside a group**: '));
  assert.ok(hasLine(spacing, 'examples: # Each file is examples/spacing/<Name>.tsx.'));
  assert.ok(hasLine(spacing, '  Grouping: example'));
  assert.ok(!hasLine(spacing, '  Shapes: example'));
  assert.ok(spacing.includes('\nExample: Grouping.\n\n1. **Tight, inside a group**: '));
  assert.ok(compiled.has('examples/spacing/Grouping.tsx'));
  assert.ok(spacing.includes('| `--env-space-4` '));
});
