// Chooses what `npm run check` and `npm run check:affected` run for a change: which files to lint,
// whether to typecheck, which browser specs, and which catalogue pages to scan and screenshot.
//
// The map from sources to specs is derived from the repository, so new components, fixtures and
// specs join it without an edit here:
//
// - The library's import graph, read from packages/ui/src, leads from a changed module to the
//   modules that use it. A stylesheet leads to the components whose markup carries its env-
//   classes. The public names of those modules (docs/generated/manifest.json) lead to catalogue
//   pages.
// - A spec is about the components its file name, its fixtures' file names and the catalogue
//   pages it opens name ("primary"), and also uses whatever its fixtures import from envUI.
// - A changed spec runs itself; a changed fixture runs the specs that load it; a changed helper
//   runs the specs that import it.
//
// `overrides` below adds what names can't express. Everything here is plain data in, data out;
// scripts/Check.mjs runs the result, and tests/TestScope.test.mjs covers the logic.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

/**
 * What the derived map can't see. Keep it short: prefer names that let the map find a spec.
 */
export const overrides = {
  /** Specs whose names don't name a component, and the public names or pages they are about. */
  specSubjects: {
    'Adoption.spec.ts': ['Theme', 'ThemePreferenceProvider', 'AppShell', 'ConfirmButton'],
    // The frame's specs cover its hooks and its trigger too.
    'AppShell.spec.ts': ['AppShell', 'useAppShell', 'SidebarTrigger'],
    'Sidebar.spec.ts': ['Sidebar', 'SidebarTrigger', 'useSidebar'],
    'ButtonCounts.spec.ts': ['CounterBadge', 'DiffStat', 'Button'],
    'Cards.spec.ts': ['components/card'],
    'ContainerSize.spec.ts': ['useContainerSize'],
    // ListDetail is built on SplitPane, and its fixture is SplitPane's.
    'ListDetail.spec.ts': ['ListDetail', 'SplitPane'],
    'DataDisplay.spec.ts': ['components/list', 'components/table', 'components/card'],
    'DenseContent.spec.ts': ['components/code', 'components/menu', 'components/tabs'],
    'Direction.spec.ts': ['EnvUIProvider'],
    // The app frames the components replace hand-built layouts in.
    'FrameNeeds.spec.ts': ['AppShell', 'Sidebar', 'WindowFrame', 'Page', 'PageHeader'],
    'Forms.spec.ts': [
      'components/text-field',
      'components/checkbox',
      'components/switch',
      'components/radio',
      'components/select',
      'components/dialog',
    ],
    'IconButton.spec.ts': ['IconButton'],
    'MarkdownExtensions.spec.ts': ['components/markdown'],
    // Menubar's menus are Menu's popups and items, so a change to Menu runs it too.
    'Menubar.spec.ts': ['Menubar', 'Menu'],
    'Meter.spec.ts': ['Progress', 'Spinner'],
    'Tooltip.spec.ts': ['Popover'],
    'Messages.spec.ts': [
      'EnvUIProvider',
      'CloseButton',
      'ConfirmButton',
      'CopyButton',
      'ThemeToggle',
      'AccountMenu',
      'ConfirmDialog',
      'SearchTrigger',
      'SplitPane',
    ],
    'InputAffixes.spec.ts': ['TextField', 'SearchField'],
    'Navigation.spec.ts': ['components/nav-list', 'Tooltip'],
    'Primitives.spec.ts': ['Toolbar', 'Field', 'CloseButton', 'EnvUIProvider'],
    'Overlays.spec.ts': [
      'components/dialog',
      'components/popover',
      'components/alert',
      'components/command-palette',
    ],
    'ResponsiveHooks.spec.ts': ['useMediaQuery', 'useBreakpoint', 'foundations/responsive'],
    // Its centre-line test lines a sidebar's rail icons up with the sidebar toggle.
    'Scale.spec.ts': ['foundations/scale', 'AppShell', 'Sidebar'],
    'SegmentedControl.spec.ts': ['SegmentedControl'],
    'Spacing.spec.ts': ['foundations/spacing', 'Stack'],
    'ThemeContrast.spec.ts': ['Theme', 'ThemePreferenceProvider'],
    'ThemePreference.spec.ts': ['Theme', 'ThemePreferenceProvider'],
    'TouchFields.spec.ts': ['components/text-field', 'Composer', 'foundations/scale'],
  },
  /**
   * Specs and public names that work in progress adds. Until one exists, the overrides may name it
   * and the selection skips it; once all exist, empty these lists.
   */
  planned: {
    specs: ['Templates.spec.ts'],
    names: [],
  },
  /**
   * Library files that most components depend on. A change to one runs the shared set rather than
   * every spec that imports it: the fast tier stays fast, and `npm run verify` covers the rest.
   */
  sharedLibrary: [
    'packages/ui/src/styles/Tokens.css',
    'packages/ui/src/styles/TokensHandwritten.css',
    'packages/ui/src/styles/index.css',
    'packages/ui/src/styles/Theme.css',
    'packages/ui/src/styles/Motion.css',
    'packages/ui/src/foundations/Theme.tsx',
    'packages/ui/src/index.ts',
  ],
  /** Run for any library style sheet: every rule sits in a cascade layer and keeps its states under forced colors. */
  stylesheetSpecs: ['CascadeLayers.spec.ts', 'ForcedColors.spec.ts', 'Stacking.spec.ts'],
  /** Run for a shared change: quick specs that touch theming, fields, popups and the catalogue. */
  smokeSpecs: [
    'Colors.spec.ts',
    'Forms.spec.ts',
    'Menu.spec.ts',
    'Overlays.spec.ts',
    'Tabs.spec.ts',
    'Badges.spec.ts',
  ],
  /** Run for a change to the catalogue's own shell, navigation or styles. */
  catalogueSpecs: ['Catalogue.spec.ts', 'Spacing.spec.ts', 'DenseContent.spec.ts'],
  /** Run for a template's screen: each screen opened alone at its frame route. */
  templateSpecs: ['Templates.spec.ts'],
  /**
   * Parts of the catalogue and the specs about them, beside the specs that import a part's
   * modules, which the map finds itself.
   */
  catalogueAreas: {
    'apps/catalogue/src/search/': ['CatalogueSearch.spec.ts'],
    // The frame route and the template previews, which every template screen renders through.
    'apps/catalogue/src/template/Template': ['Templates.spec.ts', 'Catalogue.spec.ts'],
    'apps/catalogue/src/main.tsx': ['Templates.spec.ts', 'Catalogue.spec.ts'],
    'apps/catalogue/src/navigation/': ['CatalogueSearch.spec.ts', 'Catalogue.spec.ts'],
    'apps/catalogue/src/pages/': ['Catalogue.spec.ts', 'CatalogueSearch.spec.ts'],
    'apps/catalogue/src/theme/': ['CatalogueSearch.spec.ts', 'Catalogue.spec.ts'],
    'apps/catalogue/src/layout/': ['Catalogue.spec.ts', 'Spacing.spec.ts'],
    'apps/catalogue/site/': ['Catalogue.spec.ts', 'CatalogueSearch.spec.ts'],
  },
  /**
   * The frame route and the template previews: a change to them scans every template's screens
   * alone at their frame routes, as the accessibility scan does for a template page.
   */
  frameFiles: [
    'apps/catalogue/src/template/TemplateFrame',
    'apps/catalogue/src/template/TemplatePreview',
    'apps/catalogue/src/main.tsx',
  ],
  /** Catalogue pages scanned and screenshotted for a shared change. */
  smokePages: [
    'foundations/colors',
    'components/button',
    'components/text-field',
    'components/menu',
  ],
};

