// v1-names: moves imports of envUI 0.x to their 1.0 names, as the rename map lists them.
//
// - Flat renames change the imported name and, unless the import is aliased, every reference.
// - Parts of a namespace (`MenuItem` becomes `Menu.Item`) drop their specifier, import the
//   namespace once and rewrite each reference as a member access.
// - A split (`DirectionLink`) becomes the part its literal prop value names, without that prop.
// - Removed exports are reported with what to use instead; a removed constant with a literal
//   value is inlined.
// - `import * as ui` accesses and `export { … } from` re-exports are rewritten the same way.
// Anything the transform cannot rewrite safely stays as it is and is reported with its line.
import { loadMap } from '../map.mjs';
import { createScopes } from '../scope.mjs';
import { createReporter, keepByteOrderMark, parserFor, printOptions } from '../shared.mjs';

export const parser = 'tsx';

/** Reference kinds that sit in type positions. */
const typeKinds = new Set(['type', 'typeof', 'qualified', 'typeof-qualified']);
/** Reference kinds that access a member of the binding, as a namespace is used. */
const memberKinds = new Set(['object', 'jsx-object', 'qualified', 'typeof-qualified']);
/** Reference kinds written as the left side of a qualified name, `Menu.ItemProps`. */
const qualifiedKinds = new Set(['qualified', 'typeof-qualified']);

/** The entry point of `useTheme`, whose call returns `{ theme, contrast }` in 1.0. */
const library = '@envsemble/envui';

/**
 * Whether the qualified name a path is the left side of is the name of a `typeof` query, as in
 * `typeof ui.Input` or `typeof Menu.Item.displayName`, whose first name is a value.
 */
function inTypeQuery(path) {
  let current = path.parent;
  while (current.parent?.node.type === 'TSQualifiedName' && current.name === 'left')
    current = current.parent;
  return current.parent?.node.type === 'TSTypeQuery' && current.name === 'exprName';
}

/**
 * How an Identifier or JSXIdentifier is used: `decl` for a declaration, a reference kind (`jsx`,
 * `jsx-object`, `object`, `qualified`, `typeof-qualified`, `type`, `typeof`, `shorthand`, `export`
 * or `value`), or null for a name that refers to no binding, such as a property key.
 */
function classify(path) {
  const { node } = path;
  const parentPath = path.parent;
  if (!parentPath) return null;
  const parent = parentPath.node;
  const field = typeof path.name === 'number' ? path.parentPath.name : path.name;
  if (node.type === 'JSXIdentifier') {
    if (
      (parent.type === 'JSXOpeningElement' || parent.type === 'JSXClosingElement') &&
      field === 'name'
    )
      return 'jsx';
    if (parent.type === 'JSXMemberExpression' && field === 'object') return 'jsx-object';
    return null;
  }
  if (node.type !== 'Identifier') return null;
  switch (parent.type) {
    case 'ImportSpecifier':
    case 'ImportDefaultSpecifier':
    case 'ImportNamespaceSpecifier':
      return field === 'local' ? 'decl' : null;
    case 'ExportSpecifier':
      return field === 'local' && !parentPath.parent?.node.source ? 'export' : null;
    case 'ExportNamespaceSpecifier':
    case 'ExportDefaultSpecifier':
    case 'TSImportType':
    case 'TSTypePredicate':
    case 'MetaProperty':
    case 'LabeledStatement':
    case 'BreakStatement':
    case 'ContinueStatement':
    case 'ImportAttribute':
      return null;
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      if (field === 'property') return parent.computed ? 'value' : null;
      return field === 'object' ? 'object' : 'value';
    case 'TSQualifiedName':
      if (field !== 'left') return null;
      return inTypeQuery(path) ? 'typeof-qualified' : 'qualified';
    case 'TSTypeReference':
      return field === 'typeName' ? 'type' : null;
    case 'TSExpressionWithTypeArguments':
    case 'TSInterfaceHeritage':
    case 'TSClassImplements':
      return field === 'expression' ? 'type' : null;
    case 'TSTypeQuery':
      return field === 'exprName' ? 'typeof' : null;
    case 'ArrayPattern':
    case 'RestElement':
      return 'decl';
    case 'AssignmentPattern':
      return field === 'left' ? 'decl' : 'value';
    case 'ObjectProperty':
    case 'Property':
      if (field === 'key') return parent.computed ? 'value' : null;
      if (parentPath.parent?.node.type === 'ObjectPattern') return 'decl';
      return parent.shorthand ? 'shorthand' : 'value';
  }
  if (field === 'key') return parent.computed ? 'value' : null;
  if (['id', 'params', 'param', 'parameters', 'parameter'].includes(field)) return 'decl';
  return 'value';
}

/**
 * The space a reference kind looks its name up in; see scope.mjs. `typeof ui.Input` looks `ui` up
 * as a value, as `ui.Input` in an expression does.
 */
const spaceOf = (kind) => (kind === 'type' ? 'type' : kind === 'qualified' ? 'namespace' : 'value');
/**
 * The space a namespace written at a reference of a kind is looked up in: `Menu.ItemProps` in a
 * type finds namespaces, while `<Menu.Item>` and `typeof Menu.Item` find values.
 */
const namespaceSpaceOf = (kind) =>
  kind === 'type' || kind === 'qualified' ? 'namespace' : 'value';

/**
 * Whether a comment is a directive about the line below it, which must stay right above that line:
 * `@ts-expect-error`, `@ts-ignore`, `eslint-disable-next-line`, `prettier-ignore` and the like.
 */
function isLineDirective(comment) {
  return lineDirective.test(comment.value);
}
const lineDirective =
  /^[\s*]*(?:@ts-(?:expect-error|ignore)|eslint-disable-(?:next-)?line|prettier-ignore|biome-ignore|oxlint-disable-next-line|deno-lint-ignore|(?:istanbul|c8|v8) ignore next)(?![\w-])/;

/**
 * Whether a comment is `@ts-expect-error`. Above names the transform changes it expected an error
 * from the 0.x names, and once that error is gone TypeScript fails on it (TS2578), so it is
 * dropped there and reported rather than kept or moved.
 */
const isExpectError = (comment) => /^[\s*]*@ts-expect-error(?![\w-])/.test(comment.value);

/** A comment as it is written, for a report. */
function commentText(comment) {
  const block = comment.type === 'CommentBlock' || comment.type === 'Block';
  return block ? `/*${comment.value}*/` : `//${comment.value}`;
}

