import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { Linter } from 'eslint';
import ts from 'typescript';
import tseslint from 'typescript-eslint';
import handRolledLayoutRule from '../../packages/eslint-plugin/src/rules/no-hand-rolled-layout.js';
import { baseContent, changedFiles } from './prepare.mjs';

const scoringDir = new URL('../scoring/', import.meta.url);
const readData = (name) => JSON.parse(readFileSync(new URL(name, scoringDir), 'utf8'));
export const rawHtml = readData('raw-html.json');
export const aliasData = readData('aliases.json');
export const uiLibraries = readData('ui-libraries.json').packages;

/**
 * Score parts, 100 points in all. Each part starts at its maximum and loses `cost` per
 * occurrence, down to zero; coverage is proportional; the UI-library and suppression penalties
 * come off the total. `handRolled` costs per flex or grid layout hand-rolled in an inline style,
 * as the ESLint plugin's rule reports it, so that hand-rolling is never cheaper than a primitive.
 * `layout` comes from the browser step: `cost` per distinct problem that dev mode, the page's own
 * overflow or the benchmark's check of hand-rolled containers shows at the four widths, and nothing
 * when the app doesn't render.
 */
export const scoring = {
  typecheck: { max: 15 },
  coverage: { max: 30 },
  rawHtml: { max: 15, cost: 4 },
  duplicates: { max: 10, cost: 5 },
  envuiErrors: { max: 10, cost: 5 },
  rawStyles: { max: 5, cost: 0.5 },
  handRolled: { max: 5, cost: 2 },
  layout: { max: 10, cost: 2 },
  uiLibraryPenalty: 10,
  suppressionPenalty: 5,
};

const ENVUI = '@envsemble/envui';
const isEnvuiModule = (specifier) => specifier === ENVUI || specifier.startsWith(`${ENVUI}/`);
const isIconModule = (specifier) =>
  specifier === `${ENVUI}/icons` || specifier.startsWith(`${ENVUI}/icons/`);
const isEnvuiFile = (fileName) =>
  fileName.replaceAll('\\', '/').includes(`/node_modules/${ENVUI}/`);
const toPosix = (path) => path.replaceAll('\\', '/');

const sourceExtensions = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx']);
const styleExtensions = new Set(['.css', '.scss', '.sass', '.less']);

// ---------------------------------------------------------------------------------------------
// Styles

const namedColors = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
    'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
    'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
    'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet ' +
    'deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ' +
    'ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki ' +
    'lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow ' +
    'lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine ' +
    'mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen ' +
    'mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace ' +
    'olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred ' +
    'papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue ' +
    'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey ' +
    'snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow ' +
    'yellowgreen'
  ).split(' '),
);
const colorProperty =
  /^(color|background(-color)?|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?|outline(-color)?|fill|stroke|box-shadow|text-shadow|text-decoration(-color)?|caret-color|accent-color|column-rule(-color)?)$/i;
const hairlineProperty = /^(border|outline|box-shadow|text-shadow)/i;

/** Counts raw colors and px lengths in one declaration value. */
function scanValue(property, value) {
  const result = { colors: 0, px: 0, samples: [] };
  const plain = value.replace(/var\([^)]*\)/g, '');
  const hex = (plain.match(/#[0-9a-f]{3,8}\b/gi) ?? []).filter((match) =>
    [4, 5, 7, 9].includes(match.length),
  );
  const functions = plain.match(/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi) ?? [];
  const named = colorProperty.test(property)
    ? (plain.toLowerCase().match(/[a-z]+/g) ?? []).filter((word) => namedColors.has(word))
    : [];
  result.colors = hex.length + functions.length + named.length;
  for (const match of plain.matchAll(/(-?\d*\.?\d+)px\b/g)) {
    const size = Math.abs(Number(match[1]));
    const allowed = size <= 1 || (size <= 2 && hairlineProperty.test(property));
    if (!allowed) result.px += 1;
  }
  if (result.colors || result.px) result.samples.push(`${property}: ${value.trim()}`.slice(0, 120));
  return result;
}

/**
 * Scans a style sheet: raw colors and px in declarations, and declarations that set one of envUI's
 * private component tokens (`privateTokens`), such as `--env-card-padding`. Part classes such as
 * `.env-card` are public and not counted.
 */
