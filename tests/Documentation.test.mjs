import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { compileDocument, readDocumentation } from '../scripts/GenerateDocumentation.mjs';

test('focused Markdown discovery preserves examples and rejects broken documentation', async () => {
  const cache = resolve('.cache');
  await mkdir(cache, { recursive: true });
  const fixture = await mkdtemp(join(cache, 'documentation-'));
  const index =
    '# envUI documentation\n\n## Actions\n\n- [Button](button.md) — Perform an action.\n';
  const example = '# Button\n\n## Example\n\n```tsx\n<Button>Save</Button>\n```\n';
  try {
    await writeFile(join(fixture, 'index.md'), index);
    await writeFile(join(fixture, 'button.md'), example);
    const [discovery, button] = readDocumentation(fixture);
    assert.equal(discovery.path, 'index.md');
    assert.equal(button.path, 'button.md');
    assert.equal(button.group, 'Actions');
    assert.ok(button.markdown.includes('```tsx\n<Button>Save</Button>\n```'));

    await writeFile(join(fixture, 'button.md'), example + '\n[Missing component](missing.md)\n');
    assert.throws(() => readDocumentation(fixture), /Broken documentation link/);
    await writeFile(join(fixture, 'button.md'), '# Different title\n');
    assert.throws(() => readDocumentation(fixture), /title differs/);
    await writeFile(join(fixture, 'index.md'), index.replace('button.md', '../outside.md'));
    assert.throws(() => readDocumentation(fixture), /escapes docs/);
  } finally {
    const contained = relative(cache, fixture);
    assert.ok(contained && !contained.startsWith('..') && !isAbsolute(contained));
    await rm(fixture, { recursive: true, force: true });
  }
});

const switchExample = [
  "import { Switch } from '@envsemble/envui';",
  '',
  'export default function Basic() {',
  '  return <Switch label="Alerts" />;',
  '}',
  '',
].join('\n');

const switchFrontmatter = [
  '---',
  'title: Switch',
  'summary: An on/off setting that applies at once.',
  'status: beta',
  'since: 0.1.0',
  'category: Forms & selection',
  'aliases: [toggle]',
  'useWhen: [A setting that applies immediately.]',
  'avoidWhen:',
  '  - text: A choice that applies on submit.',
  '    use: Checkbox',
  'related: []',
  'components: [Switch]',
  '---',
  '',
].join('\n');

const switchBody = [
  '# Switch',
  '',
  '## Overview',
  '',
  'Turns a setting on or off.',
  '',
  '## States and behaviour',
  '',
  '<!-- specimen: States -->',
  '',
  '## Accessibility',
  '',
  '### Keyboard',
  '',
  '| Key | Action |',
  '| --- | --- |',
  '| <kbd>Space</kbd> | Toggles the switch. |',
  '',
  '### envUI provides',
  '',
  '- The switch role.',
  '',
  '### You provide',
  '',
  '- A label.',
  '',
  '## Examples',
  '',
  '### Basic',
  '',
  'A labelled switch.',
  '',
  '```tsx example=Basic',
  '```',
  '',
  '## Changelog',
  '',
  '- 0.1.0: Added.',
  '',
].join('\n');

const switchProps = {
  exports: {
    Switch: {
      kind: 'component',
      source: 'packages/ui/src/forms/Switch.tsx',
      description: 'An on/off setting.',
      props: [
        { name: 'label', type: 'ReactNode', required: true, description: 'Visible label.' },
        { name: 'size', type: "'sm' | 'md'", required: false, default: "'md'", description: '' },
      ],
      native: ['input'],
      entries: ['@envsemble/envui'],
    },
    Checkbox: {
      kind: 'component',
      source: '',
      description: '',
      props: [],
      native: [],
      entries: [],
    },
  },
};

/** A docs/ folder with one component page, its example and specimen files and stand-in props. */
async function templateFixture(run) {
  const cache = resolve('.cache');
  await mkdir(cache, { recursive: true });
  const fixture = await mkdtemp(join(cache, 'template-'));
  const docs = join(fixture, 'docs');
  const examples = join(fixture, 'examples');
  const specimens = join(fixture, 'specimens');
  await mkdir(join(docs, 'components'), { recursive: true });
  await mkdir(join(examples, 'switch'), { recursive: true });
  await mkdir(join(specimens, 'switch'), { recursive: true });
  await writeFile(
    join(docs, 'index.md'),
    '# envUI documentation\n\n## Forms & selection\n\n- [Switch](components/switch.md)\n',
  );
  await writeFile(join(examples, 'switch', 'Basic.tsx'), switchExample);
  await writeFile(join(specimens, 'switch', 'States.tsx'), 'export default function States() {}\n');
  const page = join(docs, 'components', 'switch.md');
  const read = () => readDocumentation(docs, { props: switchProps, examples, specimens });
  try {
    await run({ page, read, examples });
  } finally {
    const contained = relative(cache, fixture);
    assert.ok(contained && !contained.startsWith('..') && !isAbsolute(contained));
    await rm(fixture, { recursive: true, force: true });
  }
}

