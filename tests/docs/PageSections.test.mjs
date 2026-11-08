// A page's sections, read in the structure's order: Rules, Accessibility, Compose and the Markdown
// they hold.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { writeFile } from 'node:fs/promises';
import { compileDocument } from '../../scripts/docs/GenerateDocumentation.ts';
import {
  pageFixture,
  switchBody,
  switchExample,
  switchFrontmatter,
  switchProps,
} from './DocumentationFixtures.mjs';

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

test('the sections are those the structure knows, once each, in its order, with Rules', async () => {
  await pageFixture(async ({ rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
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
  });
});

test('Accessibility lists what envUI and the application provide, and a Key and Action table', async () => {
  await pageFixture(async ({ rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
    // Accessibility: what envUI and the application provide, and a Key and Action table.
    await rejects(frontmatter + body.replace('### You provide', '### Notes'), /You provide/);
    await rejects(
      frontmatter +
        body.replace('### envUI provides\n\n- The switch role.\n', '### envUI provides\n'),
      /"### envUI provides" list/,
    );
    await rejects(frontmatter + body.replace('| Key | Action |', '| Keys | Result |'), /"Key"/);
  });
});

test('props, headings, quotes and specimens are written as the structure reads them', async () => {
  await pageFixture(async ({ rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
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
  });
});

test('a page saved with CRLF line endings reads as it does with LF', async () => {
  await pageFixture(async ({ page, read }) => {
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
