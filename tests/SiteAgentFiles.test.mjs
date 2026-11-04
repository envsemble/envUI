// The files the hosted site serves to coding agents at its root: the setup skill, SKILL.md, and the
// signpost llms.txt (scripts/site/SiteAgentFiles.ts).
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { libraryVersion, renderLlmsText, renderSkill } from '../scripts/site/SiteAgentFiles.ts';

const repository = fileURLToPath(new URL('../', import.meta.url));
const version = libraryVersion();
const skill = renderSkill();
const llms = renderLlmsText();

/** The skill's frontmatter and body. */
function skillParts(text) {
  const [, frontmatter, body] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text) ?? [];
  assert.ok(frontmatter, 'SKILL.md starts with frontmatter');
  return { metadata: parse(frontmatter), body };
}

test('the setup skill names itself, says when to use it and carries the package version', () => {
  const { metadata, body } = skillParts(skill);
  assert.equal(metadata.name, 'envui-setup');
  assert.match(metadata.description, /@envsemble\/envui/);
  assert.match(metadata.description, /Use when/);
  assert.equal(metadata.metadata.version, version);
  assert.doesNotMatch(skill, /\{\{/, 'every placeholder is filled in');
  assert.equal(
    renderSkill({ version: '9.8.7-test.1', template: 'version: {{version}} and {{version}}\r\n' }),
    'version: 9.8.7-test.1 and 9.8.7-test.1\n',
  );
  assert.match(body, /^# Set up envUI$/m);
});

test('the setup skill stays short and pins every envUI package at its version', () => {
  const words = skill.split(/\s+/).filter(Boolean).length;
  assert.ok(words < 1300, `SKILL.md has ${words} words; keep it under 1300`);
  const pinned = [...skill.matchAll(/@envsemble\/[a-z-]+@([^\s`'"]+)/g)].map((match) => match[1]);
  assert.ok(pinned.length > 0);
  assert.deepEqual([...new Set(pinned)], [version]);
  // The user sees a checklist and agrees before anything changes.
  assert.match(skill, /checklist and wait for a yes/);
  assert.match(skill, /You can skip any step/);
});

test("the skill's AGENTS.md block is short and points at docs the package ships", () => {
  const block = /```md\n(<!-- BEGIN envui -->[\s\S]*?<!-- END envui -->)\n```/.exec(skill)?.[1];
  assert.ok(block, 'the skill gives the AGENTS.md block between its markers');
  const text = block.replace(/<!--[^>]*-->/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  assert.ok(words <= 80, `the AGENTS.md block has ${words} words; keep it to about 100 tokens`);
  assert.match(text, /every UI element/);
  assert.match(text, /propose an addition to envUI instead of writing a local copy/);
  // The package ships docs/ with its index and the examples, and the lint packages their READMEs.
  const library = JSON.parse(readFileSync(join(repository, 'packages/ui/package.json'), 'utf8'));
  assert.ok(library.files.includes('docs'));
  for (const path of ['docs/index.md', 'docs/setup.md', 'docs/migration.md'])
    assert.ok(skill.includes(`node_modules/@envsemble/envui/${path}`) || text.includes(path), path);
  assert.ok(existsSync(join(repository, 'docs/index.md')));
  for (const name of ['eslint-plugin', 'stylelint-config']) {
    const manifest = JSON.parse(
      readFileSync(join(repository, `packages/${name}/package.json`), 'utf8'),
    );
    assert.equal(manifest.version, version, `${manifest.name} has envUI's version`);
    assert.ok(manifest.files.includes('README.md'), `${manifest.name} ships its README`);
    assert.ok(skill.includes(manifest.name), `the skill installs ${manifest.name}`);
  }
});

test('llms.txt introduces envUI and points to the setup skill and the installed docs, no pages', () => {
  const [title, , summary] = llms.split('\n');
  assert.equal(title, '# envUI');
  assert.match(summary, /^> envUI is /);
  assert.match(llms, /^- \[Setup skill\]\(https:\/\/envui\.envsemble\.com\/SKILL\.md\)/m);
  assert.match(llms, /node_modules\/@envsemble\/envui\/docs\//);
  // A signpost, not another index: the skill is its only link.
  assert.equal([...llms.matchAll(/\]\(([^)]+)\)/g)].length, 1);
  assert.ok(llms.endsWith('\n') && !llms.endsWith('\n\n'));
});

test('the Docs home and setup lead to the skill the site serves at /SKILL.md', () => {
  const docsHome = readFileSync(join(repository, 'apps/site/src/pages/DocsPages.tsx'), 'utf8');
  const prompt = /setupPrompt = '([^']+)'/.exec(docsHome)?.[1];
  assert.equal(prompt, 'Set up envUI in my app: envui.envsemble.com/SKILL.md');
  const setup = readFileSync(join(repository, 'docs/setup.md'), 'utf8');
  assert.ok(setup.includes('(https://envui.envsemble.com/SKILL.md)'));
});