export function scanStyleSheet(text, { privateTokens = new Set() } = {}) {
  const totals = { colors: 0, px: 0, privateTokens: 0, declarations: 0, samples: [] };
  const source = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const declaration = (segment) => {
    const index = segment.indexOf(':');
    if (index < 0) return;
    const property = segment.slice(0, index).trim();
    if (!property || property.startsWith('@') || /[\s>+~.#[]/.test(property)) return;
    totals.declarations += 1;
    if (privateTokens.has(property)) {
      totals.privateTokens += 1;
      totals.samples.push(`${property}: ${segment.slice(index + 1).trim()}`.slice(0, 120));
      return;
    }
    const found = scanValue(property, segment.slice(index + 1));
    totals.colors += found.colors;
    totals.px += found.px;
    totals.samples.push(...found.samples);
  };
  const prelude = (segment) => {
    const text = segment.trim();
    if (/^@(media|container)/i.test(text)) {
      const found = [...text.matchAll(/(\d*\.?\d+)px\b/g)].length;
      totals.px += found;
      if (found) totals.samples.push(text.slice(0, 120));
    }
  };
  let buffer = '';
  for (const character of source) {
    if (character === '{') {
      prelude(buffer);
      buffer = '';
    } else if (character === '}' || character === ';') {
      declaration(buffer);
      buffer = '';
    } else buffer += character;
  }
  totals.samples = totals.samples.slice(0, 12);
  return totals;
}

const lengthProperties = new Set(
  (
    'width height minWidth minHeight maxWidth maxHeight padding paddingTop paddingRight paddingBottom ' +
    'paddingLeft paddingInline paddingBlock margin marginTop marginRight marginBottom marginLeft ' +
    'marginInline marginBlock gap rowGap columnGap top right bottom left inset fontSize borderRadius ' +
    'flexBasis letterSpacing outlineOffset'
  ).split(' '),
);
const kebab = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

// ---------------------------------------------------------------------------------------------
// Source analysis (syntactic, so it also runs on the base version of a modified file)

const isPascal = (name) => /^[A-Z][A-Za-z0-9]*$/.test(name);
const words = (name) => name.match(/[A-Z][a-z0-9]*|[a-z0-9]+/g) ?? [name];
const lineOf = (sourceFile, node) =>
  sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;

function attributeMap(attributes) {
  const map = new Map();
  for (const property of attributes.properties) {
    if (!ts.isJsxAttribute(property)) continue;
    const name = property.name.getText();
    const initializer = property.initializer;
    let value = null;
    if (initializer && ts.isStringLiteral(initializer)) value = initializer.text;
    else if (
      initializer &&
      ts.isJsxExpression(initializer) &&
      initializer.expression &&
      ts.isStringLiteralLike(initializer.expression)
    )
      value = initializer.expression.text;
    map.set(name, { value, node: property });
  }
  return map;
}

/** Comment directives that silence the type checker. */
const suppressionDirective = /(?:\/\/|\/\*|^\s*\*)\s*@ts-(nocheck|ignore|expect-error)\b/gm;

/**
 * Analyzes one source file. `reexports(specifier)` resolves a local module, such as a barrel
 * file, to the envUI exports it re-exports (a map from its export name to envUI's), so
 * `import { Button } from './ui'` counts as envUI's Button when ./ui re-exports it.
 */
export function analyzeSource(fileName, text, { reexports } = {}) {
  const kind = /\.[jt]sx$/i.test(fileName) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, kind);
  const imports = new Map(); // local name -> envUI export name
  const namespaces = new Map(); // local name -> null for envUI itself, or a barrel's re-exports
  const iconLocals = new Map(); // local name -> icon name
  const iconNamespaces = new Set();
  const modules = new Set(); // every module specifier the file imports or re-exports from
  for (const statement of sourceFile.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    )
      modules.add(statement.moduleSpecifier.text);
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue;
    const specifier = statement.moduleSpecifier.text;
    modules.add(specifier);
    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly) continue;
    if (!isEnvuiModule(specifier)) {
      const local = reexports?.(specifier);
      if (!local) continue;
      if (clause.name && local.has('default')) imports.set(clause.name.text, local.get('default'));
      const bindings = clause.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) namespaces.set(bindings.name.text, local);
      if (bindings && ts.isNamedImports(bindings))
        for (const element of bindings.elements) {
          const exported = (element.propertyName ?? element.name).text;
          if (!element.isTypeOnly && local.has(exported))
            imports.set(element.name.text, local.get(exported));
        }
      continue;
    }
    const icon = isIconModule(specifier);
    if (clause.name) {
      if (icon) iconLocals.set(clause.name.text, specifier.split('/').pop());
      else imports.set(clause.name.text, 'default');
    }
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) {
      if (icon) iconNamespaces.add(bindings.name.text);
      else namespaces.set(bindings.name.text, null);
    }
    if (bindings && ts.isNamedImports(bindings))
      for (const element of bindings.elements) {
        if (element.isTypeOnly) continue;
        const exported = (element.propertyName ?? element.name).text;
        if (icon) iconLocals.set(element.name.text, exported);
        else imports.set(element.name.text, exported);
      }
  }

  /** The envUI export an expression refers to: `Button`, an alias, or `ui.Button`. */
  const resolveReference = (node) => {
    if (ts.isIdentifier(node) && imports.has(node.text)) return imports.get(node.text);
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      namespaces.has(node.expression.text)
    ) {
      const local = namespaces.get(node.expression.text);
      return local ? (local.get(node.name.text) ?? null) : node.name.text;
    }
    return null;
  };
  const isIconReference = (node) =>
    (ts.isIdentifier(node) && iconLocals.has(node.text)) ||
    (ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      iconNamespaces.has(node.expression.text));

  const isReferencePosition = (node) => {
    const parent = node.parent;
    if (!parent) return false;
    if (ts.isImportSpecifier(parent) || ts.isImportClause(parent) || ts.isNamespaceImport(parent))
      return false;
    if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
    if (ts.isJsxAttribute(parent) || (ts.isPropertyAssignment(parent) && parent.name === node))
      return false;
    if ((ts.isPropertySignature(parent) || ts.isMethodDeclaration(parent)) && parent.name === node)
      return false;
    return true;
  };

  /** envUI exports and icons referenced anywhere inside a node. */
  const referencesIn = (root) => {
    const exports = new Set();
    let icons = false;
    const visit = (node) => {
      if (ts.isIdentifier(node) && isReferencePosition(node)) {
        const reference = resolveReference(node);
        if (reference) exports.add(reference);
        if (iconLocals.has(node.text)) icons = true;
      } else if (ts.isPropertyAccessExpression(node)) {
        const reference = resolveReference(node);
        if (reference) exports.add(reference);
        if (isIconReference(node)) icons = true;
      }
      ts.forEachChild(node, visit);
    };
    visit(root);
    return { exports, icons };
  };

  const result = {
    usedExports: new Set(),
    usedProps: new Set(),
    jsxUses: {},
    icons: new Set(),
    raw: [],
    components: [],
    inlineStyle: { colors: 0, px: 0, samples: [] },
    // Custom properties set in inline style objects, such as '--env-card-padding'.
    customProperties: [],
    modules,
    suppressions: [...text.matchAll(suppressionDirective)].map((match) => ({
      directive: `@ts-${match[1]}`,
      line: text.slice(0, match.index).split('\n').length,
    })),
  };
  const addRaw = (node, entry) => result.raw.push({ ...entry, line: lineOf(sourceFile, node) });

  const inspectElement = (node) => {
    const tagName = node.tagName;
    const attributes = attributeMap(node.attributes);
    const style = attributes.get('style')?.node.initializer;
    // The object literal itself, also inside `as React.CSSProperties`, `satisfies` or parentheses.
    let styleObject = style && ts.isJsxExpression(style) ? style.expression : undefined;
    while (
      styleObject &&
      (ts.isAsExpression(styleObject) ||
        ts.isSatisfiesExpression(styleObject) ||
        ts.isParenthesizedExpression(styleObject))
    )
      styleObject = styleObject.expression;
    if (styleObject && ts.isObjectLiteralExpression(styleObject))
      for (const property of styleObject.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const name = property.name.getText(sourceFile).replace(/['"]/g, '');
        const value = property.initializer;
        if (name.startsWith('--')) result.customProperties.push(name);
        if (ts.isStringLiteralLike(value)) {
          const found = scanValue(kebab(name), value.text);
          result.inlineStyle.colors += found.colors;
          result.inlineStyle.px += found.px;
          result.inlineStyle.samples.push(...found.samples);
        } else if (
          ts.isNumericLiteral(value) &&
          lengthProperties.has(name) &&
          Number(value.text) > 1
        ) {
          result.inlineStyle.px += 1;
          result.inlineStyle.samples.push(`${name}: ${value.text}`);
        }
      }

    const reference = resolveReference(tagName);
    if (reference) {
      result.jsxUses[reference] = (result.jsxUses[reference] ?? 0) + 1;
      for (const name of attributes.keys()) result.usedProps.add(`${reference}.${name}`);
      // A widget role on an envUI element rebuilds another envUI component, as in <Text role="alert">.
      const role = attributes.get('role')?.value;
      if (role && rawHtml.roles[role] && !rawHtml.roles[role].includes(reference))
        addRaw(node, {
          kind: 'role',
          key: `role="${role}" on <${reference}>`,
          tag: reference,
          role,
          weight: 1,
          use: rawHtml.roles[role],
        });
      return;
    }
    if (!ts.isIdentifier(tagName) || !/^[a-z]/.test(tagName.text)) return;
    const tag = tagName.text;
    const role = attributes.get('role')?.value;
    const element = rawHtml.elements[tag];
    if (element) {
      let use = element.use;
      let type;
      if (tag === 'input') {
        type = (attributes.get('type')?.value ?? 'text').toLowerCase();
        if (type in rawHtml.inputTypes) use = rawHtml.inputTypes[type];
        if (use === null) return;
      }
      addRaw(node, {
        kind: 'element',
        key: type ? `<input type="${type}">` : `<${tag}>`,
        tag,
        role,
        weight: element.weight,
        use,
      });
      return;
    }
    if (role && rawHtml.roles[role]) {
      addRaw(node, {
        kind: 'role',
        key: `role="${role}"`,
        tag,
        role,
        weight: 1,
        use: rawHtml.roles[role],
      });
      return;
    }
    if (tag === 'a') {
      const href = attributes.get('href');
      const clickable = attributes.has('onClick');
      const fakeHref =
        !href ||
        (href.value !== null &&
          (href.value === '' || href.value === '#' || /^javascript:/i.test(href.value)));
      if (clickable && fakeHref)
        addRaw(node, {
          kind: 'anchor-button',
          key: '<a> as button',
          tag,
          weight: rawHtml.anchorAsButton.weight,
          use: rawHtml.anchorAsButton.use,
        });
      else if (href)
        addRaw(node, {
          kind: 'anchor-link',
          key: '<a href>',
          tag,
          weight: rawHtml.anchorLink.weight,
          use: rawHtml.anchorLink.use,
        });
      return;
    }
    if (['form', 'label', 'option', 'optgroup'].includes(tag)) return;
    if (['onClick', 'onMouseDown', 'onPointerDown'].some((name) => attributes.has(name)))
      addRaw(node, {
        kind: 'clickable',
        key: `clickable <${tag}>`,
        tag,
        weight: rawHtml.clickableElement.weight,
        use: rawHtml.clickableElement.use,
      });
  };

  const componentBody = (node) => {
    if (ts.isFunctionDeclaration(node) && node.name && isPascal(node.name.text))
      return { name: node.name.text, body: node };
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      isPascal(node.name.text) &&
      node.initializer
    ) {
      let initializer = node.initializer;
      while (ts.isCallExpression(initializer) && initializer.arguments.length)
        initializer = initializer.arguments[0];
      if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
        return { name: node.name.text, body: initializer };
    }
    if (ts.isClassDeclaration(node) && node.name && isPascal(node.name.text))
      return { name: node.name.text, body: node };
    return null;
  };
  const containsJsx = (root) => {
    let found = false;
    const visit = (node) => {
      if (found) return;
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node))
        found = true;
      else ts.forEachChild(node, visit);
    };
    visit(root);
    return found;
  };

  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) inspectElement(node);
    // require('x') and import('x')
    if (
      ts.isCallExpression(node) &&
      node.arguments.length &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    )
      modules.add(node.arguments[0].text);
    if (ts.isIdentifier(node) && isReferencePosition(node)) {
      const reference = resolveReference(node);
      if (reference) result.usedExports.add(reference);
      if (iconLocals.has(node.text)) result.icons.add(iconLocals.get(node.text));
    } else if (ts.isPropertyAccessExpression(node)) {
      const reference = resolveReference(node);
      if (reference) result.usedExports.add(reference);
      if (isIconReference(node)) result.icons.add(node.name.text);
    }
    const component = componentBody(node);
    if (component && containsJsx(component.body)) {
      const references = referencesIn(component.body);
      result.components.push({
        name: component.name,
        line: lineOf(sourceFile, node),
        uses: [...references.exports],
        usesIcons: references.icons,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  result.inlineStyle.samples = result.inlineStyle.samples.slice(0, 12);
  return result;
}

// ---------------------------------------------------------------------------------------------
// Duplicates

/** Returns the envUI exports a local component name duplicates, or null. */
export function duplicateTargets(name, envuiExports) {
  if (aliasData.ignoreNames.includes(name)) return null;
  if (aliasData.aliases[name]) return { match: name, targets: aliasData.aliases[name] };
  if (envuiExports.has(name)) return { match: name, targets: [name] };
  const parts = words(name);
  for (let size = Math.min(3, parts.length - 1); size >= 1; size -= 1) {
    const suffix = parts.slice(-size).join('');
    if (aliasData.aliases[suffix]) return { match: suffix, targets: aliasData.aliases[suffix] };
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Type checking

const resolveAlias = (checker, symbol) =>
  symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;

/**
 * Value and type exports of the installed envUI entry points that the program loaded: their names,
 * and each export's declared symbol mapped to its public name, for resolving re-exports.
 */
function envuiExports(appDir, { program, checker, options }) {
  const names = new Set();
  const targets = new Map();
  const containing = join(appDir, 'src/main.tsx');
  for (const entry of ['', '/content', '/rich-text', '/diff']) {
    const resolved = ts.resolveModuleName(`${ENVUI}${entry}`, containing, options, ts.sys)
      .resolvedModule?.resolvedFileName;
    const sourceFile = resolved && program.getSourceFile(resolved);
    const symbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
    if (!symbol) continue;
    for (const exported of checker.getExportsOfModule(symbol)) {
      names.add(exported.name);
      const target = resolveAlias(checker, exported);
      if (!targets.has(target)) targets.set(target, exported.name);
    }
  }
  return { names, targets };
}

/**
 * Resolves a module that a source file imports, such as a barrel `./ui` or `@/components`, to the
 * envUI exports it re-exports: `export { Button } from '@envsemble/envui'`, `export *`, or an
 * imported name exported again. Packages in node_modules are not followed.
 */
function reexportResolver({ program, checker, options }, targets) {
  const cache = new Map();
  return (fromFile) => (specifier) => {
    const resolved = ts.resolveModuleName(specifier, fromFile, options, ts.sys).resolvedModule;
    if (!resolved || resolved.isExternalLibraryImport) return null;
    const key = resolved.resolvedFileName;
    if (cache.has(key)) return cache.get(key);
    const sourceFile = program.getSourceFile(key);
    const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
    let map = null;
    if (moduleSymbol)
      for (const exported of checker.getExportsOfModule(moduleSymbol)) {
        const target = resolveAlias(checker, exported);
        const isEnvui = (target.declarations ?? []).some((declaration) =>
          isEnvuiFile(declaration.getSourceFile().fileName),
        );
        if (!isEnvui) continue;
        map ??= new Map();
        map.set(exported.name, targets.get(target) ?? target.name);
      }
    cache.set(key, map);
    return map;
  };
}

const configErrors = (parsed) =>
  !parsed || parsed.errors.some((error) => error.category === ts.DiagnosticCategory.Error);

/**
 * The app's tsconfig.json, parsed with its own path, so `types` such as `vite/client` and the type
 * roots resolve from the app and not from wherever the scorer runs. If the agent broke or removed
 * the file, its version in the base commit is used for the same app directory.
 */
function compilerSetup(appDir, baseCommit) {
  const configFile = join(appDir, 'tsconfig.json');
  const host = {
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    readDirectory: ts.sys.readDirectory,
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    getCurrentDirectory: () => appDir,
    onUnRecoverableConfigFileDiagnostic: () => {},
  };
  let parsed = existsSync(configFile)
    ? ts.getParsedCommandLineOfConfigFile(configFile, undefined, host)
    : undefined;
  if (configErrors(parsed)) {
    const text = baseContent(appDir, baseCommit, 'tsconfig.json');
    const json = text === null ? null : ts.parseConfigFileTextToJson(configFile, text);
    parsed =
      json && !json.error
        ? ts.parseJsonConfigFileContent(json.config, host, appDir, undefined, configFile)
        : undefined;
  }
  if (configErrors(parsed)) throw new Error(`No usable tsconfig.json in ${appDir}.`);
  // The app's own config, kept strict whatever the agent changed.
  return {
    options: { ...parsed.options, strict: true, noEmit: true },
    fileNames: parsed.fileNames,
  };
}

function symbolIsEnvui(checker, symbol) {
  if (!symbol) return false;
  const target = resolveAlias(checker, symbol);
  return (target.declarations ?? []).some((declaration) =>
    isEnvuiFile(declaration.getSourceFile().fileName),
  );
}

function nodeAt(sourceFile, position) {
  let found = sourceFile;
  const visit = (node) => {
    if (position >= node.getStart(sourceFile) && position < node.getEnd()) {
      found = node;
      ts.forEachChild(node, visit);
    }
  };
  ts.forEachChild(sourceFile, visit);
  return found;
}

/** Attributes a diagnostic to envUI: an invented export, a wrong prop or a wrong member. */
function classifyDiagnostic(diagnostic, checker) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if ([2305, 2724, 2614, 2459, 2460].includes(diagnostic.code) && message.includes(ENVUI))
    return { kind: 'invented-export' };
  if ([2307, 2792].includes(diagnostic.code) && message.includes(ENVUI))
    return { kind: 'unknown-module' };
  if (!diagnostic.file || diagnostic.start === undefined) return null;
  const start = nodeAt(diagnostic.file, diagnostic.start);
  for (let node = start; node; node = node.parent) {
    // Stop at a callback body or element children: errors there are not about the element's props.
    if (node !== start && (ts.isFunctionLike(node) || ts.isBlock(node))) break;
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) break;
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (symbolIsEnvui(checker, checker.getSymbolAtLocation(node.tagName)))
        return { kind: 'invalid-prop', component: node.tagName.getText() };
      break;
    }
    if (ts.isPropertyAccessExpression(node)) {
      const type = checker.getTypeAtLocation(node.expression);
      if (symbolIsEnvui(checker, type.getSymbol() ?? type.aliasSymbol))
        return { kind: 'invalid-member', component: node.expression.getText() };
    }
    if (ts.isCallExpression(node)) {
      if (symbolIsEnvui(checker, checker.getSymbolAtLocation(node.expression)))
        return { kind: 'invalid-call', component: node.expression.getText() };
      break;
    }
  }
  if (message.includes(ENVUI)) return { kind: 'other' };
  const related = diagnostic.relatedInformation ?? [];
  if (related.some((information) => information.file && isEnvuiFile(information.file.fileName)))
    return { kind: 'other' };
  return null;
}

const fileKey = (fileName) => {
  const path = toPosix(resolve(fileName));
  return ts.sys.useCaseSensitiveFileNames ? path : path.toLowerCase();
};
/** Turns `@ts-nocheck` into `@ts_nocheck` and so on, keeping every position in the file. */
const neutralize = (text) =>
  text.replace(suppressionDirective, (match) => match.replace('@ts-', '@ts_'));

/**
 * Type-checks the app from its own directory. In the files the agent changed, comment directives
 * that silence the checker are neutralized first, so the errors they hide still count.
 */
function typecheck(appDir, baseCommit, extraRoots, changedFiles) {
  const { options, fileNames } = compilerSetup(appDir, baseCommit);
  const roots = [...new Set([...fileNames, ...extraRoots].map((file) => resolve(file)))];
  const changed = new Set(changedFiles.map(fileKey));
  const host = ts.createCompilerHost(options, true);
  host.getCurrentDirectory = () => appDir;
  const getSourceFile = host.getSourceFile;
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    if (changed.has(fileKey(fileName))) {
      const text = host.readFile(fileName);
      if (text !== undefined)
        return ts.createSourceFile(fileName, neutralize(text), languageVersion, true);
    }
    return getSourceFile(fileName, languageVersion, onError, shouldCreate);
  };
  const program = ts.createProgram(roots, options, host);
  const checker = program.getTypeChecker();
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .filter(
      (diagnostic) =>
        !diagnostic.file || !toPosix(diagnostic.file.fileName).includes('/node_modules/'),
    );
  const errors = diagnostics.map((diagnostic) => {
    const position =
      diagnostic.file && diagnostic.start !== undefined
        ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
        : null;
    return {
      code: diagnostic.code,
      file: diagnostic.file
        ? toPosix(diagnostic.file.fileName).slice(toPosix(appDir).length + 1)
        : null,
      line: position ? position.line + 1 : null,
      message: ts
        .flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        .split('\n')[0]
        .slice(0, 240),
      envui: classifyDiagnostic(diagnostic, checker),
    };
  });
  return { errors, options, program, checker };
}

