#!/usr/bin/env node
// envui-codemods: upgrades an application from envUI 0.x to 1.0 by running a transform over its
// files with jscodeshift's runner. See README.md.
import { readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { loadMap } from '../src/map.mjs';
import { projectRoot } from '../src/transforms/v1-classes.mjs';
import { transforms } from '../src/transforms.mjs';

const require = createRequire(import.meta.url);

const names = Object.keys(transforms);
const width = Math.max(...names.map((name) => name.length));
const list = names
  .map((name) => `  ${name.padEnd(width)}  ${transforms[name].description}`)
  .join('\n');
const usage = `Usage: envui-codemods <transform> [paths...] [options]

Transforms:
${list}

Options:
  --dry                    List the files that would change, and report, without writing.
  --print                  Print every changed file under its name.
  --extensions=<list>      Comma-separated extensions to read instead of the transform's.
  --ignore-pattern=<glob>  Skip matching files and folders; repeatable. node_modules, dist
                           and .git are always skipped.
  --map=<path>             Use another rename map: a folder shaped like src/maps/v1, or one
                           JSON file with its merged sections.
  --list                   List the transforms.
  -h, --help               Show this help.

Paths default to the current folder. Run v1-names, v1-structure, v1-render, v1-stack, v1-props,
then v1-classes, then type-check.`;

/** Paths relative to the working folder, with forward slashes, for ignore patterns. */
const portable = (path) =>
  relative(process.cwd(), path)
    .split(sep)
    .join('/')
    .replace(/^(\.\.\/)+/, '');

/**
 * Whether a path matches one of the patterns: a pattern without a slash matches a file or folder
 * name at any depth, one with a slash matches the path from the working folder and what is in it.
 */
function ignoreMatcher(patterns) {
  const rules = patterns.map((pattern) =>
    pattern.replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/+$/, ''),
  );
  return (path) => {
    const segments = path.split('/');
    return rules.some((rule) =>
      rule.includes('/')
        ? posix.matchesGlob(path, rule) || posix.matchesGlob(path, `${rule}/**`)
        : segments.some((segment) => posix.matchesGlob(segment, rule)),
    );
  };
}

const isDirectory = (path) => {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
};

/** The files to transform under the given paths, in a stable order, and the paths that are missing. */
function collectFiles(paths, extensions, isIgnored) {
  const files = [];
  const missing = [];
  const visit = (path, given) => {
    let stats;
    try {
      stats = statSync(path);
    } catch {
      missing.push(path);
      return;
    }
    if (!given && isIgnored(portable(path))) return;
    if (stats.isDirectory()) {
      const children = readdirSync(path, { withFileTypes: true }).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      for (const child of children) {
        // Linked folders are migrated where they live; following them could loop.
        if (child.isSymbolicLink() && isDirectory(join(path, child.name))) continue;
        visit(join(path, child.name), false);
      }
    } else if (stats.isFile() && extensions.has(extname(path).slice(1).toLowerCase())) {
      files.push(relative(process.cwd(), path) || path);
    }
  };
  for (const path of paths) visit(resolve(path), true);
  return { files, missing };
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      dry: { type: 'boolean', default: false },
      print: { type: 'boolean', default: false },
      extensions: { type: 'string' },
      'ignore-pattern': { type: 'string', multiple: true, default: [] },
      map: { type: 'string' },
      list: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
} catch (error) {
  console.error(`${error.message}\n\n${usage}`);
  process.exit(2);
}
const { values, positionals } = parsed;

if (values.help) {
  console.log(usage);
  process.exit(0);
}
if (values.list) {
  console.log(list);
  process.exit(0);
}

const [name, ...paths] = positionals;
const transform = transforms[name];
if (!transform) {
  console.error(`${name ? `Unknown transform: ${name}` : 'Name a transform.'}\n\n${usage}`);
  process.exit(2);
}

let map;
if (values.map) {
  map = resolve(values.map);
  try {
    loadMap(map);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}

const extensions = new Set(
  (values.extensions?.split(',') ?? transform.extensions)
    .map((extension) => extension.trim().replace(/^\./, '').toLowerCase())
    .filter(Boolean),
);
const isIgnored = ignoreMatcher(['node_modules', 'dist', '.git', ...values['ignore-pattern']]);
const scanned = paths.length ? paths : ['.'];
const { files, missing } = collectFiles(scanned, extensions, isIgnored);
// The projects scanned, each the nearest folder with a package.json at or above a path:
// v1-classes tells test files by their path below their project, not the working folder.
const roots = scanned
  .map((path) => resolve(path))
  .map((path) => (isDirectory(path) ? path : dirname(path)))
  .map((folder) => projectRoot(folder) ?? folder);
for (const path of missing) console.error(`Skipped ${path}, which does not exist.`);

const Runner = require('jscodeshift/src/Runner.js');
// The workers run src/run-transform.mjs, which runs the named transform and names each file it
// changes; jscodeshift's own --print would print the new text without the file's name.
const result = await Runner.run(
  fileURLToPath(new URL('../src/run-transform.mjs', import.meta.url)),
  files,
  {
    // The transforms are ES modules, which Node loads as they are; Babel would compile them to
    // CommonJS and break them.
    babel: false,
    parser: 'tsx',
    dry: values.dry,
    print: false,
    printChanges: values.print,
    transform: name,
    map,
    roots,
    verbose: 0,
  },
);

const processed = result.ok + result.nochange + result.skip + result.error;
if (processed < files.length)
  console.error(`${files.length - processed} files were not processed: a worker stopped early.`);
if (result.error > 0 || processed < files.length || missing.length > 0) process.exitCode = 1;
