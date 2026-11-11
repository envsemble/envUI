// Reads packages/ui/src against tests/library/rules/composition/Rules.json and finds what breaks each composition
// rule. tests/library/rules/Composition.test.mjs compares the findings with tests/library/rules/composition/Exceptions.json.
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, posix, relative, resolve, sep } from 'node:path';
import { libraryEntryPoints } from '../../../../scripts/docs/LibraryEntryPoints.ts';
import { kebab } from '../../../../scripts/docs/PageStructure.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');

export const rulesFile = 'tests/library/rules/composition/Rules.json';
export const exceptionsFile = 'tests/library/rules/composition/Exceptions.json';

const sourceRoot = resolve('packages/ui/src');
const stylesRoot = join(sourceRoot, 'styles');
/**
 * Generated icons are listed, so imports of them resolve and they take a layer, but not read:
 * `npm run icons:check` holds each to its generator, whose one import is ../Icon.js. Reading
 * thousands of files would make this test slow.
 */
const generated = 'icons/';
const isGenerated = (module) => module.startsWith(generated) && module !== 'icons/index.ts';
/**
 * The message modules hold strings, one module per namespace, and render nothing: they are no
 * components, so their names claim no classes.
 */
const isMessages = (module) => module.startsWith('foundations/messages/');

function walk(directory, found = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (path !== stylesRoot && entry.name !== 'assets') walk(path, found);
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) found.push(path);
  }
  return found;
}

/** A function from an offset in text to its 1-based line. */
function lineIndex(text) {
  const starts = [0];
  for (let index = text.indexOf('\n'); index !== -1; index = text.indexOf('\n', index + 1))
    starts.push(index + 1);
  return (offset) => {
    let low = 0;
    let high = starts.length - 1;
    while (low < high) {
      const middle = (low + high + 1) >> 1;
      if (starts[middle] <= offset) low = middle;
      else high = middle - 1;
    }
    return low + 1;
  };
}
const baseName = (module) => posix.basename(module).replace(/\.tsx?$/, '');

/**
 * A class or class prefix in TSX: `env-x`, or `env-x-*` where code appends to `env-x-`. Names may
 * also take BEM elements and modifiers (`env-x__part`, `env-x--state`).
 */
const classPattern = /(?<![\w-])env-[a-z0-9]+(?:(?:--?|__)[a-z0-9]+)*-?/g;
const classToken = (match) => (match.endsWith('-') ? `${match}*` : match);
/** A class in a selector. */
const selectorClassPattern = /\.(env-[a-z0-9]+(?:(?:--?|__)[a-z0-9]+)*)/g;
/** Whether a class is a prefix itself or continues it with a part or modifier. */
const continues = (name, prefix) =>
  name === prefix || (name.startsWith(prefix) && /^(?:-|__)/.test(name.slice(prefix.length)));

/** What identifies a finding, and the exception entry that lists it, in each section. */
export function keyOf(section, entry) {
  if (section === 'imports') return `${entry.module} -> ${entry.imports}`;
  if (section === 'interactive') return `${entry.module} ${entry.element}`;
  if (section === 'tsxClasses') return `${entry.module} ${entry.class}`;
  return `${entry.stylesheet} ${entry.class}`;
}

/** Adds a site to the finding its exception entry identifies, and returns the finding. */
function record(findings, section, entry, site) {
  const key = keyOf(section, entry);
  const finding = findings.get(key) ?? { entry, sites: [], ...site.info };
  finding.sites.push(site.line);
  findings.set(key, finding);
  return finding;
}

/**
 * The library as the rules read it: its modules, planned ones, the sources and style sheets, and the
 * problems found so far, with checks that a name in the rules exists.
 */
