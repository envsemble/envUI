// Chooses what `npm run check` and `npm run check:affected` run for a change: which files to lint,
// whether to typecheck, which generated files to check, and which browser specs to run.
//
// A spec is named after its component (tests/browser/Button.spec.ts), and runs when that component
// changes, nothing more: a library or fixture file runs the spec of its name, or of the name
// `aliases` gives it; a changed spec runs itself; a changed helper runs the specs that import it;
// and `exceptions` lists the shared files and the catalogue, which name no component. A path that
// matches nothing runs no browser spec: `npm run verify` covers it. Check.ts runs the result, and
// tests/TestScope.test.mjs covers the logic.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

/** Components and fixtures whose spec has another name: name → the specs about it. */
export const aliases: Record<string, string[]> = {
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
  contentsOutline: ['TableOfContents'],
  contentsWave: ['TableOfContents'],
  Kbd: ['DataDisplay'],
  Progress: ['Meter'],
  Spinner: ['Meter', 'Skeleton'],
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
  NavigationBar: ['Navigation'],
  NavigationRail: ['Navigation'],
  NavigationDrawer: ['Navigation'],
  Rail: ['Navigation'],
  Drawer: ['Navigation'],
  ResizableDrawers: ['Navigation'],
  NestedDrawers: ['Navigation'],
  useResizableWidth: ['Navigation', 'Sheet'],
  Destinations: ['Navigation'],
  ChoiceControls: ['Checkbox', 'Radio', 'Switch'],
  Toolbar: ['Primitives'],
  ResizeHandle: ['Primitives', 'Panes'],
  Editor: ['MarkdownEditor', 'RichTextEditor'],
  useResize: ['Panes', 'PanelDock'],
  PanelDockPanelContext: ['PanelDock'],
  PanelFrame: ['PanelDock'],
  PanelTab: ['PanelDock'],
  dockLayout: ['PanelDock'],
  useEntrance: ['PanelDock'],
  useDockOverflow: ['PanelDock'],
  useStripWheel: ['PanelDock'],
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
  themeBootstrap: ['ThemePreference', 'ThemeContrast'],
  'theme-bootstrap': ['ThemePreference', 'ThemeContrast'],
  ThemePreferenceContext: ['ThemePreference'],
  ThemeToggle: ['ThemePreference'],
  Density: ['Scale'],
  DensitySections: ['Scale'],
  MessageStrings: ['Messages'],
  Avatar: ['AvatarGroup'],
  // The icon wrapper sizes whatever every icon slot holds, a Graphic's included.
  Icon: ['Graphic', 'Button', 'IconButton', 'Skeleton'],
  NavigationIconState: ['Navigation', 'Tabs'],
  Calendar: ['DatePicker'],
  calendarDays: ['DatePicker', 'TimePicker', 'MonthPicker', 'CalendarHeatmap'],
  PickerField: ['DatePicker', 'TimePicker', 'MonthPicker', 'PickerPopup'],
  PickerPopup: ['PickerPopup', 'DatePicker', 'TimePicker', 'MonthPicker'],
  PickerPopups: ['PickerPopup'],
  DatePicker: ['DatePicker', 'PickerPopup'],
  TimePicker: ['TimePicker', 'PickerPopup'],
  MonthPicker: ['MonthPicker', 'PickerPopup'],
  TimeList: ['DatePicker', 'TimePicker', 'ForcedColors'],
  TimeWheel: ['DatePicker', 'TimePicker', 'ForcedColors'],
  MonthGrid: ['MonthPicker', 'ForcedColors'],
  Code: ['CodeBlock'],
  RichText: ['RichTextEditor'],
  commands: ['RichTextEditor'],
  Reference: ['RichTextEditor'],
  referenceAttributes: ['RichTextEditor'],
  referenceExtension: ['RichTextEditor'],
  suggestions: ['RichTextEditor'],
  taskItem: ['RichTextEditor'],
  useDocumentAttributes: ['RichTextEditor'],
  useLinksAndUploads: ['RichTextEditor'],
  useRichTextDocument: ['RichTextEditor'],
  useRichTextExtensions: ['RichTextEditor'],
  TooltipPopup: ['Tooltip'],
  accessibleName: ['Tooltip'],
  sliderOverdrag: ['Slider'],
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
  ComboboxPopup: ['Combobox'],
  comboboxItems: ['Combobox'],
  ListRow: ['List'],
  ColumnResizeHandle: ['Table'],
  calendarHeatmapModel: ['CalendarHeatmap'],
  Palette: ['CommandPalette'],
  'rich-text': ['RichTextEditor'],
  color: ['ColorPicker'],
  ColorSwatch: ['ColorPicker'],
  ColorPickerButton: ['ColorPicker'],
  ColorArea: ['ColorPicker'],
  ColorSlider: ['ColorPicker'],
  ColorFields: ['ColorPicker'],
  ColorLocale: ['ColorPicker'],
  SwatchList: ['ColorPicker'],
  colorValue: ['ColorPicker'],
  useColorState: ['ColorPicker'],
  useEyeDropper: ['ColorPicker'],
  MotionStage: ['SiteMotion'],
  VirtualPointer: ['SiteMotion'],
  VirtualSelection: ['SiteMotion'],
};

