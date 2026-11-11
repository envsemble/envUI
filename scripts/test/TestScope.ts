// Chooses what `npm run check` and `npm run check:affected` run for a change: which files to lint,
// whether to typecheck, which generated files to check, and which browser specs to run.
//
// A spec is named after its component (tests/browser/library/Button.spec.ts), and runs when that
// component changes: a library or fixture file runs the spec of its name, or of the name `aliases`
// gives it, and the specs whose fixtures use it (FixtureImports.ts); a changed spec runs itself; a
// changed helper runs the specs that import it; and `pathRules` lists what other paths need, such
// as the shared files and the catalogue, which name no component. The affected tier runs every
// spec a change concerns; the fast tier leaves a helper many specs import to it, and of a file many
// fixtures use runs the most specific few. A path that matches nothing runs no browser spec:
// `npm run verify` covers it. Check.ts runs the result, and tests/tooling/TestScope.test.mjs covers
// the logic.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { fixtureUse, importsOf, isComponentTest, specPaths } from './FixtureImports.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

/**
 * Files whose specs neither their name nor the fixtures' imports find, such as a part a fixture
 * reaches only through a component many specs use: name → the specs about it.
 */
export const aliases: Record<string, string[]> = {
  SearchField: ['TextField'],
  FieldFrame: ['TextField'],
  Popover: ['Dialog'],
  Spinner: ['Skeleton'],
  Badge: ['DiffStat'],
  ConfirmButton: ['Button'],
  AvatarButton: ['Button'],
  LinkProvider: ['Button'],
  ActionElement: ['Button'],
  MenuPopup: ['Menu', 'Menubar'],
  ResizeHandle: ['ResizeHandle', 'Panes'],
  useResize: ['Panes', 'PanelDock'],
  PopupSurface: ['PopupSurface', 'PortalContainer'],
  PortalContainerContext: ['PortalContainer'],
  useDirection: ['Direction'],
  Theme: ['ThemePreference', 'ThemeContrast', 'WindowClasses'],
  Popup: ['WindowClasses', 'PopupSurface'],
  windowClasses: ['WindowClasses'],
  themeBootstrap: ['ThemePreference', 'ThemeContrast'],
  'theme-bootstrap': ['ThemePreference', 'ThemeContrast'],
  Avatar: ['AvatarGroup'],
  // The icon wrapper sizes whatever every icon slot holds, a Graphic's included.
  Icon: ['Graphic', 'Button', 'IconButton', 'Skeleton'],
  PickerPopup: ['PickerPopup', 'DatePicker', 'TimePicker', 'MonthPicker'],
  DatePicker: ['DatePicker', 'PickerPopup'],
  TimePicker: ['TimePicker', 'PickerPopup'],
  MonthPicker: ['MonthPicker', 'PickerPopup'],
  TimeList: ['DatePicker', 'TimePicker', 'ForcedColors'],
  TimeWheel: ['DatePicker', 'TimePicker', 'ForcedColors'],
  timeWheelRows: ['DatePicker', 'TimePicker'],
  useTimeWheelTurn: ['DatePicker', 'TimePicker'],
  useTimeWheelGestures: ['DatePicker', 'TimePicker'],
  MonthGrid: ['MonthPicker', 'ForcedColors'],
  Code: ['CodeBlock'],
  TooltipPopup: ['Tooltip'],
  accessibleName: ['Tooltip'],
  DialogParts: ['Dialog', 'Skeleton'],
  skeleton: ['Skeleton'],
  skeletonShift: ['Skeleton'],
  Listbox: ['Select', 'Combobox'],
  ListRow: ['List'],
  'rich-text': ['RichTextEditor'],
  color: ['ColorPicker'],
};

/** The specs a token, theme or other shared change runs. */
const shared = ['Contrast', 'Colors', 'ThemeContrast', 'Scale'];
/** The site's own specs; some open its hosted build. */
const siteSpecs = ['SitePrerender', 'SiteFailures', 'SiteSmoke'];