function readLibrary(rules) {
  const problems = [];
  const modules = walk(sourceRoot)
    .map((path) => relative(sourceRoot, path).split(sep).join('/'))
    .sort();
  const moduleSet = new Set(modules);
  // Planned modules don't exist yet; the rules may name them, and each stands for its component.
  const planned = (rules.planned?.modules ?? []).filter((module) => !moduleSet.has(module));
  const plannedSet = new Set(planned);
  const stylesheets = readdirSync(stylesRoot)
    .filter((name) => name.endsWith('.css'))
    .sort();
  return {
    rules,
    problems,
    modules,
    moduleSet,
    planned,
    sources: new Map(
      modules
        .filter((module) => !isGenerated(module))
        .map((module) => [module, readFileSync(join(sourceRoot, module), 'utf8')]),
    ),
    stylesheets,
    // The allowances the findings used; one left unused is stale.
    usedAllowances: new Set(),
    requireModule(module, where) {
      if (!moduleSet.has(module) && !plannedSet.has(module))
        problems.push(`${rulesFile} ${where} names ${module}, which doesn't exist.`);
    },
    requireStylesheet(stylesheet, where) {
      if (!stylesheets.includes(stylesheet))
        problems.push(`${rulesFile} ${where} names styles/${stylesheet}, which doesn't exist.`);
    },
  };
}

/**
 * The layers: their order and each module's layer, checked against the rules. A module listed with a
 * layer other than its directory's, beyond a component's choice between base and composites, gives
 * its reason.
 */
function readLayers(library) {
  const { rules, problems, modules, planned, requireModule } = library;
  const { order, directories, modules: listed } = rules.layers;
  const rank = new Map(order.map((layer, index) => [layer, index]));
  const directoryLayer = (module) => {
    const directory = Object.keys(directories)
      .filter((path) => module.startsWith(path))
      .sort((a, b) => b.length - a.length)[0];
    return directory === undefined ? undefined : directories[directory];
  };
  const layeredModules = Object.fromEntries(
    Object.entries(listed).map(([module, entry]) => [
      module,
      typeof entry === 'string' ? entry : entry.layer,
    ]),
  );
  const components = new Set(['base', 'composites']);
  for (const [module, entry] of Object.entries(listed)) {
    const own = layeredModules[module];
    const folder = directoryLayer(module);
    const usual = own === folder || (components.has(own) && components.has(folder));
    if (!usual && typeof entry === 'string')
      problems.push(
        `${rulesFile} layers.modules puts ${module} in ${own} beside its directory's ${folder}: give it { "layer", "reason" }.`,
      );
  }
  for (const [where, map] of [
    ['layers.directories', directories],
    ['layers.modules', layeredModules],
  ])
    for (const [path, layer] of Object.entries(map)) {
      if (!rank.has(layer))
        problems.push(`${rulesFile} ${where} gives ${path} the unknown layer "${layer}".`);
      if (where === 'layers.modules') requireModule(path, where);
      else if (![...modules, ...planned].some((module) => module.startsWith(path)))
        problems.push(`${rulesFile} ${where} names ${path}, which holds no module.`);
    }
  const entryPoints = new Set(
    libraryEntryPoints().map(({ file }) => relative(sourceRoot, file).split(sep).join('/')),
  );
  const layerOf = (module) => {
    if (entryPoints.has(module)) return 'entries';
    if (Object.hasOwn(layeredModules, module)) return layeredModules[module];
    return directoryLayer(module);
  };
  for (const module of modules)
    if (layerOf(module) === undefined)
      problems.push(`${module} has no layer: give it one under layers in ${rulesFile}.`);
  return { order, rank, layerOf };
}

