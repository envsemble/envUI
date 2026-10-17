import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute } from 'node:path';
import {
  compileDocument,
  libraryVersions,
  readDocumentation,
} from '../scripts/GenerateDocumentation.mjs';

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
    // Metadata that says nothing or points nowhere.
    await rejects(frontmatter.replace('related: []', 'related: [switch]') + body, /itself/);
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
    const legacy = switchFrontmatter.replace(/useWhen:[\s\S]*?(?=related:)/, '');
    await writeFile(
      page,
      `${legacy}# Switch\n\n## React usage\n\n### Props & contracts\n\n| Name | Contract |\n| --- | --- |\n| label | The visible label. |\n`,
    );
    const documents = read();
    assert.equal(documents[1].sections, undefined);
    const compiled = compileDocument(documents[1], documents, { props: switchProps, examples });
    assert.match(compiled, /### Props & contracts/);
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
    const legacy = switchFrontmatter.replace(/useWhen:[\s\S]*?(?=related:)/, '');
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
  'intent: Collect and change information',
  'aliases: [preferences]',
  'useWhen: [Someone changes a preference.]',
  'avoidWhen:',
  '  - text: A form submitted once.',
  '    see: sign-in-page',
  '  - text: A single choice.',
  '    use: Checkbox',
  'composes: [Switch]',
  'related: [switch]',
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

const templateFrontmatter = [
  '---',
  'title: Sign-in page',
  'summary: A whole screen to sign in with an email and a password.',
  'status: beta',
  'since: 0.2.0',
  'frame: none',
  'aliases: [login page]',
  'useWhen: [People sign in to the application.]',
  'avoidWhen:',
  '  - text: Changing a preference.',
  '    see: settings',
  'composes: [Switch]',
  'related: [settings]',
  '---',
  '',
].join('\n');

const templateBody = [
  '# Sign-in page',
  '',
  '## Overview',
  '',
  'A screen of its own.',
  '',
  '```tsx template=SignInPage',
  '```',
  '',
  '## Anatomy',
  '',
  '1. A form.',
  '',
  '## Accessibility',
  '',
  '### Landmarks and headings',
  '',
  '- One main and one level-one heading.',
  '',
  '### envUI provides',
  '',
  '- Labelled fields.',
  '',
  '### You provide',
  '',
  '- The page title.',
  '',
  '## Examples',
  '',
  '### Signed out',
  '',
  'The screen inside the app frame.',
  '',
  '```tsx template=SignedOut frame=app',
  '```',
  '',
].join('\n');

/** A docs/ folder with a component, a pattern and a template page and their example files. */
async function compositionFixture(run) {
  await templateFixture(async ({ page, read, examples, docs }) => {
    await writeFile(page, switchFrontmatter + switchBody);
    await mkdir(join(docs, 'patterns'), { recursive: true });
    await mkdir(join(docs, 'templates'), { recursive: true });
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
        '## Templates',
        '',
        '- [Sign-in page](templates/sign-in-page.md)',
        '',
      ].join('\n'),
    );
    for (const [folder, names] of [
      ['settings', ['Lead', 'Grouped', 'SavedAtOnce']],
      ['sign-in-page', ['SignInPage', 'SignedOut']],
    ]) {
      await mkdir(join(examples, folder), { recursive: true });
      for (const name of names) await writeFile(join(examples, folder, `${name}.tsx`), lead(name));
    }
    const pattern = join(docs, 'patterns', 'settings.md');
    const template = join(docs, 'templates', 'sign-in-page.md');
    await writeFile(pattern, patternFrontmatter + patternBody);
    await writeFile(template, templateFrontmatter + templateBody);
    await run({ pattern, template, read, examples, docs });
  });
}

