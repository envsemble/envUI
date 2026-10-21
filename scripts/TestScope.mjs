// Chooses what `npm run check` and `npm run check:affected` run for a change: which files to lint,
// whether to typecheck, which generated files to check, and which browser specs to run.
//
// A spec is named after its component (tests/browser/Button.spec.ts), and runs when that component
// changes, nothing more: a library or fixture file runs the spec of its name, or of the name
// `aliases` gives it; a changed spec runs itself; a changed helper runs the specs that import it;
// and `exceptions` lists the shared files and the catalogue, which name no component. A path that
// matches nothing runs no browser spec: `npm run verify` covers it. Check.mjs runs the result, and
// tests/TestScope.test.mjs covers the logic.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

/** Components and fixtures whose spec has another name: name → the specs about it. */
export const aliases = {
  SearchField: ['TextField'],
  Affixes: ['TextField'],
  Select: ['Forms'],
  SelectOptions: ['Forms'],
  Field: ['Forms'],
  FieldFrame: ['Forms', 'TextField'],
  Popover: ['Dialog'],
  Alert: ['Dialog'],
  Overlays: ['Dialog'],
  Breadcrumbs: ['DataDisplay'],
  Kbd: ['DataDisplay'],
  Progress: ['Meter'],
  Spinner: ['Meter', 'Skeleton'],
  AnimatedNumber: ['Stat'],
  Badge: ['DiffStat'],
  ButtonCounts: ['DiffStat'],
  ConfirmButton: ['Button'],
  AvatarButton: ['Button'],
  LinkProvider: ['Button'],
  ActionElement: ['Button'],
  Adoption: ['Button'],
  QuietButtons: ['Button'],
  ContextMenu: ['Menu'],
  MenuPopup: ['Menu', 'Menubar'],
  Bar: ['Navigation'],
  Rail: ['Navigation'],
  Drawer: ['Navigation'],
  Destinations: ['Navigation'],
  Segments: ['SegmentedControl'],
  TreeView: ['Tree'],
  MarkdownEditing: ['MarkdownEditor'],
  RichTextEditing: ['RichTextEditor'],
  ChoiceControls: ['Checkbox', 'Radio', 'Switch'],
  Toolbar: ['Primitives'],
  ResizeHandle: ['Primitives', 'Panes'],
  useResize: ['Panes', 'PanelDock'],
  TopBar: ['Scaffold'],
  useScrollKeys: ['Scaffold'],
  Page: ['PageHeader'],
  PopupSurface: ['Primitives', 'PortalContainer'],
  PortalContainerContext: ['PortalContainer'],
  PortalContainers: ['PortalContainer'],
  useRovingFocus: ['Primitives'],
  useDirection: ['Direction'],
  Theme: ['ThemePreference', 'ThemeContrast', 'WindowClasses'],
  Popup: ['WindowClasses', 'Primitives'],
  windowClasses: ['WindowClasses'],
  ThemeBootstrap: ['ThemePreference', 'ThemeContrast'],
  'theme-bootstrap': ['ThemePreference', 'ThemeContrast'],
  ThemePreferenceContext: ['ThemePreference'],
  Density: ['Scale'],
  DensitySections: ['Scale'],
  MessageStrings: ['Messages'],
  Avatar: ['AvatarGroup'],
  Calendar: ['DatePicker'],
  CalendarDays: ['DatePicker', 'TimePicker', 'MonthPicker'],
  PickerField: ['DatePicker', 'TimePicker', 'MonthPicker'],
  TimeList: ['DatePicker', 'TimePicker', 'ForcedColors'],
  MonthGrid: ['MonthPicker', 'ForcedColors'],
  Code: ['CodeBlock'],
  RichText: ['RichTextEditor'],
  TooltipPopup: ['Tooltip'],
  DialogParts: ['Dialog', 'Skeleton'],
  SkeletonScope: ['Skeleton'],
  skeleton: ['Skeleton'],
  inSkeleton: ['Skeleton'],
  placeholders: ['Skeleton'],
  skeletonShift: ['Skeleton'],
  SpinnerLabel: ['Skeleton'],
  Skeletons: ['Skeleton'],
  AlertDismiss: ['Dialog'],
  Listbox: ['Forms', 'Combobox'],
  ListRow: ['List'],
  Palette: ['CommandPalette'],
  'rich-text': ['RichTextEditor'],
  contrast: ['Contrast'],
  'forced-colors': ['ForcedColors'],
  layers: ['CascadeLayers'],
};

/** The specs a token, theme or other shared change runs. */
const shared = ['Contrast', 'Colors', 'ThemeContrast', 'Scale'];
/** The catalogue's own specs; they open its builds. */
const catalogue = ['Catalogue', 'CatalogueSearch'];