// ---------------------------------------------------------------------------------------------
// Dependencies

const dependencyNames = (text) => {
  if (!text) return new Set();
  try {
    const manifest = JSON.parse(text);
    return new Set([
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
    ]);
  } catch {
    return new Set();
  }
};
export const isUiLibrary = (name) =>
  uiLibraries.some((pattern) =>
    pattern.endsWith('/*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern,
  );
/** The package a bare module specifier names: `@base-ui/react/dialog` is `@base-ui/react`. */
export const packageName = (specifier) => {
  if (/^(\.|\/|[a-z]+:)/i.test(specifier)) return null;
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
};

// ---------------------------------------------------------------------------------------------
// Private component tokens and hand-rolled layout

/**
 * Reads which custom properties of a style sheet are envUI's private component tokens: those
 * declared in `@layer env.components` and nowhere in `env.tokens` or `env.base`, where the system
 * tokens and the theme live. Apps may set system tokens; component tokens, such as
 * `--env-card-padding`, are each component's own business.
 */
export function componentTokens(css) {
  const system = new Set();
  const component = new Set();
  const stack = [];
  let buffer = '';
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const declare = (segment) => {
    const match = /^\s*(--env-[\w-]+)\s*:/.exec(segment);
    if (!match) return;
    const layers = stack.join(' ');
    if (/@layer\s+env\.(tokens|base)\b/.test(layers)) system.add(match[1]);
    else if (/@layer\s+env\.components\b/.test(layers)) component.add(match[1]);
  };
  for (const character of source) {
    if (character === '{') {
      stack.push(buffer.trim());
      buffer = '';
    } else if (character === '}') {
      declare(buffer);
      stack.pop();
      buffer = '';
    } else if (character === ';') {
      declare(buffer);
      buffer = '';
    } else buffer += character;
  }
  for (const name of system) component.delete(name);
  return component;
}

const tokenCache = new Map();
/** The private component tokens of the envUI the app installed; none when it has no style sheet. */
function installedComponentTokens(appDir) {
  const file = join(appDir, 'node_modules', ENVUI, 'dist', 'styles.css');
  if (!existsSync(file)) return new Set();
  const key = `${file}\0${statSync(file).mtimeMs}`;
  if (!tokenCache.has(key)) tokenCache.set(key, componentTokens(readFileSync(file, 'utf8')));
  return tokenCache.get(key);
}

const linter = new Linter({ configType: 'flat' });
const layoutLintConfig = [
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { envui: { rules: { 'no-hand-rolled-layout': handRolledLayoutRule } } },
    rules: { 'envui/no-hand-rolled-layout': 'warn' },
  },
];