/**
 * More specs than this make a change "broad": the fast tier runs the shared set instead. The
 * affected tier's budget leaves room for the frame proof (FrameNeeds.spec.ts), which composes many
 * components.
 */
export const budgets = { fast: 8, affected: 20, pages: 8 };

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
export function changedFiles({ root = repositoryRoot, base } = {}) {
  const candidates = base
    ? [base]
    : process.env.ENVUI_BASE
      ? [process.env.ENVUI_BASE]
      : defaultBases;
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

// ---------------------------------------------------------------------------------------------
// The index: library graph, pages, fixtures and specs

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

/** Relative module specifiers a TypeScript or JavaScript source imports or re-exports. */
export function relativeImports(source) {
  const found = new Set();
  const patterns = [
    /\b(?:import|export)\s[^'";]*?\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]/g,
    /\bimport\s*['"](\.{1,2}\/[^'"]+)['"]/g,
    /\bimport\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) for (const match of source.matchAll(pattern)) found.add(match[1]);
  return [...found];
}

/** Resolves a relative specifier from a file to a file the index knows, or undefined. */
function resolveImport(from, specifier, known) {
  const joined = posix.normalize(posix.join(posix.dirname(from), specifier));
  const stem = joined.replace(/\.(?:m?js|jsx)$/, '');
  for (const candidate of [
    joined,
    `${stem}.ts`,
    `${stem}.tsx`,
    `${stem}.mjs`,
    `${stem}.js`,
    `${joined}/index.ts`,
    `${joined}/index.tsx`,
  ])
    if (known.has(candidate)) return candidate;
  return undefined;
}

/** Names a module exports: declarations and lists, not types alone. */
export function exportedNames(source) {
  const names = new Set();
  for (const match of source.matchAll(
    /\bexport\s+(?:default\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|enum)\s+([A-Za-z_$][\w$]*)/g,
  ))
    names.add(match[1]);
  for (const match of source.matchAll(/\bexport\s*\{([^}]*)\}/g))
    for (const part of match[1].split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
    }
  return [...names];
}

/** The env- classes a stylesheet styles. */
export function stylesheetClasses(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...new Set([...withoutComments.matchAll(/\.(env-[a-z0-9-]+)/g)].map((m) => m[1]))];
}

/**
 * The env- classes a component's source names, and the prefixes it builds classes from, such as
 * `env-button-` in `env-button-${variant}`.
 */
