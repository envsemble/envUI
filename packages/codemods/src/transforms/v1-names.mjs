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
import { createReporter, parserFor, printOptions } from '../shared.mjs';

export const parser = 'tsx';

/** Reference kinds that sit in type positions. */
const typeKinds = new Set(['type', 'typeof', 'qualified']);
/** Reference kinds that access a member of the binding, as a namespace is used. */
const memberKinds = new Set(['object', 'jsx-object', 'qualified']);

/**
 * How an Identifier or JSXIdentifier is used: `decl` for a declaration, a reference kind (`jsx`,
 * `jsx-object`, `object`, `qualified`, `type`, `typeof`, `shorthand`, `export` or `value`), or
 * null for a name that refers to no binding, such as a property key.
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
      return field === 'left' ? 'qualified' : null;
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

/** Whether a reference resolves to the module scope, where imports bind, rather than a local. */
function bindsToModule(path, name, kind) {
  const { scope } = path;
  if (!scope) return true;
  if (typeKinds.has(kind) && typeof scope.lookupType === 'function') {
    const typeScope = scope.lookupType(name);
    if (typeScope && !typeScope.isGlobal) return false;
  }
  const found = scope.lookup(name);
  return !found || found.isGlobal;
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
  const reExports = root
    .find(j.ExportNamedDeclaration)
    .filter((path) => Boolean(path.node.source) && entries.has(path.node.source.value))
    .paths();
  if (importDeclarations.length === 0 && reExports.length === 0) return undefined;
  // New string literals follow the quotes of the file's envUI imports.
  const quoteSource = (importDeclarations[0] ?? reExports[0]).node.source;
  const quote = quoteSource.extra?.raw?.startsWith('"') ? 'double' : 'single';

  // Every binding and reference by name, and the names already in use anywhere in the file.
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
  const referencesTo = (name) =>
    (references.get(name) ?? []).filter(({ path, kind }) => bindsToModule(path, name, kind));

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
  const remove = (info) => {
    removals.add(info.specifier);
    changed = true;
  };
  // Specifiers are replaced whole: in `{ Input }` the imported and local names share one source
  // range, and recast would reprint a changed `imported` over both.
  const replaceImport = (info, imported, local) => {
    const replacement = j.importSpecifier(j.identifier(imported), j.identifier(local));
    if (info.specifier.importKind) replacement.importKind = info.specifier.importKind;
    const list = info.declaration.specifiers;
    list[list.indexOf(info.specifier)] = replacement;
    info.specifier = replacement;
  };
  const replaceExport = (list, specifier, local, exported) => {
    const replacement = j.exportSpecifier.from({
      local: j.identifier(local),
      exported: j.identifier(exported),
    });
    if (specifier.exportKind) replacement.exportKind = specifier.exportKind;
    list[list.indexOf(specifier)] = replacement;
  };

  const rewriteAsPart = ({ path, kind }, namespace, part) => {
    const replacement = build(flavorOf(kind), [namespace.local, part]);
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
      if (sibling) {
        target = sibling.local;
        remove(info);
      } else if (!isFree(rename.to)) {
        // The new name is taken in this file: keep the old local name as an alias.
        edits.push(() => replaceImport(info, rename.to, local));
        continue;
      } else {
        target = rename.to;
        claimed.add(target);
        edits.push(() => replaceImport(info, target, target));
      }
      for (const { path, kind } of referencesTo(local)) {
        edits.push(() => {
          if (kind === 'shorthand') {
            path.parent.node.shorthand = false;
            path.replace(j.identifier(target));
          } else if (kind === 'export') {
            const exportSpecifier = path.parent.node;
            const exported = exportSpecifier.exported.name;
            replaceExport(
              path.parent.parent.node.specifiers,
              exportSpecifier,
              target,
              exported === local ? target : exported,
            );
          } else path.node.name = target;
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
        if (!kept) remove(info);
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
            edits.push(planned.rename(() => [namespace.local, planned.target.part]));
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
        remove(info);
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
        const declarator = path.parent.node;
        if (declarator.type === 'VariableDeclarator' && declarator.id.type === 'ObjectPattern') {
          for (const property of declarator.id.properties) {
            const key = property.computed ? undefined : property.key?.name;
            const rename = entry.renames.get(key);
            const split = entry.splits.get(key);
            const removed = entry.removed.get(key);
            const change = rename
              ? `which is ${rename.to} in 1.0: rename it by hand.`
              : split
                ? `which 1.0 splits into ${describeSplit(split).join(' and ')}: rename it by hand.`
                : removed
                  ? `which ${entry.name} no longer exports: ${removed.use}`
                  : undefined;
            if (change) warn(property, `destructures ${key} from ${local}, ${change}`);
          }
        }
        continue;
      }
      if (!memberKinds.has(kind)) continue;
      const accessPath = path.parent;
      const access = accessPath.node;
      if (handled.has(access)) continue;
      const property =
        kind === 'qualified' ? access.right : access.computed ? undefined : access.property;
      if (!property || (property.type !== 'Identifier' && property.type !== 'JSXIdentifier'))
        continue;
      const name = property.name;
      const flavor = flavorOf(kind);
      const outer = accessPath.parent?.node;
      const rename = entry.renames.get(name);
      if (rename && !rename.namespace) {
        changed = true;
        edits.push(() => {
          const replacement =
            flavor === 'jsx' ? j.jsxIdentifier(rename.to) : j.identifier(rename.to);
          if (kind === 'qualified') access.right = replacement;
          else access.property = replacement;
        });
        continue;
      }
      if (rename) {
        if (name === rename.namespace && isAccessedFurther(accessPath)) continue;
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
    for (const specifier of exportPath.node.specifiers ?? []) {
      if (specifier.type !== 'ExportSpecifier' || specifier.local?.type !== 'Identifier') continue;
      const name = specifier.local.name;
      const rename = entry.renames.get(name);
      const split = entry.splits.get(name);
      const removed = entry.removed.get(name);
      if (rename && !rename.namespace) {
        changed = true;
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
  }

  reporter.flush();
  if (!changed) return file.source;

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
      continue;
    }
    if (type) {
      namespace.local = type.local;
      if (!needsValue) continue;
      if (type.specifier.importKind === 'type') {
        edits.push(() => {
          type.specifier.importKind = 'value';
        });
        continue;
      }
      removals.add(type.specifier);
    } else {
      namespace.local = freeName(namespace.name);
    }
    insertions.push({ namespace, needsValue });
  }

  for (const edit of edits) edit();

  for (const { namespace, needsValue } of insertions) {
    const contributors = namespace.contributors.map(({ info }) => info);
    const anchor = needsValue ? contributors.find((info) => !info.isType) : contributors[0];
    const specifier = j.importSpecifier(
      j.identifier(namespace.name),
      j.identifier(namespace.local),
    );
    if (anchor) {
      if (!needsValue && anchor.declaration.importKind !== 'type') specifier.importKind = 'type';
      const list = anchor.declaration.specifiers;
      list.splice(list.indexOf(anchor.specifier), 0, specifier);
      continue;
    }
    const host = importDeclarations.find(
      (path) =>
        entries.get(path.node.source.value) === namespace.entry && path.node.importKind !== 'type',
    );
    if (host) host.node.specifiers.push(specifier);
    else {
      const last = importDeclarations.filter(
        (path) => entries.get(path.node.source.value) === namespace.entry,
      );
      last
        .at(-1)
        .insertAfter(j.importDeclaration([specifier], j.stringLiteral(namespace.entry.name)));
    }
  }

  for (const declarationPath of importDeclarations) {
    const declaration = declarationPath.node;
    const before = declaration.specifiers.length;
    declaration.specifiers = declaration.specifiers.filter((specifier) => !removals.has(specifier));
    if (before > 0 && declaration.specifiers.length === 0) {
      // Keep comments above a removed import, such as a file header, on the next statement.
      const comments = (declaration.comments ?? []).filter((comment) => comment.leading);
      const body = declarationPath.parent.node.body ?? [];
      const next = body[body.indexOf(declaration) + 1];
      if (comments.length && next) next.comments = [...comments, ...(next.comments ?? [])];
      declarationPath.prune();
    }
  }

  return root.toSource(printOptions(file.source, quote));
}
