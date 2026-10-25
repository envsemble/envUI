import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cp, mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute } from 'node:path';
import {
  compileDocument,
  compileDocumentation,
  leanPages,
  libraryVersions,
  readDocumentation,
} from '../scripts/GenerateDocumentation.mjs';
import { marked } from 'marked';
import {
  longParagraphs,
  optionPieces,
  optionTable,
  optionTableProblems,
  paragraphLength,
  siteStructure,
} from '../scripts/SiteContent.mjs';

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
    // A link to a heading must name one the page has, as the catalogue gives it its id.
    await writeFile(join(fixture, 'button.md'), example + '\n[The example](#example)\n');
    assert.equal(readDocumentation(fixture).length, 2);
    await writeFile(
      join(fixture, 'button.md'),
      `# Button\n\n## Größe\n\n[Size](#gr%C3%B6%C3%9Fe)\n`,
    );
    assert.equal(readDocumentation(fixture).length, 2);
    await writeFile(join(fixture, 'button.md'), example + '\n[An example](#examples)\n');
    assert.throws(() => readDocumentation(fixture), /names no heading of button\.md/);
    await writeFile(join(fixture, 'index.md'), index + '\nSee [its example](button.md#example).\n');
    await writeFile(join(fixture, 'button.md'), example);
    assert.equal(readDocumentation(fixture).length, 2);
    await writeFile(join(fixture, 'index.md'), index + '\nSee [its example](button.md#usage).\n');
    assert.throws(() => readDocumentation(fixture), /names no heading of button\.md/);
    await writeFile(join(fixture, 'index.md'), index);
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
  const versions = new Set(['0.1.0', '0.2.0']);
  const read = () => readDocumentation(docs, { props: switchProps, examples, specimens, versions });
  try {
    await run({ page, read, examples, docs });
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

    // The packaged page: examples filled in, specimens left out, props and related generated.
    const compiled = compileDocument(switchPage, documents, { props: switchProps, examples });
    assert.ok(compiled.includes(`\`\`\`tsx example=Basic\n${switchExample}\`\`\``));
    assert.doesNotMatch(compiled, /specimen/);
    // Related, from avoidWhen: each export or page with when to pick it.
    assert.match(compiled, /## Related\n\n- `Checkbox`: A choice that applies on submit\.\n/);
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
    // Metadata that says nothing or points nowhere. avoidWhen is the one list of related pages:
    // each entry names an export or a page, once.
    await rejects(
      frontmatter.replace(
        '    use: Checkbox',
        '    use: Checkbox\n  - text: Another.\n    use: Checkbox',
      ) + body,
      /names Checkbox twice/,
    );
    await rejects(
      frontmatter.replace('    use: Checkbox\n', '') + body,
      /avoidWhen must be a list/,
    );
    await rejects(
      frontmatter.replace('components: [Switch]', 'components: [Switch]\nrelated: [checkbox]') +
        body,
      /unknown field related/,
    );
    await rejects(frontmatter.replace('aliases: [toggle]', 'aliases: []') + body, /aliases must/);
    await rejects(frontmatter.replace('since: 0.1.0', 'since: 9.9.9') + body, /since 9\.9\.9/);
    // statuses: an export's own status, which differs from the page's and names a listed export.
    const statuses = (lines) =>
      frontmatter.replace('components: [Switch]', `components: [Switch]\nstatuses:${lines}`) + body;
    await rejects(statuses(' [beta]'), /statuses must map an export to its status/);
    await rejects(statuses('\n  Toggle: stable'), /statuses names Toggle, which components/);
    await rejects(statuses('\n  Switch: ready'), /statuses of Switch must be one of/);
    await rejects(statuses('\n  Switch: beta'), /statuses of Switch repeats the page's status/);
    await writeFile(page, statuses('\n  Switch: stable'));
    assert.deepEqual(read()[1].frontmatter.statuses, { Switch: 'stable' });
    await rejects(
      frontmatter.replace('components: [Switch]', 'components: [Switch, Menu.Item]') + body,
      /Menu\.Item, a part/,
    );
    // Lists, props and headings the template generates or needs in Markdown.
    await rejects(
      frontmatter +
        body.replace('### envUI provides\n\n- The switch role.\n', '### envUI provides\n'),
      /"### envUI provides" list/,
    );
    await rejects(
      frontmatter +
        body.replace('## Changelog', '| Option | Type |\n| --- | --- |\n| a | b |\n\n## Changelog'),
      /lists props in a table/,
    );
    await rejects(
      frontmatter + body.replace('## Changelog', '#### Props\n\nsize is sm or md.\n\n## Changelog'),
      /"#### Props" lists props by hand/,
    );
    await rejects(
      frontmatter + body.replace('## Changelog', '<h2>Notes</h2>\n\n## Changelog'),
      /headings in Markdown/,
    );
    // A page with the template's parts that does not start with its Overview.
    await rejects(
      frontmatter +
        body.replace(
          '## Overview\n\nTurns a setting on or off.\n\n',
          '## Usage\n\nTurns a setting on or off.\n\n',
        ),
      /first section must be "## Overview", not "## Usage"/,
    );
    // Saved with CRLF line endings, the page reads as it does with LF.
    await writeFile(page, (frontmatter + body).replaceAll('\n', '\r\n'));
    assert.deepEqual(
      read()[1].sections.map((section) => section.id),
      ['overview', 'states', 'accessibility', 'examples', 'changelog'],
    );
    await writeFile(page, frontmatter + body);
    assert.doesNotThrow(read);
  });
});

