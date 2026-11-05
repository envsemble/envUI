import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { cp, mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute } from 'node:path';
import {
  compileDocument,
  compileDocumentation,
  libraryVersions,
  readDocumentation,
} from '../scripts/docs/GenerateDocumentation.ts';
import { marked } from 'marked';
import {
  longParagraphs,
  optionPieces,
  optionTable,
  optionTableProblems,
  paragraphLength,
  catalogueStructure,
} from '../apps/site/src/shared/CatalogueContent.ts';

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
  'examples:',
  '  Basic: overview',
  '  Parts: anatomy',
  '  Narrow: example',
  '  Instant:',
  '    role: do',
  '    caption: Use a switch for a setting that applies at once.',
  '  OnSubmit:',
  '    role: dont',
  "    caption: Don't use a switch in a form that applies on submit.",
  '---',
  '',
].join('\n');

/** A Switch page in the one-file structure: short text, figures placed by name and a legend. */
const switchBody = [
  '# Switch',
  '',
  '## Variants',
  '',
  '### Sizes',
  '',
  'Two sizes, for a form and a dense list.',
  '',
  '## Anatomy',
  '',
  '```tsx figure=Parts',
  '',
  '```',
  '',
  '1. **Track** (`env-switch`): the pill.',
  '2. **Thumb** (`env-switch-input`)',
  '',
  '## Behaviour',
  '',
  '<!-- specimen: States -->',
  '',
  '### Adapting to width',
  '',
  'The label wraps.',
  '',
  '```tsx figure=Narrow widths="16 30" stage=shaded',
  '',
  '```',
  '',
  '## Rules',
  '',
  'A switch applies at once.',
  '',
  '```tsx figure=Instant',
  '',
  '```',
  '',
  '```tsx figure=OnSubmit open stage=shaded',
  '',
  '```',
  '',
  '### Labels',
  '',
  'Name the setting, not the action.',
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
  '## Compose',
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
  '## Changelog',
  '',
  '- **0.1.0**: Switch.',
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
async function pageFixture(run) {
  const cache = resolve('.cache');
  await mkdir(cache, { recursive: true });
  const fixture = await mkdtemp(join(cache, 'page-'));
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
  for (const name of ['Basic', 'Parts', 'Narrow', 'Instant', 'OnSubmit'])
    await writeFile(join(examples, 'switch', `${name}.tsx`), switchExample);
  await writeFile(join(specimens, 'switch', 'States.tsx'), 'export default function States() {}\n');
  const page = join(docs, 'components', 'switch.md');
  await writeFile(page, switchFrontmatter + switchBody);
  const versions = new Set(['0.1.0', '0.2.0']);
  const read = () => readDocumentation(docs, { props: switchProps, examples, specimens, versions });
  try {
    await run({ page, read, examples, specimens, docs });
  } finally {
    const contained = relative(cache, fixture);
    assert.ok(contained && !contained.startsWith('..') && !isAbsolute(contained));
    await rm(fixture, { recursive: true, force: true });
  }
}

test('a page is read into its sections, figures, legends and specimens', async () => {
  await pageFixture(async ({ read, examples }) => {
    const documents = read();
    const switchPage = documents[1];
    assert.deepEqual(
      switchPage.sections.map((section) => section.id),
      [
        'overview',
        'variants',
        'anatomy',
        'behaviour',
        'rules',
        'accessibility',
        'code',
        'changelog',
      ],
    );
    const blocks = switchPage.sections.flatMap((section) => section.blocks);
    const figure = (name) => blocks.find((block) => block.name === name);
    // The Overview is generated from the frontmatter's overview examples, named after the page.
    assert.deepEqual(switchPage.sections[0].blocks.at(-1), {
      kind: 'example',
      name: 'Basic',
      heading: 'Switch',
    });
    assert.ok(blocks.some((block) => block.kind === 'specimen' && block.name === 'States'));
    // A figure's role and caption come from the frontmatter, its framing from its fence.
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
    // The flag open shows the example's overlays open; stage=shaded the deeper stage of a whole
    // window. Other figures leave both out.
    assert.equal(figure('OnSubmit').open, true);
    assert.equal(figure('Instant').open, undefined);
    assert.equal(figure('OnSubmit').stage, 'shaded');
    assert.equal(figure('Narrow').stage, 'shaded');
    assert.equal(figure('Instant').stage, undefined);
    // Compose opens on the generated Import, with an example's source as code.
    const code = switchPage.sections.find((section) => section.id === 'code');
    assert.deepEqual(
      code.blocks.map((block) => block.kind),
      ['markdown', 'source', 'markdown'],
    );
    assert.match(
      code.blocks[0].markdown,
      /^## Compose\n\n### Import\n\n```tsx\nimport \{ Switch \} from '@envsemble\/envui';\n```\n\n### Usage\n/,
    );

    // The packaged page: the whole file in its order, each example once, by name; specimens left
    // out; the props after Compose; no Related or changelog, which the frontmatter and the Docs
    // hold.
    const compiled = compileDocument(switchPage, documents, { props: switchProps, examples });
    assert.ok(compiled.includes('examples: # Each file is examples/switch/<Name>.tsx.\n'));
    assert.ok(compiled.includes('  Basic: overview\n'));
    assert.ok(
      compiled.includes(
        '  Instant: { role: do, caption: "Use a switch for a setting that applies at once." }\n',
      ),
    );
    assert.ok(compiled.includes("\nExamples: Instant (do), OnSubmit (don't).\n"));
    assert.ok(compiled.includes('\nExample: Narrow.\n'));
    assert.match(compiled, /^### Labels$/m);
    assert.match(
      compiled,
      /\n1\. \*\*Track\*\* \(`env-switch`\): the pill\.\n2\. \*\*Thumb\*\* \(`env-switch-input`\)\n/,
    );
    assert.ok(compiled.includes(`\`\`\`tsx source=Basic\n${switchExample}\`\`\``));
    assert.doesNotMatch(compiled, /specimen|figure=|^## (?:Overview|Related|Changelog)$/m);
    assert.deepEqual(
      [...compiled.matchAll(/^## (.*)$/gm)].map(([, title]) => title),
      ['Variants', 'Anatomy', 'Behaviour', 'Rules', 'Accessibility', 'Compose', 'Props'],
    );
    assert.match(compiled, /^Native props: `<input>`\.$/m);
  });
});

test('the build fails a page that is not in the one-file structure', async () => {
  await pageFixture(async ({ page, read, docs, specimens }) => {
    const rejects = async (source, pattern) => {
      await writeFile(page, source);
      assert.throws(read, pattern);
    };
    const body = switchBody;
    const frontmatter = switchFrontmatter;
    // A page of a structured kind lists its examples; without them it is not in the structure.
    await rejects(
      frontmatter.replace(/examples:\n[\s\S]*?(?=---)/, '') + body,
      /components\/switch\.md is not in the one-file structure: its frontmatter lists no examples/,
    );
    await rejects(body, /Component page components\/switch\.md needs frontmatter/);
    // Sections: those the structure knows, once each, in its order, with Rules.
    await rejects(
      frontmatter + body.replace('## Variants', '## Usage'),
      /"## Usage" is not a section of a component page \(Variants, Anatomy, Behaviour, Rules, Accessibility, Words to use, Compose, Changelog\)/,
    );
    await rejects(frontmatter + body.replace('## Variants', '## Overview'), /is generated/);
    await rejects(frontmatter + body.replace('## Changelog', '## Props'), /is generated/);
    await rejects(
      frontmatter + body.replace('## Behaviour', '## Rules\n\nAgain.\n\n## Behaviour'),
      /"## Rules" appears twice/,
    );
    await rejects(
      frontmatter +
        body.replace(
          '## Variants\n\n### Sizes\n\nTwo sizes, for a form and a dense list.\n\n',
          '',
        ) +
        '\n## Variants\n\nOne size.\n',
      /"## Variants" must come before "## Changelog"/,
    );
    // The changelog runs from the newest version, a release after its prereleases.
    await rejects(
      frontmatter +
        body.replace(
          '- **0.1.0**: Switch.',
          '- **1.0.0-prerelease.6**: Lighter.\n- **1.0.0**: Renamed.\n- **0.1.0**: Switch.',
        ),
      /"## Changelog" lists 1\.0\.0 below an older version: list the newest first/,
    );
    await rejects(
      frontmatter + body.replace(/## Rules[\s\S]*?(?=## Accessibility)/, ''),
      /"## Rules" is required/,
    );
    await rejects(
      frontmatter + body.replace('# Switch\n\n', '# Switch\n\nAn intro.\n\n'),
      /content must follow a "##" section heading/,
    );
    // Examples: each listed once and placed once, but the overview's, which nothing places.
    await rejects(
      frontmatter + body.replace('```tsx figure=Instant\n', '```tsx figure=Narrow\n'),
      /figure Narrow is placed twice[\s\S]*example Instant is listed in the frontmatter but placed nowhere/,
    );
    await rejects(
      frontmatter + body.replace('figure=Instant', 'figure=Extra'),
      /figure Extra is not listed under examples in the frontmatter/,
    );
    await rejects(
      frontmatter + body.replace('### Labels', '```tsx figure=Basic\n\n```\n\n### Labels'),
      /figure Basic is an overview example, which the Overview shows from the frontmatter/,
    );
    await rejects(
      frontmatter.replace('  Basic: overview\n', '  Basic: example\n') + body,
      /example Basic is listed in the frontmatter but placed nowhere[\s\S]*lists no overview example/,
    );
    await rejects(
      frontmatter + body.replace('figure=Instant', 'do=Instant caption="Use it."'),
      /`tsx do=Instant caption="Use it\."`: place a figure as `tsx figure=Name`/,
    );
    await rejects(
      frontmatter.replace('  Narrow: example\n', '  Narrow: example\n  Missing: example\n') +
        body.replace('### Labels', '```tsx figure=Missing\n\n```\n\n### Labels'),
      /figure Missing has no file/,
    );
    await rejects(
      frontmatter + body.replace('figure=Parts\n\n```', 'figure=Parts\n<Switch />\n```'),
      /the fence of figure Parts must be empty/,
    );
    // The frontmatter: an example's entry, a role and a caption, and on an overview its framing.
    await rejects(
      frontmatter.replace('  Parts: anatomy', '  Parts: legend') + body,
      /gives Parts the role legend; one of overview, example, variants, anatomy, do, dont, caution/,
    );
    await rejects(
      frontmatter.replace(
        "    caption: Don't use a switch in a form that applies on submit.\n",
        '',
      ) + body,
      /gives the dont figure OnSubmit no caption, its rule/,
    );
    // A caution, acceptable with care, states its rule too.
    await rejects(
      frontmatter.replace(
        "    role: dont\n    caption: Don't use a switch in a form that applies on submit.\n",
        '    role: caution\n',
      ) + body,
      /gives the caution figure OnSubmit no caption, its rule/,
    );
    await rejects(
      frontmatter.replace('  Narrow: example', '  Narrow:\n    role: example\n    width: 30') +
        body,
      /gives Narrow a field other than role, caption, open, stage, motion, wide, device/,
    );
    await rejects(
      frontmatter.replace('  Narrow: example', '  Narrow:\n    role: example\n    wide: true') +
        body,
      /gives Narrow open, stage, motion, wide or device, which only an overview example takes here/,
    );
    await rejects(
      frontmatter.replace('  Narrow: example', '  Narrow:\n    role: example\n    open: true') +
        body,
      /gives Narrow open, stage, motion, wide or device, which only an overview example takes here/,
    );
    // An example the catalogue plays needs its specimen of the same name.
    await rejects(
      frontmatter.replace('  Basic: overview', '  Basic:\n    role: overview\n    motion: true') +
        body,
      /example Basic has motion but no specimen apps\/site\/src\/specimens\/switch\/Basic\.tsx/,
    );
    await rejects(
      frontmatter +
        body.replace('figure=Narrow widths="16 30"', 'figure=Narrow motion widths="16 30"'),
      /example Narrow has motion but no specimen/,
    );
    // An anatomy figure held in a moment needs its specimen of the same name too.
    await rejects(
      frontmatter + body.replace('figure=Parts\n', 'figure=Parts specimen\n'),
      /anatomy Parts has specimen but no specimen apps\/site\/src\/specimens\/switch\/Parts\.tsx/,
    );
    await rejects(
      frontmatter.replace('  Basic: overview', '  Basic:\n    role: overview\n    open: yes') +
        body,
      /gives Basic open: yes; write open: true/,
    );
    await rejects(
      frontmatter.replace('  Basic: overview', '  Basic:\n    role: overview\n    stage: dark') +
        body,
      /gives Basic stage: dark; a stage takes shaded/,
    );
    await writeFile(
      page,
      frontmatter.replace(
        '  Basic: overview',
        '  Basic:\n    role: overview\n    open: true\n    stage: shaded',
      ) + body,
    );
    assert.deepEqual(read()[1].sections[0].blocks.at(-1), {
      kind: 'example',
      name: 'Basic',
      heading: 'Switch',
      open: true,
      stage: 'shaded',
    });
    // With its specimen, an example the catalogue plays says so, in the Overview and on its fence.
    await writeFile(join(specimens, 'switch', 'Basic.tsx'), 'export default function Basic() {}\n');
    await writeFile(
      join(specimens, 'switch', 'Narrow.tsx'),
      'export default function Narrow() {}\n',
    );
    await writeFile(
      page,
      frontmatter.replace('  Basic: overview', '  Basic:\n    role: overview\n    motion: true') +
        body.replace('figure=Narrow widths="16 30"', 'figure=Narrow motion widths="16 30"'),
    );
    const motions = read()[1]
      .sections.flatMap((section) => section.blocks)
      .filter((block) => block.motion)
      .map((block) => block.name);
    assert.deepEqual(motions, ['Basic', 'Narrow']);
    // A pattern or foundation page is in the structure too.
    await mkdir(join(docs, 'foundations'), { recursive: true });
    await writeFile(
      join(docs, 'foundations', 'motion.md'),
      '---\ntitle: Motion\nsummary: How things move.\naliases: [animation]\n---\n\n# Motion\n\n## Rules\n\nMove little.\n',
    );
    await writeFile(
      join(docs, 'index.md'),
      '# envUI documentation\n\n## Foundations\n\n- [Motion](foundations/motion.md)\n\n## Forms & selection\n\n- [Switch](components/switch.md)\n',
    );
    await rejects(
      frontmatter + body,
      /foundations\/motion\.md is not in the one-file structure: its frontmatter lists no examples/,
    );
  });
});

test('the structure checks the frontmatter, the figures and the text of a page', async () => {
  await pageFixture(async ({ page, read }) => {
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
    // Accessibility: what envUI and the application provide, and a Key and Action table.
    await rejects(frontmatter + body.replace('### You provide', '### Notes'), /You provide/);
    await rejects(
      frontmatter +
        body.replace('### envUI provides\n\n- The switch role.\n', '### envUI provides\n'),
      /"### envUI provides" list/,
    );
    await rejects(frontmatter + body.replace('| Key | Action |', '| Keys | Result |'), /"Key"/);
    // Lists, props and headings the structure generates or needs in Markdown.
    await rejects(
      frontmatter +
        body.replace(
          'Name the setting, not the action.',
          '| Name | Contract |\n| --- | --- |\n| label | Text |',
        ),
      /lists props in a table/,
    );
    await rejects(
      frontmatter + body.replace('### Labels', '#### Props\n\nsize is sm or md.\n\n### Labels'),
      /"#### Props" lists props by hand/,
    );
    await rejects(
      frontmatter + body.replace('### Labels', '<h3>Labels</h3>'),
      /headings in Markdown/,
    );
    await rejects(
      frontmatter + body.replace('Name the setting, not the action.', '> How do I label it?'),
      /Rules has a blockquote/,
    );
    await rejects(frontmatter + body.replace('specimen: States', 'specimen: Matrix'), /no file/);
    // An option table, whose last column is Use for, shows in the catalogue as a legend of tags:
    // each names its option in a few plain words, once, and says what it is for.
    const options = (rows) =>
      frontmatter +
      body.replace(
        'Two sizes, for a form and a dense list.',
        `Two sizes, for a form and a dense list.\n\n| Size | Use for |\n| ---- | ------- |\n${rows}\n`,
      );
    await rejects(
      options('| [Small](#small) | A dense list. |'),
      /Variants: row 1 of the Size table names its option with a link/,
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
    await writeFile(page, options('| Small | A dense list. |'));
    assert.doesNotThrow(read);
    // A figure's fence: the attributes its role takes, as name="value", and flags alone.
    await rejects(frontmatter + body.replace('widths="16 30"', 'widths="wide"'), /widths="wide"/);
    // sweep shows one frame sweeping between at least two widths; classes needs a sweep.
    await rejects(
      frontmatter + body.replace('widths="16 30"', 'widths="16" sweep'),
      /example Narrow has sweep; give the widths it sweeps between/,
    );
    await rejects(
      frontmatter + body.replace('widths="16 30"', 'widths="16 30" classes'),
      /example Narrow has classes without sweep/,
    );
    await rejects(
      frontmatter + body.replace('widths="16 30"', 'widths="16 30" fit'),
      /example Narrow has fit without sweep/,
    );
    await writeFile(
      page,
      frontmatter + body.replace('widths="16 30"', 'widths="30 16" sweep classes fit'),
    );
    assert.deepEqual(
      (({ widths, sweep, classes, fit }) => ({ widths, sweep, classes, fit }))(
        read()[1]
          .sections.flatMap((section) => section.blocks)
          .find((block) => block.name === 'Narrow'),
      ),
      { widths: [30, 16], sweep: true, classes: true, fit: true },
    );
    await rejects(
      frontmatter + body.replace('figure=Parts', 'figure=Parts size=lg'),
      /anatomy Parts takes no size/,
    );
    await rejects(
      frontmatter + body.replace('figure=OnSubmit open', 'figure=OnSubmit open=yes'),
      /write the flag open alone/,
    );
    await rejects(
      frontmatter + body.replace('figure=Parts', 'figure=Parts of'),
      /has of without a value/,
    );
    await rejects(
      frontmatter + body.replace('open stage=shaded', 'open stage=dark'),
      /has stage="dark"/,
    );
    await rejects(
      frontmatter + body.replace('figure=Instant', 'figure=Instant caption="Use it."'),
      /figure Instant has a caption on its fence; it goes under examples/,
    );
    // A double quote inside a value, escaped or not, leaves the fence malformed.
    await rejects(
      frontmatter + body.replace('figure=Narrow widths="16 30"', 'figure=Narrow widths="16 "30""'),
      /the fence `tsx figure=Narrow widths="16 "30"" stage=shaded` is malformed/,
    );
    // A legend names parts that exist, each starting with its name in bold.
    await rejects(
      frontmatter + body.replace('2. **Thumb** (`env-switch-input`)', '2. The thumb.'),
      /item 2 of the legend of anatomy Parts names no part/,
    );
    await rejects(
      frontmatter + body.replace('2. **Thumb** (`env-switch-input`)', '2. `env-switch-input`'),
      /must start with the part's name in bold/,
    );
    await rejects(
      frontmatter +
        body.replace('2. **Thumb** (`env-switch-input`)', '2. **Knob** (`env-switch-knob`)'),
      /names env-switch-knob, which neither packages\/ui's CSS nor docs\/generated\/parts\.json has/,
    );
    // A variants figure names each variant in bold, in a legend it can't do without.
    const variants = frontmatter.replace('  Parts: anatomy', '  Parts: variants');
    await rejects(
      variants + body.replace('1. **Track** (`env-switch`): the pill.', '1. Track'),
      /in bold/,
    );
    await rejects(
      variants + body.replace(/1\. \*\*Track\*\*.*\n2\. \*\*Thumb\*\*.*\n/, ''),
      /variants Parts has no legend/,
    );
    await rejects(
      frontmatter + body.replace(/1\. \*\*Track\*\*.*\n2\. \*\*Thumb\*\*.*\n/, ''),
      /anatomy Parts has no legend, and docs\/generated\/parts\.json lists no parts of Switch/,
    );
    // Saved with CRLF line endings, the page reads as it does with LF.
    await writeFile(page, (frontmatter + body).replaceAll('\n', '\r\n'));
    assert.deepEqual(
      read()[1].sections.map((section) => section.id),
      [
        'overview',
        'variants',
        'anatomy',
        'behaviour',
        'rules',
        'accessibility',
        'code',
        'changelog',
      ],
    );
    await writeFile(page, frontmatter + body);
    assert.doesNotThrow(read);
  });
});

/** Compose with its usage and an example file shown as code, then a customization. */
const compose = [
  '## Compose',
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

test('"## Compose" is the developer part, opened by the generated Import', async () => {
  await pageFixture(async ({ page, read }) => {
    const rejects = async (part, pattern) => {
      await writeFile(
        page,
        switchFrontmatter + switchBody.replace(/## Compose[\s\S]*?(?=## Changelog)/, part),
      );
      assert.throws(read, pattern);
    };
    await rejects(
      compose.replace('### Usage', '### Import'),
      /"### Import" of "## Compose" is generated/,
    );
    await rejects(
      compose.replace('### Usage', '### Recipes'),
      /"### Recipes" is not a subsection of "## Compose"/,
    );
    await rejects(
      compose.replace('### Usage\n', ''),
      /"## Compose" starts with a "###" subsection/,
    );
    await rejects(
      compose.replace('### Customize', '### Composition').replace('### Usage', '### Customize'),
      /"### Composition" must come before "### Customize"/,
    );
    await rejects(
      compose.replace('### Usage', '### Composition'),
      /"## Compose" needs a "### Usage" subsection/,
    );
    await rejects(compose.replace('source=Basic', 'source=Missing'), /source Missing has no file/);
    await rejects(
      compose.replace('source=Basic', 'figure=Basic'),
      /"## Compose" shows code, not figures/,
    );
    await rejects(
      `${compose}<!-- specimen: States -->\n\n`,
      /"## Compose" shows code, not specimens/,
    );
    // An example's source as code belongs in Compose only.
    await writeFile(
      page,
      switchFrontmatter +
        switchBody.replace('### Labels', '```tsx source=Basic\n\n```\n\n### Labels'),
    );
    assert.throws(read, /an example's source as code belongs in "## Compose"/);
    // A page without Compose gets one, holding the Import.
    await writeFile(
      page,
      switchFrontmatter + switchBody.replace(/## Compose[\s\S]*?(?=## Changelog)/, ''),
    );
    const sections = read()[1].sections;
    assert.deepEqual(sections.map((section) => section.id).slice(-2), ['code', 'changelog']);
  });
});

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
      JSON.stringify({ fixed: [['@envsemble/envui', '@envsemble/eslint-plugin-envui']] }),
    );
    await writeFile(changelog, '# Changelog\n\n## 0.7.0\n\nText.\n\n## 0.6.0\n\nText.\n');
    await changeset('fix', { '@envsemble/envui': 'patch' });
    assert.deepEqual(versions(), ['0.6.0', '0.7.0', '0.7.1']);
    // A package that shares envUI's version raises it too.
    await changeset('lint', { '@envsemble/eslint-plugin-envui': 'minor' });
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

test('the structure reads Markdown as it renders', async () => {
  await pageFixture(async ({ page, read }) => {
    const accepts = async (source) => {
      await writeFile(page, source);
      assert.doesNotThrow(read);
    };
    // Tables of attributes and a section on forwarding props are not props tables.
    await accepts(
      switchFrontmatter +
        switchBody.replace(
          'Give every switch a `label`.',
          '#### Props forwarding\n\nOther props go to the input.\n\n| Attribute | Values |\n| --- | --- |\n| role | switch |\n\nGive every switch a `label`.',
        ),
    );
    // A figure fence shown inside another fence is text, not a figure.
    await accepts(
      switchFrontmatter +
        switchBody.replace(
          'Give every switch a `label`.',
          'Give every switch a `label`.\n\n````md\n```tsx figure=Instant\n```\n````',
        ),
    );
    // A figure fence indented by up to three spaces is one.
    await writeFile(
      page,
      switchFrontmatter +
        switchBody.replace('### Labels', '  ```tsx figure=Instant\n  ```\n\n### Labels'),
    );
    assert.throws(read, /figure Instant is placed twice/);
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

test('an option table is read for the catalogue as a legend', () => {
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
  // The catalogue's Markdown is cut at its option tables, keeping each table's source.
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

test('Catalogue text with no structure is found: loose after a figure, or a fourth paragraph', () => {
  const markdown = (text) => ({ kind: 'markdown', markdown: text });
  const figure = (role) => ({ kind: 'example', name: 'Figure', heading: 'Figure', role });
  const found = catalogueStructure({
    sections: [
      {
        id: 'rules',
        title: 'Rules',
        blocks: [
          markdown('## Rules\n\nOne paragraph opens the section.\n\n'),
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
      // The developer part is not the catalogue's.
      { id: 'code', title: 'Compose', blocks: [markdown('## Compose\n\nOne.\n\nTwo.\n')] },
    ],
  });
  assert.deepEqual(
    found.map(({ where, kind, text }) => `${where}, ${kind}: ${text}`),
    [
      'Rules, after a figure: A lone sentence after the pairs.',
      'Rules, too many paragraphs: One too many.',
      'Variants, after a figure: Loose after the legend.',
    ],
  );
});

test('long paragraphs of catalogue text are found, measured as people read them', () => {
  const markdown = (text) => ({ kind: 'markdown', markdown: text });
  const long = `${'A sentence of words. '.repeat(12)}`.trim();
  const found = longParagraphs({
    sections: [
      {
        id: 'rules',
        title: 'Rules',
        blocks: [
          // A link counts as its words, not its address.
          markdown(
            `## Rules

Short, with [a link](${'../components/x.md'.repeat(20)}).

${long}
`,
          ),
        ],
      },
      {
        id: 'code',
        title: 'Compose',
        blocks: [
          markdown(`## Compose

${long}
`),
        ],
      },
    ],
  });
  assert.deepEqual(
    found.map(({ where, length }) => `${where}: ${length}`),
    [`Rules: ${long.length}`],
  );
  assert.ok(long.length > paragraphLength);
});

test("a guide's status, statuses and exportAliases hold, and name only the exports it lists", async () => {
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
    // A guide may carry a status of the ladder, which its exports take, so one that says so
    // repeats the guide's.
    const withStatus = (status, text = source) => `---\nstatus: ${status}\n${text.slice(4)}`;
    await writeFile(setup, withStatus('experimental'));
    assert.throws(read, /status must be one of alpha, beta, stable, deprecated/);
    await writeFile(
      setup,
      withStatus(
        'alpha',
        source.replace(/^statuses:.*\n(?: {2}.*\n)*/m, 'statuses:\n  LinkProvider: alpha\n'),
      ),
    );
    assert.throws(read, /statuses of LinkProvider repeats the page's status/);
    await writeFile(setup, withStatus('alpha'));
    const guide = read().find((document) => document.path === 'setup.md');
    assert.equal(guide.frontmatter.status, 'alpha');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
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

test("the contributor guides' relative links reach files, and headings, that exist", async () => {
  const { headingsOf } = await import('../scripts/docs/MarkdownHeadings.ts');
  const guides = ['README.md', 'CONTRIBUTING.md', 'AGENTS.md', 'contributing/pages.md'];
  const broken = [];
  for (const guide of guides) {
    const source = await readFile(resolve(guide), 'utf8');
    marked.walkTokens(marked.lexer(source), (token) => {
      if (token.type !== 'link' || /^[a-z][a-z\d+.-]*:/i.test(token.href)) return;
      const [path, fragment] = token.href.split('#');
      const target = path ? join(resolve(guide, '..'), path) : resolve(guide);
      if (!existsSync(target)) broken.push(`${guide}: ${token.href}`);
      else if (
        fragment &&
        !headingsOf(readFileSync(target, 'utf8')).some(({ id }) => id === fragment)
      )
        broken.push(`${guide}: ${token.href} names no heading`);
    });
  }
  assert.deepEqual(broken, []);
});

test("every namespace of envUI's strings but the shared one shows on a component's page", async () => {
  const { readMessages } = await import('../scripts/docs/Messages.ts');
  const documented = new Set(
    readDocumentation().flatMap((document) => document.frontmatter?.components ?? []),
  );
  for (const { namespace, components, strings } of readMessages()) {
    assert.ok(strings.length, `${namespace} has strings`);
    for (const string of strings) assert.ok(string.description, `${namespace}.${string.key}`);
    if (namespace === 'common') continue;
    assert.ok(
      components.some((name) => documented.has(name)),
      `${namespace} names no documented export: ${components.join(', ')}`,
    );
  }
});