/** The value of a literal prop: `prop="next"`, `prop={'next'}` or `prop={`next`}`. */
function literalValue(value) {
  const node = value?.type === 'JSXExpressionContainer' ? value.expression : value;
  if (
    node?.type === 'StringLiteral' ||
    (node?.type === 'Literal' && typeof node.value === 'string')
  )
    return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0].value.cooked;
  return undefined;
}

/**
 * The names an object pattern takes from a node, as in `const { Root, Item } = Menu` or
 * `({ Root } = Menu)`, or undefined when the node is not destructured.
 */
function destructuredNames(path) {
  const parent = path.parent?.node;
  const pattern =
    parent?.type === 'VariableDeclarator' && parent.init === path.node
      ? parent.id
      : parent?.type === 'AssignmentExpression' && parent.right === path.node
        ? parent.left
        : undefined;
  if (pattern?.type !== 'ObjectPattern') return undefined;
  return pattern.properties.map((property) =>
    property.type === 'RestElement'
      ? `...${property.argument.name}`
      : property.computed
        ? '[…]'
        : (property.key.name ?? String(property.key.value)),
  );
}

/** A list of names for a report: `Root`, `Root and Item`, `Root, Item and Group`. */
const listOf = (names) =>
  names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];

/** Whether a member-like node is itself the object of a further member access. */
function isAccessedFurther(path) {
  const outer = path.parent?.node;
  if (!outer) return false;
  if (path.name !== 'object' && path.name !== 'left') return false;
  return [
    'MemberExpression',
    'OptionalMemberExpression',
    'JSXMemberExpression',
    'TSQualifiedName',
  ].includes(outer.type);
}

