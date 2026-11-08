// Chooses what `npm run check` and `npm run check:affected` run for a change: which files to lint,
// whether to typecheck, which generated files to check, and which browser specs to run.
//
// A spec is named after its component (tests/browser/library/Button.spec.ts), and runs when that component
// changes: a library or fixture file runs the spec of its name, or of the name `aliases` gives it,
// and the specs whose fixtures use it (FixtureImports.ts), all of them when they are few, else the
// most specific few; a changed spec runs itself; a changed helper runs the specs that import it;
// and `exceptions` lists the shared files and the catalogue, which name no component. A path that
// matches nothing runs no browser spec: `npm run verify` covers it. Check.ts runs the result, and
// tests/tooling/TestScope.test.mjs covers the logic.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureUse, specPaths } from './FixtureImports.ts';

export const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

/**
 * Files whose specs neither their name nor the fixtures' imports find, such as a part a fixture
 * reaches only through a component many specs use: name → the specs about it.
 */
export const aliases: Record<string, string[]> = {
  SearchField: ['TextField'],
  FieldFrame: ['TextField'],
  Popover: ['Dialog'],
  Spinner: ['Meter', 'Skeleton'],
  Badge: ['DiffStat'],
  ConfirmButton: ['Button'],
  AvatarButton: ['Button'],
  LinkProvider: ['Button'],
  ActionElement: ['Button'],
  QuietButtons: ['Button'],
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
  wheelRows: ['DatePicker', 'TimePicker'],
  useWheelTurn: ['DatePicker', 'TimePicker'],
  useWheelGestures: ['DatePicker', 'TimePicker'],
  MonthGrid: ['MonthPicker', 'ForcedColors'],
  Code: ['CodeBlock'],
  TooltipPopup: ['Tooltip'],
  accessibleName: ['Tooltip'],
  DialogParts: ['Dialog', 'Skeleton'],
  skeleton: ['Skeleton'],
  inSkeleton: ['Skeleton'],
  skeletonShift: ['Skeleton'],
  Listbox: ['Select', 'Combobox'],
  ListRow: ['List'],
  'rich-text': ['RichTextEditor'],
  color: ['ColorPicker'],
};

/** The specs a token, theme or other shared change runs. */
const shared = ['Contrast', 'Colors', 'ThemeContrast', 'Scale'];
/** The catalogue's own specs; some open its hosted build. */
const catalogue = [
  'SiteRoutes',
  'SiteShell',
  'SiteFailures',
  'CatalogueComponentPages',
  'CatalogueFigures',
  'CatalogueBanners',
  'CatalogueGallery',
  'CatalogueTilePlayback',
  'CatalogueRelated',
  'CatalogueOverlays',
  'CataloguePlainLanguage',
  'DocsPages',
  'CatalogueSearch',
];