/** The library modules each module imports, each with the line of its first import. */
function readImports({ problems, modules, moduleSet, sources }) {
  const resolveImport = (from, specifier) => {
    if (!specifier.startsWith('.')) return undefined;
    const target = posix.normalize(posix.join(posix.dirname(from), specifier)).replace(/\.js$/, '');
    const candidates = [
      `${target}.tsx`,
      `${target}.ts`,
      `${target}/index.ts`,
      `${target}/index.tsx`,
    ];
    const found = candidates.find((candidate) => moduleSet.has(candidate));
    if (found === undefined && !/\.(?:css|json|svg|woff2)(?:\?raw)?$/.test(specifier))
      problems.push(`${from} imports ${specifier}, which isn't a module under packages/ui/src.`);
    return found;
  };
  const imports = new Map();
  for (const module of modules) {
    const targets = new Map();
    imports.set(module, targets);
    const text = sources.get(module);
    if (text === undefined) continue;
    const lineOf = lineIndex(text);
    const { importedFiles } = ts.preProcessFile(text, true, true);
    for (const file of importedFiles) {
      const target = resolveImport(module, file.fileName);
      if (target !== undefined && !targets.has(target)) targets.set(target, lineOf(file.pos));
    }
  }
  return imports;
}

/** The imports that go up the layers. */
function importFindingsOf(imports, { rank, layerOf }) {
  const findings = new Map();
  for (const [module, targets] of imports)
    for (const [target, line] of targets) {
      const from = layerOf(module);
      const to = layerOf(target);
      if (!rank.has(from) || !rank.has(to) || rank.get(to) <= rank.get(from)) continue;
      record(findings, 'imports', { module, imports: target }, { line, info: { from, to } });
    }
  return findings;
}

/**
 * The components: a module each, named after it, planned ones and those the rules join, with the
 * modules, class prefixes, style sheets and slots of each, and each module's component.
 */
function readComponents(library, layerOf) {
  const { rules, problems, modules, planned, stylesheets, requireModule, requireStylesheet } =
    library;
  const components = new Map();
  const componentOf = new Map();
  const ownStyles = (name) => new Set(stylesheets.includes(`${name}.css`) ? [`${name}.css`] : []);
  for (const module of modules) {
    if (layerOf(module) === 'entries' || module.startsWith(generated) || isMessages(module))
      continue;
    const name = baseName(module);
    if (components.has(name)) {
      problems.push(
        `${module} and ${[...components.get(name).modules][0]} are both named ${name}: list one under a component in ${rulesFile}.`,
      );
      continue;
    }
    components.set(name, {
      modules: new Set([module]),
      prefixes: new Set([`env-${kebab(name)}`]),
      styles: ownStyles(name),
      slots: new Set(),
    });
    componentOf.set(module, name);
  }
  for (const module of planned) {
    const name = baseName(module);
    if (components.has(name)) continue;
    components.set(name, {
      modules: new Set(),
      prefixes: new Set([`env-${kebab(name)}`]),
      styles: ownStyles(name),
      slots: new Set(),
      planned: true,
    });
  }
  for (const [name, entry] of Object.entries(rules.classes.components)) {
    const component = components.get(name) ?? {
      modules: new Set(),
      prefixes: new Set(),
      styles: new Set(),
      slots: new Set(),
    };
    components.set(name, component);
    for (const module of entry.modules ?? []) {
      requireModule(module, `classes.components.${name}`);
      const absorbed = componentOf.get(module);
      if (absorbed === undefined || absorbed === name) continue;
      for (const key of ['modules', 'prefixes', 'styles', 'slots'])
        for (const value of components.get(absorbed)[key]) component[key].add(value);
      for (const member of components.get(absorbed).modules) componentOf.set(member, name);
      components.delete(absorbed);
    }
    for (const prefix of entry.classes ?? []) component.prefixes.add(prefix);
    for (const stylesheet of entry.styles ?? []) {
      requireStylesheet(stylesheet, `classes.components.${name}`);
      component.styles.add(stylesheet);
    }
    for (const slot of entry.slots ?? []) component.slots.add(slot);
  }
  return { components, componentOf };
}

/**
 * Who owns a class: `ownerOf` names the component whose prefix it continues, or `shared`, and
 * remembers each class it was asked about (`seen`) and each that nothing owns (`unowned`). Each
 * style sheet's owners, which must be a component's or listed without one.
 */