export default function transform(file, api, options = {}) {
  const { entries } = loadMap(options.map);
  if (![...entries.keys()].some((entry) => file.source.includes(entry))) return undefined;

  const j = api.jscodeshift.withParser(parserFor(file.path));
  const root = j(file.source);
  const reporter = createReporter(api);
  const warn = reporter.warn;

  const importDeclarations = root
    .find(j.ImportDeclaration)
    .filter((path) => entries.has(path.node.source.value))
    .paths();
  // `import ui = require('@envsemble/envui')`, which TypeScript reads as `import * as ui`.
  const importEquals = root
    .find(j.TSImportEqualsDeclaration)
    .filter(
      ({ node }) =>
        node.moduleReference?.type === 'TSExternalModuleReference' &&
        entries.has(node.moduleReference.expression?.value),
    )
    .paths();
  const reExports = root
    .find(j.ExportNamedDeclaration)
    .filter((path) => Boolean(path.node.source) && entries.has(path.node.source.value))
    .paths();
  // `require('@envsemble/envui')` and `import('@envsemble/envui')`, which are not followed.
  root.find(j.CallExpression).forEach(({ node }) => {
    const how =
      node.callee.type === 'Import'
        ? 'import()'
        : node.callee.type === 'Identifier' && node.callee.name === 'require'
          ? 'require()'
          : undefined;
    const source = literalValue(node.arguments[0]);
    if (how && entries.has(source))
      warn(
        node,
        `loads ${source} with ${how}, which the codemod does not follow: change the 0.x names used through it by hand${source === library ? ', and read .theme from a useTheme() call read as the color scheme' : ''}.`,
      );
  });
  if (importDeclarations.length === 0 && reExports.length === 0 && importEquals.length === 0) {
    reporter.flush();
    return undefined;
  }
  /** The specifiers as written, before any is replaced. */
  const originalSpecifiers = new Set(
    [...importDeclarations, ...reExports].flatMap(({ node }) => node.specifiers ?? []),
  );
  // New string literals follow the quotes of the file's envUI imports.
  const quoteSource =
    (importDeclarations[0] ?? reExports[0])?.node.source ??
    importEquals[0].node.moduleReference.expression;
  const quote = quoteSource.extra?.raw?.startsWith('"') ? 'double' : 'single';

  // Every binding and reference by name, and the names already in use anywhere in the file.
  const scopes = createScopes();
  /** Whether a reference reaches the imports of the file, or a global, rather than a local. */
  const bindsToModule = (path, name, kind, space = spaceOf(kind)) => {
    const found = scopes.lookup(path, name, space);
    return !found || found.imported;
  };
  const references = new Map();
  const taken = new Set();
  root.find(j.Identifier).forEach((path) => {
    const kind = classify(path);
    if (!kind) return;
    taken.add(path.node.name);
    if (kind === 'decl') return;
    if (!references.has(path.node.name)) references.set(path.node.name, []);
    references.get(path.node.name).push({ path, kind });
  });
  // Type parameters, also of mapped types and `infer`, name themselves with a string, not an
  // Identifier, in Babel's AST.
  root.find(j.TSTypeParameter).forEach(({ node }) => {
    const name = typeof node.name === 'string' ? node.name : node.name?.name;
    if (name) taken.add(name);
  });
  const referencesTo = (name) =>
    (references.get(name) ?? []).filter(({ path, kind }) => bindsToModule(path, name, kind));

  /**
   * Whether the binding a pattern declares or assigns at `bindingPath` is used other than through
   * its members (`Menu.Root`), which is how a 1.0 namespace of the same name is used.
   */
  const usedAsComponent = (bindingPath, name) => {
    const declaring = scopes.lookup(bindingPath, name, 'value')?.node;
    return (references.get(name) ?? []).some(
      ({ path, kind }) =>
        !memberKinds.has(kind) &&
        !(kind === 'jsx' && path.parent.node.type === 'JSXClosingElement') &&
        scopes.lookup(path, name, spaceOf(kind))?.node === declaring,
    );
  };

  const claimed = new Set();
  const isFree = (name) => !taken.has(name) && !claimed.has(name);
  /** The namespace name, or `Env<Name>`, `Env<Name>2`, … when the file already uses it. */
  const freeName = (name) => {
    for (let index = 0; ; index += 1) {
      const candidate = index === 0 ? name : `Env${name}${index === 1 ? '' : index}`;
      if (isFree(candidate)) {
        claimed.add(candidate);
        return candidate;
      }
    }
  };

  const build = (flavor, names) => {
    const [first, ...rest] = names;
    if (flavor === 'jsx')
      return rest.reduce(
        (object, name) => j.jsxMemberExpression(object, j.jsxIdentifier(name)),
        j.jsxIdentifier(first),
      );
    if (flavor === 'ts')
      return rest.reduce(
        (left, name) => j.tsQualifiedName(left, j.identifier(name)),
        j.identifier(first),
      );
    return rest.reduce(
      (object, name) => j.memberExpression(object, j.identifier(name)),
      j.identifier(first),
    );
  };
  const literal = (value) =>
    typeof value === 'number'
      ? j.numericLiteral(value)
      : typeof value === 'boolean'
        ? j.booleanLiteral(value)
        : j.stringLiteral(value);
  const flavorOf = (kind) =>
    kind === 'jsx' || kind === 'jsx-object' ? 'jsx' : typeKinds.has(kind) ? 'ts' : 'value';
  const describeSplit = (rule) => [...new Set([...rule.values.values()].map(({ to }) => to))];

  const edits = [];
  const removals = new Set();
  const namespaces = new Map();
  let changed = false;

  // Pass 1: the specifiers imported from mapped entry points, and the namespaces already imported.
  const specifiers = [];
  const namespaceImports = [];
  for (const declarationPath of importDeclarations) {
    const declaration = declarationPath.node;
    const entry = entries.get(declaration.source.value);
    for (const specifier of declaration.specifiers ?? []) {
      if (specifier.type === 'ImportNamespaceSpecifier') {
        namespaceImports.push({ local: specifier.local.name, entry });
        continue;
      }
      if (specifier.type !== 'ImportSpecifier' || specifier.imported.type !== 'Identifier')
        continue;
      specifiers.push({
        declarationPath,
        declaration,
        specifier,
        entry,
        imported: specifier.imported.name,
        local: specifier.local?.name ?? specifier.imported.name,
        isType: declaration.importKind === 'type' || specifier.importKind === 'type',
      });
    }
  }
  for (const { node } of importEquals)
    namespaceImports.push({
      local: node.id.name,
      entry: entries.get(node.moduleReference.expression.value),
    });
  const namespaceFor = (entry, name) => {
    const key = `${entry.name}\0${name}`;
    if (!namespaces.has(key))
      namespaces.set(key, {
        entry,
        name,
        existing: specifiers.filter((info) => info.entry === entry && info.imported === name),
        contributors: [],
        used: false,
        local: undefined,
      });
    return namespaces.get(key);
  };
  /** Removed import specifiers, with the declaration that has their names now, if any. */
  const movedTo = new Map();
  /** Import declarations whose names change, where a @ts-expect-error above them goes stale. */
  const rewritten = new Set();
  const remove = (info, replacement = () => undefined) => {
    removals.add(info.specifier);
    movedTo.set(info.specifier, replacement);
    rewritten.add(info.declaration);
    changed = true;
  };
  /**
   * Comments to keep where names changed: all but a leading @ts-expect-error, reported at `node`.
   * `kept` names the names below it that stay as they are, whose error it may have expected.
   */
  const withoutExpectError = (comments, node, kept = []) =>
    comments?.filter((comment) => {
      if (!comment.leading || !isExpectError(comment)) return true;
      warn(
        node,
        kept.length
          ? `dropped ${commentText(comment)}, which expected an error from the 0.x names or from ${listOf(kept)}, which ${kept.length > 1 ? 'stay' : 'stays'}: TypeScript fails on a @ts-expect-error with no error below it, so put it back if ${listOf(kept)} still ${kept.length > 1 ? 'have' : 'has'} the error.`
          : `dropped ${commentText(comment)}, which expected an error from the 0.x names: TypeScript fails on a @ts-expect-error with no error below it.`,
      );
      return false;
    });
  /** The names an import or re-export lists that the map does not change. */
  const unchangedNames = (specifiers, entry) =>
    specifiers
      .filter((specifier) => originalSpecifiers.has(specifier))
      .filter(
        (specifier) => specifier.type === 'ImportSpecifier' || specifier.type === 'ExportSpecifier',
      )
      .map((specifier) =>
        specifier.type === 'ImportSpecifier' ? specifier.imported : specifier.local,
      )
      .filter((name) => name?.type === 'Identifier')
      .map(({ name }) => name)
      .filter(
        (name) => !entry.renames.has(name) && !entry.splits.has(name) && !entry.removed.has(name),
      );
  // Specifiers are replaced whole: in `{ Input }` the imported and local names share one source
  // range, and recast would reprint a changed `imported` over both.
  const replaceImport = (info, imported, local) => {
    const replacement = j.importSpecifier(j.identifier(imported), j.identifier(local));
    if (info.specifier.importKind) replacement.importKind = info.specifier.importKind;
    // Comments on the specifier, such as a disable directive, stay with it.
    if (info.specifier.comments)
      replacement.comments = withoutExpectError(info.specifier.comments, info.specifier);
    const list = info.declaration.specifiers;
    list[list.indexOf(info.specifier)] = replacement;
    rewritten.add(info.declaration);
    info.specifier = replacement;
  };
  const replaceExport = (list, specifier, local, exported) => {
    const replacement = j.exportSpecifier.from({
      local: j.identifier(local),
      exported: j.identifier(exported),
    });
    if (specifier.exportKind) replacement.exportKind = specifier.exportKind;
    if (specifier.comments) replacement.comments = specifier.comments;
    list[list.indexOf(specifier)] = replacement;
  };

  /** Elements and references already told that a local shadows the name written for them. */
  const shadowReported = new Set();
  const reportShadow = (node, local, written, alias, imported) => {
    if (shadowReported.has(node)) return;
    shadowReported.add(node);
    warn(
      node,
      `a local ${local} shadows the import here: wrote ${written}, with ${imported} also imported as ${alias}.`,
    );
  };

  /**
   * The name a namespace is written with at a reference: its import's local name, or, where a local
   * of that name shadows the import, a second import of the namespace under a free alias such as
   * `Menu as EnvMenu`. `node` is what the report about the alias points at.
   */
  const namespaceLocalAt = ({ path, kind }, namespace, part, node = path.node) => {
    if (bindsToModule(path, namespace.local, kind, namespaceSpaceOf(kind))) return namespace.local;
    if (!namespace.alias) {
      namespace.alias = freeName(namespace.name);
      insertions.push({ namespace, needsValue: false, local: namespace.alias });
    }
    if (!typeKinds.has(kind))
      insertions.find(({ local }) => local === namespace.alias).needsValue = true;
    reportShadow(
      node,
      namespace.local,
      `${namespace.alias}.${part}`,
      namespace.alias,
      namespace.name,
    );
    return namespace.alias;
  };

  const rewriteAsPart = (reference, namespace, part) => {
    const { path, kind } = reference;
    const owner = kind === 'jsx' ? path.parent.parent.node : path.node;
    const replacement = build(flavorOf(kind), [
      namespaceLocalAt(reference, namespace, part, owner),
      part,
    ]);
    if (kind === 'shorthand') path.parent.node.shorthand = false;
    path.replace(replacement);
  };

  /**
   * The part a split element becomes, from its one literal prop (`direction="next"` gives
   * `Pager.Next`), and an edit that renames the element to `names()` and drops the prop. Undefined
   * when the prop is dynamic, spread in, missing or has a value the map does not list.
   */
  const splitElement = (opening, element, rule) => {
    const spread = opening.attributes.some((attribute) => attribute.type === 'JSXSpreadAttribute');
    const props = opening.attributes.filter(
      (attribute) =>
        attribute.type === 'JSXAttribute' &&
        attribute.name.type === 'JSXIdentifier' &&
        attribute.name.name === rule.prop,
    );
    const target =
      !spread && props.length === 1 ? rule.values.get(literalValue(props[0].value)) : undefined;
    if (!target) return undefined;
    const rename = (names) => () => {
      opening.attributes = opening.attributes.filter((attribute) => attribute !== props[0]);
      opening.name = build('jsx', names());
      if (element.closingElement) element.closingElement.name = build('jsx', names());
    };
    return { target, rename };
  };

  // Pass 2: plan each imported specifier.
  for (const info of specifiers) {
    const { entry, imported, local } = info;
    const rename = entry.renames.get(imported);
    const split = entry.splits.get(imported);
    const removed = entry.removed.get(imported);

    if (rename && !rename.namespace) {
      changed = true;
      if (local !== imported) {
        edits.push(() => replaceImport(info, rename.to, local));
        continue;
      }
      const sibling = specifiers.find(
        (other) =>
          other.entry === entry && other.imported === rename.to && (!other.isType || info.isType),
      );
      let target;
      let alias;
      const references = referencesTo(local);
      const shadowed = (path, kind) => !bindsToModule(path, sibling.local, kind);
      if (sibling) {
        target = sibling.local;
        // Where a local of the new name shadows the sibling import, keep this import, aliased.
        if (references.some(({ path, kind }) => kind !== 'export' && shadowed(path, kind))) {
          alias = freeName(rename.to);
          edits.push(() => replaceImport(info, rename.to, alias));
        } else remove(info, () => sibling.declaration);
      } else if (
        !isFree(rename.to) ||
        references.some(({ path, kind }) => scopes.lookup(path, rename.to, spaceOf(kind)))
      ) {
        // The new name is taken in this file, or something declares it where a reference would
        // read it: keep the old local name as an alias.
        edits.push(() => replaceImport(info, rename.to, local));
        continue;
      } else {
        target = rename.to;
        claimed.add(target);
        edits.push(() => replaceImport(info, target, target));
      }
      for (const { path, kind } of references) {
        const name = alias && kind !== 'export' && shadowed(path, kind) ? alias : target;
        if (name === alias) {
          const owner = kind === 'jsx' ? path.parent.parent.node : path.node;
          reportShadow(owner, target, alias, alias, rename.to);
        }
        edits.push(() => {
          if (kind === 'shorthand') {
            path.parent.node.shorthand = false;
            path.replace(j.identifier(name));
          } else if (kind === 'export') {
            const exportSpecifier = path.parent.node;
            const exported = exportSpecifier.exported.name;
            replaceExport(
              path.parent.parent.node.specifiers,
              exportSpecifier,
              target,
              exported === local ? target : exported,
            );
          } else path.node.name = name;
        });
      }
      continue;
    }

    if (rename) {
      const namespace = namespaceFor(entry, rename.namespace);
      const self = imported === rename.namespace;
      let kept = false;
      for (const reference of referencesTo(local)) {
        if (self && memberKinds.has(reference.kind)) continue;
        // Parts destructured from the namespace are 1.0 code: the namespace stays.
        const names = self ? destructuredNames(reference.path) : undefined;
        if (names) {
          warn(
            reference.path.node,
            `destructures ${listOf(names)} from ${local}, which is the ${rename.namespace} namespace in 1.0, and stays as it is; the 0.x component is ${local}${rename.to.slice(rename.namespace.length)}.`,
          );
          continue;
        }
        if (reference.kind === 'export') {
          warn(
            reference.path.node,
            self
              ? `exports ${local}, which is the ${rename.namespace} namespace in 1.0; the old component is ${rename.to}.`
              : `exports ${local}, which is ${rename.to} in 1.0 and cannot be exported by its old name: export the ${rename.namespace} namespace or a constant instead.`,
          );
          kept = !self;
          continue;
        }
        namespace.used = true;
        changed = true;
        edits.push(() => rewriteAsPart(reference, namespace, rename.part));
      }
      if (!self) {
        namespace.contributors.push({ info, kept });
        if (!kept) remove(info, () => namespace.declaration);
      }
      continue;
    }

    if (split) {
      const targets = describeSplit(split);
      const handled = new Set();
      let kept = false;
      const contributed = new Set();
      for (const { path, kind } of referencesTo(local)) {
        if (handled.has(path.node)) continue;
        if (kind === 'jsx' && path.parent.node.type === 'JSXOpeningElement') {
          const opening = path.parent.node;
          const element = path.parent.parent.node;
          if (element.closingElement) handled.add(element.closingElement.name);
          const planned = splitElement(opening, element, split);
          if (planned) {
            const namespace = namespaceFor(entry, planned.target.namespace);
            namespace.used = true;
            contributed.add(namespace);
            changed = true;
            const { part } = planned.target;
            edits.push(
              planned.rename(() => [
                namespaceLocalAt({ path, kind }, namespace, part, element),
                part,
              ]),
            );
            continue;
          }
          warn(
            opening,
            `${imported} has a dynamic, spread or missing ${split.prop} and stays as it is: use ${targets.join(' or ')}, which take no ${split.prop} prop.`,
          );
          kept = true;
          continue;
        }
        warn(
          path.node,
          `${imported} is used outside JSX and stays as it is: use ${targets.join(' or ')}, which take no ${split.prop} prop.`,
        );
        kept = true;
      }
      if (!kept) {
        remove(info, () => [...contributed][0]?.declaration);
        if (contributed.size === 0)
          for (const { namespace } of split.values.values())
            contributed.add(namespaceFor(entry, namespace));
      }
      for (const namespace of contributed) namespace.contributors.push({ info, kept });
      continue;
    }

    if (removed) {
      if (removed.value !== undefined) {
        let kept = false;
        for (const { path, kind } of referencesTo(local)) {
          if (kind === 'value' || kind === 'object' || kind === 'shorthand') {
            edits.push(() => {
              if (kind === 'shorthand') path.parent.node.shorthand = false;
              path.replace(literal(removed.value));
            });
          } else if (kind === 'typeof') {
            edits.push(() => path.parent.replace(j.tsLiteralType(literal(removed.value))));
          } else {
            warn(path.node, `${imported} is no longer exported by ${entry.name}: ${removed.use}`);
            kept = true;
          }
        }
        if (!kept) remove(info);
        changed = true;
        continue;
      }
      if (entry.namespaces.has(imported)) {
        // `Toast` names the 1.0 namespace too: member accesses are the new API.
        for (const { path, kind } of referencesTo(local)) {
          if (memberKinds.has(kind)) continue;
          if (kind === 'jsx' && path.parent.node.type === 'JSXClosingElement') continue;
          warn(
            path.node,
            `${imported} is no longer exported as a component by ${entry.name}: ${removed.use}`,
          );
        }
        continue;
      }
      warn(info.specifier, `${imported} is no longer exported by ${entry.name}: ${removed.use}`);
    }
  }

  // `import * as ui from '@envsemble/envui'`: rewrite `ui.<old name>` accesses.
  for (const { local, entry } of namespaceImports) {
    const handled = new Set();
    for (const { path, kind } of referencesTo(local)) {
      if (kind === 'value') {
        // `const { Input } = ui` and `({ Input } = ui)`.
        const parent = path.parent;
        const field =
          parent.node.type === 'VariableDeclarator' && parent.node.init === path.node
            ? 'id'
            : parent.node.type === 'AssignmentExpression' && parent.node.right === path.node
              ? 'left'
              : undefined;
        const patternPath = field && parent.get(field);
        if (patternPath?.node.type === 'ObjectPattern') {
          patternPath.node.properties.forEach((property, index) => {
            // `{ Input }`, `{ 'Input': field }` and `{ ['Input']: field }`.
            const key =
              property.type === 'RestElement'
                ? undefined
                : property.computed
                  ? literalValue(property.key)
                  : (property.key?.name ?? literalValue(property.key));
            const rename = entry.renames.get(key);
            const split = entry.splits.get(key);
            const removed = entry.removed.get(key);
            // `Menu` and `Toast` name 1.0 namespaces too: used through their members, as in
            // `<Menu.Root>`, they are 1.0 code.
            if (entry.namespaces.has(key)) {
              let binding = patternPath.get('properties', index, 'value');
              if (binding.value?.type === 'AssignmentPattern') binding = binding.get('left');
              if (binding.value?.type !== 'Identifier') return;
              if (!usedAsComponent(binding, binding.value.name)) return;
            }
            const change = rename
              ? `which is ${rename.to} in 1.0: rename it by hand.`
              : split
                ? `which 1.0 splits into ${describeSplit(split).join(' and ')}: rename it by hand.`
                : removed
                  ? `which ${entry.name} no longer exports: ${removed.use}`
                  : undefined;
            if (change) warn(property, `destructures ${key} from ${local}, ${change}`);
            else if (key === 'useTheme' && entry.name === library)
              warn(
                property,
                `destructures useTheme from ${local}, whose call is { theme, contrast } in 1.0 rather than the color scheme: read .theme by hand where a call is read as the color scheme.`,
              );
          });
        }
        continue;
      }
      if (!memberKinds.has(kind)) continue;
      const accessPath = path.parent;
      const access = accessPath.node;
      if (handled.has(access)) continue;
      // `ui.Input`, and `ui['Input']` or ``ui[`Input`]``, whose literal key is kept a literal.
      const literalKey =
        !qualifiedKinds.has(kind) && access.computed ? literalValue(access.property) : undefined;
      const property = qualifiedKinds.has(kind) ? access.right : access.property;
      const name =
        literalKey ??
        (!access.computed && (property?.type === 'Identifier' || property?.type === 'JSXIdentifier')
          ? property.name
          : undefined);
      if (name === undefined) {
        if (access.computed && access.object === path.node)
          warn(
            access,
            `${local}[…] reads an export by a name computed at run time, which is not changed: if it can name an export that 1.0 renames, rename it by hand.`,
          );
        continue;
      }
      const flavor = flavorOf(kind);
      const outer = accessPath.parent?.node;
      const rename = entry.renames.get(name);
      if (rename && !rename.namespace) {
        changed = true;
        edits.push(() => {
          const replacement =
            literalKey !== undefined
              ? j.stringLiteral(rename.to)
              : flavor === 'jsx'
                ? j.jsxIdentifier(rename.to)
                : j.identifier(rename.to);
          if (qualifiedKinds.has(kind)) access.right = replacement;
          else access.property = replacement;
        });
        continue;
      }
      if (rename) {
        if (name === rename.namespace && isAccessedFurther(accessPath)) continue;
        const names = name === rename.namespace ? destructuredNames(accessPath) : undefined;
        if (names) {
          warn(
            access,
            `destructures ${listOf(names)} from ${local}.${name}, which is the ${name} namespace in 1.0, and stays as it is; the 0.x component is ${local}.${rename.to}.`,
          );
          continue;
        }
        changed = true;
        edits.push(() => accessPath.replace(build(flavor, [local, rename.namespace, rename.part])));
        continue;
      }
      const split = entry.splits.get(name);
      if (split) {
        const targets = describeSplit(split);
        if (flavor === 'jsx' && outer?.type === 'JSXClosingElement') continue;
        if (flavor === 'jsx' && outer?.type === 'JSXOpeningElement') {
          const element = accessPath.parent.parent.node;
          if (element.closingElement) handled.add(element.closingElement.name);
          const planned = splitElement(outer, element, split);
          if (planned) {
            changed = true;
            const { namespace, part } = planned.target;
            edits.push(planned.rename(() => [local, namespace, part]));
            continue;
          }
          warn(
            outer,
            `${local}.${name} has a dynamic, spread or missing ${split.prop} and stays as it is: use ${targets.map((target) => `${local}.${target}`).join(' or ')}, which take no ${split.prop} prop.`,
          );
          continue;
        }
        warn(
          access,
          `${local}.${name} is used outside JSX and stays as it is: use ${targets.map((target) => `${local}.${target}`).join(' or ')}.`,
        );
        continue;
      }
      const removed = entry.removed.get(name);
      if (removed) {
        if (removed.value !== undefined && flavor === 'value') {
          changed = true;
          edits.push(() => accessPath.replace(literal(removed.value)));
          continue;
        }
        if (removed.value !== undefined && outer?.type === 'TSTypeQuery') {
          changed = true;
          edits.push(() => accessPath.parent.replace(j.tsLiteralType(literal(removed.value))));
          continue;
        }
        if (entry.namespaces.has(name) && isAccessedFurther(accessPath)) continue;
        if (flavor === 'jsx' && outer?.type === 'JSXClosingElement') continue;
        warn(access, `${local}.${name} is no longer exported by ${entry.name}: ${removed.use}`);
      }
    }
  }

  // `export { … } from '@envsemble/envui'`: flat renames move to the new name; the rest is reported.
  for (const exportPath of reExports) {
    const entry = entries.get(exportPath.node.source.value);
    let renamed = false;
    for (const specifier of exportPath.node.specifiers ?? []) {
      if (specifier.type !== 'ExportSpecifier' || specifier.local?.type !== 'Identifier') continue;
      const name = specifier.local.name;
      const rename = entry.renames.get(name);
      const split = entry.splits.get(name);
      const removed = entry.removed.get(name);
      if (rename && !rename.namespace) {
        changed = true;
        renamed = true;
        const exported = specifier.exported?.name ?? name;
        edits.push(() =>
          replaceExport(
            exportPath.node.specifiers,
            specifier,
            rename.to,
            exported === name ? rename.to : exported,
          ),
        );
      } else if (rename && name === rename.namespace) {
        warn(
          specifier,
          `re-exports ${name}, which is the ${name} namespace in 1.0; the old component is ${rename.to}.`,
        );
      } else if (rename) {
        warn(
          specifier,
          `re-exports ${name}, which is ${rename.to} in 1.0 and cannot be re-exported by its old name: re-export the ${rename.namespace} namespace instead.`,
        );
      } else if (split) {
        warn(
          specifier,
          `re-exports ${name}, which 1.0 splits into ${describeSplit(split).join(' and ')}: re-export their namespace instead.`,
        );
      } else if (removed) {
        warn(
          specifier,
          `re-exports ${name}, which ${entry.name} no longer exports: ${removed.use}`,
        );
      }
    }
    // As above an import, a @ts-expect-error above a re-export whose names change goes stale.
    const declaration = exportPath.node;
    if (renamed && declaration.comments)
      declaration.comments = withoutExpectError(
        declaration.comments,
        declaration,
        unchangedNames(declaration.specifiers, entry),
      );
  }

  // useTheme() returns `{ theme, contrast }` in 1.0 rather than the color scheme.
  // `<Theme theme={useTheme()}>`, 0.x's way to re-theme a portal, becomes `<Theme {...useTheme()}>`,
  // which keeps the contrast too; every other bare call reads `useTheme().theme`, 0.x's value.
  const localsOf = (name) =>
    specifiers
      .filter((info) => info.entry.name === library && info.imported === name && !info.isType)
      .map((info) => info.local);
  const themeLocals = new Set(localsOf('Theme'));
  const useThemeLocals = localsOf('useTheme');
  const libraryNamespaces = new Set(
    namespaceImports.filter(({ entry }) => entry.name === library).map(({ local }) => local),
  );
  const isLibraryNamespace = (node, path) =>
    (node?.type === 'Identifier' || node?.type === 'JSXIdentifier') &&
    libraryNamespaces.has(node.name) &&
    bindsToModule(path, node.name, 'object');
  const useThemeCalls = [
    ...useThemeLocals.flatMap((local) =>
      referencesTo(local)
        .filter(({ kind, path }) => kind === 'value' && path.parent.node.callee === path.node)
        .map(({ path }) => path.parent),
    ),
    ...root
      .find(j.CallExpression)
      .filter(
        (path) =>
          path.node.callee.type === 'MemberExpression' &&
          !path.node.callee.computed &&
          path.node.callee.property.name === 'useTheme' &&
          isLibraryNamespace(path.node.callee.object, path),
      )
      .paths(),
  ].filter((path) => path.node.arguments.length === 0);
  const isLibraryTheme = (name, path) =>
    name.type === 'JSXIdentifier'
      ? themeLocals.has(name.name) && bindsToModule(path, name.name, 'jsx')
      : name.type === 'JSXMemberExpression' &&
        name.property.name === 'Theme' &&
        isLibraryNamespace(name.object, path);
  const contexts = contextNames(j, root);
  for (const call of useThemeCalls) {
    const container = call.parent;
    const attributePath = container?.parent;
    const attribute = attributePath?.node;
    if (
      container?.node.type === 'JSXExpressionContainer' &&
      attribute?.type === 'JSXAttribute' &&
      attribute.name.type === 'JSXIdentifier' &&
      attribute.name.name === 'theme' &&
      isLibraryTheme(attributePath.parent.node.name, attributePath.parent)
    ) {
      // Props written before the spread would lose to the contrast it carries, so it goes first.
      const attributes = attributePath.parent.node.attributes;
      const contrast = attributes.findIndex(
        (other) => other.type === 'JSXAttribute' && other.name.name === 'contrast',
      );
      const at = attributes.indexOf(attribute);
      attributes.splice(at, 1);
      attributes.splice(
        contrast >= 0 && contrast < at ? contrast : at,
        0,
        j.jsxSpreadAttribute(call.node),
      );
      changed = true;
      continue;
    }
    if (readThemeOfCall(j, call, { references, scopes, warn, contexts })) changed = true;
  }

  if (!changed) {
    reporter.flush();
    return file.source;
  }

  // Pick the local name of each namespace the rewrites use, and plan its import specifier.
  const insertions = [];
  for (const namespace of namespaces.values()) {
    const needed = namespace.used || namespace.contributors.some(({ kept }) => !kept);
    if (!needed) continue;
    const needsValue = namespace.contributors.some(({ info }) => !info.isType);
    const value = namespace.existing.find((info) => !info.isType);
    const type = namespace.existing.find((info) => info.isType);
    if (value) {
      namespace.local = value.local;
      namespace.declaration = value.declaration;
      continue;
    }
    if (type) {
      namespace.local = type.local;
      namespace.declaration = type.declaration;
      if (!needsValue) continue;
      if (type.specifier.importKind === 'type') {
        edits.push(() => {
          type.specifier.importKind = 'value';
        });
        continue;
      }
      // The type-only import gives way to a value import, which takes its comments.
      removals.add(type.specifier);
      movedTo.set(type.specifier, () => namespace.declaration);
      namespace.declaration = undefined;
      insertions.push({ namespace, needsValue, replaces: type.specifier });
      continue;
    }
    namespace.local = freeName(namespace.name);
    insertions.push({ namespace, needsValue });
  }

  for (const edit of edits) edit();

  /** Removed specifiers whose place a namespace specifier takes, which gets their comments. */
  const heirs = new Map();
  /** Namespace specifiers that took line comments from the specifiers they replace. */
  const commented = new Set();
  for (const { namespace, needsValue, local = namespace.local, replaces } of insertions) {
    const contributors = namespace.contributors.map(({ info }) => info);
    const anchor = needsValue ? contributors.find((info) => !info.isType) : contributors[0];
    const specifier = j.importSpecifier(j.identifier(namespace.name), j.identifier(local));
    if (replaces) heirs.set(replaces, specifier);
    if (anchor) {
      if (!needsValue && anchor.declaration.importKind !== 'type') specifier.importKind = 'type';
      const list = anchor.declaration.specifiers;
      list.splice(list.indexOf(anchor.specifier), 0, specifier);
      if (removals.has(anchor.specifier)) heirs.set(anchor.specifier, specifier);
      namespace.declaration ??= anchor.declaration;
      continue;
    }
    const host = importDeclarations.find(
      (path) =>
        entries.get(path.node.source.value) === namespace.entry && path.node.importKind !== 'type',
    );
    if (host) {
      host.node.specifiers.push(specifier);
      namespace.declaration ??= host.node;
    } else {
      const last = importDeclarations.filter(
        (path) => entries.get(path.node.source.value) === namespace.entry,
      );
      const declaration = j.importDeclaration([specifier], j.stringLiteral(namespace.entry.name));
      last.at(-1).insertAfter(declaration);
      namespace.declaration ??= declaration;
    }
  }

  for (const declarationPath of importDeclarations) {
    const declaration = declarationPath.node;
    const before = declaration.specifiers.length;
    const removedHere = declaration.specifiers.filter((specifier) => removals.has(specifier));
    declaration.specifiers = declaration.specifiers.filter((specifier) => !removals.has(specifier));
    // Comments on a removed specifier go to the namespace specifier in its place, if there is one;
    // otherwise they are reported, since nothing they describe is left.
    for (const specifier of removedHere) {
      if (!specifier.comments?.length) continue;
      const heir = heirs.get(specifier);
      if (heir) {
        heir.comments = [
          ...(heir.comments ?? []),
          // Leading, so that a comment that followed the removed name stays out of the list's
          // commas.
          ...withoutExpectError(specifier.comments, specifier).map((comment) => ({
            ...comment,
            leading: true,
            trailing: false,
          })),
        ];
        if (heir.comments.some(({ type }) => type === 'CommentLine' || type === 'Line'))
          commented.add(heir);
        continue;
      }
      const { imported, local } = specifier;
      const name =
        local && local.name !== imported.name ? `${imported.name} as ${local.name}` : imported.name;
      for (const comment of specifier.comments)
        warn(
          specifier,
          `dropped ${commentText(comment)}, which was on ${name}, removed from this import.`,
        );
    }
    if (before > 0 && declaration.specifiers.length === 0) {
      const leading = (declaration.comments ?? []).filter((comment) => comment.leading);
      const directives = leading.filter(isLineDirective);
      // A directive about the import's own line, such as @ts-expect-error, goes with its names to
      // the import that has them now; with no such import, the line is gone, and so is it.
      const target = removedHere.map((specifier) => movedTo.get(specifier)?.()).find(Boolean);
      if (target && directives.length > 0) {
        const comments = target.comments ?? [];
        target.comments = [
          ...comments.filter((comment) => comment.leading),
          ...withoutExpectError(directives, declaration),
          ...comments.filter((comment) => !comment.leading),
        ];
      } else
        for (const comment of directives)
          warn(
            declaration,
            `dropped ${commentText(comment)}, which applied to the import that was removed.`,
          );
      // Other comments above a removed import, such as a file header, stay on the next statement.
      const others = leading.filter((comment) => !directives.includes(comment));
      const body = declarationPath.parent.node.body ?? [];
      const next = body[body.indexOf(declaration) + 1];
      if (others.length && next) next.comments = [...others, ...(next.comments ?? [])];
      declarationPath.prune();
    } else if (rewritten.has(declaration) && declaration.comments)
      declaration.comments = withoutExpectError(
        declaration.comments,
        declaration,
        unchangedNames(declaration.specifiers, entries.get(declaration.source.value)),
      );
  }

  // Recast prints a list's comments after the comma before them, so a line comment above a name
  // that follows another would land on that name's line. These imports are printed with a name on
  // each line instead, as a formatter would, and read back in.
  root.find(j.ImportDeclaration).forEach((declarationPath) => {
    const { specifiers = [] } = declarationPath.node;
    if (!specifiers.some((specifier, index) => index > 0 && commented.has(specifier))) return;
    const options = printOptions(file.source, quote);
    const tabWidth = root.get().node.loc?.lines?.guessTabWidth?.() ?? 2;
    // A copy, without the original it would otherwise be patched into.
    let printed = j({ ...declarationPath.node }).toSource({ ...options, wrapColumn: 0, tabWidth });
    // Recast indents a name it keeps from the source with spaces, even when told to use tabs.
    if (options.useTabs)
      printed = printed.replace(
        /^ +/gm,
        (spaces) =>
          '	'.repeat(Math.floor(spaces.length / tabWidth)) + ' '.repeat(spaces.length % tabWidth),
      );
    declarationPath.replace(j(printed).find(j.ImportDeclaration).nodes()[0]);
  });

  // The rewrites and the pruned imports can still add reports.
  reporter.flush();
  return keepByteOrderMark(file.source, root.toSource(printOptions(file.source, quote)));
}