test('a page not yet on the template ships its own props table only', async () => {
  await templateFixture(async ({ page, read, examples }) => {
    const legacy = switchFrontmatter.replace(/useWhen:[\s\S]*?(?=components:)/, '');
    await writeFile(
      page,
      `${legacy}# Switch\n\n## React usage\n\n### Props & contracts\n\n| Name | Contract |\n| --- | --- |\n| label | The visible label. |\n`,
    );
    const documents = read();
    assert.equal(documents[1].sections, undefined);
    const compiled = compileDocument(documents[1], documents, { props: switchProps, examples });
    assert.doesNotMatch(compiled, /## Props\n/);
  });
});

test('a filled-in example keeps its fence closed, with backticks in its source', async () => {
  await templateFixture(async ({ page, read, examples }) => {
    const source = "export default function Basic() {\n  return <Code>{'```'}</Code>;\n}\n";
    await writeFile(join(examples, 'switch', 'Basic.tsx'), source);
    // Text right after the empty fence, without a blank line.
    await writeFile(
      page,
      switchFrontmatter +
        switchBody.replace(
          '```tsx example=Basic\n```\n',
          '```tsx example=Basic\n```\nAfter the example.\n',
        ),
    );
    const documents = read();
    const compiled = compileDocument(documents[1], documents, { props: switchProps, examples });
    assert.ok(
      compiled.includes(`\`\`\`\`tsx example=Basic\n${source}\`\`\`\`\nAfter the example.\n`),
    );
  });
});

test('since names a stable release or the version the changesets lead to, also in prerelease mode', async () => {
  const cache = resolve('.cache');
  await mkdir(cache, { recursive: true });
  const fixture = await mkdtemp(join(cache, 'versions-'));
  const changelog = join(fixture, 'CHANGELOG.md');
  const changesets = join(fixture, 'changeset');
  const changeset = (name, packages) =>
    writeFile(
      join(changesets, `${name}.md`),
      `---\n${Object.entries(packages)
        .map(([pkg, bump]) => `'${pkg}': ${bump}`)
        .join('\n')}\n---\n\nA change.\n`,
    );
  const versions = () => [...libraryVersions({ changelog, changesets })].sort();
  try {
    await mkdir(changesets);
    await writeFile(
      join(changesets, 'config.json'),
      JSON.stringify({ fixed: [['@envsemble/envui', '@envsemble/envui-codemods']] }),
    );
    await writeFile(changelog, '# Changelog\n\n## 0.7.0\n\nText.\n\n## 0.6.0\n\nText.\n');
    await changeset('fix', { '@envsemble/envui': 'patch' });
    assert.deepEqual(versions(), ['0.6.0', '0.7.0', '0.7.1']);
    // A package that shares envUI's version raises it too.
    await changeset('codemods', { '@envsemble/envui-codemods': 'minor' });
    assert.deepEqual(versions(), ['0.6.0', '0.7.0', '0.8.0']);
    // In prerelease mode, a released prerelease is no version of its own, and the changesets lead
    // to the version the prereleases are for, from the version before them.
    await changeset('names', { '@envsemble/envui': 'major' });
    await writeFile(
      join(changesets, 'pre.json'),
      JSON.stringify({
        mode: 'pre',
        tag: 'next',
        initialVersions: { '@envsemble/envui': '0.7.0' },
      }),
    );
    await writeFile(changelog, '# Changelog\n\n## 1.0.0-next.0\n\nText.\n\n## 0.7.0\n\nText.\n');
    assert.deepEqual(versions(), ['0.7.0', '1.0.0']);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('the template rules read Markdown as it renders', async () => {
  await templateFixture(async ({ page, read }) => {
    const accepts = async (source) => {
      await writeFile(page, source);
      assert.doesNotThrow(read);
    };
    // Tables of attributes and a section on forwarding props are not props tables.
    await accepts(
      switchFrontmatter +
        switchBody.replace(
          'Turns a setting on or off.',
          '### Props forwarding\n\nOther props go to the input.\n\n| Attribute | Values |\n| --- | --- |\n| role | switch |\n\nTurns a setting on or off.',
        ),
    );
    const legacy = switchFrontmatter.replace(/useWhen:[\s\S]*?(?=components:)/, '');
    // An example fence shown inside another fence is text, not an example.
    await accepts(
      `${legacy}# Switch\n\n## React usage\n\n\`\`\`\`md\n\`\`\`tsx example=Basic\n\`\`\`\n\`\`\`\`\n`,
    );
    // An example fence indented by up to three spaces is one.
    await writeFile(
      page,
      `${legacy}# Switch\n\n## React usage\n\n  \`\`\`tsx example=Basic\n  \`\`\`\n`,
    );
    assert.throws(read, /first section must be "## Overview", not "## React usage"/);
  });
});

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
  '---',
  '',
].join('\n');

const patternBody = [
  '# Settings',
  '',
  '## Overview',
  '',
  'Use this pattern to let people change a preference.',
  '',
  '```tsx example=Lead',
  '```',
  '',
  '## Anatomy',
  '',
  '1. A Switch per setting.',
  '',
  '## Content guidelines',
  '',
  'Name the setting, not the action.',
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
  '## Examples',
  '',
  '### Grouped',
  '',
  'Settings in groups.',
  '',
  '```tsx example=Grouped',
  '```',
  '',
  '### Saved at once',
  '',
  'Each change applies at once.',
  '',
  '```tsx example=SavedAtOnce',
  '```',
  '',
].join('\n');

/** A docs/ folder with a component and a pattern page and their example files. */
async function compositionFixture(run) {
  await templateFixture(async ({ page, read, examples, docs }) => {
    await writeFile(page, switchFrontmatter + switchBody);
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
    for (const [folder, names] of [['settings', ['Lead', 'Grouped', 'SavedAtOnce']]]) {
      await mkdir(join(examples, folder), { recursive: true });
      for (const name of names) await writeFile(join(examples, folder, `${name}.tsx`), lead(name));
    }
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
      ['overview', 'anatomy', 'content', 'accessibility', 'examples'],
    );
    const blocks = settings.sections.flatMap((section) => section.blocks);
    assert.equal(blocks.filter((block) => block.kind === 'example').length, 3);
    // The packaged page fills in every example's source.
    const compiled = compileDocument(settings, documents, { examples });
    assert.ok(compiled.includes(`\`\`\`tsx example=Lead\n${lead('Lead')}\`\`\``));
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
    await writeFile(pattern, patternFrontmatter + patternBody);
    // Sections: the subset of the kind, with the ones it needs.
    await rejects(
      pattern,
      p + patternBody.replace('## Content guidelines', '## Variants and sizes'),
      /not a template section of a pattern page/,
    );
    await rejects(
      pattern,
      p + patternBody.replace('## Anatomy\n\n1. A Switch per setting.\n\n', ''),
      /"## Anatomy" is required/,
    );
    await rejects(
      pattern,
      p + patternBody.replace(/### Saved at once[\s\S]*$/, ''),
      /at least 3 example files, .* it has 2/,
    );
    await rejects(
      pattern,
      p + patternBody.replace('```tsx example=Lead\n```\n', ''),
      /shows the lead example/,
    );
    await rejects(
      pattern,
      p + patternBody.replace('example=Grouped', 'template=Grouped'),
      /the fence `tsx template=Grouped` is malformed/,
    );
    await rejects(
      pattern,
      p +
        patternBody.replace(
          '# Settings\n\n## Overview',
          '# Settings\n\n## Anatomy\n\nx\n\n## Overview',
        ),
      /is a pattern page, on the page template/,
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
    // A fence that names a file but doesn't parse is an error, not a code block.
    await rejects(
      pattern,
      patternFrontmatter + patternBody.replace('example=Grouped', 'example=Grouped layout=app'),
      /the fence `tsx example=Grouped layout=app` is malformed/,
    );
    await writeFile(pattern, patternFrontmatter + patternBody);
    assert.doesNotThrow(read);
  });
});

/** A Switch page on the figure template: short text, live figures and a legend. */
const figureBody = [
  '# Switch',
  '',
  '## Overview',
  '',
  'Turns a setting on or off.',
  '',
  '```tsx example=Basic',
  '',
  '```',
  '',
  '## When to use',
  '',
  '```tsx do=Instant caption="Use a switch for a setting that applies at once."',
  '',
  '```',
  '',
  '```tsx dont=OnSubmit open stage=shaded caption="Don\'t use a switch in a form that applies on submit."',
  '',
  '```',
  '',
  '### Labels',
  '',
  'Name the setting, not the action.',
  '',
  '## Anatomy',
  '',
  '```tsx anatomy=Parts',
  '',
  '```',
  '',
  '1. **Track** (`env-switch`): the pill.',
  '2. **Thumb** (`env-switch-input`)',
  '',
  '## Adapting to width',
  '',
  '```tsx example=Narrow widths="16 30" stage=shaded',
  '',
  '```',
  '',
  '## Accessibility',
  '',
  '### envUI provides',
  '',
  '- The switch role.',
  '',
  '### You provide',
  '',
  '- A label.',
  '',
  '## Changelog',
  '',
  '- **0.1.0**: Switch.',
  '',
].join('\n');

test('a component page with a When to use section is on the figure template', async () => {
  await templateFixture(async ({ page, read, examples }) => {
    for (const name of ['Instant', 'OnSubmit', 'Parts', 'Narrow'])
      await writeFile(join(examples, 'switch', `${name}.tsx`), switchExample);
    await writeFile(page, switchFrontmatter + figureBody);
    const documents = read();
    const switchPage = documents[1];
    assert.equal(switchPage.format, 'figures');
    assert.deepEqual(
      switchPage.sections.map((section) => section.id),
      ['overview', 'usage', 'anatomy', 'width', 'accessibility', 'code', 'changelog'],
    );
    const blocks = switchPage.sections.flatMap((section) => section.blocks);
    const figure = (name) => blocks.find((block) => block.name === name);
    assert.deepEqual(
      [figure('Instant').role, figure('Instant').caption],
      ['do', 'Use a switch for a setting that applies at once.'],
    );
    assert.equal(
      figure('OnSubmit').heading,
      "Don't: Don't use a switch in a form that applies on submit.",
    );
    assert.deepEqual(figure('Parts').legend, [
      { part: 'env-switch', text: '**Track** (`env-switch`): the pill.', name: 'Track' },
      { part: 'env-switch-input', text: '**Thumb** (`env-switch-input`)', name: 'Thumb' },
    ]);
    assert.deepEqual(figure('Narrow').widths, [16, 30]);
    // The flag open shows the example's overlays open; other figures leave it out.
    assert.equal(figure('OnSubmit').open, true);
    assert.equal(figure('Instant').open, undefined);
    // stage=shaded fills the stage with a shade darker than the page's and the navigation's;
    // other figures keep the page's.
    assert.equal(figure('OnSubmit').stage, 'shaded');
    assert.equal(figure('Narrow').stage, 'shaded');
    assert.equal(figure('Instant').stage, undefined);

    // The packaged page keeps the figures' kinds and attributes, and the legend.
    const compiled = compileDocument(switchPage, documents, { props: switchProps, examples });
    assert.match(compiled, /^### Labels$/m);
    assert.ok(
      compiled.includes(
        `\`\`\`tsx do=Instant caption="Use a switch for a setting that applies at once."\n${switchExample}\`\`\``,
      ),
    );
    assert.ok(
      compiled.includes('```tsx dont=OnSubmit open stage=shaded caption="Don\'t use a switch'),
    );
    assert.match(
      compiled,
      /```\n\n1\. \*\*Track\*\* \(`env-switch`\): the pill\.\n2\. \*\*Thumb\*\* \(`env-switch-input`\)\n/,
    );
    assert.ok(compiled.indexOf('## Accessibility') < compiled.indexOf('## Props'));
  });
});

test('a page on the figure template rejects what breaks its form', async () => {
  await templateFixture(async ({ page, read, examples, docs }) => {
    for (const name of ['Instant', 'OnSubmit', 'Parts', 'Narrow'])
      await writeFile(join(examples, 'switch', `${name}.tsx`), switchExample);
    const rejects = async (body, pattern) => {
      await writeFile(page, switchFrontmatter + body);
      assert.throws(read, pattern);
    };
    const body = figureBody;
    await rejects(
      body.replace('Name the setting, not the action.', '> How do I label it?'),
      /When to use has a blockquote/,
    );
    await rejects(
      body.replace(' caption="Use a switch for a setting that applies at once."', ''),
      /do Instant needs caption/,
    );
    // An option table, whose last column is Use for, shows on the Site as a legend of tags: each
    // names its option in a few plain words, once, and says what it is for.
    const options = (rows) =>
      body.replace(
        'Name the setting, not the action.',
        `Name the setting, not the action.\n\n| Size | Use for |\n| ---- | ------- |\n${rows}\n`,
      );
    await rejects(
      options('| [Small](#small) | A dense list. |'),
      /When to use: row 1 of the Size table names its option with a link/,
    );
    await rejects(
      options('| Small | A dense list. |\n| Small | A table. |'),
      /row 2 of the Size table names Small again/,
    );
    await rejects(options('| Small |  |'), /row 1 of the Size table says nothing under Use for/);
    await rejects(
      options('| The small one, for dense lists. | A dense list. |'),
      /names its option "The small one, for dense lists\.": a name of a few words/,
    );
    await writeFile(page, switchFrontmatter + options('| Small | A dense list. |'));
    assert.doesNotThrow(read);
    await rejects(body.replace('widths="16 30"', 'widths="wide"'), /widths="wide"/);
    await rejects(
      body.replace('anatomy=Parts', 'anatomy=Parts size=lg'),
      /anatomy Parts takes no size/,
    );
    await rejects(
      body.replace('dont=OnSubmit open stage=shaded', 'dont=OnSubmit open=yes'),
      /write the flag open alone/,
    );
    await rejects(body.replace('anatomy=Parts', 'anatomy=Parts of'), /has of without a value/);
    await rejects(body.replace('stage=shaded caption', 'stage=dark caption'), /has stage="dark"/);
    // The page's own fill is the default, and a figure is always on a stage.
    for (const fill of ['raised', 'none'])
      await rejects(
        body.replace('stage=shaded caption', `stage=${fill} caption`),
        new RegExp(`has stage="${fill}"`),
      );
    // A double quote inside a caption, escaped or not, is pointed at rather than called malformed.
    for (const quote of ['"', '\\"'])
      await rejects(
        body.replace('applies at once.', `says ${quote}Save${quote}.`),
        /the caption of the fence `tsx do=Instant caption="Use a switch for a setting that says "Save"\."` has a double quote inside it, at `"Save"\."`/,
      );
    await rejects(
      body.replace('2. **Thumb** (`env-switch-input`)', '2. The thumb.'),
      /item 2 of the legend of anatomy Parts names no part/,
    );
    await rejects(
      body.replace('## Adapting to width', '## Width'),
      /not a section of a component page/,
    );
    await rejects(
      body.replace(/## When to use[\s\S]*?(?=## Anatomy)/, ''),
      /a page on the figure template has a "## When to use" section/,
    );
    await rejects(
      body.replace('## Changelog', '## Variants\n\nOne size.\n\n## Changelog'),
      /"## Variants" must come before "## Accessibility"/,
    );
    await rejects(body.replace('example=Basic', 'example=Missing'), /has no file/);
    // A legend names parts that exist, and a figure without one names a component with parts.
    await rejects(
      body.replace('2. **Thumb** (`env-switch-input`)', '2. `env-switch-knob`'),
      /names env-switch-knob, which neither packages\/ui's CSS nor docs\/generated\/parts\.json has/,
    );
    // A variants figure names each variant in bold, in a legend it can't do without.
    const variants = body.replace('anatomy=Parts', 'variants=Parts');
    await rejects(variants.replace('1. **Track** (`env-switch`)', '1. Track'), /in bold/);
    await rejects(
      variants.replace(/1\. \*\*Track\*\*.*\n2\. \*\*Thumb\*\*.*\n/, ''),
      /variants Parts has no legend/,
    );
    const withoutLegend = body.replace(/1\. \*\*Track\*\*.*\n2\. \*\*Thumb\*\*.*\n/, '');
    await rejects(
      withoutLegend,
      /anatomy Parts has no legend, and docs\/generated\/parts\.json lists no parts of Switch/,
    );
    await rejects(
      withoutLegend.replace('anatomy=Parts', 'anatomy=Parts of=Toggle'),
      /lists no parts of Toggle$/m,
    );
    await mkdir(join(docs, 'generated'), { recursive: true });
    await writeFile(
      join(docs, 'generated', 'parts.json'),
      JSON.stringify({
        schemaVersion: 1,
        components: {
          Switch: {
            root: 'env-switch',
            source: 'Switch.tsx',
            parts: [{ class: 'env-switch-knob', description: 'The knob.' }],
            states: [],
          },
        },
        shared: {},
      }),
    );
    await writeFile(
      page,
      switchFrontmatter + withoutLegend.replace('`env-switch-input`', '`env-switch-knob`'),
    );
    assert.doesNotThrow(read);
    // A section-template page that borrows a figure-template section is told what makes one.
    await rejects(
      switchBody.replace('## States and behaviour', '## Adapting to width'),
      /a page on the figure template has a "## When to use" section/,
    );
  });
});

/** A developer-only part: "## In code" with its usage, an example file shown as code. */
const inCode = [
  '## In code',
  '',
  '### Usage',
  '',
  'Give every switch a `label`.',
  '',
  '```tsx source=Basic',
  '',
  '```',
  '',
  '### Customize',
  '',
  '`--env-switch-track` sets the track.',
  '',
  '',
].join('\n');

test('"## In code" is the developer-only part, opened by the generated Import', async () => {
  await templateFixture(async ({ page, read, examples }) => {
    for (const name of ['Instant', 'OnSubmit', 'Parts', 'Narrow'])
      await writeFile(join(examples, 'switch', `${name}.tsx`), switchExample);
    await writeFile(
      page,
      switchFrontmatter + figureBody.replace('## Changelog', `${inCode}## Changelog`),
    );
    const documents = read();
    const switchPage = documents[1];
    const code = switchPage.sections.find((section) => section.id === 'code');
    assert.deepEqual(
      code.blocks.map((block) => block.kind),
      ['markdown', 'source', 'markdown'],
    );
    assert.match(
      code.blocks[0].markdown,
      /^## In code\n\n### Import\n\n```tsx\nimport \{ Switch \} from '@envsemble\/envui';\n```\n\n### Usage\n/,
    );
    assert.deepEqual(code.blocks[1], { kind: 'source', name: 'Basic' });
    // The packaged page keeps it, with the example's source filled in, before the props.
    const compiled = compileDocument(switchPage, documents, { props: switchProps, examples });
    assert.ok(compiled.includes(`\`\`\`tsx source=Basic\n${switchExample}\`\`\``));
    assert.ok(compiled.indexOf('## Accessibility') < compiled.indexOf('## In code'));
    assert.ok(compiled.indexOf('## In code') < compiled.indexOf('## Props'));

    const rejects = async (part, pattern) => {
      await writeFile(
        page,
        switchFrontmatter + figureBody.replace('## Changelog', `${part}## Changelog`),
      );
      assert.throws(read, pattern);
    };
    await rejects(
      inCode.replace('### Usage', '### Import'),
      /"### Import" of "## In code" is generated/,
    );
    await rejects(
      inCode.replace('### Usage', '### Recipes'),
      /"### Recipes" is not a subsection of "## In code"/,
    );
    await rejects(inCode.replace('### Usage\n', ''), /"## In code" starts with a "###" subsection/);
    await rejects(
      inCode.replace('### Customize', '### Composition').replace('### Usage', '### Customize'),
      /"### Composition" must come before "### Customize"/,
    );
    await rejects(
      inCode.replace('### Usage', '### Composition'),
      /"## In code" needs a "### Usage" subsection/,
    );
    await rejects(inCode.replace('source=Basic', 'source=Missing'), /source Missing has no file/);
    await rejects(
      inCode.replace('source=Basic', 'example=Basic'),
      /"## In code" shows code, not figures/,
    );
    // An example's source as code belongs in "## In code" only.
    await writeFile(
      page,
      switchFrontmatter +
        figureBody.replace('### Labels', '```tsx source=Basic\n\n```\n\n### Labels'),
    );
    assert.throws(read, /an example's source as code belongs in "## In code"/);
    // An anatomy legend item starts with its part's name in bold, all the Site shows of it.
    await writeFile(
      page,
      switchFrontmatter +
        figureBody.replace('2. **Thumb** (`env-switch-input`)', '2. `env-switch-input`'),
    );
    assert.throws(read, /must start with the part's name in bold/);
  });
});

test('an option table is read for the Site as a legend', () => {
  const [table] = marked.lexer(
    [
      '| Variant | Tones | Use for |',
      '| ------- | ----- | ------- |',
      '| **Primary** | Neutral, accent | The main action of a group. |',
      '| `ghost` | Neutral | A toolbar. |',
      '',
    ].join('\n'),
  );
  const options = optionTable(table);
  assert.equal(options.column, 'Variant');
  assert.deepEqual(
    options.options.map(({ name, details, use }) => ({ name, details, use })),
    [
      {
        name: 'Primary',
        details: [{ title: 'Tones', markdown: 'Neutral, accent' }],
        use: 'The main action of a group.',
      },
      { name: 'ghost', details: [{ title: 'Tones', markdown: 'Neutral' }], use: 'A toolbar.' },
    ],
  );
  assert.deepEqual(optionTableProblems(options), []);
  // Only a table whose last column is Use for is an option table.
  assert.equal(
    optionTable(marked.lexer('| Key | Action |\n| --- | --- |\n| Tab | Moves. |\n')[0]),
    undefined,
  );
  // The Site's Markdown is cut at its option tables, keeping each table's source.
  const source = 'Intro.\n\n| Size | Use for |\n| --- | --- |\n| Small | Lists. |\n\nAfter.\n';
  const pieces = optionPieces(source);
  assert.deepEqual(
    pieces.map((piece) => ('options' in piece ? piece.options.options[0].name : piece.markdown)),
    ['Intro.\n\n', 'Small', 'After.\n'],
  );
  assert.equal(
    pieces.map((piece) => ('options' in piece ? piece.raw : piece.markdown)).join(''),
    source,
  );
});

test('Site text with no structure is found: loose after a figure, or a fourth paragraph', () => {
  const markdown = (text) => ({ kind: 'markdown', markdown: text });
  const figure = (role) => ({ kind: 'example', name: 'Figure', heading: 'Figure', role });
  const found = siteStructure({
    sections: [
      {
        id: 'usage',
        title: 'When to use',
        blocks: [
          markdown('## When to use\n\nOne paragraph opens the section.\n\n'),
          figure('do'),
          figure('dont'),
          markdown(
            'A lone sentence after the pairs.\n\n### Labels\n\nStart with a verb.\n\nPut the outcome in it.\n\nKeep it short.\n\nOne too many.\n\n',
          ),
          figure(),
        ],
      },
      {
        id: 'anatomy',
        title: 'Anatomy',
        // The sentence after an anatomy legend names what the figure can't show; it belongs to it.
        blocks: [
          markdown('## Anatomy\n\n'),
          figure('anatomy'),
          markdown('Not shown: the spinner.\n'),
        ],
      },
      {
        id: 'variants',
        title: 'Variants',
        blocks: [
          markdown(
            '## Variants\n\n| Size | Use for |\n| --- | --- |\n| Small | Lists. |\n\nLoose after the legend.\n\n### Tones\n\nIn a block.\n',
          ),
        ],
      },
      // The developer-only part is not the Site's.
      { id: 'code', title: 'In code', blocks: [markdown('## In code\n\nOne.\n\nTwo.\n')] },
    ],
  });
  assert.deepEqual(
    found.map(({ where, kind, text }) => `${where}, ${kind}: ${text}`),
    [
      'When to use, after a figure: A lone sentence after the pairs.',
      'When to use, too many paragraphs: One too many.',
      'Variants, after a figure: Loose after the legend.',
    ],
  );
});

test('long paragraphs of Site text are found, measured as people read them', () => {
  const markdown = (text) => ({ kind: 'markdown', markdown: text });
  const long = `${'A sentence of words. '.repeat(12)}`.trim();
  const found = longParagraphs({
    sections: [
      {
        id: 'usage',
        title: 'When to use',
        blocks: [
          // A link counts as its words, not its address.
          markdown(
            `## When to use

Short, with [a link](${'../components/x.md'.repeat(20)}).

${long}
`,
          ),
        ],
      },
      {
        id: 'code',
        title: 'In code',
        blocks: [
          markdown(`## In code

${long}
`),
        ],
      },
    ],
  });
  assert.deepEqual(
    found.map(({ where, length }) => `${where}: ${length}`),
    [`When to use: ${long.length}`],
  );
  assert.ok(long.length > paragraphLength);
});

test("a guide's statuses and exportAliases name only the exports it lists", async () => {
  const cache = resolve('.cache');
  await mkdir(cache, { recursive: true });
  const directory = await mkdtemp(join(cache, 'guide-'));
  try {
    await cp(resolve('docs'), directory, { recursive: true });
    const setup = join(directory, 'setup.md');
    const source = await readFile(resolve('docs/setup.md'), 'utf8');
    const read = () => readDocumentation(directory, { versions: undefined });
    // A guide's exports are stable, so a status that says so repeats the default.
    await writeFile(
      setup,
      source.replace(/^statuses:.*\n(?: {2}.*\n)*/m, 'statuses:\n  LinkProvider: stable\n'),
    );
    assert.throws(read, /statuses of LinkProvider repeats the default status of a guide's exports/);
    await writeFile(
      setup,
      source.replace('exportAliases:\n', 'exportAliases:\n  Button:\n    - push\n'),
    );
    assert.throws(read, /exportAliases names Button, which components does not list/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('a lean page ships each example once, its rules and legends, and no changelog', () => {
  const compiled = compileDocumentation();
  const button = compiled.get('components/button.md');
  assert.ok(leanPages.has('components/button.md'));
  // A figure is a line naming its file, which still ships; In code keeps its own code.
  assert.match(
    button,
    /^- Example: \[CreateProject\]\(\.\.\/examples\/button\/CreateProject\.tsx\)$/m,
  );
  assert.ok(compiled.has('examples/button/CreateProject.tsx'));
  assert.doesNotMatch(button, /^`{3,}tsx (?:example|do|dont|anatomy|variants)=/m);
  assert.match(button, /^- Do: One primary button per group, at the end of its actions\. /m);
  assert.match(button, /^- Don't: Several primary buttons: none of them stands out\.$/m);
  assert.match(button, /^1\. \*\*Container\*\* \(`env-button`\)$/m);
  // A family member's props said word for word on Button are named, not repeated.
  assert.match(button, /^Also `end`, `size`, .* as on Button\.$/m);
  assert.match(button, /^Native props: `<button>` or `<a>`\.$/m);
  assert.doesNotMatch(button, /^avoidWhen:|^## Changelog/m);
  assert.match(button, /^## Related$/m);
  // The lean index leaves out the contributor pages; other pages ship as before.
  assert.doesNotMatch(compiled.get('index.md'), /component-pages\.md/);
  assert.match(compiled.get('components/switch.md'), /^`{3,}tsx do=/m);
  assert.match(compiled.get('components/switch.md'), /^## Changelog$/m);
});