function readOwnership(library, components) {
  const { rules, problems, stylesheets, requireStylesheet } = library;
  const classRules = rules.classes;
  const shared = new Set(Object.keys(classRules.shared).filter((name) => !name.startsWith('$')));
  const prefixOwner = new Map();
  for (const [name, component] of components)
    for (const prefix of component.prefixes) {
      if (prefixOwner.has(prefix))
        problems.push(
          `${prefix} belongs to both ${prefixOwner.get(prefix)} and ${name} in ${rulesFile}.`,
        );
      prefixOwner.set(prefix, name);
    }
  const prefixes = [...prefixOwner.keys()].sort((a, b) => b.length - a.length);
  const unowned = new Map();
  const seen = new Set();
  /** The component that owns a class, `shared`, or undefined. */
  const ownerOf = (token, where) => {
    const name = token.replace(/-\*$/, '');
    seen.add(name);
    if (shared.has(name)) return 'shared';
    const prefix = prefixes.find((candidate) => continues(name, candidate));
    if (prefix === undefined) {
      if (!unowned.has(name)) unowned.set(name, where);
      return undefined;
    }
    return prefixOwner.get(prefix);
  };
  const stylesheetOwners = new Map(stylesheets.map((stylesheet) => [stylesheet, new Set()]));
  for (const [name, component] of components)
    for (const stylesheet of component.styles) stylesheetOwners.get(stylesheet)?.add(name);
  for (const stylesheet of Object.keys(classRules.stylesheetsWithoutComponent))
    requireStylesheet(stylesheet, 'classes.stylesheetsWithoutComponent');
  for (const [stylesheet, owners] of stylesheetOwners)
    if (owners.size === 0 && !Object.hasOwn(classRules.stylesheetsWithoutComponent, stylesheet))
      problems.push(
        `styles/${stylesheet} belongs to no component: list it under a component's styles in ${rulesFile}, or under stylesheetsWithoutComponent.`,
      );
  return { shared, ownerOf, seen, unowned, stylesheetOwners };
}

/** A pattern of property names, `*` standing for any run of letters and dashes. */
const propertyPattern = (patterns) =>
  new RegExp(
    `^(?:${patterns.map((pattern) => pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z-]*')).join('|')})$`,
  );

/**
 * Raw interactive HTML in the modules, and classes a module emits that another component owns
 * but neither its own slot nor a component it imports.
 */