/** Comparisons that hold for 0.x's scheme and 1.0's object alike: with null or undefined. */
const nullishComparison = (node, operand) => {
  if (node?.type !== 'BinaryExpression' || !['===', '!==', '==', '!='].includes(node.operator))
    return false;
  const other = node.left === operand ? node.right : node.left;
  return (
    other.type === 'NullLiteral' ||
    (other.type === 'Literal' && other.value === null) ||
    (other.type === 'Identifier' && other.name === 'undefined') ||
    (other.type === 'UnaryExpression' && other.operator === 'void')
  );
};

/** Expressions whose value is their operand's: parentheses and TypeScript's assertions. */
const transparentTypes = new Set([
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
]);

/**
 * The outermost expression whose value can be the one at `path`: through parentheses, `as`,
 * `satisfies`, `!` and `<T>`, the branches of a conditional, and the operands of `??`, `||` and
 * the right of `&&`. `const { theme } = own ? useTheme() : fallback` destructures the call.
 */
function valueOf(path) {
  let current = path;
  for (;;) {
    const parent = current.parent;
    const node = parent?.node;
    const passes =
      (transparentTypes.has(node?.type) && node.expression === current.node) ||
      (node?.type === 'ConditionalExpression' && node.test !== current.node) ||
      (node?.type === 'LogicalExpression' &&
        (node.operator !== '&&' || node.right === current.node));
    if (!passes) return current;
    current = parent;
  }
}