/** Paths that name no component, by prefix, and the specs they run. */
const exceptions: [RegExp, string[]][] = [
  [
    /^packages\/ui\/(?:tokens\/|terrazzo\.config\.mjs|src\/generated\/|src\/styles\/(?:TokensHandwritten|Theme)\.css)|^tests\/contrast\/|^scripts\/build\/(?:(?:BuildTokens|GeneratePalette)\.ts$|tokens\/)/,
    shared,
  ],
  [
    /^packages\/ui\/src\/(?:styles\/(?:index|Motion)\.css|index\.ts)$|^package(?:-lock)?\.json$/,
    [...shared, 'CascadeLayers', 'ForcedColors'],
  ],
  [/^packages\/ui\/src\/foundations\/messages\//, ['Messages']],
  [/^packages\/ui\/src\/dev(?:\.ts$|\/)/, ['DevMode']],
  [/^apps\/site\/|^wrangler\.jsonc$|^scripts\/(?:docs|site)\//, catalogue],
  // The catalogue's scripted playback: its pointer, timelines and autoplay.
  [/^apps\/site\/src\/motion\//, ['SiteMotion', 'Autoplay']],
  // Live development edits the catalogue's sources and watches them update; the affected tier runs it.
  [/^apps\/site\/src\//, ['LiveDevelopment']],
  // The layout check measures every example the pages place, on the catalogue's stage, with dev
  // mode's checks; the affected tier runs it.
  [
    /^apps\/site\/src\/(?:examples\/|styles\/Stage\.css$)|^docs\/(?:components|patterns)\/|^packages\/ui\/src\/dev(?:\.ts$|\/)/,
    ['LayoutCheck'],
  ],
];

/** More specs than this importing a changed helper leaves it to `npm run verify`. */
const helperBudget = 8;
/** More specs than this whose fixtures use a changed file run the most specific of them. */
const fixtureBudget = 6;

/** A spec's file, by its name: Button for tests/browser/library/Button.spec.ts. */
export const specFile = (name: string, root = repositoryRoot) =>
  specPaths(root).get(name) ?? `tests/browser/library/${name}.spec.ts`;
const baseName = (path: string) =>
  posix.basename(path).replace(/\.(?:spec\.ts|tsx?|css|m?js|html)$/, '');

/** fixtureUse reads every fixture and library module: once per checkout and process. */
const fixtureUses = new Map<string, ReturnType<typeof fixtureUse>>();
function cachedFixtureUse(root: string) {
  if (!fixtureUses.has(root)) fixtureUses.set(root, fixtureUse(root));
  return fixtureUses.get(root)!;
}

/** What a spec needs beyond the development servers, read from its source. */
export function specNeeds(name: string, root = repositoryRoot) {
  const source = read(root, specFile(name, root));
  return {
    // Opens the hosted build, which npm run build:site writes.
    site: /from '\.\.\/helpers\/HostedSite'/.test(source),
    // Opens a page that the unit tests on the library build render.
    library: /\.cache\/Hydration\.html/.test(source),
    // Edits sources, so it runs alone once nothing else reads them.
    live: name === 'LiveDevelopment',
    // Renders every catalogue example at four widths: minutes, so the affected tier runs it.
    whole: name === 'LayoutCheck',
  };
}

/**
 * The browser specs a change runs, by name (Button for tests/browser/library/Button.spec.ts), each with
 * why; the paths that run none; and the files more specs' fixtures use than run, with how many do.
 */
export function specsFor(paths: readonly string[], root = repositoryRoot) {
  const specs = new Map<string, Set<string>>();
  const unmatched: string[] = [];
  const widelyUsed = new Map<string, number>();
  let specsUsing: ((path: string) => string[]) | undefined;
  // By name, as written: a file system that ignores case would find Table.spec.ts for table.
  const written = new Set(specPaths(root).keys());
  const exists = (name: string) => written.has(name);
  const add = (name: string, reason: string) => {
    if (!exists(name)) return false;
    if (!specs.has(name)) specs.set(name, new Set());
    specs.get(name)!.add(reason);
    return true;
  };
  const helpers = new Map<string, string[]>();
  for (const path of paths) {
    let found = false;
    if (/^tests\/browser\/(?:library|site)\/[^/]+\.spec\.ts$/.test(path))
      found = add(baseName(path), 'changed spec');
    else if (/^tests\/browser\/helpers\/[^/]+\.ts$/.test(path)) {
      const helper = baseName(path);
      const users = [...written].filter((spec) =>
        new RegExp(`from '\\.\\./helpers/${helper}'`).test(read(root, specFile(spec, root))),
      );
      helpers.set(path, users);
      if (users.length <= helperBudget)
        for (const user of users) found = add(user, `imports ${path}`) || found;
    } else if (/^(?:packages\/ui\/src|tests\/fixture)\//.test(path)) {
      // ButtonGroups.tsx and Comboboxes.tsx are about ButtonGroup and Combobox, Tabs.tsx about
      // Tabs, and a file in navigation/panel-dock/ about PanelDock. An icon's name names a symbol, not a
      // component: icons/Palette.tsx is not about CommandPalette.
      const name = baseName(path);
      const folder = posix
        .basename(posix.dirname(path))
        .replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());
      const candidates = path.startsWith('packages/ui/src/icons/')
        ? []
        : [name, name.replace(/e?s$/, ''), name.replace(/s$/, ''), folder];
      const specsOf = (each: string) =>
        Object.hasOwn(aliases, each) ? aliases[each] : exists(each) ? [each] : [];
      const component = candidates.find((each) => specsOf(each).length);
      const named = component ? specsOf(component) : [];
      for (const spec of named) found = add(spec, `about ${component} (${path})`) || found;
      // The specs whose fixtures use it: all of them when they are few; else, for a file of no
      // spec's name, the most specific few, and verify the rest.
      specsUsing ??= cachedFixtureUse(root);
      const using = specsUsing(path).filter(exists);
      if (using.length <= fixtureBudget)
        for (const spec of using) found = add(spec, `its fixture uses ${path}`) || found;
      else {
        widelyUsed.set(path, using.length);
        if (!named.length)
          for (const spec of using.slice(0, fixtureBudget))
            found = add(spec, `among the fixtures that use ${path}`) || found;
      }
    }
    for (const [pattern, names] of exceptions)
      if (pattern.test(path)) for (const name of names) found = add(name, path) || found;
    if (!found) unmatched.push(path);
  }
  return { specs, unmatched, helpers, widelyUsed };
}

/**
 * What a change needs, by file: the static checks, the generated-file checks, the browser specs
 * and the builds those open.
 */
export function selectScope(paths: readonly string[], root = repositoryRoot) {
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
    const exists = existsSync(resolve(root, path));
    if (exists && /\.(?:[cm]?js|tsx?)$/.test(path)) scope.lint.push(path);
    if (exists && /^(?:packages\/ui\/src|apps\/site\/src)\/.*\.css$/.test(path))
      scope.css.push(path);
    if (exists) scope.format.push(path);
    if (
      /^(?:packages\/ui\/src|apps\/site\/src|tests\/fixture|tests\/types|scripts)\/.*\.tsx?$/.test(
        path,
      )
    )
      scope.typecheck = true;
    if (/(?:^|\/)tsconfig\.json$/.test(path)) scope.typecheck = true;
    // Repository-wide configuration reruns the whole of its check.
    if (/^eslint\.config\.mjs$|^knip\.jsonc$|^packages\/eslint-plugin\//.test(path))
      scope.whole.lint = true;
    if (/^stylelint\.|^stylelint-suppressions\.json$|^packages\/stylelint-config\//.test(path))
      scope.whole.css = true;
    if (/^\.prettier/.test(path)) scope.whole.format = true;
    if (/^package(?:-lock)?\.json$/.test(path)) {
      Object.assign(scope.whole, { lint: true, css: true, format: true });
      scope.typecheck = scope.build.library = true;
    }
    // Generated files: tokens with the lint packages' copies, icons, and the documentation the
    // sources and docs/ make.
    if (
      /^packages\/ui\/(?:tokens\/|terrazzo\.config\.mjs|src\/generated\/|src\/styles\/TokensHandwritten\.css)|^scripts\/build\/(?:(?:BuildTokens|GeneratePalette|SyncLintPackages|LintPackageTokens)\.[jt]s$|tokens\/)|^packages\/(?:eslint-plugin\/src|stylelint-config)\/(?:tokens\.js|data\/tokens\.json)$/.test(
        path,
      )
    )
      scope.generated.add('tokens').add('docs');
    if (
      /^packages\/ui\/src\/icons\/|^scripts\/build\/(?:GenerateIcons|SyncIcons)\.ts$|^packages\/ui\/icon-manifest\.json$/.test(
        path,
      )
    )
      scope.generated.add('icons');
    if (
      /^packages\/ui\/src\/.*\.(?:tsx?|css|json)$|^docs\/|^apps\/site\/|^\.changeset\/|^scripts\/docs\//.test(
        path,
      )
    )
      scope.generated.add('docs');
    if (
      /^packages\/ui\/(?:src\/|package\.json|README)|^README\.md$|^scripts\/build\/(?:BuildLibrary|ClientModules|DependencyNotices)\.ts$|^scripts\/release\/ValidateRelease\.ts$/.test(
        path,
      )
    )
      scope.build.library = true;
  }
  const { specs, unmatched, helpers, widelyUsed } = specsFor(paths, root);
  for (const name of specs.keys()) {
    const needs = specNeeds(name, root);
    scope.build.site ||= needs.site;
    scope.build.library ||= needs.library;
  }
  return { ...scope, specs, unmatched, helpers, widelyUsed };
}

/** Which development servers the specs need, for ENVUI_SERVERS. */
export function serversFor(names: readonly string[], root = repositoryRoot) {
  const servers = new Set<string>();
  for (const name of names) {
    const source = read(root, specFile(name, root));
    if (/\bsiteDevUrl\b/.test(source)) servers.add('site');
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
    /packages\/ui\/dist|support\/packedConsumer\.mjs/.test(read(root, file)),
  );
  return { built, fast: files.filter((file) => !built.includes(file)) };
}
