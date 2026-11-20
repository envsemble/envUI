import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { browserTestFile, browserTestPaths, isComponentTest } from './BrowserTests.ts';
import { fixtureUse, importsOf } from './FixtureImports.ts';
import { partsFile, repositoryPath, repositoryRoot } from '../RepositoryPaths.ts';
import { baseBranch, git, mergeBase as mergeBaseOf } from '../Git.ts';

export const testsByModuleName: Record<string, string[]> = {
  SearchField: ['TextField'],
  FieldFrame: ['TextField'],
  Popover: ['Dialog'],
  AvatarButton: ['Button'],
  LinkProvider: ['Button'],
  ActionElement: ['Button'],
  MenuPopup: ['Menu', 'Menubar'],
  ResizeHandle: ['ResizeHandle', 'Panes'],
  useResize: ['Panes'],
  PopupSurface: ['PopupSurface', 'PortalContainer'],
  PortalContainerContext: ['PortalContainer'],
  useDirection: ['Direction'],
  Theme: ['ThemePreference', 'ThemeContrast', 'WindowClasses'],
  Popup: ['WindowClasses', 'PopupSurface'],
  windowClasses: ['WindowClasses'],
  themeBootstrap: ['ThemePreference', 'ThemeContrast'],
  'theme-bootstrap': ['ThemePreference', 'ThemeContrast'],
  themeStorage: ['ThemePreference'],
  'theme-storage': ['ThemePreference'],
  useStoredThemePreference: ['ThemePreference'],
  Avatar: ['AvatarGroup'],
  Icon: ['Graphic', 'Button', 'IconButton', 'Skeleton'],
  TimeList: ['DatePicker', 'TimePicker', 'ForcedColors'],
  TimeWheel: ['DatePicker', 'TimePicker', 'ForcedColors'],
  timeWheelRows: ['DatePicker', 'TimePicker'],
  useTimeWheelTurn: ['DatePicker', 'TimePicker'],
  useTimeWheelGestures: ['DatePicker', 'TimePicker'],
  MonthGrid: ['MonthPicker', 'ForcedColors'],
  TooltipPopup: ['Tooltip'],
  accessibleName: ['Tooltip'],
  DialogParts: ['Dialog', 'Skeleton'],
  skeleton: ['Skeleton'],
  ListRow: ['List'],
};

const sharedChangeTests = ['Contrast', 'Colors', 'ThemeContrast', 'Scale'];
const siteTests = ['SitePrerender', 'SiteFailures', 'SiteSmoke'];

type Need = 'typecheck' | 'lint' | 'css' | 'format' | 'tokens' | 'icons' | 'docs' | 'library';