/**
 * Whether an expression is read as 1.0's `{ theme, contrast }`: `.theme` or `.contrast` read from
 * it, spread, or destructured, also through parentheses, type assertions and conditionals.
 */
function readsAsThemeObject(expression) {
  const path = valueOf(expression);
  const { node } = path;
  const parent = path.parent?.node;
  switch (parent?.type) {
    case 'MemberExpression':
    case 'OptionalMemberExpression': {
      if (parent.object !== node) return false;
      const key = parent.computed ? parent.property.value : parent.property.name;
      return key === 'theme' || key === 'contrast';
    }
    case 'SpreadElement':
    case 'JSXSpreadAttribute':
      return true;
    case 'VariableDeclarator':
      return parent.init === node && parent.id.type === 'ObjectPattern';
    case 'AssignmentExpression':
      return parent.right === node && parent.left.type === 'ObjectPattern';
  }
  return false;
}

/** The name of a JSX element as written: `Context` or `Context.Provider`. */
const jsxName = (name) =>
  name.type === 'JSXMemberExpression'
    ? `${jsxName(name.object)}.${name.property.name}`
    : name.type === 'JSXNamespacedName'
      ? `${name.namespace.name}:${name.name.name}`
      : name.name;

/**
 * Whether a JSX element may be a context provider, whose `value` the transform can't follow:
 * `Context.Provider`, an element named `…Context`, as React 19 renders a context, or `…Provider`,
 * which may wrap one, or a binding `createContext` makes in the file. A component such as
 * `<Select>` takes `value` as a prop of its own.
 */
