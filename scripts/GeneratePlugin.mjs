// Keeps the agent plugin in plugin/ in step with its sources. The repository is the plugin's
// marketplace (.claude-plugin/marketplace.json and .agents/plugins/marketplace.json), and a client
// installs a copy of plugin/ alone, so the plugin carries its own copy of the skills.
//
//   node scripts/GeneratePlugin.mjs           copy .agents/skills to plugin/skills and set the version
//   node scripts/GeneratePlugin.mjs --check   fail when plugin/ differs from them
//
// .agents/skills is the one source of the skills: plugin/skills is its exact copy, committed so
// that the marketplace serves it. The plugin's version in plugin/.claude-plugin/plugin.json and
// plugin/.codex-plugin/plugin.json is the version of @envsemble/envui, so every release raises it
// and clients fetch the new copy; `npm run changeset:version` runs this script.
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));

export const pluginDirectory = 'plugin';
export const skillsSource = '.agents/skills';
export const pluginManifests = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json'];

const toPosix = (path) => path.split(sep).join('/');
// Git checks text out with the platform's line endings; compare what it commits.
const normalized = (buffer) => buffer.toString('utf8').replaceAll('\r\n', '\n');

/** Every file under a directory, as paths relative to it; none when it is missing. */
function filesUnder(directory) {
  let names;
  try {
    names = readdirSync(directory);
  } catch {
    return [];
  }
  return names.flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory()
      ? filesUnder(path).map((file) => `${name}/${file}`)
      : [name];
  });
}

/** The version of @envsemble/envui, which the plugin carries. */
export function libraryVersion(root = defaultRoot) {
  return JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8')).version;
}

/** A manifest's text with its top-level "version" set; the rest of the text is kept as written. */
function withVersion(text, version, path) {
  const pattern = /^( {2}"version": )"[^"]*"/m;
  if (!pattern.test(text)) throw new Error(`${path} has no top-level "version" line.`);
  return text.replace(pattern, `$1${JSON.stringify(version)}`);
}

/**
 * What plugin/ should hold, as differences from what it holds: each with its repository path, why
 * it differs, and the content to write, or null for a file to remove.
 */
export function pluginDifferences(root = defaultRoot) {
  const differences = [];
  const sourceDirectory = resolve(root, skillsSource);
  const copyDirectory = resolve(root, pluginDirectory, 'skills');
  const sources = filesUnder(sourceDirectory);
  if (!sources.length) throw new Error(`${skillsSource} holds no skills.`);
  for (const file of sources) {
    const expected = readFileSync(join(sourceDirectory, file));
    const path = `${pluginDirectory}/skills/${file}`;
    let actual;
    try {
      actual = readFileSync(join(copyDirectory, file));
    } catch {
      differences.push({
        path,
        reason: `missing copy of ${skillsSource}/${file}`,
        content: expected,
      });
      continue;
    }
    if (normalized(actual) !== normalized(expected))
      differences.push({ path, reason: `differs from ${skillsSource}/${file}`, content: expected });
  }
  const known = new Set(sources);
  for (const file of filesUnder(copyDirectory))
    if (!known.has(file))
      differences.push({
        path: `${pluginDirectory}/skills/${file}`,
        reason: `not in ${skillsSource}`,
        content: null,
      });

  const version = libraryVersion(root);
  for (const manifest of pluginManifests) {
    const path = `${pluginDirectory}/${manifest}`;
    const text = readFileSync(resolve(root, path), 'utf8');
    const current = JSON.parse(text).version;
    if (current !== version)
      differences.push({
        path,
        reason: `version ${current}, not @envsemble/envui ${version}`,
        content: withVersion(text, version, path),
      });
  }
  return differences;
}

/** Writes the differences; returns them. */
export function syncPlugin(root = defaultRoot) {
  const differences = pluginDifferences(root);
  for (const { path, content } of differences) {
    const target = resolve(root, path);
    const inside = toPosix(relative(resolve(root, pluginDirectory), target));
    if (inside.startsWith('../') || isAbsolute(inside))
      throw new Error(`Refusing to write outside ${pluginDirectory}/: ${path}`);
    if (content === null) rmSync(target);
    else {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
  }
  return differences;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.includes('--check');
  if (process.argv.slice(2).some((argument) => argument !== '--check'))
    throw new Error('Usage: GeneratePlugin.mjs [--check]');
  const version = libraryVersion();
  if (checkOnly) {
    const differences = pluginDifferences();
    if (differences.length) {
      for (const { path, reason } of differences) console.error(`  ${path}: ${reason}`);
      console.error('The plugin is stale; run `npm run plugin:generate` and commit plugin/.');
      process.exit(1);
    }
    console.log(`Verified the plugin: the skills of ${skillsSource}, version ${version}.`);
  } else {
    const written = syncPlugin();
    for (const { path, reason } of written) console.log(`  ${path}: ${reason}`);
    console.log(
      `${written.length ? 'Updated' : 'Verified'} the plugin: the skills of ${skillsSource}, version ${version}.`,
    );
  }
}