/** A check a changed path needs beyond linting and formatting it. */
type Need =
  /** `tsc` on the projects. */
  | 'typecheck'
  /** ESLint, Stylelint or Prettier on the whole repository rather than the changed files. */
  | 'lint'
  | 'css'
  | 'format'
  /** The generated files of the tokens, the icons or the documentation. */
  | 'tokens'
  | 'icons'
  | 'docs'
  /** The library build, for the unit tests that read it. */
  | 'library';

/**
 * What paths need besides their own lint and format and the specs of their names: checks and
 * browser specs. Each path is a glob from the repository's root, `**` reaching into folders, and
 * names files that exist (tests/tooling/TestScope.test.mjs).
 */
export const pathRules: { paths: string[]; needs?: Need[]; specs?: string[] }[] = [
  {
    paths: [
      'packages/ui/src/**/*.{ts,tsx}',
      'apps/site/src/**/*.{ts,tsx}',
      'tests/fixture/**/*.{ts,tsx}',
      'tests/types/**/*.{ts,tsx}',
      'scripts/**/*.ts',
      '**/tsconfig.json',
    ],
    needs: ['typecheck'],
  },
  // Repository-wide configuration reruns the whole of its check.
  { paths: ['eslint.config.mjs', 'knip.jsonc', 'packages/eslint-plugin/**'], needs: ['lint'] },
  {
    paths: ['stylelint.config.mjs', 'stylelint-suppressions.json', 'packages/stylelint-config/**'],
    needs: ['css'],
  },
  { paths: ['.prettierrc.json', '.prettierignore'], needs: ['format'] },
  {
    paths: ['package.json', 'package-lock.json'],
    needs: ['lint', 'css', 'format', 'typecheck', 'library'],
    specs: [...shared, 'CascadeLayers', 'ForcedColors'],
  },
  // The tokens and the documentation that lists them, and the shared specs.
  {
    paths: [
      'packages/ui/tokens/**',
      'packages/ui/terrazzo.config.mjs',
      'packages/ui/src/generated/**',
      'packages/ui/src/styles/TokensHandwritten.css',
      'scripts/build/BuildTokens.ts',
      'scripts/build/GeneratePalette.ts',
      'scripts/build/tokens/**',
    ],
    needs: ['tokens', 'docs'],
    specs: shared,
  },
  // The lint packages' copies of the tokens, the color policy and the entry points, and their sources.
  {
    paths: [
      'scripts/build/SyncLintPackages.ts',
      'scripts/docs/LibraryEntryPoints.ts',
      'packages/ui/package.json',
      'packages/eslint-plugin/src/data/entryPoints.json',
      'scripts/build/LintPackageTokens.js',
      'scripts/build/LintPackageColorPolicy.js',
      'packages/eslint-plugin/src/tokens.js',
      'packages/eslint-plugin/src/colorPolicy.js',
      'packages/eslint-plugin/src/data/tokens.json',
      'packages/stylelint-config/src/tokens.js',
      'packages/stylelint-config/src/colorPolicy.js',
      'packages/stylelint-config/src/data/tokens.json',
    ],
    needs: ['tokens', 'docs'],
  },
  { paths: ['packages/ui/src/styles/Theme.css', 'tests/contrast/**'], specs: shared },
  {
    paths: [
      'packages/ui/src/styles/index.css',
      'packages/ui/src/styles/Motion.css',
      'packages/ui/src/index.ts',
    ],
    specs: [...shared, 'CascadeLayers', 'ForcedColors'],
  },
  {
    paths: [
      'packages/ui/src/icons/**',
      'packages/ui/vendor/**',
      'packages/ui/icon-manifest.json',
      'scripts/build/GenerateIcons.ts',
      'scripts/build/SyncIcons.ts',
    ],
    needs: ['icons'],
  },
  // The documentation the sources and docs/ make.
  {
    paths: ['packages/ui/src/**/*.{ts,tsx,css,json}', 'docs/**', '.changeset/**'],
    needs: ['docs'],
  },
  { paths: ['apps/site/**', 'scripts/docs/**'], needs: ['docs'], specs: siteSpecs },
  { paths: ['wrangler.jsonc', 'scripts/site/**'], specs: siteSpecs },
  {
    paths: [
      'packages/ui/src/**',
      'packages/ui/package.json',
      'packages/ui/README.md',
      'README.md',
      'scripts/build/BuildLibrary.ts',
      'scripts/build/ClientModules.ts',
      'scripts/build/DependencyNotices.ts',
      'scripts/release/ValidateRelease.ts',
    ],
    needs: ['library'],
  },
  { paths: ['packages/ui/src/foundations/messages/**'], specs: ['Messages'] },
  { paths: ['packages/ui/src/dev.ts', 'packages/ui/src/dev/**'], specs: ['DevMode'] },
  // Live development edits the catalogue's sources and watches them update; the affected tier runs it.
  { paths: ['apps/site/src/**'], specs: ['LiveDevelopment'] },
];