export const pathRules: { paths: string[]; needs?: Need[]; browserTests?: string[] }[] = [
  {
    paths: [
      'packages/ui/src/**/*.{ts,tsx}',
      'apps/site/src/**/*.{ts,tsx}',
      'tests/**/*.{ts,tsx}',
      'playwright.config.ts',
      'apps/site/vite.config.ts',
      'scripts/**/*.ts',
      'scripts/build/LintPackage*.js',
      'packages/eslint-plugin/src/**/*.js',
      'packages/stylelint-config/src/**/*.js',
      '**/tsconfig.json',
    ],
    needs: ['typecheck'],
  },
  {
    paths: [
      'eslint.config.mjs',
      'knip.jsonc',
      'packages/eslint-plugin/**',
      'scripts/lint/NoComments.ts',
    ],
    needs: ['lint'],
  },
  {
    paths: [
      'stylelint.config.mjs',
      'stylelint-suppressions.json',
      'packages/stylelint-config/**',
      'scripts/lint/NoStyleSheetComments.ts',
    ],
    needs: ['css'],
  },
  { paths: ['.prettierrc.json', '.prettierignore'], needs: ['format'] },
  {
    paths: ['package.json', 'package-lock.json'],
    needs: ['lint', 'css', 'format', 'typecheck', 'library'],
    browserTests: [...sharedChangeTests, 'CascadeLayers', 'ForcedColors'],
  },
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
    browserTests: sharedChangeTests,
  },
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
      'packages/eslint-plugin/src/data/vocabulary.json',
      'packages/stylelint-config/src/data/customProperties.json',
      'packages/stylelint-config/src/data/scales.json',
      repositoryPath(partsFile),
      'docs/writing.md',
    ],
    needs: ['tokens', 'docs'],
  },
  {
    paths: ['packages/ui/src/styles/Theme.css', 'tests/contrast/**'],
    browserTests: sharedChangeTests,
  },
  {
    paths: [
      'packages/ui/src/styles/index.css',
      'packages/ui/src/styles/Motion.css',
      'packages/ui/src/index.ts',
    ],
    browserTests: [...sharedChangeTests, 'CascadeLayers', 'ForcedColors'],
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
  {
    paths: ['packages/ui/src/**/*.{ts,tsx,css,json}', 'docs/**', '.changeset/**'],
    needs: ['docs'],
  },
  {
    paths: ['apps/site/{src,hosting}/**', 'apps/site/*.{html,ts,json}', 'scripts/docs/**'],
    needs: ['docs'],
    browserTests: siteTests,
  },
  { paths: ['wrangler.jsonc', 'scripts/site/**'], browserTests: siteTests },
  {
    paths: [
      'packages/ui/src/**',
      'packages/ui/package.json',
      'README.md',
      'scripts/build/BuildLibrary.ts',
      'scripts/build/ClientModules.ts',
      'scripts/build/DependencyNotices.ts',
      'scripts/release/ValidateRelease.ts',
    ],
    needs: ['library'],
  },
  { paths: ['packages/ui/src/foundations/messages/**'], browserTests: ['Messages'] },
  { paths: ['apps/site/src/**'], browserTests: ['LiveDevelopment'] },
];

const rulesOf = (path: string) =>
  pathRules.filter((rule) => rule.paths.some((glob) => posix.matchesGlob(path, glob)));

const fastTierHelperTestLimit = 8;
export const fixtureBudget = 6;

const baseName = (path: string) =>
  posix.basename(path).replace(/\.(?:spec\.ts|test\.tsx|fixture\.tsx?|tsx?|css|m?js|html)$/, '');

const fixtureUses = new Map<string, ReturnType<typeof fixtureUse>>();
function cachedFixtureUse(root: string) {
  const cached = fixtureUses.get(root) ?? fixtureUse(root);
  fixtureUses.set(root, cached);
  return cached;
}

export function browserTestNeeds(name: string, root = repositoryRoot) {
  const source = read(root, browserTestFile(name, root));
  return {
    site: importsOf(source).some(({ specifier }) => specifier === '../support/HostedSite'),
    library: /\.cache\/Hydration\.html/.test(source),
    live: name === 'LiveDevelopment',
  };
}

interface ScopeOptions {
  root?: string;
  affected?: boolean;
}

