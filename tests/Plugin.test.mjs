import assert from 'node:assert/strict';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  libraryVersion,
  pluginDifferences,
  pluginDirectory,
  skillsSource,
  syncPlugin,
} from '../scripts/GeneratePlugin.mjs';

// The repository is the marketplace of the envui agent plugin, with a manifest and a marketplace
// file for each of the two clients that read it (.claude-plugin and .codex-plugin, .claude-plugin
// and .agents/plugins). These checks hold them to the formats the clients read, to each other and
// to the library's version; docs/agent-tooling.md names the clients and their validators.

const repository = fileURLToPath(new URL('../', import.meta.url));
const plugin = resolve(repository, pluginDirectory);
const json = (path) => JSON.parse(readFileSync(resolve(repository, path), 'utf8'));
const skillNames = readdirSync(resolve(repository, skillsSource)).sort();
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

test('the plugin carries the current skills and the version of @envsemble/envui', () => {
  assert.deepEqual(
    pluginDifferences(repository).map(({ path, reason }) => `${path}: ${reason}`),
    [],
    'Run `npm run plugin:generate` and commit plugin/.',
  );
});

test('the generator finds a stale copy, a stray file and a stale version, and repairs them', () => {
  const root = mkdtempSync(join(tmpdir(), 'envui-plugin-'));
  try {
    for (const path of [skillsSource, pluginDirectory, 'packages/ui/package.json'])
      cpSync(resolve(repository, path), join(root, path), { recursive: true });
    assert.deepEqual(pluginDifferences(root), []);

    const skill = join(root, pluginDirectory, 'skills', skillNames[0], 'SKILL.md');
    writeFileSync(skill, `${readFileSync(skill, 'utf8')}\nEdited in the copy.\n`);
    writeFileSync(join(root, pluginDirectory, 'skills', skillNames[0], 'stray.md'), 'Stray.\n');
    const packageFile = join(root, 'packages/ui/package.json');
    const library = JSON.parse(readFileSync(packageFile, 'utf8'));
    writeFileSync(packageFile, JSON.stringify({ ...library, version: '9.8.7-next.6' }));

    assert.deepEqual(
      pluginDifferences(root)
        .map(({ path, reason }) => `${path}: ${reason}`)
        .sort(),
      [
        `${pluginDirectory}/.claude-plugin/plugin.json: version ${library.version}, not @envsemble/envui 9.8.7-next.6`,
        `${pluginDirectory}/.codex-plugin/plugin.json: version ${library.version}, not @envsemble/envui 9.8.7-next.6`,
        `${pluginDirectory}/skills/${skillNames[0]}/SKILL.md: differs from ${skillsSource}/${skillNames[0]}/SKILL.md`,
        `${pluginDirectory}/skills/${skillNames[0]}/stray.md: not in ${skillsSource}`,
      ],
    );
    syncPlugin(root);
    assert.deepEqual(pluginDifferences(root), []);
    for (const manifest of ['.claude-plugin', '.codex-plugin']) {
      const text = readFileSync(join(root, pluginDirectory, manifest, 'plugin.json'), 'utf8');
      assert.equal(JSON.parse(text).version, '9.8.7-next.6');
      // Only the version line changes, so the file keeps its formatting.
      assert.equal(
        text.replace('9.8.7-next.6', library.version),
        readFileSync(resolve(plugin, manifest, 'plugin.json'), 'utf8'),
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the plugin holds its manifests, the MCP configuration and the skills, nothing else', () => {
  assert.deepEqual(readdirSync(plugin).sort(), [
    '.claude-plugin',
    '.codex-plugin',
    '.mcp.json',
    'skills',
  ]);
  assert.deepEqual(readdirSync(resolve(plugin, '.claude-plugin')), ['plugin.json']);
  assert.deepEqual(readdirSync(resolve(plugin, '.codex-plugin')), ['plugin.json']);
  assert.deepEqual(readdirSync(resolve(plugin, 'skills')).sort(), skillNames);
});

test('the plugin manifests name envui, agree with each other and carry the library version', () => {
  const manifest = json(`${pluginDirectory}/.claude-plugin/plugin.json`);
  const mirrored = json(`${pluginDirectory}/.codex-plugin/plugin.json`);
  const version = libraryVersion(repository);
  for (const [client, entry] of [
    ['.claude-plugin', manifest],
    ['.codex-plugin', mirrored],
  ]) {
    assert.equal(entry.name, 'envui', `${client}: name`);
    assert.match(entry.name, kebab, `${client}: the name is kebab-case`);
    assert.equal(entry.version, version, `${client}: version`);
    assert.match(entry.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, `${client}: semver`);
    assert.equal(typeof entry.description, 'string', `${client}: description`);
    assert.ok(entry.description.length > 0, `${client}: description`);
    assert.equal(typeof entry.author?.name, 'string', `${client}: author.name`);
  }
  // The mirrored manifest repeats the fields and also names where the skills and the servers are.
  const shared = Object.fromEntries(
    Object.entries(mirrored).filter(
      ([key]) => !['skills', 'mcpServers', 'interface'].includes(key),
    ),
  );
  assert.deepEqual(shared, manifest, '.codex-plugin repeats .claude-plugin');
  assert.equal(mirrored.skills, './skills/');
  assert.equal(mirrored.mcpServers, './.mcp.json');
  for (const field of ['skills', 'mcpServers'])
    assert.ok(existsSync(resolve(plugin, mirrored[field])), `.codex-plugin: ${field} exists`);
  assert.equal(mirrored.interface.displayName, 'envUI');
  for (const field of ['shortDescription', 'developerName', 'category'])
    assert.equal(typeof mirrored.interface[field], 'string', `.codex-plugin: interface.${field}`);
  assert.ok(
    Array.isArray(mirrored.interface.capabilities),
    '.codex-plugin: interface.capabilities',
  );
});

test('the MCP server runs from the envUI the project has installed', () => {
  assert.deepEqual(json(`${pluginDirectory}/.mcp.json`), {
    mcpServers: {
      envui: { command: 'node', args: ['node_modules/@envsemble/envui/bin/envui.mjs', 'mcp'] },
    },
  });
  assert.ok(existsSync(resolve(repository, 'packages/ui/bin/envui.mjs')));
});

test('both marketplaces are named envui and list the plugin in plugin/', () => {
  const marketplace = json('.claude-plugin/marketplace.json');
  const mirrored = json('.agents/plugins/marketplace.json');
  assert.equal(marketplace.name, 'envui');
  assert.equal(mirrored.name, 'envui');
  assert.equal(typeof marketplace.owner?.name, 'string', 'owner.name');
  assert.equal(mirrored.interface?.displayName, 'envUI');
  assert.deepEqual(
    marketplace.plugins.map((entry) => entry.name),
    ['envui'],
  );
  assert.deepEqual(
    mirrored.plugins.map((entry) => entry.name),
    ['envui'],
  );
  const [entry] = marketplace.plugins;
  const [mirroredEntry] = mirrored.plugins;
  assert.equal(mirroredEntry.source.source, 'local');
  for (const source of [entry.source, mirroredEntry.source.path]) {
    // Relative to the repository root, the folder that holds .claude-plugin/ and .agents/.
    assert.match(source, /^\.\//);
    assert.doesNotMatch(source, /\.\./);
    assert.equal(resolve(repository, source), plugin);
  }
  // The version lives in plugin.json alone; an entry that repeats it can disagree.
  assert.equal(entry.version, undefined);
  assert.equal(mirroredEntry.version, undefined);
  assert.deepEqual(mirroredEntry.policy, {
    installation: 'AVAILABLE',
    authentication: 'ON_INSTALL',
  });
  assert.equal(typeof mirroredEntry.category, 'string');
});

test('each packaged skill is named after its folder and links only inside the skills', () => {
  const skills = resolve(plugin, 'skills');
  for (const name of skillNames) {
    const file = resolve(skills, name, 'SKILL.md');
    const text = readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1];
    assert.ok(frontmatter, `${name}: frontmatter`);
    assert.match(frontmatter, new RegExp(`^name: ${name}$`, 'm'), `${name}: name`);
    assert.match(frontmatter, /^description: \S/m, `${name}: description`);
    assert.match(name, kebab);
    for (const [, target] of text.replace(/`[^`\n]*`/g, '').matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
      const linked = resolve(dirname(file), target.split('#')[0]);
      assert.ok(existsSync(linked), `${name}: ${target} exists`);
      assert.ok(
        !relative(skills, linked).startsWith(`..${sep}`),
        `${name}: ${target} stays in the plugin`,
      );
    }
  }
});

test('the npm package leaves out the plugin and the marketplaces', () => {
  const { files } = json('packages/ui/package.json');
  for (const entry of files)
    assert.doesNotMatch(entry, /plugin|marketplace|^\.agents/, `packages/ui files: ${entry}`);
});
