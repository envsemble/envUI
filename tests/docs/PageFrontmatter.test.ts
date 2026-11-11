// A page's frontmatter: what each kind of page takes, its examples' roles, and since and status.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { libraryVersions } from '../../scripts/docs/LibraryVersions.ts';
import { readDocumentation } from '../../scripts/docs/DocumentationReader.ts';
import {
  inScratchFolder,
  pageFixture,
  switchBody,
  switchFrontmatter,
} from './DocumentationFixtures.ts';

test('a page of a structured kind needs its frontmatter, and its frontmatter its examples', async () => {
  await pageFixture(async ({ rejects, docs }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
    // A page of a structured kind lists its examples; without them it is not in the structure.
    await rejects(
      frontmatter.replace(/examples:\n[\s\S]*?(?=---)/, '') + body,
      /components\/switch\.md is not in the one-file structure: its frontmatter lists no examples/,
    );
    await rejects(body, /Component page components\/switch\.md needs frontmatter/);
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

test("an example's frontmatter gives its role and caption, and an overview's its framing", async () => {
  await pageFixture(async ({ page, read, rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
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
  });
});

test("the frontmatter's fields hold what the page's kind takes", async () => {
  await pageFixture(async ({ page, read, rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
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
  });
});

test('since names a stable release or the version the changesets lead to, also in prerelease mode', async () => {
  await inScratchFolder('versions', async (fixture) => {
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
  });
});

test("a guide's status, statuses and exportAliases hold, and name only the exports it lists", async () => {
  await inScratchFolder('guide', async (directory) => {
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
  });
});
