import assert from 'node:assert/strict';
import { test } from 'node:test';
import { writeFile } from 'node:fs/promises';
import { compileDocument } from '../../scripts/docs/Compiler.ts';
import {
  samplePage,
  switchBody,
  switchExample,
  switchFrontmatter,
  switchProps,
} from './DocumentationSamples.ts';

test('a page is read into its sections, figures, legends and specimens', async () => {
  await samplePage(async ({ read, examples }) => {
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
    assert.deepEqual(switchPage.sections[0].blocks.at(-1), {
      kind: 'example',
      name: 'Basic',
      heading: 'Switch',
    });
    assert.ok(blocks.some((block) => block.kind === 'specimen' && block.name === 'States'));
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
    assert.equal(figure('OnSubmit').open, true);
    assert.equal(figure('Instant').open, undefined);
    assert.equal(figure('OnSubmit').stage, 'shaded');
    assert.equal(figure('Narrow').stage, 'shaded');
    assert.equal(figure('Instant').stage, undefined);
    const code = switchPage.sections.find((section) => section.id === 'code');
    assert.deepEqual(
      code.blocks.map((block) => block.kind),
      ['markdown', 'source', 'markdown'],
    );
    assert.match(
      code.blocks[0].markdown,
      /^## Compose\n\n### Import\n\n```tsx\nimport \{ Switch \} from '@envsemble\/envui';\n```\n\n### Usage\n/,
    );

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

test('the sections are those the structure knows, once each, in its order', async () => {
  await samplePage(async ({ rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
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
    await rejects(
      frontmatter +
        body.replace(
          '- **0.1.0**: Switch.',
          '- **1.0.0-prerelease.6**: Lighter.\n- **1.0.0**: Renamed.\n- **0.1.0**: Switch.',
        ),
      /"## Changelog" lists 1\.0\.0 below an older version: list the newest first/,
    );
    await rejects(
      frontmatter + body.replace('# Switch\n\n', '# Switch\n\nAn intro.\n\n'),
      /content must follow a "##" section heading/,
    );
  });
});

const referenceFrontmatter = switchFrontmatter.replace(/ {2}Instant:[\s\S]*?(?=---)/, '');
const referenceBody = [
  '# Switch',
  '',
  '## Anatomy',
  '',
  '```tsx figure=Parts',
  '',
  '```',
  '',
  '1. **Track** (`env-switch`)',
  '',
  '## Behaviour',
  '',
  '### Adapting to width',
  '',
  '```tsx figure=Narrow',
  '',
  '```',
  '',
  '## Accessibility',
  '',
  '### Keyboard',
  '',
  '| Key | Action |',
  '| --- | --- |',
  '| <kbd>Space</kbd> | Toggles the switch. |',
  '',
].join('\n');

test('a page of only examples and reference reads, with Rules generated to open with when to use it', async () => {
  await samplePage(async ({ page, read, examples }) => {
    await writeFile(page, referenceFrontmatter + referenceBody);
    const documents = read();
    const sections = documents[1].sections;
    assert.deepEqual(
      sections.map((section) => section.id),
      ['overview', 'anatomy', 'behaviour', 'rules', 'accessibility', 'code'],
    );
    assert.deepEqual(sections.find((section) => section.id === 'rules').blocks, [
      { kind: 'markdown', markdown: '## Rules\n\n' },
    ]);
    const compiled = compileDocument(documents[1], documents, { props: switchProps, examples });
    assert.deepEqual(
      [...compiled.matchAll(/^## (.*)$/gm)].map(([, title]) => title),
      ['Anatomy', 'Behaviour', 'Accessibility', 'Compose', 'Props'],
    );
  });
});

test('Accessibility, where a page has it, has a Key and Action table under Keyboard', async () => {
  await samplePage(async ({ page, read, rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
    await rejects(frontmatter + body.replace('| Key | Action |', '| Keys | Result |'), /"Key"/);
    await writeFile(
      page,
      referenceFrontmatter + referenceBody.replace(/## Accessibility[\s\S]*/, ''),
    );
    assert.doesNotThrow(read);
  });
});

test("a component page's useWhen and avoidWhen are a few lines each", async () => {
  await samplePage(async ({ rejects }) => {
    const entries = (count) =>
      Array.from(
        { length: count },
        (_, index) => `  - Setting ${index + 1} that applies at once.`,
      ).join('\n');
    await rejects(
      switchFrontmatter.replace(
        'useWhen: [A setting that applies immediately.]',
        `useWhen:\n${entries(4)}`,
      ) + switchBody,
      /lists 4 entries in useWhen; keep the 3 that matter most/,
    );
    await rejects(
      switchFrontmatter.replace(
        'A choice that applies on submit.',
        `A choice that applies on submit, ${'and more words '.repeat(5)}`,
      ) + switchBody,
      /an entry of avoidWhen longer than a line of 80 characters/,
    );
  });
});

test('props, headings, quotes and specimens are written as the structure reads them', async () => {
  await samplePage(async ({ rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
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
  });
});

test('a page saved with CRLF line endings reads as it does with LF', async () => {
  await samplePage(async ({ page, read }) => {
    await writeFile(page, (switchFrontmatter + switchBody).replaceAll('\n', '\r\n'));
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
    await writeFile(page, switchFrontmatter + switchBody);
    assert.doesNotThrow(read);
  });
});

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
  await samplePage(async ({ page, read }) => {
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
    await writeFile(
      page,
      switchFrontmatter +
        switchBody.replace('### Labels', '```tsx source=Basic\n\n```\n\n### Labels'),
    );
    assert.throws(read, /an example's source as code belongs in "## Compose"/);
    await writeFile(
      page,
      switchFrontmatter + switchBody.replace(/## Compose[\s\S]*?(?=## Changelog)/, ''),
    );
    const sections = read()[1].sections;
    assert.deepEqual(sections.map((section) => section.id).slice(-2), ['code', 'changelog']);
  });
});

test('the structure reads Markdown as it renders', async () => {
  await samplePage(async ({ page, read }) => {
    const accepts = async (source) => {
      await writeFile(page, source);
      assert.doesNotThrow(read);
    };
    await accepts(
      switchFrontmatter +
        switchBody.replace(
          'Give every switch a `label`.',
          '#### Props forwarding\n\nOther props go to the input.\n\n| Attribute | Values |\n| --- | --- |\n| role | switch |\n\nGive every switch a `label`.',
        ),
    );
    await accepts(
      switchFrontmatter +
        switchBody.replace(
          'Give every switch a `label`.',
          'Give every switch a `label`.\n\n````md\n```tsx figure=Instant\n```\n````',
        ),
    );
    await writeFile(
      page,
      switchFrontmatter +
        switchBody.replace('### Labels', '  ```tsx figure=Instant\n  ```\n\n### Labels'),
    );
    assert.throws(read, /figure Instant is placed twice/);
  });
});