test('a page on the template is split into sections, examples and specimens', async () => {
  await templateFixture(async ({ page, read, examples }) => {
    await writeFile(page, switchFrontmatter + switchBody);
    const documents = read();
    const switchPage = documents[1];
    assert.deepEqual(
      switchPage.sections.map((section) => section.id),
      ['overview', 'states', 'accessibility', 'examples', 'changelog'],
    );
    const blocks = switchPage.sections.flatMap((section) => section.blocks);
    assert.ok(blocks.some((block) => block.kind === 'specimen' && block.name === 'States'));
    assert.ok(blocks.some((block) => block.kind === 'example' && block.name === 'Basic'));
    assert.equal(switchPage.summary, 'An on/off setting that applies at once.');

    // The packaged page: examples filled in, specimens left out, props and related generated.
    const compiled = compileDocument(switchPage, documents, { props: switchProps, examples });
    assert.match(compiled, /^---\ntitle: Switch\n/);
    assert.ok(compiled.includes(`\`\`\`tsx example=Basic\n${switchExample}\`\`\``));
    assert.doesNotMatch(compiled, /specimen/);
    assert.ok(
      compiled.includes(
        '## Props\n\n### Switch\n\nAn on/off setting.\n\n| Prop | Type | Default | Description |',
      ),
    );
    assert.ok(compiled.includes("| `size` | `'sm' \\| 'md'` | `'md'` |  |"));
    assert.ok(compiled.includes('| `label` (required) | `ReactNode` | — | Visible label. |'));
    assert.match(compiled, /Also accepts the native props of `<input>`/);
    assert.ok(compiled.indexOf('## Props') < compiled.indexOf('## Changelog'));
    const index = compileDocument(documents[0], documents, { props: switchProps, examples });
    assert.ok(
      index.includes('- [Switch](components/switch.md) — An on/off setting that applies at once.'),
    );
  });
});

test('the template rejects pages that break its contract', async () => {
  await templateFixture(async ({ page, read }) => {
    const rejects = async (source, pattern) => {
      await writeFile(page, source);
      assert.throws(read, pattern);
    };
    const body = switchBody;
    const frontmatter = switchFrontmatter;
    await rejects(frontmatter.replace('status: beta', 'status: ready') + body, /status must be/);
    await rejects(frontmatter.replace('since: 0.1.0\n', '') + body, /since is required/);
    await rejects(frontmatter.replace('title: Switch', 'title: Switch\nowner: me') + body, /owner/);
    await rejects(
      frontmatter.replace('category: Forms & selection', 'category: Actions') + body,
      /index lists it under/,
    );
    await rejects(frontmatter.replace('use: Checkbox', 'use: Toggle') + body, /no Toggle/);
    await rejects(frontmatter.replace('[Switch]', '[Switch, Toggle]') + body, /no Toggle/);
    await rejects(
      frontmatter.replace('[A setting that applies immediately.]', '[]') + body,
      /useWhen must not be empty/,
    );
    await rejects(frontmatter + body.replace('## States and behaviour', '## Behaviour'), /not a/);
    await rejects(frontmatter + body.replace('## Changelog', '## Props'), /is generated/);
    await rejects(
      frontmatter + body.replace('## Changelog', '## Anatomy'),
      /must come before "## Examples"/,
    );
    await rejects(frontmatter + body.replace('### You provide', '### Notes'), /You provide/);
    await rejects(frontmatter + body.replace('| Key | Action |', '| Keys | Result |'), /"Key"/);
    await rejects(frontmatter + body.replace('example=Basic', 'example=Missing'), /has no file/);
    await rejects(
      frontmatter + body.replace('example=Basic\n```', 'example=Basic\n<Switch />\n```'),
      /must be empty/,
    );
    await rejects(frontmatter + body.replace('specimen: States', 'specimen: Matrix'), /no file/);
    await rejects(
      frontmatter +
        body.replace(
          'Turns a setting on or off.',
          '| Name | Contract |\n| --- | --- |\n| label | Text |',
        ),
      /lists props in a table/,
    );
    await rejects(frontmatter + body.replace('```tsx example=Basic', '```tsx'), /example file/);
    await writeFile(page, frontmatter + body);
    assert.doesNotThrow(read);
  });
});