/** The rules whose paths a changed path matches. */
const rulesOf = (path: string) =>
  pathRules.filter((rule) => rule.paths.some((glob) => posix.matchesGlob(path, glob)));

/** In the fast tier, more specs than this importing a changed helper leaves them to the affected tier. */
const helperBudget = 8;
/** In the fast tier, more specs than this whose fixtures use a changed file run the most specific. */
const fixtureBudget = 6;

/** A spec's file, by its name: Button for tests/browser/library/Button.spec.ts. */
export const specFile = (name: string, root = repositoryRoot) =>
  specPaths(root).get(name) ?? `tests/browser/library/${name}.spec.ts`;
const baseName = (path: string) =>
  posix.basename(path).replace(/\.(?:spec\.ts|test\.tsx|fixture\.tsx?|tsx?|css|m?js|html)$/, '');

/** fixtureUse reads every fixture and library module: once per checkout and process. */
const fixtureUses = new Map<string, ReturnType<typeof fixtureUse>>();
function cachedFixtureUse(root: string) {
  const cached = fixtureUses.get(root) ?? fixtureUse(root);
  fixtureUses.set(root, cached);
  return cached;
}

/** What a spec needs beyond the development servers, read from its source. */
export function specNeeds(name: string, root = repositoryRoot) {
  const source = read(root, specFile(name, root));
  return {
    // Opens the hosted build, which npm run build:site writes.
    site: importsOf(source).some(({ specifier }) => specifier === '../helpers/HostedSite'),
    // Opens a page that the unit tests on the library build render.
    library: /\.cache\/Hydration\.html/.test(source),
    // Edits sources, so it runs alone once nothing else reads them.
    live: name === 'LiveDevelopment',
  };
}

/** The checkout to read, and whether the selection is the affected tier's, which runs every spec. */
interface ScopeOptions {
  root?: string;
  affected?: boolean;
}

/**
 * The browser specs a change runs, by name (Button for tests/browser/library/Button.spec.ts), each
 * with why; the paths that run none; the changed helpers with the specs that import them; and in
 * the fast tier, the files more specs' fixtures use than run, with how many do.
 */