function isProvider(name, contexts) {
  const last =
    name.type === 'JSXMemberExpression'
      ? name.property.name
      : name.type === 'JSXIdentifier'
        ? name.name
        : undefined;
  if (!last || !/^[A-Z]/.test(last)) return false;
  if (/(Context|Provider)$/.test(last)) return true;
  return name.type === 'JSXIdentifier' && contexts.has(last);
}

/** The names bound to a `createContext(…)` or `React.createContext(…)` call in the file. */
function contextNames(j, root) {
  const names = new Set();
  root.find(j.VariableDeclarator).forEach(({ node }) => {
    let init = node.init;
    while (init && transparentTypes.has(init.type)) init = init.expression;
    const callee = init?.type === 'CallExpression' ? init.callee : undefined;
    const called =
      callee?.type === 'Identifier'
        ? callee.name
        : callee?.type === 'MemberExpression' && !callee.computed
          ? callee.property.name
          : undefined;
    if (called === 'createContext' && node.id.type === 'Identifier') names.add(node.id.name);
  });
  return names;
}

/**
 * Where a value leaves for code the transform can't see, so it can't tell 0.x code from 1.0: a
 * value returned, also as an arrow function's body, or given to the `value` prop of what may be a
 * context provider (see isProvider). Returns `{ provider }` for a `value` prop, `{}` for a return,
 * and undefined elsewhere.
 */
