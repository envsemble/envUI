import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import ts from 'typescript';
import { baseContent, changedFiles } from './prepare.mjs';

const scoringDir = new URL('../scoring/', import.meta.url);
const readData = (name) => JSON.parse(readFileSync(new URL(name, scoringDir), 'utf8'));
export const rawHtml = readData('raw-html.json');
export const aliasData = readData('aliases.json');
export const uiLibraries = readData('ui-libraries.json').packages;

/**
 * Score parts. Each part starts at its maximum and loses `cost` per occurrence, down to zero;
 * coverage is proportional; the UI-library penalty comes off the total.
 */
export const scoring = {
  typecheck: { max: 20 },
  coverage: { max: 35 },
  rawHtml: { max: 20, cost: 4 },
  duplicates: { max: 10, cost: 5 },
  envuiErrors: { max: 10, cost: 5 },
  rawStyles: { max: 5, cost: 0.5 },
  uiLibraryPenalty: 10,
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

/** Scans a style sheet: raw colors and px in declarations, and selectors on envUI's private classes. */
export function scanStyleSheet(text) {
  const totals = { colors: 0, px: 0, privateClasses: 0, declarations: 0, samples: [] };
  const source = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const declaration = (segment) => {
    const index = segment.indexOf(':');
    if (index < 0) return;
    const property = segment.slice(0, index).trim();
    if (!property || property.startsWith('@') || /[\s>+~.#[]/.test(property)) return;
    totals.declarations += 1;
    const found = scanValue(property, segment.slice(index + 1));
    totals.colors += found.colors;
    totals.px += found.px;
    totals.samples.push(...found.samples);
  };
  const prelude = (segment) => {
    const text = segment.trim();
    if (/^@(media|container)/i.test(text))
      totals.px += [...text.matchAll(/(\d*\.?\d+)px\b/g)].length;
    else totals.privateClasses += (text.match(/\.env-[\w-]+/g) ?? []).length;
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

export function analyzeSource(fileName, text) {
  const kind = /\.[jt]sx$/i.test(fileName) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, kind);
  const imports = new Map(); // local name -> envUI export name
  const namespaces = new Set();
  const iconLocals = new Map(); // local name -> icon name
  const iconNamespaces = new Set();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue;
    const specifier = statement.moduleSpecifier.text;
    if (!isEnvuiModule(specifier)) continue;
    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly) continue;
    const icon = isIconModule(specifier);
    if (clause.name) {
      if (icon) iconLocals.set(clause.name.text, specifier.split('/').pop());
      else imports.set(clause.name.text, 'default');
    }
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings))
      (icon ? iconNamespaces : namespaces).add(bindings.name.text);
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
    )
      return node.name.text;
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
    privateClasses: 0,
  };
  const addRaw = (node, entry) => result.raw.push({ ...entry, line: lineOf(sourceFile, node) });

  const inspectElement = (node) => {
    const tagName = node.tagName;
    const attributes = attributeMap(node.attributes);
    const className = attributes.get('className')?.value;
    if (className && /(^|\s)env-[\w-]/.test(className)) result.privateClasses += 1;
    const style = attributes.get('style')?.node.initializer;
    if (
      style &&
      ts.isJsxExpression(style) &&
      style.expression &&
      ts.isObjectLiteralExpression(style.expression)
    )
      for (const property of style.expression.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const name = property.name.getText(sourceFile).replace(/['"]/g, '');
        const value = property.initializer;
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

/** Value and type exports of the installed envUI entry points that the program loaded. */
function envuiExportNames(appDir, { program, checker, options }) {
  const names = new Set();
  const containing = join(appDir, 'src/main.tsx');
  for (const entry of ['', '/content', '/rich-text', '/diff']) {
    const resolved = ts.resolveModuleName(`${ENVUI}${entry}`, containing, options, ts.sys)
      .resolvedModule?.resolvedFileName;
    const sourceFile = resolved && program.getSourceFile(resolved);
    const symbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
    if (symbol) for (const exported of checker.getExportsOfModule(symbol)) names.add(exported.name);
  }
  return names;
}

function compilerSetup(appDir, fixtureDir) {
  const read = (directory) => {
    const file = join(directory, 'tsconfig.json');
    if (!existsSync(file)) return null;
    const config = ts.readConfigFile(file, ts.sys.readFile);
    if (config.error) return null;
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, appDir);
    return parsed.errors.some((error) => error.category === ts.DiagnosticCategory.Error)
      ? null
      : parsed;
  };
  const parsed = read(appDir) ?? read(fixtureDir);
  // The app's own config, kept strict whatever the agent changed.
  return {
    options: { ...parsed.options, strict: true, noEmit: true },
    fileNames: parsed.fileNames,
  };
}

function symbolIsEnvui(checker, symbol) {
  if (!symbol) return false;
  const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
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

function typecheck(appDir, fixtureDir, extraRoots) {
  const { options, fileNames } = compilerSetup(appDir, fixtureDir);
  const roots = [...new Set([...fileNames, ...extraRoots].map((file) => resolve(file)))];
  const program = ts.createProgram(roots, options);
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
const isUiLibrary = (name) =>
  uiLibraries.some((pattern) =>
    pattern.endsWith('/*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern,
  );

// ---------------------------------------------------------------------------------------------
// Run score

const clampPart = ({ max, cost }, occurrences) => Math.max(0, max - cost * occurrences);
const round = (value) => Math.round(value * 10) / 10;

/**
 * Scores one finished run from its workspace. Only files the agent created or changed count;
 * for a changed file the base version's counts are subtracted.
 */
export function scoreRun({ appDir, baseCommit, task, fixtureDir }) {
  const { files, patch } = changedFiles(appDir, baseCommit);
  const present = files.filter((file) => file.status !== 'D');
  const sourceFiles = present.filter(
    (file) => sourceExtensions.has(extname(file.path)) && !file.path.startsWith('node_modules/'),
  );
  const styleFiles = present.filter((file) => styleExtensions.has(extname(file.path)));

  const checked = typecheck(
    appDir,
    fixtureDir,
    sourceFiles
      .filter((file) => /\.(tsx?|mts|cts)$/.test(file.path))
      .map((file) => join(appDir, file.path)),
  );
  const { errors } = checked;
  const envuiExports = envuiExportNames(appDir, checked);

  const usedExports = new Set();
  const usedProps = new Set();
  const newExports = new Set();
  const icons = new Set();
  const jsxUses = {};
  const raw = [];
  const duplicates = [];
  const inlineStyle = { colors: 0, px: 0, samples: [] };
  let privateClasses = 0;
  const shims = [];

  for (const file of sourceFiles) {
    const text = readFileSync(join(appDir, file.path), 'utf8');
    if (/declare\s+module\s+['"]@envsemble\/envui/.test(text)) shims.push(file.path);
    const after = analyzeSource(file.path, text);
    const beforeText = file.status === 'M' ? baseContent(appDir, baseCommit, file.path) : null;
    const before = beforeText === null ? null : analyzeSource(file.path, beforeText);
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
      const duplicate = duplicateTargets(component.name, envuiExports);
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
    privateClasses += Math.max(0, after.privateClasses - (before?.privateClasses ?? 0));
  }

  const css = { colors: 0, px: 0, privateClasses: 0, linesAdded: 0, samples: [] };
  for (const file of styleFiles) {
    const text = readFileSync(join(appDir, file.path), 'utf8');
    const after = scanStyleSheet(text);
    const beforeText = file.status === 'M' ? baseContent(appDir, baseCommit, file.path) : null;
    const before = beforeText === null ? null : scanStyleSheet(beforeText);
    css.colors += Math.max(0, after.colors - (before?.colors ?? 0));
    css.px += Math.max(0, after.px - (before?.px ?? 0));
    css.privateClasses += Math.max(0, after.privateClasses - (before?.privateClasses ?? 0));
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
  const capabilities = task.capabilities.map((capability) => {
    const by = capability.envui.filter((name) =>
      name.includes('.') ? usedProps.has(name) : usedExports.has(name),
    );
    return { id: capability.id, label: capability.label, covered: by.length > 0, by };
  });

  const rawWeight = raw.reduce((total, entry) => total + entry.weight, 0);
  const rawStyleCount =
    css.colors + css.px + css.privateClasses + inlineStyle.colors + inlineStyle.px + privateClasses;
  const hasOutput = sourceFiles.length > 0 || styleFiles.length > 0;
  const coverage =
    capabilities.filter((capability) => capability.covered).length / capabilities.length;
  const parts = {
    typecheck: errors.length === 0 ? scoring.typecheck.max : 0,
    coverage: scoring.coverage.max * coverage,
    rawHtml: clampPart(scoring.rawHtml, rawWeight),
    duplicates: clampPart(scoring.duplicates, duplicates.length),
    envuiErrors: clampPart(scoring.envuiErrors, envuiErrors.length),
    rawStyles: clampPart(scoring.rawStyles, rawStyleCount),
    uiLibraryPenalty: -scoring.uiLibraryPenalty * uiDependencies.length,
  };
  const total = hasOutput
    ? Math.max(
        0,
        Object.values(parts).reduce((sum, value) => sum + value, 0),
      )
    : 0;

  return {
    score: round(total),
    parts: Object.fromEntries(Object.entries(parts).map(([name, value]) => [name, round(value)])),
    hasOutput,
    files: files.map((file) => `${file.status} ${file.path}`),
    typecheck: {
      passed: errors.length === 0,
      errorCount: errors.length,
      errors: errors.slice(0, 40),
    },
    coverage: { ratio: round(coverage * 100) / 100, capabilities },
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
      privateClassNames: privateClasses,
      total: rawStyleCount,
    },
    dependencies: { added: addedDependencies, ui: uiDependencies },
    patch,
  };
}