export function specsFor(
  paths: readonly string[],
  { root = repositoryRoot, affected = false }: ScopeOptions = {},
) {
  const specs = new Map<string, Set<string>>();
  const unmatched: string[] = [];
  const widelyUsed = new Map<string, number>();
  let specsUsing: ((path: string) => string[]) | undefined;
  // By name, as written: a file system that ignores case would find Table's spec for table.
  const written = new Set(specPaths(root).keys());
  const exists = (name: string) => written.has(name);
  const add = (name: string, reason: string) => {
    if (!exists(name)) return false;
    specs.set(name, (specs.get(name) ?? new Set()).add(reason));
    return true;
  };
  const helpers = new Map<string, string[]>();
  for (const path of paths) {
    let found = false;
    if (
      /^tests\/browser\/(?:library|site)\/[^/]+\.spec\.ts$/.test(path) ||
      /^tests\/component\/[^/]+\.test\.tsx$/.test(path)
    )
      found = add(baseName(path), 'changed spec');
    // What every component test runs on: its configuration, setup and helpers, and the mount it
    // shares with the fixture page.
    else if (
      /^tests\/component\/[^/]+\.tsx?$/.test(path) ||
      path === 'tests/fixture/FixtureMount.tsx'
    ) {
      for (const [name, file] of specPaths(root))
        if (isComponentTest(file)) found = add(name, `runs on ${path}`) || found;
    } else if (/^tests\/browser\/helpers\/[^/]+\.ts$/.test(path)) {
      const helper = baseName(path);
      const users = [...written].filter((spec) =>
        importsOf(read(root, specFile(spec, root))).some(
          ({ specifier }) => specifier === `../helpers/${helper}`,
        ),
      );
      helpers.set(path, users);
      if (affected || users.length <= helperBudget)
        for (const user of users) found = add(user, `imports ${path}`) || found;
    } else if (/^(?:packages\/ui\/src|tests\/fixture)\//.test(path)) {
      // Combobox.tsx and Combobox.fixture.tsx are about Combobox, and a file in layout/panel-dock/
      // about PanelDock. An icon's name names a symbol, not a component: icons/Palette.tsx is not
      // about CommandPalette.
      const name = baseName(path);
      const folder = posix
        .basename(posix.dirname(path))
        .replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());
      const candidates = path.startsWith('packages/ui/src/icons/') ? [] : [name, folder];
      const specsOf = (each: string) =>
        Object.hasOwn(aliases, each) ? aliases[each] : exists(each) ? [each] : [];
      const component = candidates.find((each) => specsOf(each).length);
      const named = component ? specsOf(component) : [];
      for (const spec of named) found = add(spec, `about ${component} (${path})`) || found;
      // The specs whose fixtures use it: all of them in the affected tier or when they are few;
      // else, for a file of no spec's name, the most specific few, leaving the rest to the
      // affected tier.
      specsUsing ??= cachedFixtureUse(root);
      const using = specsUsing(path).filter(exists);
      if (affected || using.length <= fixtureBudget)
        for (const spec of using) found = add(spec, `its fixture uses ${path}`) || found;
      else {
        widelyUsed.set(path, using.length);
        if (!named.length)
          for (const spec of using.slice(0, fixtureBudget))
            found = add(spec, `among the fixtures that use ${path}`) || found;
      }
    }
    for (const rule of rulesOf(path))
      for (const name of rule.specs ?? []) found = add(name, path) || found;
    if (!found) unmatched.push(path);
  }
  return { specs, unmatched, helpers, widelyUsed };
}

/**
 * What a change needs, by file: the static checks, the generated-file checks, the browser specs
 * and the builds those open.
 */
export function selectScope(paths: readonly string[], options: ScopeOptions = {}) {
  const { root = repositoryRoot } = options;
  const scope = {
    lint: [] as string[],
    css: [] as string[],
    format: [] as string[],
    whole: { lint: false, css: false, format: false },
    typecheck: false,
    generated: new Set<string>(),
    build: { library: false, site: false },
  };
  for (const path of paths) {
    if (existsSync(resolve(root, path))) {
      if (/\.(?:[cm]?js|tsx?)$/.test(path)) scope.lint.push(path);
      if (/^(?:packages\/ui\/src|apps\/site\/src)\/.*\.css$/.test(path)) scope.css.push(path);
      scope.format.push(path);
    }
    for (const need of rulesOf(path).flatMap((rule) => rule.needs ?? []))
      if (need === 'typecheck') scope.typecheck = true;
      else if (need === 'lint' || need === 'css' || need === 'format') scope.whole[need] = true;
      else if (need === 'library') scope.build.library = true;
      else scope.generated.add(need);
  }
  const { specs, unmatched, helpers, widelyUsed } = specsFor(paths, options);
  for (const name of specs.keys()) {
    const needs = specNeeds(name, root);
    scope.build.site ||= needs.site;
    scope.build.library ||= needs.library;
  }
  return { ...scope, specs, unmatched, helpers, widelyUsed };
}