export function markupClasses(source) {
  const literal = new Set();
  const prefixes = new Set();
  for (const match of source.matchAll(/(?<![\w-])(env-[a-z0-9]+(?:-[a-z0-9]+)*)(-?)(\$\{)?/g)) {
    if (match[3]) prefixes.add(`${match[1]}${match[2]}`);
    else literal.add(match[1]);
  }
  return { literal, prefixes };
}

/** The class a stylesheet is named for: TextField.css styles env-text-field and its parts. */
export function ownClassPrefix(file) {
  const base = posix.basename(file, '.css');
  return `env-${base.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

const ownedBy = (name, prefix) => name === prefix || name.startsWith(`${prefix}-`);

/**
 * The classes a stylesheet styles for its own components: those named after it, or, in a
 * stylesheet named for a group (Actions.css, Indicators.css), every class no other stylesheet is
 * named for. A component's stylesheet often styles an icon or button inside it; those classes
 * belong to the icon's and the button's stylesheets.
 */
export function ownedClasses(file, classes, prefixes) {
  const prefix = ownClassPrefix(file);
  const own = classes.filter((name) => ownedBy(name, prefix));
  if (own.length) return own;
  return classes.filter(
    (name) => !prefixes.some((other) => other !== prefix && ownedBy(name, other)),
  );
}

function stylesheetModules(classes, components) {
  const modules = new Set();
  for (const [file, { literal, prefixes }] of components)
    for (const name of classes)
      if (
        literal.has(name) ||
        // `env-button-${variant}` builds env-button-outlined, not env-button-group-item.
        [...prefixes].some(
          (prefix) =>
            prefix.length > 5 &&
            name.startsWith(prefix) &&
            !name.slice(prefix.length).includes('-'),
        )
      ) {
        modules.add(file);
        break;
      }
  return modules;
}

/** Singular and plural spellings a file name may use for a public name. */
export function nameCandidates(base) {
  const names = [base];
  if (/(?:xes|ches|shes|sses)$/.test(base)) names.push(base.slice(0, -2));
  if (/s$/.test(base)) names.push(base.slice(0, -1));
  return names;
}

/** Builds the index the selection reads. Takes about a second on the whole repository. */
export function buildIndex(root = repositoryRoot) {
  const manifest = JSON.parse(read(root, 'docs/generated/manifest.json'));

  // Pages and the public names on each.
  const pageOfName = new Map();
  const namesOfPage = new Map();
  for (const component of manifest.components) {
    const page = `components/${component.page}`;
    const names = [...new Set(component.exports.map((name) => name.split('.')[0]))];
    namesOfPage.set(page, names);
    for (const name of names) if (!pageOfName.has(name)) pageOfName.set(name, page);
  }
  const pages = new Set(namesOfPage.keys());
  for (const section of ['foundations', 'patterns', 'templates'])
    for (const file of walk(root, `docs/${section}`, /\.md$/))
      pages.add(`${section}/${posix.basename(file, '.md')}`);
  const publicNames = new Set([
    ...Object.keys(manifest.exports ?? {}).map((name) => name.split('.')[0]),
    ...pageOfName.keys(),
  ]);

  // The library: imports, exports and stylesheets.
  const library = walk(root, 'packages/ui/src', /\.(?:tsx?|css)$/).filter(
    (file) => !file.startsWith('packages/ui/src/generated/'),
  );
  const known = new Set(library);
  const dependents = new Map();
  const namesOfModule = new Map();
  const components = new Map();
  for (const file of library) {
    if (file.endsWith('.css')) continue;
    const source = read(root, file);
    for (const specifier of relativeImports(source)) {
      const target = resolveImport(file, specifier, known);
      if (!target) continue;
      if (!dependents.has(target)) dependents.set(target, new Set());
      dependents.get(target).add(file);
    }
    namesOfModule.set(file, new Set(exportedNames(source).filter((name) => publicNames.has(name))));
    if (file.endsWith('.tsx')) components.set(file, markupClasses(source));
  }
  // Namespaces (`export * as Menu from './navigation/Menu.js'`) name their module.
  for (const entry of library.filter((file) => /^packages\/ui\/src\/[^/]+\.ts$/.test(file))) {
    for (const match of read(root, entry).matchAll(
      /export\s*\*\s*as\s+(\w+)\s+from\s*['"](\.[^'"]+)['"]/g,
    )) {
      const target = resolveImport(entry, match[2], known);
      // Its parts, such as Menu.RadioGroup, are not the top-level names they may share.
      if (target && publicNames.has(match[1])) namesOfModule.set(target, new Set([match[1]]));
    }
  }
  const stylesheets = new Map();
  const sheets = library.filter((path) => path.endsWith('.css'));
  const owners = sheets.map((file) => ownClassPrefix(file));
  const classesOf = new Map(sheets.map((file) => [file, stylesheetClasses(read(root, file))]));
  // A class many stylesheets style, such as the icon inside a control, belongs to none of them.
  const sheetsStyling = new Map();
  for (const classes of classesOf.values())
    for (const name of classes) sheetsStyling.set(name, (sheetsStyling.get(name) ?? 0) + 1);
  for (const file of sheets) {
    const classes = classesOf.get(file).filter((name) => sheetsStyling.get(name) <= 3);
    stylesheets.set(file, stylesheetModules(ownedClasses(file, classes, owners), components));
  }

  // Fixtures: which files each ?fixture= name mounts, and what each file imports from envUI. A
  // fixture's own stylesheet counts as a file it mounts.
  const fixtureFiles = walk(root, 'tests/fixture', /\.(?:tsx?|html|css)$/).filter(
    (file) => !file.includes('/hydration/'),
  );
  const fixtureKnown = new Set(fixtureFiles);
  const fixtureImports = new Map();
  const fixtureNames = new Map();
  for (const file of fixtureFiles) {
    if (file.endsWith('.html') || file.endsWith('.css')) continue;
    const source = read(root, file);
    fixtureImports.set(
      file,
      relativeImports(source)
        .map((specifier) => resolveImport(file, specifier, fixtureKnown))
        .filter(Boolean),
    );
    const names = new Set();
    for (const match of source.matchAll(
      /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]@envsemble\/envui(?:\/[\w-]+)?['"]/g,
    ))
      for (const part of match[1].split(',')) {
        const name = part
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0]
          ?.trim();
        if (name && publicNames.has(name)) names.add(name);
      }
    fixtureNames.set(file, names);
  }
  const fixtureClosure = (start) => {
    const seen = new Set();
    const queue = [...start];
    while (queue.length) {
      const file = queue.pop();
      if (seen.has(file)) continue;
      seen.add(file);
      queue.push(...(fixtureImports.get(file) ?? []));
    }
    return seen;
  };
  const fixtureByName = parseFixtureApp(root, fixtureKnown);

  // Specs.
  // What specs import: test helpers, and the catalogue and script modules they read directly.
  const helpers = new Set([
    ...walk(root, 'tests', /\.(?:ts|mjs|js|json)$/),
    ...walk(root, 'apps/catalogue', /\.(?:tsx?|mjs)$/).filter(
      (file) => !file.includes('/generated/'),
    ),
    ...walk(root, 'scripts', /\.mjs$/),
  ]);
  const specs = new Map();
  for (const file of walk(root, 'tests/browser', /\.spec\.ts$/)) {
    const name = posix.basename(file);
    const source = read(root, file);
    const fixtures = [...new Set([...source.matchAll(/fixture=([a-z0-9-]+)/g)].map((m) => m[1]))];
    const directFixtureFiles = new Set(
      fixtures.flatMap((fixture) => fixtureByName.get(fixture) ?? []),
    );
    for (const match of source.matchAll(/(?<![\w])([\w-]+)\.html\b/g))
      for (const extension of ['.tsx', '.ts'])
        if (fixtureKnown.has(`tests/fixture/${match[1]}${extension}`))
          directFixtureFiles.add(`tests/fixture/${match[1]}${extension}`);
    const allFixtureFiles = fixtureClosure(directFixtureFiles);
    const routes = new Set();
    for (const match of source.matchAll(/#\/((?:components|foundations)\/[a-z0-9-]+)/g))
      if (pages.has(match[1])) routes.add(match[1]);

    // Primary names: the spec's own name and its page, its fixtures' file names and the
    // overrides. The pages a spec merely opens count for changes to those pages, not here.
    const primary = new Set();
    const primaryPages = new Set();
    const nameFor = (candidate) =>
      nameCandidates(candidate).find((option) => publicNames.has(option));
    const own = nameFor(name.replace(/\.spec\.ts$/, ''));
    if (own) {
      primary.add(own);
      if (pageOfName.has(own)) primaryPages.add(pageOfName.get(own));
    }
    for (const fixture of directFixtureFiles) {
      const named = nameFor(posix.basename(fixture).replace(/\.tsx?$/, ''));
      if (named) primary.add(named);
    }
    for (const subject of overrides.specSubjects[name] ?? []) {
      if (pages.has(subject)) primaryPages.add(subject);
      else if (publicNames.has(subject)) primary.add(subject);
      else if (!overrides.planned.names.includes(subject))
        throw new Error(
          `overrides.specSubjects of ${name} names ${subject}, which is neither a page nor a public name`,
        );
    }
    for (const page of primaryPages)
      for (const each of namesOfPage.get(page) ?? []) primary.add(each);

    const uses = new Set(primary);
    for (const fixture of allFixtureFiles)
      for (const each of fixtureNames.get(fixture) ?? []) uses.add(each);

    const imports = new Set();
    const queue = relativeImports(source).map((specifier) =>
      resolveImport(file, specifier, helpers),
    );
    while (queue.length) {
      const helper = queue.pop();
      if (!helper || imports.has(helper)) continue;
      imports.add(helper);
      if (/\.(?:ts|mjs|js)$/.test(helper))
        queue.push(
          ...relativeImports(read(root, helper)).map((specifier) =>
            resolveImport(helper, specifier, helpers),
          ),
        );
    }

    specs.set(name, {
      file,
      name,
      fixtures,
      fixtureFiles: allFixtureFiles,
      routes,
      primary,
      primaryPages,
      uses,
      imports,
      catalogue: /\bcatalogueUrl\b/.test(source),
      fixtureServer: /\bfixtureUrl\b/.test(source),
      needs: {
        site: imports.has('tests/browser/HostedSite.ts'),
        offline: /dist\/envUI\.html/.test(source),
        hydration: /\.cache\/Hydration\.html/.test(source),
      },
      live: /LiveDevelopment/.test(name),
      contrast: /tag:\s*'@contrast'/.test(source),
    });
  }
  return {
    root,
    pages,
    pageOfName,
    namesOfPage,
    dependents,
    namesOfModule,
    stylesheets,
    fixtureByName,
    specs,
  };
}

/** Maps each ?fixture= name of tests/fixture/App.tsx to the fixture files it mounts. */
export function parseFixtureApp(root, fixtureKnown) {
  const app = 'tests/fixture/App.tsx';
  const source = read(root, app);
  const fileOfComponent = new Map();
  for (const match of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"](\.[^'"]+)['"]/g)) {
    const file = resolveImport(app, match[2], fixtureKnown);
    if (!file) continue;
    for (const part of match[1].split(',')) {
      const name = part.trim();
      if (name) fileOfComponent.set(name, file);
    }
  }
  const byName = new Map();
  const add = (fixture, component) => {
    const file = fileOfComponent.get(component);
    if (!file) return;
    if (!byName.has(fixture)) byName.set(fixture, new Set());
    byName.get(fixture).add(file);
  };
  // Standalone fixtures: `name: Component,` in an object literal.
  for (const match of source.matchAll(/^\s*'?([a-z0-9-]+)'?:\s*(\w+Fixture),?$/gm))
    add(match[1], match[2]);
  // `includes('name') && (...)` and `fixture === 'name'` clauses, up to the next clause.
  const clauses = [...source.matchAll(/(?:includes\(|fixture === )'([a-z0-9-]+)'/g)];
  clauses.forEach((clause, index) => {
    const end = clauses[index + 1]?.index ?? source.length;
    const body = source.slice(clause.index, end);
    for (const match of body.matchAll(/<([A-Z]\w*)\b/g)) add(clause[1], match[1]);
  });
  return new Map([...byName].map(([name, files]) => [name, [...files]]));
}

// ---------------------------------------------------------------------------------------------
// Selection

/** The page of a catalogue source or documentation file, such as components/button. */
export function pageOfFile(path, pages) {
  const match =
    /^docs\/(components|foundations|patterns|templates)\/([a-z0-9-]+)\.md$/.exec(path) ??
    /^apps\/catalogue\/src\/(?:examples|specimens|usage)\/([a-z0-9-]+)\//.exec(path);
  if (match && match.length === 3)
    return pages.has(`${match[1]}/${match[2]}`) ? `${match[1]}/${match[2]}` : undefined;
  if (match) {
    for (const section of ['components', 'foundations', 'patterns', 'templates'])
      if (pages.has(`${section}/${match[1]}`)) return `${section}/${match[1]}`;
    return undefined;
  }
  const foundation = /^apps\/catalogue\/src\/previews\/foundations\/(\w+)\.tsx$/.exec(path);
  if (foundation) {
    const id = foundation[1].toLowerCase().replace(/catalogue$/, 's');
    for (const candidate of [id, `${id}s`, id.replace(/s$/, '')])
      if (pages.has(`foundations/${candidate}`)) return `foundations/${candidate}`;
  }
  return undefined;
}

/** Library modules that depend on these, the modules included. */
function dependentsOf(modules, index) {
  const seen = new Set();
  const queue = [...modules];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    queue.push(...(index.dependents.get(file) ?? []));
  }
  return seen;
}

/** The modules, or for one with no public name, the nearest modules using it that have one. */
function publicFrontier(modules, index) {
  const frontier = new Set();
  const seen = new Set();
  const queue = [...modules];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    if (index.namesOfModule.get(file)?.size) frontier.add(file);
    else queue.push(...(index.dependents.get(file) ?? []));
  }
  return frontier;
}

const namesOf = (modules, index) =>
  new Set([...modules].flatMap((file) => [...(index.namesOfModule.get(file) ?? [])]));

const intersects = (a, b) => [...a].some((item) => b.has(item));

/**
 * What a change needs, by file. The result lists each check with the reasons for it; Check.mjs
 * picks the fast or the affected part.
 */
export function selectScope(paths, index) {
  const scope = {
    files: [...paths],
    lint: [],
    css: [],
    format: [],
    whole: { lint: false, css: false, format: false },
    typecheck: false,
    generated: new Set(),
    contrast: false,
    shared: false,
    catalogueShell: false,
    unit: false,
    build: { library: false, catalogue: false, site: false },
    // The catalogue builds the fast tier's specs open.
    fastBuild: { catalogue: false, site: false },
    // spec name → reasons; fast specs run in Chromium, affected ones in every engine.
    fastSpecs: new Map(),
    affectedSpecs: new Map(),
    pages: new Map(),
    density: false,
    a11y: false,
    visual: false,
    notes: [],
    unmapped: [],
  };
  const want = (map, key, reason) => {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(reason);
  };
  const specsWhere = (predicate) => [...index.specs.values()].filter(predicate).map((s) => s.name);
  const smoke = (reason) => {
    scope.shared = true;
    for (const spec of overrides.smokeSpecs) {
      want(scope.fastSpecs, spec, reason);
      want(scope.affectedSpecs, spec, reason);
    }
    for (const page of overrides.smokePages) want(scope.pages, page, reason);
  };
  /** Adds specs to the fast tier when few, else the shared set; the affected tier gets more. */
  const addSpecs = (fast, affected, reason) => {
    if (fast.length <= budgets.fast) for (const spec of fast) want(scope.fastSpecs, spec, reason);
    else {
      scope.notes.push(`${reason}: ${fast.length} specs; the fast tier runs the shared set`);
      smoke(reason);
    }
    const wider = [...new Set([...fast, ...affected])];
    if (wider.length <= budgets.affected)
      for (const spec of wider) want(scope.affectedSpecs, spec, reason);
    else if (fast.length <= budgets.affected)
      for (const spec of fast) want(scope.affectedSpecs, spec, reason);
  };
  const addPages = (pages, reason) => {
    if (pages.length <= budgets.pages) for (const page of pages) want(scope.pages, page, reason);
    else for (const page of overrides.smokePages) want(scope.pages, page, reason);
  };

  const libraryModules = new Set();
  const lintable = /\.(?:[cm]?js|tsx?)$/;
  for (const path of paths) {
    const exists = existsSync(resolve(index.root, path));
    if (exists && lintable.test(path)) scope.lint.push(path);
    if (exists && /^(?:packages\/ui\/src|apps\/catalogue\/src)\/.*\.css$/.test(path))
      scope.css.push(path);
    if (exists) scope.format.push(path);
    if (/\.(?:[cm]?js|tsx?|json)$/.test(path) || path.endsWith('.css')) scope.unit = true;
    if (
      /^(?:packages\/ui\/src\/|apps\/catalogue\/src\/|tests\/fixture\/|tests\/types\/).*\.tsx?$/.test(
        path,
      )
    )
      scope.typecheck = true;
    if (/(?:^|\/)tsconfig\.json$/.test(path)) scope.typecheck = true;

    // Repository-wide configuration reruns the whole of its check.
    if (/^eslint\.config\.mjs$|^packages\/eslint-plugin\//.test(path)) scope.whole.lint = true;
    if (
      /^stylelint\.(?:config\.mjs|.*)$|^stylelint-suppressions\.json$|^packages\/stylelint-config\//.test(
        path,
      )
    )
      scope.whole.css = true;
    if (/^\.prettier/.test(path)) scope.whole.format = true;
    if (/^package(?:-lock)?\.json$/.test(path)) {
      Object.assign(scope.whole, { lint: true, css: true, format: true });
      scope.typecheck = true;
      scope.unit = true;
      scope.build.library = true;
      smoke('dependencies changed');
      continue;
    }

    // Tokens, the palette and their build: the contrast gate and the shared set.
    if (
      /^packages\/ui\/tokens\/|^packages\/ui\/terrazzo\.config\.mjs$|^scripts\/(?:BuildTokens|GeneratePalette)\.mjs$|^packages\/ui\/src\/generated\/tokens/.test(
        path,
      ) ||
      /^packages\/ui\/src\/styles\/Tokens(?:Handwritten)?\.css$/.test(path)
    ) {
      scope.generated.add('tokens');
      scope.generated.add('docs');
      scope.contrast = true;
      scope.density = true;
      scope.typecheck ||= path.startsWith('packages/ui/src/generated/');
      smoke(`tokens (${path})`);
      continue;
    }
    if (
      /^packages\/ui\/src\/icons\/|^scripts\/(?:GenerateIcons|SyncIcons)\.mjs$|^packages\/ui\/icon-manifest\.json$/.test(
        path,
      )
    ) {
      scope.generated.add('icons');
      want(scope.pages, 'foundations/icons', `icons (${path})`);
      if (path.startsWith('packages/ui/src/icons/')) libraryModules.add(path);
      continue;
    }
    if (path.startsWith('packages/ui/src/')) {
      // Props and the manifest come from the TypeScript sources.
      if (/\.tsx?$/.test(path)) scope.generated.add('docs');
      scope.build.library = true;
      if (path.endsWith('.css'))
        for (const spec of overrides.stylesheetSpecs)
          want(scope.fastSpecs, spec, 'a library style sheet changed');
      if (overrides.sharedLibrary.includes(path)) {
        scope.contrast ||= path.endsWith('.css');
        scope.density = true;
        smoke(`shared library file ${path}`);
        continue;
      }
      libraryModules.add(path);
      continue;
    }
    if (
      /^packages\/ui\/(?:package\.json|bin\/|README|CHANGELOG)/.test(path) ||
      /^README\.md$|^\.agents\/skills\//.test(path)
    ) {
      scope.build.library = true;
      continue;
    }
    // The agent plugin and its marketplaces: tests/Plugin.test.mjs, a unit test, checks them
    // against .agents/skills and the library's version.
    if (
      /^plugin\/|^\.claude-plugin\/|^\.agents\/plugins\/|^scripts\/GeneratePlugin\.mjs$/.test(path)
    ) {
      scope.unit = true;
      continue;
    }

    // The setup page's router recipes are type-checked by a unit test, tests/RouterRecipes.test.mjs.
    if (path === 'docs/setup.md') scope.unit = true;
    // Documentation and catalogue pages.
    const page = pageOfFile(path, index.pages);
    if (page) {
      if (path.startsWith('docs/') || path.startsWith('apps/catalogue/'))
        scope.generated.add('docs');
      const visiting = specsWhere((spec) => spec.routes.has(page));
      want(scope.pages, page, `page ${page} (${path})`);
      // A template's screens are also checked alone, at their frame route.
      if (page.startsWith('templates/'))
        for (const spec of overrides.templateSpecs.filter((name) => index.specs.has(name))) {
          want(scope.fastSpecs, spec, `template ${page} (${path})`);
          want(scope.affectedSpecs, spec, `template ${page} (${path})`);
        }
      if (path.endsWith('.md')) {
        // Text: the fast tier checks the generated docs; browser checks wait for the affected tier.
        for (const spec of visiting) want(scope.affectedSpecs, spec, `opens ${page}`);
      } else addSpecs(visiting, [], `opens ${page}`);
      scope.build.catalogue = scope.build.site = true;
      continue;
    }
    if (/^docs\/.*\.md$/.test(path)) {
      scope.generated.add('docs');
      continue;
    }
    if (/^docs\/generated\//.test(path)) {
      scope.generated.add('docs');
      continue;
    }
    if (
      path.startsWith('apps/catalogue/') ||
      /^scripts\/(?:GenerateDocumentation|ExtractProps|GenerateManifest|GenerateCodeThemes|Search\w*|MarkdownHeadings)\.m?[jt]s$/.test(
        path,
      )
    ) {
      scope.generated.add('docs');
      scope.catalogueShell = true;
      scope.build.catalogue = scope.build.site = true;
      // The specs that import the file or are about its part of the catalogue, else the shared set.
      const related = new Set([
        ...specsWhere((spec) => spec.imports.has(path)),
        ...Object.entries(overrides.catalogueAreas)
          .filter(([area]) => path.startsWith(area))
          .flatMap(([, specs]) => specs)
          // A planned spec joins once it exists.
          .filter((spec) => index.specs.has(spec)),
      ]);
      const chosen =
        related.size && related.size <= budgets.fast ? [...related] : overrides.catalogueSpecs;
      for (const spec of chosen)
        if (!index.specs.get(spec)?.live) want(scope.fastSpecs, spec, `catalogue (${path})`);
      for (const spec of specsWhere(
        (spec) => spec.catalogue || spec.needs.site || spec.needs.offline,
      ))
        if (!spec.startsWith('LiveDevelopment'))
          want(scope.affectedSpecs, spec, `catalogue (${path})`);
      for (const page of overrides.smokePages) want(scope.pages, page, `catalogue (${path})`);
      if (overrides.frameFiles.some((file) => path.startsWith(file)))
        for (const page of [...index.pages].filter((name) => name.startsWith('templates/')))
          want(scope.pages, page, `template frame (${path})`);
      continue;
    }
    if (
      /^scripts\/(?:FinalizeCatalogue|FinalizeSite|SiteModuleFiles|AssembleSiteVersions)\.mjs$|^wrangler\.jsonc$/.test(
        path,
      )
    ) {
      scope.build.catalogue = scope.build.site = true;
      for (const spec of specsWhere((spec) => spec.needs.site || spec.needs.offline))
        want(scope.affectedSpecs, spec, `site build (${path})`);
      continue;
    }
    if (
      /^scripts\/(?:BuildLibrary|ClientModules|DependencyNotices|ValidateRelease)\.mjs$/.test(path)
    ) {
      scope.build.library = true;
      continue;
    }

    // Tests.
    if (path.startsWith('tests/browser/') && path.endsWith('.spec.ts')) {
      const name = posix.basename(path);
      if (index.specs.has(name)) {
        want(scope.fastSpecs, name, 'changed spec');
        want(scope.affectedSpecs, name, 'changed spec');
        if (index.specs.get(name).contrast) scope.contrast = true;
      }
      continue;
    }
    if (path.startsWith('tests/fixture/')) {
      const users = specsWhere((spec) => spec.fixtureFiles.has(path));
      if (users.length) addSpecs(users, [], `loads ${path}`);
      else if (/\.(?:tsx?|css|html)$/.test(path)) smoke(`fixture-wide file ${path}`);
      if (/DensitySections|Density\.tsx/.test(path)) scope.density = true;
      continue;
    }
    if (path.startsWith('tests/contrast/')) {
      scope.contrast = true;
      addSpecs(
        specsWhere((spec) => spec.imports.has(path) && !spec.contrast),
        [],
        `imports ${path}`,
      );
      continue;
    }
    if (path.startsWith('tests/accessibility/')) {
      scope.a11y = true;
      for (const page of overrides.smokePages) want(scope.pages, page, `a11y harness (${path})`);
      continue;
    }
    if (path.startsWith('tests/visual/') || path === 'scripts/VisualTests.mjs') {
      scope.visual = true;
      const snapshot = /^tests\/visual\/snapshots\/catalogue\/([a-z0-9-]+)\//.exec(path);
      const snapshotPage =
        snapshot && pageOfFile(`apps/catalogue/src/examples/${snapshot[1]}/`, index.pages);
      if (snapshotPage) want(scope.pages, snapshotPage, `snapshot ${path}`);
      else if (path.startsWith('tests/visual/snapshots/density/')) scope.density = true;
      else
        for (const page of overrides.smokePages)
          want(scope.pages, page, `visual harness (${path})`);
      continue;
    }
    if (path.startsWith('tests/browser/') || path === 'playwright.config.ts') {
      const users = specsWhere((spec) => spec.imports.has(path));
      if (users.length && users.length <= budgets.fast) addSpecs(users, [], `imports ${path}`);
      else smoke(`browser harness (${path})`);
      continue;
    }
    if (/^(?:tests|packages\/(?:codemods|eslint-plugin|stylelint-config)|bench)\//.test(path))
      continue;
    if (/^scripts\/(?:Check|Verify|TestScope|TestTasks)\.mjs$/.test(path)) continue;
    if (/\.md$|^\.github\/|^\.changeset\/|^assets\/|^\.git/.test(path)) continue;
    scope.unmapped.push(path);
  }

  if (libraryModules.size) {
    // Stylesheets lead to the components that render their classes.
    const direct = new Set();
    const directNames = new Set();
    for (const file of libraryModules) {
      if (file.endsWith('.css')) {
        const modules = index.stylesheets.get(file) ?? new Set();
        if (!modules.size) scope.notes.push(`${file} styles no component's classes`);
        for (const module of modules) direct.add(module);
        // TextField.css is about TextField, whichever internal module renders its classes.
        const named = nameCandidates(posix.basename(file, '.css')).find((name) =>
          index.pageOfName.has(name),
        );
        if (named) directNames.add(named);
        for (const name of namesOf(modules, index)) directNames.add(name);
      } else direct.add(file);
    }
    // An internal module, such as the frame of every field, stands for the components using it.
    if (!directNames.size)
      for (const name of namesOf(publicFrontier(direct, index), index)) directNames.add(name);
    const closure = dependentsOf(direct, index);
    const closureNames = namesOf(closure, index);
    const directPages = [
      ...new Set([...directNames].map((name) => index.pageOfName.get(name)).filter(Boolean)),
    ];
    const closurePages = [
      ...new Set([...closureNames].map((name) => index.pageOfName.get(name)).filter(Boolean)),
    ];
    const label = [...libraryModules].map((file) => posix.basename(file)).join(', ');
    const primary = specsWhere((spec) => intersects(spec.primary, directNames));
    const users = specsWhere((spec) => intersects(spec.uses, closureNames));
    if (primary.length) addSpecs(primary, users, `about ${[...directNames].join(', ') || label}`);
    else if (users.length) addSpecs(users, [], `uses what ${label} affects`);
    else smoke(`${label} reaches no spec by name`);
    addPages(directPages.length ? directPages : closurePages, `shows ${label}`);
  }

  // The catalogue builds take seconds, so the fast tier builds what its specs open. Specs that
  // need the library build, and live development, which edits sources, wait for the affected tier.
  for (const name of [...scope.fastSpecs.keys()]) {
    const spec = index.specs.get(name);
    if (spec && (spec.needs.hydration || spec.live)) {
      scope.fastSpecs.delete(name);
      want(scope.affectedSpecs, name, 'needs the library build or edits sources');
      scope.notes.push(`${name} needs the library build or edits sources: check:affected runs it`);
      continue;
    }
    if (spec?.needs.offline) scope.fastBuild.catalogue = true;
    if (spec?.needs.site) scope.fastBuild.site = true;
  }
  for (const name of scope.affectedSpecs.keys()) {
    const spec = index.specs.get(name);
    if (spec?.needs.offline) scope.build.catalogue = true;
    if (spec?.needs.site) scope.build.site = true;
    if (spec?.needs.hydration) scope.build.library = true;
  }
  if (scope.pages.size) scope.a11y = scope.visual = true;
  if (scope.density) scope.visual = true;
  return scope;
}

/** Which servers the given specs need, for ENVUI_SERVERS. */
export function serversFor(specNames, index) {
  const servers = new Set();
  for (const name of specNames) {
    const spec = index.specs.get(name);
    if (spec?.catalogue) servers.add('catalogue');
    if (spec?.fixtureServer) servers.add('fixture');
  }
  return [...servers];
}

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