function leaves(expression, contexts) {
  const path = valueOf(expression);
  const parent = path.parent?.node;
  if (
    parent?.type === 'ReturnStatement' ||
    (parent?.type === 'ArrowFunctionExpression' && parent.body === path.node)
  )
    return {};
  const attribute = path.parent?.parent?.node;
  if (
    parent?.type === 'JSXExpressionContainer' &&
    attribute?.type === 'JSXAttribute' &&
    attribute.name.type === 'JSXIdentifier' &&
    attribute.name.name === 'value'
  ) {
    const element = path.parent.parent.parent.node.name;
    // `<input value={…}>` and `<Select value={…}>` take 0.x's scheme as the string it was.
    if (isProvider(element, contexts)) return { provider: jsxName(element) };
  }
  return undefined;
}

/** What a report says a value that leaves does: `returns …` or `passes … as the value of <…>`. */
const leaving = (where, call, variable) => {
  const held = variable ? `${variable}, which holds ${call}` : call;
  return where.provider
    ? `passes ${held}${variable ? ',' : ''} as the value of <${where.provider}>`
    : `returns ${held}`;
};

/**
 * Rewrites a bare `useTheme()` call as `useTheme().theme`, the color scheme 0.x's call returned,
 * so `useTheme() === 'dark'`, `theme={useTheme()}` on another element and `` `t-${useTheme()}` ``
 * keep their meaning. The transform is meant for 0.x code, but a call already read as 1.0's object
 * stays, also through a variable it initializes, such as `const current = useTheme()` read as
 * `current.contrast`, and through parentheses, type assertions and conditionals; so does a
 * comparison with null or undefined. A call whose value leaves for code the transform can't see,
 * returned or given to a context as its value, also directly or through a variable, stays and is
 * reported. `references` are the file's references by name, which `scopes` narrows to the
 * variable's declaration. Returns whether it rewrote the call.
 */