/** Which servers the specs need, for ENVUI_SERVERS (tests/browser/helpers/Servers.ts). */
export function serversFor(names: readonly string[], root = repositoryRoot) {
  const servers = new Set<string>();
  for (const name of names) {
    const source = read(root, specFile(name, root));
    if (/\bsiteDevUrl\b/.test(source)) servers.add('site');
    if (/\bsiteBuildUrl\b/.test(source)) servers.add('site-build');
    if (/\bfixtureUrl\b/.test(source)) servers.add('fixture');
  }
  return [...servers].sort();
}

// ---------------------------------------------------------------------------------------------
// Changed files

/** A changed file, and for a rename or copy the path it came from. */
export interface Change {
  status: string;
  path: string;
  from?: string;
}

/** Parses `git diff --name-status -z` output into { status, path, from } entries. */
export function parseNameStatus(text: string): Change[] {
  const fields = text.split('\0').filter((field) => field !== '');
  const entries: Change[] = [];
  for (let index = 0; index < fields.length;) {
    const status = fields[index++];
    if (/^[RC]/.test(status)) {
      const from = fields[index++];
      const path = fields[index++];
      entries.push({ status: status[0], from, path });
    } else entries.push({ status: status[0], path: fields[index++] });
  }
  return entries;
}

/** Merges diff entries and untracked paths, one entry per path, sorted. */
export function mergeChanges(entries: readonly Change[], untracked: readonly string[] = []) {
  const byPath = new Map<string, Change>();
  for (const entry of entries) byPath.set(entry.path, entry);
  for (const path of untracked) if (!byPath.has(path)) byPath.set(path, { status: 'A', path });
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

/** The integration branches a change is compared with, in order of preference. */
const defaultBases = ['origin/envui-1.0', 'origin/dev'];

function git(args: string[], root: string) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/**
 * The files changed since the merge-base with the integration branch, committed or not, and the
 * untracked ones. The branch is `base`, else ENVUI_BASE, else the first of defaultBases that exists.
 */
/** The branches to compare with, in order: `base`, else ENVUI_BASE, else defaultBases. */
export function baseCandidates(base?: string): string[] {
  return base ? [base] : process.env.ENVUI_BASE ? [process.env.ENVUI_BASE] : defaultBases;
}

export function changedFiles({
  root = repositoryRoot,
  base,
}: { root?: string; base?: string } = {}) {
  const candidates = baseCandidates(base);
  const found = candidates.find((ref) => {
    try {
      git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], root);
      return true;
    } catch {
      return false;
    }
  });
  if (!found)
    throw new Error(
      `None of ${candidates.join(', ')} exists. Fetch it, or pass --base <ref> or set ENVUI_BASE.`,
    );
  const mergeBase = git(['merge-base', 'HEAD', found], root).trim();
  const entries = parseNameStatus(
    git(['diff', '--name-status', '-z', '-M', '--no-ext-diff', mergeBase], root),
  );
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z'], root)
    .split('\0')
    .filter(Boolean);
  return { base: found, mergeBase, changes: mergeChanges(entries, untracked) };
}

function walk(root: string, directory: string, pattern: RegExp): string[] {
  const absolute = resolve(root, directory);
  if (!existsSync(absolute)) return [];
  const found: string[] = [];
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const path = posix.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...walk(root, path, pattern));
    else if (pattern.test(entry.name)) found.push(path);
  }
  return found;
}

const read = (root: string, path: string) => readFileSync(resolve(root, path), 'utf8');

/**
 * The unit test files, split into those that read the library build (packages/ui/dist, or a packed
 * tarball) and the rest, which run in seconds without it.
 */
export function unitTestFiles(root = repositoryRoot) {
  const files = [
    ...walk(root, 'tests', /\.test\.mjs$/).filter((file) => /^tests\/[^/]+\/[^/]+$/.test(file)),
    ...walk(root, 'packages', /\.test\.mjs$/).filter((file) =>
      /^packages\/[^/]+\/test\/[^/]+$/.test(file),
    ),
  ].sort();
  // A test reads the build through its path or through the packed consumer, which packs it.
  const built = files.filter((file) =>
    /packages\/ui\/dist|support\/PackedConsumer\.mjs/.test(read(root, file)),
  );
  return { built, fast: files.filter((file) => !built.includes(file)) };
}