/**
 * Hand-rolled flex and grid layout in a source file, as the ESLint plugin's `no-hand-rolled-layout`
 * rule reports it: each `display: flex` or `grid` in an inline style. A file that doesn't parse
 * has none.
 */
export function handRolledLayout(fileName, text) {
  return linter
    .verify(text, layoutLintConfig, { filename: fileName.replaceAll('\\', '/') })
    .filter((message) => message.ruleId === 'envui/no-hand-rolled-layout')
    .map((message) => ({ line: message.line, sample: message.message.split(':')[0] }));
}

// ---------------------------------------------------------------------------------------------
// Run score

const clampPart = ({ max, cost }, occurrences) => Math.max(0, max - cost * occurrences);
const penalty = (cost, occurrences) => (occurrences ? -cost * occurrences : 0);
const round = (value) => Math.round(value * 10) / 10;

/**
 * Scores one finished run from its workspace. Only files the agent created or changed count;
 * for a changed file the base version's counts are subtracted.
 */
export function scoreRun({ appDir, baseCommit, task, rendered = null }) {
  const { files, patch } = changedFiles(appDir, baseCommit);
  const privateTokens = installedComponentTokens(appDir);
  const present = files.filter((file) => file.status !== 'D');
  const sourceFiles = present.filter(
    (file) => sourceExtensions.has(extname(file.path)) && !file.path.startsWith('node_modules/'),
  );
  const styleFiles = present.filter((file) => styleExtensions.has(extname(file.path)));

  const sourcePaths = sourceFiles.map((file) => join(appDir, file.path));
  const checked = typecheck(
    appDir,
    baseCommit,
    sourcePaths.filter((path) => /\.(tsx?|mts|cts)$/.test(path)),
    sourcePaths,
  );
  const { errors } = checked;
  const { names: envuiExportNames, targets } = envuiExports(appDir, checked);
  const reexportsFrom = reexportResolver(checked, targets);

  const usedExports = new Set();
  const usedProps = new Set();
  const newExports = new Set();
  const icons = new Set();
  const jsxUses = {};
  const raw = [];
  const duplicates = [];
  const inlineStyle = { colors: 0, px: 0, privateTokens: 0, samples: [] };
  const handRolled = [];
  const shims = [];
  const suppressions = [];
  const importedUi = new Map(); // UI package -> first file that imports it

  for (const file of sourceFiles) {
    const text = readFileSync(join(appDir, file.path), 'utf8');
    if (/declare\s+module\s+['"]@envsemble\/envui/.test(text)) shims.push(file.path);
    const reexports = reexportsFrom(join(appDir, file.path));
    const after = analyzeSource(file.path, text, { reexports });
    const beforeText = file.status === 'M' ? baseContent(appDir, baseCommit, file.path) : null;
    const before = beforeText === null ? null : analyzeSource(file.path, beforeText, { reexports });
    // Directives that silence the type checker, beyond the base version's count.
    const baseSuppressions = before?.suppressions.length ?? 0;
    for (const entry of after.suppressions.slice(baseSuppressions))
      suppressions.push({ ...entry, file: file.path });
    // Third-party UI packages imported directly, whether or not the agent added them to
    // package.json: envUI's own dependencies, such as @base-ui/react, are already installed.
    const beforePackages = new Set([...(before?.modules ?? [])].map(packageName));
    for (const specifier of after.modules) {
      const name = packageName(specifier);
      if (name && isUiLibrary(name) && !beforePackages.has(name) && !importedUi.has(name))
        importedUi.set(name, file.path);
    }
    for (const name of after.usedExports) {
      usedExports.add(name);
      if (!before?.usedExports.has(name)) newExports.add(name);
    }
    for (const prop of after.usedProps) usedProps.add(prop);
    for (const icon of after.icons) if (!before?.icons.has(icon)) icons.add(icon);
    for (const [name, count] of Object.entries(after.jsxUses)) {
      const added = count - (before?.jsxUses[name] ?? 0);
      if (added > 0) jsxUses[name] = (jsxUses[name] ?? 0) + added;
    }
    // Raw elements: only the occurrences beyond the base version's count of the same kind.
    const baseCounts = {};
    for (const entry of before?.raw ?? []) baseCounts[entry.key] = (baseCounts[entry.key] ?? 0) + 1;
    for (const entry of after.raw) {
      if (baseCounts[entry.key] > 0) baseCounts[entry.key] -= 1;
      else raw.push({ ...entry, file: file.path });
    }
    const baseComponents = new Set((before?.components ?? []).map((component) => component.name));
    for (const component of after.components) {
      if (baseComponents.has(component.name)) continue;
      const duplicate = duplicateTargets(component.name, envuiExportNames);
      if (!duplicate) continue;
      const satisfied = duplicate.targets.some((target) =>
        target === '@icons' ? component.usesIcons : component.uses.includes(target),
      );
      if (!satisfied)
        duplicates.push({
          name: component.name,
          file: file.path,
          line: component.line,
          matches: duplicate.match,
          envui: duplicate.targets.filter((target) => target !== '@icons'),
        });
    }
    inlineStyle.colors += Math.max(0, after.inlineStyle.colors - (before?.inlineStyle.colors ?? 0));
    inlineStyle.px += Math.max(0, after.inlineStyle.px - (before?.inlineStyle.px ?? 0));
    if (
      after.inlineStyle.colors + after.inlineStyle.px >
      (before ? before.inlineStyle.colors + before.inlineStyle.px : 0)
    )
      inlineStyle.samples.push(
        ...after.inlineStyle.samples.map((sample) => `${file.path}: ${sample}`),
      );
    // Private component tokens set in inline styles, beyond the base version's count.
    const tokensSet = (analysis) =>
      (analysis?.customProperties ?? []).filter((name) => privateTokens.has(name));
    const addedTokens = tokensSet(after).length - tokensSet(before).length;
    if (addedTokens > 0) {
      inlineStyle.privateTokens += addedTokens;
      inlineStyle.samples.push(...tokensSet(after).map((name) => `${file.path}: ${name}`));
    }
    // Hand-rolled flex and grid layout, as the ESLint plugin's rule reports it.
    if (/\.[cm]?[jt]sx?$/.test(file.path)) {
      const found = handRolledLayout(file.path, text);
      const baseCount = beforeText === null ? 0 : handRolledLayout(file.path, beforeText).length;
      for (const entry of found.slice(baseCount)) handRolled.push({ ...entry, file: file.path });
    }
  }

  const css = { colors: 0, px: 0, privateTokens: 0, linesAdded: 0, samples: [] };
  for (const file of styleFiles) {
    const text = readFileSync(join(appDir, file.path), 'utf8');
    const after = scanStyleSheet(text, { privateTokens });
    const beforeText = file.status === 'M' ? baseContent(appDir, baseCommit, file.path) : null;
    const before = beforeText === null ? null : scanStyleSheet(beforeText, { privateTokens });
    css.colors += Math.max(0, after.colors - (before?.colors ?? 0));
    css.px += Math.max(0, after.px - (before?.px ?? 0));
    css.privateTokens += Math.max(0, after.privateTokens - (before?.privateTokens ?? 0));
    css.linesAdded += Math.max(0, text.split('\n').length - (beforeText?.split('\n').length ?? 0));
    css.samples.push(...after.samples.map((sample) => `${file.path}: ${sample}`));
  }
  css.samples = css.samples.slice(0, 12);

  const manifest = present.find((file) => file.path === 'package.json');
  const addedDependencies = manifest
    ? [...dependencyNames(readFileSync(join(appDir, 'package.json'), 'utf8'))].filter(
        (name) => !dependencyNames(baseContent(appDir, baseCommit, 'package.json')).has(name),
      )
    : [];
  const uiDependencies = addedDependencies.filter(isUiLibrary);
  // One penalty per UI package, whether it was added, imported or both.
  const uiPackages = [...new Set([...uiDependencies, ...importedUi.keys()])].sort();

  const envuiErrors = [
    ...errors
      .filter((error) => error.envui)
      .map((error) => ({ ...error, kind: error.envui.kind, component: error.envui.component })),
    ...shims.map((file) => ({
      code: null,
      kind: 'module-shim',
      file,
      line: null,
      message: `declares module '${ENVUI}' locally`,
    })),
  ];
  // Capabilities named by envUI exports are judged here; those described by what renders are
  // judged by the browser step, in scoreParts.
  const capabilities = task.capabilities.map((capability) => {
    if (capability.rendered)
      return { id: capability.id, label: capability.label, kind: 'rendered', covered: null };
    const by = capability.envui.filter((name) =>
      name.includes('.') ? usedProps.has(name) : usedExports.has(name),
    );
    return { id: capability.id, label: capability.label, covered: by.length > 0, by };
  });

  const rawWeight = raw.reduce((total, entry) => total + entry.weight, 0);
  const rawStyleCount =
    css.colors +
    css.px +
    css.privateTokens +
    inlineStyle.colors +
    inlineStyle.px +
    inlineStyle.privateTokens;
  const hasOutput = sourceFiles.length > 0 || styleFiles.length > 0;

  const detail = {
    score: 0,
    parts: {},
    hasOutput,
    files: files.map((file) => `${file.status} ${file.path}`),
    typecheck: {
      passed: errors.length === 0,
      errorCount: errors.length,
      errors: errors.slice(0, 40),
      suppressions,
    },
    coverage: { ratio: null, capabilities },
    envui: {
      exportsUsed: [...usedExports].sort(),
      newExportsUsed: [...newExports].sort(),
      newExportCount: newExports.size,
      jsxUses,
      jsxUseCount: Object.values(jsxUses).reduce((sum, count) => sum + count, 0),
      icons: [...icons].sort(),
    },
    rawHtml: { weighted: round(rawWeight), count: raw.length, occurrences: raw },
    duplicates,
    envuiErrors,
    styles: {
      css,
      inline: { ...inlineStyle, samples: inlineStyle.samples.slice(0, 12) },
      handRolledLayout: { count: handRolled.length, occurrences: handRolled.slice(0, 25) },
      total: rawStyleCount,
    },
    dependencies: {
      added: addedDependencies,
      ui: uiPackages,
      imported: [...importedUi].map(([name, file]) => ({ name, file })),
    },
    patch,
  };
  return scoreParts(detail, task, rendered);
}

/**
 * Totals a run's parts, with the browser step's result when it ran: `rendered` is what
 * checkRendered() returned, or null when the step was skipped. Capabilities described by what
 * renders are covered when every one of their checks passed; the layout part loses
 * `scoring.layout.cost` per distinct problem. What the run could not check (the layout part and
 * rendered capabilities without the browser step) is left out, and the parts that were checked
 * are scaled to 100; the penalties come off after. Can be called again on the same detail.
 */
export function scoreParts(detail, task, step = null) {
  // A step that failed on its own account, such as a dev server that didn't start, checked
  // nothing: its parts are left out, as without the step.
  const rendered = step?.harnessError ? null : step;
  const capabilities = detail.coverage.capabilities.map((capability) => {
    if (capability.kind !== 'rendered') return capability;
    if (!rendered) return { ...capability, covered: null, failed: [] };
    const results = (rendered.checks ?? []).filter(
      (check) => check.key.split('#')[0] === capability.id,
    );
    const failed = results
      .filter((check) => !check.pass)
      .map((check) => `${check.width}: ${check.detail}`);
    return {
      ...capability,
      covered: rendered.rendered && results.length > 0 && failed.length === 0,
      failed: rendered.rendered ? failed.slice(0, 6) : [`not rendered: ${rendered.error}`],
    };
  });
  const judged = capabilities.filter((capability) => capability.covered !== null);
  const coverage = judged.length
    ? judged.filter((capability) => capability.covered).length / judged.length
    : null;
  const problems = rendered?.problems ?? [];
  const parts = {
    typecheck: detail.typecheck.passed ? scoring.typecheck.max : 0,
    coverage: coverage === null ? null : scoring.coverage.max * coverage,
    rawHtml: clampPart(scoring.rawHtml, detail.rawHtml.weighted),
    duplicates: clampPart(scoring.duplicates, detail.duplicates.length),
    envuiErrors: clampPart(scoring.envuiErrors, detail.envuiErrors.length),
    rawStyles: clampPart(scoring.rawStyles, detail.styles.total),
    handRolled: clampPart(scoring.handRolled, detail.styles.handRolledLayout.count),
    layout: !rendered ? null : rendered.rendered ? clampPart(scoring.layout, problems.length) : 0,
    uiLibraryPenalty: penalty(scoring.uiLibraryPenalty, detail.dependencies.ui.length),
    suppressionPenalty: penalty(scoring.suppressionPenalty, detail.typecheck.suppressions.length),
  };
  const positive = [
    'typecheck',
    'coverage',
    'rawHtml',
    'duplicates',
    'envuiErrors',
    'rawStyles',
    'handRolled',
    'layout',
  ];
  const checkedMax = positive
    .filter((name) => parts[name] !== null)
    .reduce((sum, name) => sum + scoring[name].max, 0);
  const earned = positive.reduce((sum, name) => sum + (parts[name] ?? 0), 0);
  const total = detail.hasOutput
    ? Math.max(0, (earned * 100) / checkedMax + parts.uiLibraryPenalty + parts.suppressionPenalty)
    : 0;
  detail.score = round(total);
  detail.parts = Object.fromEntries(
    Object.entries(parts).map(([name, value]) => [name, value === null ? null : round(value)]),
  );
  detail.notChecked = positive.filter((name) => parts[name] === null);
  detail.coverage = {
    ratio: coverage === null ? null : round(coverage * 100) / 100,
    capabilities,
  };
  detail.layout = rendered
    ? {
        checked: true,
        rendered: rendered.rendered,
        error: rendered.error,
        problemCount: problems.length,
        problems: problems.slice(0, 20),
        widths: (rendered.widths ?? []).map(
          ({ width, windowClass, pageOverflow, problems, error }) => ({
            width,
            windowClass,
            pageOverflow,
            problems: problems.length,
            error,
          }),
        ),
        pageErrors: rendered.pageErrors ?? [],
        durationMs: rendered.durationMs,
      }
    : { checked: false, harnessError: step?.harnessError ?? null };
  return detail;
}