test('pattern and template pages are read into sections, examples and screens', async () => {
  await compositionFixture(async ({ read, examples }) => {
    const documents = read();
    const settings = documents.find((document) => document.id === 'settings');
    const signIn = documents.find((document) => document.id === 'sign-in-page');
    assert.deepEqual(
      settings.sections.map((section) => section.id),
      ['overview', 'anatomy', 'content', 'accessibility', 'examples'],
    );
    // The summary comes from the frontmatter, and the index line drops it.
    assert.equal(settings.summary, 'Let people change how the application works for them.');
    const blocks = (document) => document.sections.flatMap((section) => section.blocks);
    assert.deepEqual(
      blocks(signIn).filter((block) => block.kind === 'template'),
      [
        { kind: 'template', name: 'SignInPage', heading: 'Sign-in page', frame: 'none' },
        { kind: 'template', name: 'SignedOut', heading: 'Signed out', frame: 'app' },
      ],
    );
    assert.equal(blocks(settings).filter((block) => block.kind === 'example').length, 3);

    // The packaged page fills in every screen's source; a screen keeps a frame that differs.
    const compiled = compileDocument(signIn, documents, { examples });
    assert.ok(compiled.includes(`\`\`\`tsx template=SignInPage\n${lead('SignInPage')}\`\`\``));
    assert.ok(
      compiled.includes(`\`\`\`tsx template=SignedOut frame=app\n${lead('SignedOut')}\`\`\``),
    );
    assert.match(compiled, /## Related\n\n- \[Settings\]\(\.\.\/patterns\/settings\.md\)/);
    assert.doesNotMatch(compiled, /## Props/);
    const index = compileDocument(documents[0], documents, { examples });
    assert.ok(
      index.includes(
        '- [Settings](patterns/settings.md) — Let people change how the application works for them.',
      ),
    );
  });
});

test('pattern and template pages are validated as their kind', async () => {
  await compositionFixture(async ({ pattern, template, read, docs }) => {
    const rejects = async (file, source, expected) => {
      await writeFile(file, source);
      assert.throws(read, expected);
    };
    const p = patternFrontmatter;
    const t = templateFrontmatter;
    const withComposes = (list) => p.replace('composes: [Switch]', `composes: ${list}`);
    // Frontmatter: the fields of the kind, with values from their lists and names that exist.
    await rejects(pattern, p.replace(/intent: .*\n/, '') + patternBody, /intent is required/);
    await rejects(
      pattern,
      p.replace('intent: Collect', 'intent: Gather') + patternBody,
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
      p.replace('see: sign-in-page', 'see: nowhere') + patternBody,
      /nowhere in avoidWhen, which is not an indexed page/,
    );
    await rejects(
      pattern,
      p.replace('see: sign-in-page', 'see: settings') + patternBody,
      /the page itself/,
    );
    await rejects(
      pattern,
      p.replace('    see: sign-in-page', '    see: sign-in-page\n    use: Switch') + patternBody,
      /\{ text, see \}/,
    );
    await writeFile(pattern, patternFrontmatter + patternBody);
    await rejects(
      template,
      t.replace('frame: none', 'frame: side') + templateBody,
      /frame must be one of app, none/,
    );
    await rejects(template, t.replace('frame: none\n', '') + templateBody, /frame is required/);
    await rejects(
      template,
      t.replace('frame: none', 'frame: none\nintent: Find and navigate') + templateBody,
      /unknown field intent/,
    );
    await writeFile(template, templateFrontmatter + templateBody);
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
      /belongs on a template page/,
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
    await rejects(
      template,
      t + templateBody.replace('### Landmarks and headings', '### Landmarks'),
      /"### Landmarks and headings" list/,
    );
    await rejects(
      template,
      t + templateBody.replace('template=SignInPage', 'example=SignInPage'),
      /shows the main screen/,
    );
    await rejects(
      template,
      t + templateBody.replace('template=SignInPage\n```', 'template=SignInPage\n<Page />\n```'),
      /fence of template SignInPage must be empty/,
    );
    await rejects(
      template,
      t + templateBody.replace('template=SignedOut frame=app', 'template=signedOut'),
      /signedOut must be a PascalCase/,
    );
    await rejects(
      template,
      t + templateBody.replace('frame=app', 'frame=side'),
      /frame=side; frame is app or none/,
    );
    await rejects(
      template,
      t + templateBody.replace('template=SignedOut', 'template=Missing'),
      /template Missing has no file/,
    );
    await writeFile(template, templateFrontmatter + templateBody);
    // The summary lives in the frontmatter only.
    const index = join(docs, 'index.md');
    const source = await readFile(index, 'utf8');
    await rejects(
      index,
      source.replace('(patterns/settings.md)', '(patterns/settings.md) — Settings.'),
      /repeats a summary/,
    );
    await writeFile(index, source);
    assert.doesNotThrow(read);
  });
});