export function browserTestsFor(
  paths: readonly string[],
  { root = repositoryRoot, affected = false }: ScopeOptions = {},
) {
  const tests = new Map<string, Set<string>>();
  const unmatched: string[] = [];
  const widelyUsed = new Map<string, number>();
  let testsUsing: ((path: string) => string[]) | undefined;
  const written = new Set(browserTestPaths(root).keys());
  const exists = (name: string) => written.has(name);
  const add = (name: string, reason: string) => {
    if (!exists(name)) return false;
    tests.set(name, (tests.get(name) ?? new Set()).add(reason));
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
    else if (
      /^tests\/component\/(?:vitest\.config|support\/(?:Setup|Browser|Commands|Mount))\.tsx?$/.test(
        path,
      ) ||
      path === 'tests/fixture/FixtureMount.tsx'
    ) {
      for (const [name, file] of browserTestPaths(root))
        if (isComponentTest(file)) found = add(name, `runs on ${path}`) || found;
    } else if (
      /^tests\/browser\/support\/[^/]+\.ts$/.test(path) ||
      /^tests\/component\/support\/[^/]+\.tsx?$/.test(path)
    ) {
      const helper = posix.basename(path);
      const specifiers = path.startsWith('tests/component/')
        ? [`./support/${helper}`, `./support/${baseName(path)}`]
        : [`../support/${baseName(path)}`];
      const users = [...written].filter((spec) =>
        importsOf(read(root, browserTestFile(spec, root))).some(({ specifier }) =>
          specifiers.includes(specifier),
        ),
      );
      helpers.set(path, users);
      if (affected || users.length <= fastTierHelperTestLimit)
        for (const user of users) found = add(user, `imports ${path}`) || found;
    } else if (/^(?:packages\/ui\/src|tests\/fixture)\//.test(path)) {
      const name = baseName(path);
      const folder = posix
        .basename(posix.dirname(path))
        .replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());
      const candidates = path.startsWith('packages/ui/src/icons/') ? [] : [name, folder];
      const testsOf = (each: string) =>
        Object.hasOwn(testsByModuleName, each)
          ? testsByModuleName[each]
          : exists(each)
            ? [each]
            : [];
      const component = candidates.find((each) => testsOf(each).length);
      const named = component ? testsOf(component) : [];
      for (const spec of named) found = add(spec, `about ${component} (${path})`) || found;
      testsUsing ??= cachedFixtureUse(root);
      const using = testsUsing(path).filter(exists);
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
      for (const name of rule.browserTests ?? []) found = add(name, path) || found;
    if (!found) unmatched.push(path);
  }
  return { browserTests: tests, unmatched, helpers, widelyUsed };
}

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
      if (/^(?:packages\/ui\/src|apps\/site\/src|tests)\/.*\.css$/.test(path)) scope.css.push(path);
      scope.format.push(path);
    }
    for (const need of rulesOf(path).flatMap((rule) => rule.needs ?? []))
      if (need === 'typecheck') scope.typecheck = true;
      else if (need === 'lint' || need === 'css' || need === 'format') scope.whole[need] = true;
      else if (need === 'library') scope.build.library = true;
      else scope.generated.add(need);
  }
  const { browserTests, unmatched, helpers, widelyUsed } = browserTestsFor(paths, options);
  for (const name of browserTests.keys()) {
    const needs = browserTestNeeds(name, root);
    scope.build.site ||= needs.site;
    scope.build.library ||= needs.library;
  }
  return { ...scope, browserTests, unmatched, helpers, widelyUsed };
}

export function serversFor(names: readonly string[], root = repositoryRoot) {
  const servers = new Set<string>();
  for (const name of names) {
    const source = read(root, browserTestFile(name, root));
    if (/\bsiteDevUrl\b/.test(source)) servers.add('site');
    if (/\bsiteBuildUrl\b/.test(source)) servers.add('site-build');
    if (/\bfixtureUrl\b/.test(source)) servers.add('fixture');
  }
  return [...servers].sort();
}

export interface Change {
  status: string;
  path: string;
  from?: string;
}

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

export function mergeChanges(entries: readonly Change[], untracked: readonly string[] = []) {
  const byPath = new Map<string, Change>();
  for (const entry of entries) byPath.set(entry.path, entry);
  for (const path of untracked) if (!byPath.has(path)) byPath.set(path, { status: 'A', path });
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

export function changedFiles({
  root = repositoryRoot,
  base,
}: { root?: string; base?: string } = {}) {
  const found = baseBranch(base);
  try {
    git(['rev-parse', '--verify', '--quiet', `${found}^{commit}`], root);
  } catch {
    throw new Error(`${found} doesn't exist. Fetch it, or pass --base <ref> or set ENVUI_BASE.`);
  }
  const mergeBase = mergeBaseOf(found, root);
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

const builtUnitTests = 'tests/library/package/';

export function unitTestFiles(root = repositoryRoot) {
  const files = [
    ...walk(root, 'tests', /\.test\.ts$/),
    ...walk(root, 'packages', /\.test\.mjs$/).filter((file) =>
      /^packages\/[^/]+\/test\/[^/]+$/.test(file),
    ),
  ].sort();
  const built = files.filter((file) => file.startsWith(builtUnitTests));
  return { built, fast: files.filter((file) => !built.includes(file)) };
}
