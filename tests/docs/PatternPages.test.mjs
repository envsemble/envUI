// Pattern pages, read and validated as their kind.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compileDocument } from '../../scripts/docs/GenerateDocumentation.ts';
import { pageFixture } from './DocumentationFixtures.mjs';

const lead = (name) =>
  `import { Switch } from '@envsemble/envui';\n\nexport default function ${name}() {\n  return <Switch label="Alerts" />;\n}\n`;

const patternFrontmatter = [
  '---',
  'title: Settings',
  'summary: Let people change how the application works for them.',
  'status: beta',
  'since: 0.2.0',
  'intent: Enter and change data',
  'aliases: [preferences]',
  'useWhen: [Someone changes a preference.]',
  'avoidWhen:',
  '  - text: A form submitted once.',
  '    see: switch',
  '  - text: A single choice.',
  '    use: Checkbox',
  'composes: [Switch]',
  'examples:',
  '  Lead: overview',
  '  Grouped: example',
  '  SavedAtOnce: example',
  '---',
  '',
].join('\n');

const patternBody = [
  '# Settings',
  '',
  '## Behaviour',
  '',
  '### Saved at once',
  '',
  'Each change applies at once.',
  '',
  '```tsx figure=SavedAtOnce',
  '```',
  '',
  '## Rules',
  '',
  'Name the setting, not the action.',
  '',
  '```tsx figure=Grouped',
  '```',
  '',
  '## Accessibility',
  '',
  '### Focus and keyboard',
  '',
  'Focus stays on the switch.',
  '',
  '### envUI provides',
  '',
  '- The switch role.',
  '',
  '### You provide',
  '',
  '- A label.',
  '',
].join('\n');

/** A docs/ folder with a component and a pattern page and their example files. */
async function compositionFixture(run) {
  await pageFixture(async ({ read, examples, docs }) => {
    await mkdir(join(docs, 'patterns'), { recursive: true });
    await writeFile(
      join(docs, 'index.md'),
      [
        '# envUI documentation',
        '',
        '## Forms & selection',
        '',
        '- [Switch](components/switch.md)',
        '',
        '## Patterns',
        '',
        '- [Settings](patterns/settings.md)',
        '',
      ].join('\n'),
    );
    await mkdir(join(examples, 'settings'), { recursive: true });
    for (const name of ['Lead', 'Grouped', 'SavedAtOnce'])
      await writeFile(join(examples, 'settings', `${name}.tsx`), lead(name));
    const pattern = join(docs, 'patterns', 'settings.md');
    await writeFile(pattern, patternFrontmatter + patternBody);
    await run({ pattern, read, examples, docs });
  });
}

test('pattern pages are read into sections and examples', async () => {
  await compositionFixture(async ({ read, examples }) => {
    const documents = read();
    const settings = documents.find((document) => document.id === 'settings');
    assert.deepEqual(
      settings.sections.map((section) => section.id),
      ['overview', 'behaviour', 'rules', 'accessibility', 'code'],
    );
    const blocks = settings.sections.flatMap((section) => section.blocks);
    assert.equal(blocks.filter((block) => block.kind === 'example').length, 3);
    // The packaged page names each example; its files ship beside it.
    const compiled = compileDocument(settings, documents, { examples });
    assert.ok(compiled.includes('\nExample: SavedAtOnce.\n'));
    assert.ok(compiled.includes("import { Switch } from '@envsemble/envui';"));
    assert.doesNotMatch(compiled, /## Props/);
  });
});

test('pattern pages are validated as their kind', async () => {
  await compositionFixture(async ({ pattern, read, docs }) => {
    const rejects = async (file, source, expected) => {
      await writeFile(file, source);
      assert.throws(read, expected);
    };
    const p = patternFrontmatter;
    const withComposes = (list) => p.replace('composes: [Switch]', `composes: ${list}`);
    // Frontmatter: the fields of the kind, with values from their lists and names that exist.
    await rejects(pattern, p.replace(/intent: .*\n/, '') + patternBody, /intent is required/);
    await rejects(
      pattern,
      p.replace('intent: Enter', 'intent: Gather') + patternBody,
      /intent must be one of/,
    );
    await rejects(pattern, withComposes('[Toggle]') + patternBody, /no Toggle/);
    await rejects(pattern, withComposes('[]') + patternBody, /composes must not be empty/);
    await rejects(
      pattern,
      withComposes('[Switch, Menu.Item]') + patternBody,
      /composes lists Menu\.Item, a part/,
    );
    await rejects(
      pattern,
      p.replace('status: beta', 'status: beta\ncategory: Actions') + patternBody,
      /unknown field category/,
    );
    await rejects(
      pattern,
      p.replace('see: switch', 'see: nowhere') + patternBody,
      /nowhere in avoidWhen, which is not an indexed page/,
    );
    await rejects(
      pattern,
      p.replace('see: switch', 'see: settings') + patternBody,
      /the page itself/,
    );
    await rejects(
      pattern,
      p.replace('    see: switch', '    see: switch\n    use: Switch') + patternBody,
      /\{ text, see \}/,
    );
    // The structure is the same as a component's.
    await rejects(
      pattern,
      p + patternBody.replace('## Rules', '## Content guidelines'),
      /"## Content guidelines" is not a section of a pattern page/,
    );
    await rejects(
      pattern,
      p.replace('  Lead: overview', '  Lead: example') +
        patternBody.replace('## Accessibility', '```tsx figure=Lead\n```\n\n## Accessibility'),
      /lists no overview example/,
    );
    await rejects(
      pattern,
      p.replace(/examples:\n[\s\S]*?(?=---)/, '') + patternBody,
      /patterns\/settings\.md is not in the one-file structure/,
    );
    await rejects(
      pattern,
      p + patternBody.replace('figure=Grouped', 'figure=Grouped layout=app'),
      /example Grouped takes no layout/,
    );
    await rejects(pattern, patternBody, /Pattern page patterns\/settings\.md needs frontmatter/);
    await writeFile(pattern, patternFrontmatter + patternBody);
    // The summary lives in the frontmatter only.
    const index = join(docs, 'index.md');
    const source = await readFile(index, 'utf8');
    await rejects(
      index,
      source.replace('(patterns/settings.md)', '(patterns/settings.md) — Settings.'),
      /repeats a summary/,
    );
    // Each page's folder matches the index section that lists it.
    await rejects(
      index,
      source.replace('## Forms & selection', '## Patterns'),
      /components\/switch\.md is a component page.*under "## Patterns"; move it to docs\/patterns/,
    );
    await rejects(
      index,
      source.replace('## Patterns', '## Actions'),
      /patterns\/settings\.md is a pattern page.*under "## Actions"; list it under "## Patterns"/,
    );
    await writeFile(index, source);
    assert.doesNotThrow(read);
  });
});