function markupFindings(library, { components, componentOf }, imports, ownerOf) {
  const { rules, requireModule, modules, sources, usedAllowances } = library;
  const interactive = rules.interactive;
  for (const module of Object.keys(interactive.leafControls))
    requireModule(module, 'interactive.leafControls');
  for (const module of Object.keys(interactive.dynamicRoles ?? {}))
    if (module !== '$comment') requireModule(module, 'interactive.dynamicRoles');
  const interactiveFindings = new Map();
  const tsxClassFindings = new Map();
  for (const module of modules) {
    if (module.startsWith(generated)) continue;
    const file = ts.createSourceFile(
      module,
      sources.get(module),
      ts.ScriptTarget.Latest,
      true,
      module.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const owner = componentOf.get(module);
    const importsOf = imports.get(module);
    const lineOf = (node) => file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
    const visit = (node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
        for (const element of interactiveElements(node, interactive, module, usedAllowances)) {
          if (interactive.leafControls[module]?.includes(element))
            usedAllowances.add(`leafControls ${module} ${element}`);
          else
            record(interactiveFindings, 'interactive', { module, element }, { line: lineOf(node) });
        }
      if (
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node)
      ) {
        const line = lineOf(node);
        for (const match of node.text.matchAll(classPattern)) {
          const token = classToken(match[0]);
          if (token === 'env-*') continue;
          const tokenOwner = ownerOf(token, `${module}:${line}`);
          if (tokenOwner === undefined || tokenOwner === 'shared' || tokenOwner === owner) continue;
          const ownerComponent = components.get(tokenOwner);
          const slot =
            ownerComponent.slots.has(token) &&
            [...ownerComponent.modules].some((member) => importsOf.has(member));
          if (slot) continue;
          record(
            tsxClassFindings,
            'tsxClasses',
            { module, class: token },
            { line, info: { owner: tokenOwner } },
          );
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
  }
  return { interactiveFindings, tsxClassFindings };
}

/**
 * Selectors of a style sheet that name another component's classes, unless a child rule lets it
 * set layout properties, and those it allows, on them.
 */
function stylesheetFindings(library, { ownerOf, stylesheetOwners }) {
  const { rules, stylesheets, requireStylesheet, usedAllowances } = library;
  const { layoutProperties, rules: childRules } = rules.classes.childRules;
  for (const rule of childRules) requireStylesheet(rule.stylesheet, 'classes.childRules');
  const layoutProperty = propertyPattern(layoutProperties);
  /** The child rule that lets a stylesheet's selectors name a class, if any. */
  const childRuleFor = (stylesheet, token) => {
    const rule = childRules.find(
      (candidate) => candidate.stylesheet === stylesheet && candidate.classes.includes(token),
    );
    if (rule) usedAllowances.add(`childRules ${stylesheet} ${token}`);
    return rule;
  };
  const disallowedProperties = (rule, properties) => {
    const extra = propertyPattern(rule.properties ?? []);
    return properties.filter(
      (property) => !layoutProperty.test(property) && !(rule.properties && extra.test(property)),
    );
  };
  const findings = new Map();
  for (const stylesheet of stylesheets) {
    const text = readFileSync(join(stylesRoot, stylesheet), 'utf8');
    const owners = stylesheetOwners.get(stylesheet);
    for (const { selector, line, properties } of cssSelectors(text)) {
      const tokens = new Set([...selector.matchAll(selectorClassPattern)].map((match) => match[1]));
      for (const token of tokens) {
        const tokenOwner = ownerOf(token, `styles/${stylesheet}:${line}`);
        if (tokenOwner === undefined || tokenOwner === 'shared' || owners.has(tokenOwner)) continue;
        const childRule = childRuleFor(stylesheet, token);
        const disallowed = childRule ? disallowedProperties(childRule, properties) : [];
        if (childRule && disallowed.length === 0) continue;
        const finding = record(
          findings,
          'cssClasses',
          { stylesheet, class: token },
          { line, info: { owner: tokenOwner, disallowed: new Set() } },
        );
        for (const property of disallowed) finding.disallowed.add(property);
      }
    }
  }
  return findings;
}

/** Allowances that no longer allow anything, so the rules can't hide a later regression. */
function staleAllowances(library, components, { shared, seen, stylesheetOwners }) {
  const { rules, problems, usedAllowances } = library;
  const { interactive, classes: classRules } = rules;
  for (const [module, expressions] of Object.entries(interactive.dynamicRoles ?? {}))
    if (module !== '$comment')
      for (const expression of Object.keys(expressions))
        if (!usedAllowances.has(`dynamicRoles ${module} ${expression}`))
          problems.push(
            `${rulesFile} interactive.dynamicRoles lists the roles of role={${expression}} in ${module}, which sets no such role it can't read: remove it.`,
          );
  for (const [module, elements] of Object.entries(interactive.leafControls))
    for (const element of elements)
      if (!usedAllowances.has(`leafControls ${module} ${element}`))
        problems.push(
          `${rulesFile} interactive.leafControls lets ${module} render a raw <${element}>, which it no longer does: remove it.`,
        );
  for (const rule of classRules.childRules.rules)
    for (const token of rule.classes)
      if (!usedAllowances.has(`childRules ${rule.stylesheet} ${token}`))
        problems.push(
          `${rulesFile} classes.childRules lets styles/${rule.stylesheet} name .${token}, which it no longer does: remove it.`,
        );
  const unused = (name) => ![...seen].some((token) => continues(token, name));
  for (const name of shared)
    if (unused(name))
      problems.push(`${rulesFile} classes.shared lists ${name}, which nothing uses: remove it.`);
  for (const [name, entry] of Object.entries(classRules.components))
    if (!components.get(name)?.planned)
      for (const key of ['classes', 'slots'])
        for (const prefix of entry[key] ?? [])
          if (unused(prefix))
            problems.push(
              `${rulesFile} classes.components.${name}.${key} lists ${prefix}, which nothing uses: remove it.`,
            );
  for (const stylesheet of Object.keys(classRules.stylesheetsWithoutComponent))
    if (stylesheetOwners.get(stylesheet)?.size)
      problems.push(
        `${rulesFile} classes.stylesheetsWithoutComponent lists styles/${stylesheet}, which belongs to ${[...stylesheetOwners.get(stylesheet)].join(', ')}: remove it.`,
      );
}

export function analyze() {
  const library = readLibrary(JSON.parse(readFileSync(rulesFile, 'utf8')));
  const layers = readLayers(library);
  const imports = readImports(library);
  const importFindings = importFindingsOf(imports, layers);
  const componentMap = readComponents(library, layers.layerOf);
  const ownership = readOwnership(library, componentMap.components);
  const { interactiveFindings, tsxClassFindings } = markupFindings(
    library,
    componentMap,
    imports,
    ownership.ownerOf,
  );
  const cssClassFindings = stylesheetFindings(library, ownership);
  for (const [name, where] of ownership.unowned)
    library.problems.push(
      `${name} (${where}) belongs to no component: add it, or a prefix of it, to a component's classes in ${rulesFile}.`,
    );
  staleAllowances(library, componentMap.components, ownership);
  return {
    problems: library.problems,
    layers: layers.order,
    // Who owns what, for tests/library/rules/StyleImports.test.mjs: each module's component, each component's
    // style sheets, and a class's owner, a component or 'shared'.
    ownership: {
      ...componentMap,
      ownerOf: (token) => ownership.ownerOf(token, 'a test'),
    },
    findings: {
      imports: importFindings,
      interactive: interactiveFindings,
      tsxClasses: tsxClassFindings,
      cssClasses: cssClassFindings,
    },
  };
}

/**
 * The raw interactive elements a JSX tag can render, such as `button` or `role="button"`. A role
 * set by a condition counts with each role its branches can take. A role the source doesn't spell
 * out, such as role={role}, takes the roles listed for that expression, by its source text such as
 * `role` or `stand.role`, in its module under interactive.dynamicRoles; without them it is
 * `role={…}`, a finding of its own until they are listed. So a listing covers only that
 * expression, not every role={…} the module may add later.
 */
export function interactiveElements(node, { elements, roles, dynamicRoles = {} }, module, used) {
  if (!ts.isIdentifier(node.tagName)) return [];
  const tag = node.tagName.text;
  if (!/^[a-z]/.test(tag)) return [];
  const value = (name) => attributeValue(node, name);
  if (elements.includes(tag)) {
    if (tag === 'input' && value('type') === 'hidden') return [];
    const hidden = value('aria-hidden') === true || value('aria-hidden') === 'true';
    if (hidden && value('tabIndex') === -1) return [];
    return [tag];
  }
  const taken = roleValues(node);
  if (taken === undefined) return [];
  for (const expression of taken.unknown) {
    const listed = Object.hasOwn(dynamicRoles[module] ?? {}, expression)
      ? dynamicRoles[module][expression]
      : undefined;
    if (!listed) return ['role={…}'];
    used?.add(`dynamicRoles ${module} ${expression}`);
    taken.roles.push(...listed);
  }
  return [...new Set(taken.roles)]
    .filter((role) => roles.includes(role))
    .map((role) => `role="${role}"`);
}

/**
 * The roles a JSX tag's role attribute can take: its literal, or the literals of a condition's
 * branches, and the source text of the branches that are no literal. Undefined without a role
 * attribute.
 */
function roleValues(node) {
  const attribute = node.attributes.properties.find(
    (property) => ts.isJsxAttribute(property) && property.name.getText() === 'role',
  );
  if (attribute === undefined || attribute.initializer === undefined) return undefined;
  const result = { roles: [], unknown: [] };
  const visit = (expression) => {
    if (expression === undefined) return;
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression))
      result.roles.push(expression.text);
    else if (ts.isParenthesizedExpression(expression)) visit(expression.expression);
    else if (ts.isConditionalExpression(expression)) {
      visit(expression.whenTrue);
      visit(expression.whenFalse);
    } else if (
      !(ts.isIdentifier(expression) && expression.text === 'undefined') &&
      expression.kind !== ts.SyntaxKind.NullKeyword
    )
      result.unknown.push(expression.getText().replace(/\s+/g, ' '));
  };
  const { initializer } = attribute;
  visit(ts.isJsxExpression(initializer) ? initializer.expression : initializer);
  return result;
}

/** A JSX attribute's literal value: a string, a number, true, or undefined when it is dynamic. */
function attributeValue(node, name) {
  const attribute = node.attributes.properties.find(
    (property) => ts.isJsxAttribute(property) && property.name.getText() === name,
  );
  if (attribute === undefined) return undefined;
  const { initializer } = attribute;
  if (initializer === undefined) return true;
  if (ts.isStringLiteral(initializer)) return initializer.text;
  const expression = ts.isJsxExpression(initializer) ? initializer.expression : undefined;
  if (expression === undefined) return undefined;
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression))
    return expression.text;
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (ts.isNumericLiteral(expression)) return Number(expression.text);
  if (
    ts.isPrefixUnaryExpression(expression) &&
    expression.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(expression.operand)
  )
    return -Number(expression.operand.text);
  return undefined;
}