function readThemeOfCall(j, call, { references, scopes, warn, contexts }) {
  const outer = valueOf(call);
  if (readsAsThemeObject(call) || nullishComparison(outer.parent?.node, outer.node)) return false;
  const callee = call.node.callee;
  const shown = `${callee.type === 'MemberExpression' ? `${callee.object.name}.${callee.property.name}` : callee.name}()`;
  const report = (node, action) =>
    warn(
      node,
      `${action}, so it stays as it is: useTheme() is { theme, contrast } in 1.0; where it is read as the color scheme, read its .theme.`,
    );
  const where = leaves(call, contexts);
  if (where) {
    report(call.node, leaving(where, shown));
    return false;
  }
  const declarator = outer.parent?.node;
  if (
    declarator?.type === 'VariableDeclarator' &&
    declarator.init === outer.node &&
    declarator.id.type === 'Identifier'
  ) {
    const { name } = declarator.id;
    const declaring = scopes.lookup(outer.parent.get('id'), name, 'value')?.node;
    const uses = (references.get(name) ?? []).filter(
      ({ path, kind }) =>
        (kind === 'value' || kind === 'object') &&
        scopes.lookup(path, name, 'value')?.node === declaring,
    );
    if (uses.some(({ path }) => readsAsThemeObject(path))) return false;
    const left = uses
      .map(({ path }) => [path, leaves(path, contexts)])
      .filter(([, found]) => found);
    if (left.length > 0) {
      for (const [path, found] of left) report(path.node, leaving(found, shown, name));
      return false;
    }
  }
  call.replace(j.memberExpression(call.node, j.identifier('theme')));
  return true;
}