/** Paths that name no component, by prefix, and the specs they run. */
export const exceptions = [
  [
    /^packages\/ui\/(?:tokens\/|terrazzo\.config\.mjs|src\/generated\/tokens|src\/styles\/(?:Tokens\w*|Theme)\.css)|^tests\/contrast\/|^scripts\/(?:BuildTokens|GeneratePalette)\.mjs$/,
    shared,
  ],
  [
    /^packages\/ui\/src\/(?:styles\/(?:index|Motion)\.css|index\.ts)$|^package(?:-lock)?\.json$/,
    [...shared, 'CascadeLayers', 'ForcedColors'],
  ],
  [/^packages\/ui\/src\/foundations\/messages\//, ['Messages']],
  [/^packages\/ui\/src\/dev(?:\.ts$|\/)/, ['DevMode']],
  [
    /^apps\/catalogue\/|^wrangler\.jsonc$|^scripts\/(?:GenerateDocumentation|ExtractProps|GenerateManifest|GenerateCodeThemes|Search\w*|MarkdownHeadings|FinalizeCatalogue|FinalizeSite|SiteModuleFiles|AssembleSiteVersions)\.m?[jt]s$/,
    catalogue,
  ],
  // Live development edits the catalogue's sources and watches them update; the affected tier runs it.
  [/^apps\/catalogue\/src\//, ['LiveDevelopment']],
];

/** More specs than this importing a changed helper leaves it to `npm run verify`. */
const helperBudget = 8;

const specFile = (name) => `tests/browser/${name}.spec.ts`;
const baseName = (path) => posix.basename(path).replace(/\.(?:spec\.ts|tsx?|css|m?js|html)$/, '');

/** What a spec needs beyond the development servers, read from its source. */
export function specNeeds(name, root = repositoryRoot) {
  const source = read(root, specFile(name));
  return {
    // Opens the hosted build, or the offline file, which the catalogue builds write.
    site: /from '\.\/HostedSite'/.test(source),
    catalogue: /dist\/envUI\.html/.test(source),
    // Opens a page that the unit tests on the library build render.
    library: /\.cache\/Hydration\.html/.test(source),
    // Edits sources, so it runs alone once nothing else reads them.
    live: name === 'LiveDevelopment',
  };
}

/**
 * The browser specs a change runs, by name (Button for tests/browser/Button.spec.ts), each with
 * why, and the paths that run none.
 */
export function specsFor(paths, root = repositoryRoot) {
  const specs = new Map();
  const unmatched = [];
  // By name, as written: a file system that ignores case would find Table.spec.ts for table.
  const written = new Set(walk(root, 'tests/browser', /\.spec\.ts$/).map(baseName));
  const exists = (name) => written.has(name);
  const add = (name, reason) => {
    if (!exists(name)) return false;
    if (!specs.has(name)) specs.set(name, new Set());
    specs.get(name).add(reason);
    return true;
  };
  const helpers = new Map();
  for (const path of paths) {
    let found = false;
    if (/^tests\/browser\/[^/]+\.spec\.ts$/.test(path)) found = add(baseName(path), 'changed spec');
    else if (/^tests\/browser\/[^/]+\.ts$/.test(path)) {
      const helper = baseName(path);
      const users = [...written].filter((spec) =>
        new RegExp(`from '\\./${helper}'`).test(read(root, specFile(spec))),
      );
      helpers.set(path, users);
      if (users.length <= helperBudget)
        for (const user of users) found = add(user, `imports ${path}`) || found;
    } else if (/^(?:packages\/ui\/src|tests\/fixture)\//.test(path)) {
      // Buttons.tsx and Comboboxes.tsx are about Button and Combobox, Tabs.tsx about Tabs, and
      // a file in navigation/panel-dock/ about PanelDock.
      const name = baseName(path);
      const folder = posix
        .basename(posix.dirname(path))
        .replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());
      const candidates = [name, name.replace(/e?s$/, ''), name.replace(/s$/, ''), folder];
      const specsOf = (each) =>
        Object.hasOwn(aliases, each) ? aliases[each] : exists(each) ? [each] : [];
      const component = candidates.find((each) => specsOf(each).length);
      for (const spec of component ? specsOf(component) : [])
        found = add(spec, `about ${component} (${path})`) || found;
    }
    for (const [pattern, names] of exceptions)
      if (pattern.test(path)) for (const name of names) found = add(name, path) || found;
    if (!found) unmatched.push(path);
  }
  return { specs, unmatched, helpers };
}

/**
 * What a change needs, by file: the static checks, the generated-file checks, the browser specs
 * and the builds those open.
 */
export function selectScope(paths, root = repositoryRoot) {
  const scope = {
    lint: [],
    css: [],
    format: [],
    whole: { lint: false, css: false, format: false },
    typecheck: false,
    generated: new Set(),
    build: { library: false, catalogue: false, site: false },
  };
  for (const path of paths) {
    const exists = existsSync(resolve(root, path));
    if (exists && /\.(?:[cm]?js|tsx?)$/.test(path)) scope.lint.push(path);
    if (exists && /^(?:packages\/ui\/src|apps\/catalogue\/src)\/.*\.css$/.test(path))
      scope.css.push(path);
    if (exists) scope.format.push(path);
    if (
      /^(?:packages\/ui\/src|apps\/catalogue\/src|tests\/fixture|tests\/types)\/.*\.tsx?$/.test(
        path,
      )
    )
      scope.typecheck = true;
    if (/(?:^|\/)tsconfig\.json$/.test(path)) scope.typecheck = true;
    // Repository-wide configuration reruns the whole of its check.
    if (/^eslint\.config\.mjs$|^packages\/eslint-plugin\//.test(path)) scope.whole.lint = true;
    if (/^stylelint\.|^stylelint-suppressions\.json$|^packages\/stylelint-config\//.test(path))
      scope.whole.css = true;
    if (/^\.prettier/.test(path)) scope.whole.format = true;
    if (/^package(?:-lock)?\.json$/.test(path)) {
      Object.assign(scope.whole, { lint: true, css: true, format: true });
      scope.typecheck = scope.build.library = true;
    }
    // Generated files: tokens, icons, and the documentation the sources and docs/ make.
    if (
      /^packages\/ui\/(?:tokens\/|terrazzo\.config\.mjs|src\/generated\/tokens|src\/styles\/Tokens\w*\.css)|^scripts\/(?:BuildTokens|GeneratePalette)\.mjs$/.test(
        path,
      )
    )
      scope.generated.add('tokens').add('docs');
    if (
      /^packages\/ui\/src\/icons\/|^scripts\/(?:GenerateIcons|SyncIcons)\.mjs$|^packages\/ui\/icon-manifest\.json$/.test(
        path,
      )
    )
      scope.generated.add('icons');
    if (
      /^packages\/ui\/src\/.*\.(?:tsx?|css|json)$|^docs\/|^apps\/catalogue\/|^\.changeset\/|^scripts\/(?:GenerateDocumentation|ExtractProps|GenerateParts|GenerateManifest)\.mjs$/.test(
        path,
      )
    )
      scope.generated.add('docs');
    if (
      /^packages\/ui\/(?:src\/|package\.json|bin\/|README)|^README\.md$|^\.agents\/skills\/|^scripts\/(?:BuildLibrary|ClientModules|DependencyNotices|ValidateRelease)\.mjs$/.test(
        path,
      )
    )
      scope.build.library = true;
  }
  const { specs, unmatched, helpers } = specsFor(paths, root);
  for (const name of specs.keys()) {
    const needs = specNeeds(name, root);
    scope.build.site ||= needs.site;
    scope.build.catalogue ||= needs.catalogue;
    scope.build.library ||= needs.library;
  }
  return { ...scope, specs, unmatched, helpers };
}

/** Which development servers the specs need, for ENVUI_SERVERS. */
export function serversFor(names, root = repositoryRoot) {
  const servers = new Set();
  for (const name of names) {
    const source = read(root, specFile(name));
    if (/\bcatalogueUrl\b/.test(source)) servers.add('catalogue');
    if (/\bfixtureUrl\b/.test(source)) servers.add('fixture');
  }
  return [...servers].sort();
}

// ---------------------------------------------------------------------------------------------
// Changed files

/** Parses `git diff --name-status -z` output into { status, path, from } entries. */
export function parseNameStatus(text) {
  const fields = text.split('\0').filter((field) => field !== '');
  const entries = [];
  for (let index = 0; index < fields.length; ) {
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
export function mergeChanges(entries, untracked = []) {
  const byPath = new Map();
  for (const entry of entries) byPath.set(entry.path, entry);
  for (const path of untracked) if (!byPath.has(path)) byPath.set(path, { status: 'A', path });
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

/** The integration branches a change is compared with, in order of preference. */
export const defaultBases = ['origin/envui-1.0', 'origin/dev'];

function git(args, root) {
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
export function baseCandidates(base) {
  return base ? [base] : process.env.ENVUI_BASE ? [process.env.ENVUI_BASE] : defaultBases;
}

export function changedFiles({ root = repositoryRoot, base } = {}) {
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

function walk(root, directory, pattern) {
  const absolute = resolve(root, directory);
  if (!existsSync(absolute)) return [];
  const found = [];
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const path = posix.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...walk(root, path, pattern));
    else if (pattern.test(entry.name)) found.push(path);
  }
  return found;
}

const read = (root, path) => readFileSync(resolve(root, path), 'utf8');

/**
 * The unit test files, split into those that read the library build (packages/ui/dist, or a packed
 * tarball) and the rest, which run in seconds without it.
 */
export function unitTestFiles(root = repositoryRoot) {
  const files = [
    ...walk(root, 'tests', /\.test\.mjs$/).filter((file) => !file.slice(6).includes('/')),
    ...walk(root, 'packages', /\.test\.mjs$/).filter((file) =>
      /^packages\/[^/]+\/test\/[^/]+$/.test(file),
    ),
    ...walk(root, 'bench/test', /\.test\.mjs$/),
  ].sort();
  const built = files.filter((file) => /packages\/ui\/dist|\['pack'/.test(read(root, file)));
  return { built, fast: files.filter((file) => !built.includes(file)) };
}