/**
 * Every complex selector of a stylesheet's style rules, with its line and the properties its rule
 * declares. Keyframe steps are skipped.
 */
export function cssSelectors(css) {
  // Blank comments and strings out, keeping offsets, so braces inside them can't end a block.
  const text = css
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
    .replace(/(["'])(?:\\.|(?!\1)[^\\\n])*\1/g, (string) => string.replace(/[^\n]/g, ' '));
  const lineOf = lineIndex(text);
  const selectors = [];
  const blocks = [];
  let start = 0;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '{') {
      const prelude = text.slice(start, index);
      const insideKeyframes = blocks.some((block) => /^@(?:-\w+-)?keyframes\b/.test(block.prelude));
      const rule = !prelude.trim().startsWith('@') && !insideKeyframes;
      const block = { prelude: prelude.trim(), selectors: [], body: index + 1 };
      if (rule)
        for (const { selector, offset } of splitSelectors(prelude)) {
          const entry = { selector, line: lineOf(start + offset), properties: [] };
          block.selectors.push(entry);
          selectors.push(entry);
        }
      blocks.push(block);
      start = index + 1;
    } else if (character === '}') {
      const block = blocks.pop();
      if (block?.selectors.length) {
        const properties = text
          .slice(block.body, index)
          .split(';')
          .map((declaration) => declaration.split(':')[0].trim().toLowerCase())
          .filter((property) => /^-{0,2}[a-z][a-z0-9-]*$/.test(property));
        for (const entry of block.selectors) entry.properties = properties;
      }
      start = index + 1;
    } else if (character === ';') {
      // A statement such as @import or @layer, or a declaration: neither starts a selector.
      start = index + 1;
    }
  }
  return selectors;
}

/** The selectors of a selector list, with each one's offset in the list. */
function splitSelectors(prelude) {
  const parts = [];
  let depth = 0;
  let start = 0;
  const push = (end) => {
    const part = prelude.slice(start, end);
    if (part.trim()) parts.push({ selector: part.trim(), offset: start + part.search(/\S/) });
  };
  for (let index = 0; index < prelude.length; index++) {
    const character = prelude[index];
    if (character === '(' || character === '[') depth++;
    else if (character === ')' || character === ']') depth--;
    else if (character === ',' && depth === 0) {
      push(index);
      start = index + 1;
    }
  }
  push(prelude.length);
  return parts;
}