/** The specs a token, theme or other shared change runs. */
const shared = ['Contrast', 'Colors', 'ThemeContrast', 'Scale'];
/** The catalogue's own specs; some open its hosted build. */
const catalogue = [
  'SiteRoutes',
  'SiteShell',
  'SiteFailures',
  'CataloguePages',
  'CataloguePlainLanguage',
  'DocsPages',
  'CatalogueSearch',
];

/** Paths that name no component, by prefix, and the specs they run. */
export const exceptions: [RegExp, string[]][] = [
  [
    /^packages\/ui\/(?:tokens\/|terrazzo\.config\.mjs|src\/generated\/tokens|src\/styles\/(?:Tokens\w*|Theme)\.css)|^tests\/contrast\/|^scripts\/build\/(?:BuildTokens|GeneratePalette)\.ts$/,
    shared,
  ],
  [
    /^packages\/ui\/src\/(?:styles\/(?:index|Motion)\.css|index\.ts)$|^package(?:-lock)?\.json$/,
    [...shared, 'CascadeLayers', 'ForcedColors'],
  ],
  [/^packages\/ui\/src\/foundations\/messages\//, ['Messages']],
  [/^packages\/ui\/src\/dev(?:\.ts$|\/)/, ['DevMode']],
  [/^apps\/site\/|^wrangler\.jsonc$|^scripts\/(?:docs|site)\//, catalogue],
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

const specFile = (name: string) => `tests/browser/${name}.spec.ts`;
const baseName = (path: string) =>
  posix.basename(path).replace(/\.(?:spec\.ts|tsx?|css|m?js|html)$/, '');

/** What a spec needs beyond the development servers, read from its source. */
export function specNeeds(name: string, root = repositoryRoot) {
  const source = read(root, specFile(name));
  return {
    // Opens the hosted build, which npm run build:site writes.
    site: /from '\.\/helpers\/HostedSite'/.test(source),
    // Opens a page that the unit tests on the library build render.
    library: /\.cache\/Hydration\.html/.test(source),
    // Edits sources, so it runs alone once nothing else reads them.
    live: name === 'LiveDevelopment',
    // Renders every catalogue example at four widths: minutes, so the affected tier runs it.
    whole: name === 'LayoutCheck',
  };
}

/**
 * The browser specs a change runs, by name (Button for tests/browser/Button.spec.ts), each with
 * why, and the paths that run none.
 */
export function specsFor(paths: readonly string[], root = repositoryRoot) {
  const specs = new Map<string, Set<string>>();
  const unmatched: string[] = [];
  // By name, as written: a file system that ignores case would find Table.spec.ts for table.
  const written = new Set(walk(root, 'tests/browser', /\.spec\.ts$/).map(baseName));
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
    if (/^tests\/browser\/[^/]+\.spec\.ts$/.test(path)) found = add(baseName(path), 'changed spec');
    else if (/^tests\/browser\/helpers\/[^/]+\.ts$/.test(path)) {
      const helper = baseName(path);
      const users = [...written].filter((spec) =>
        new RegExp(`from '\\./helpers/${helper}'`).test(read(root, specFile(spec))),
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
      const specsOf = (each: string) =>
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
      /^packages\/ui\/(?:tokens\/|terrazzo\.config\.mjs|src\/generated\/tokens|src\/styles\/Tokens\w*\.css)|^scripts\/build\/(?:BuildTokens|GeneratePalette)\.ts$/.test(
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
  const { specs, unmatched, helpers } = specsFor(paths, root);
  for (const name of specs.keys()) {
    const needs = specNeeds(name, root);
    scope.build.site ||= needs.site;
    scope.build.library ||= needs.library;
  }
  return { ...scope, specs, unmatched, helpers };
}

/** Which development servers the specs need, for ENVUI_SERVERS. */
export function serversFor(names: readonly string[], root = repositoryRoot) {
  const servers = new Set<string>();
  for (const name of names) {
    const source = read(root, specFile(name));
    if (/\bsiteDevUrl\b/.test(source)) servers.add('site');
    if (/\bfixtureUrl\b/.test(source)) servers.add('fixture');
  }
  return [...servers].sort();
}

// ---------------------------------------------------------------------------------------------
// Changed files

/** Parses `git diff --name-status -z` output into { status, path, from } entries. */
/** A changed file, and for a rename or copy the path it came from. */
export interface Change {
  status: string;
  path: string;
  from?: string;
}

export function parseNameStatus(text: string): Change[] {
  const fields = text.split('\0').filter((field) => field !== '');
  const entries: Change[] = [];
  for (let index = 0; index < fields.length;) {
    const status = fields[index++]!;
    if (/^[RC]/.test(status)) {
      const from = fields[index++];
      const path = fields[index++]!;
      entries.push({ status: status[0]!, from, path });
    } else entries.push({ status: status[0]!, path: fields[index++]! });
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
export const defaultBases = ['origin/envui-1.0', 'origin/dev'];

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
    ...walk(root, 'tests', /\.test\.mjs$/).filter((file) => !file.slice(6).includes('/')),
    ...walk(root, 'packages', /\.test\.mjs$/).filter((file) =>
      /^packages\/[^/]+\/test\/[^/]+$/.test(file),
    ),
  ].sort();
  const built = files.filter((file) => /packages\/ui\/dist|\['pack'/.test(read(root, file)));
  return { built, fast: files.filter((file) => !built.includes(file)) };
}
