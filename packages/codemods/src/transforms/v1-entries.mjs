// v1-entries: moves the imports of exports that 1.0 moved to another entry point, as the rename
// map's `moved` section lists them: ColorPicker and ColorSwatch, with their props types, from
// @envsemble/envui to @envsemble/envui/color.
//
// - `import { Button, ColorPicker } from '@envsemble/envui'` keeps Button and imports ColorPicker
//   from @envsemble/envui/color, in an import of that entry point the file already has, or in a
//   new one right after the old import; a local name (`ColorPicker as Picker`) and a type-only
//   import or specifier stay as they are. An import left with no names goes with its line. Only
//   the declarations' text changes, so the file keeps its layout.
// - A re-export, `export { ColorSwatch } from '@envsemble/envui'`, moves the same way.
// - A use through a namespace import, such as `ui.ColorPicker` after
//   `import * as ui from '@envsemble/envui'`, is reported: import it from its entry point.
// - `export * from '@envsemble/envui'`, and `export * as ui`, are reported: they no longer
//   re-export the moved names. So is a dynamic `import('@envsemble/envui')` or a `require()` of it
//   in a file that names one of them, since the module it resolves to doesn't have it.
// Run it after v1-props, which moves the props of these components by their import from
// @envsemble/envui; running it again changes nothing.
import { loadMap } from '../map.mjs';
import { createReporter, indentsWithTabs, parserFor, sourceRanges } from '../shared.mjs';

export const parser = 'tsx';

/** The name a specifier imports or exports from its module. */
const importedName = (specifier) =>
  specifier.imported?.name ?? specifier.imported?.value ?? specifier.local?.name;

/** The names an entry moves, by the entry point they move to. */
function movedBy(entry) {
  const targets = new Map();
  for (const [name, target] of entry.moved)
    targets.set(target, [...(targets.get(target) ?? []), name]);
  return targets;
}

/** Names as a sentence's list: A, B and C. */
const list = (names) =>
  names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;

export default function transform(file, api, options = {}) {
  const { entries } = loadMap(options.map);
  const moving = new Map(
    [...entries].filter(([, entry]) => entry.moved.size > 0).map(([name, entry]) => [name, entry]),
  );
  if (![...moving.keys()].some((name) => file.source.includes(name))) return undefined;

  const j = api.jscodeshift.withParser(parserFor(file.path));
  const root = j(file.source);
  const reporter = createReporter(api);
  const eol = file.source.includes('\r\n') ? '\r\n' : '\n';
  const indent = indentsWithTabs(file.source) ? '\t' : '  ';
  const ranges = {
    import: sourceRanges(file, j, root, 'ImportDeclaration'),
    export: sourceRanges(file, j, root, 'ExportNamedDeclaration'),
  };

  /** A specifier as the file would write it, such as `type ColorPickerProps` or `A as B`. */
  function specifierText(specifier, kind) {
    const type = (specifier.importKind ?? specifier.exportKind) === 'type' ? 'type ' : '';
    const outer = kind === 'import' ? specifier.local.name : specifier.exported.name;
    const inner = importedName(specifier);
    return `${type}${inner}${outer !== inner ? ` as ${outer}` : ''}`;
  }

  /** The import and re-export declarations that name a source, with their text and specifiers. */
  const declarations = [];
  for (const kind of ['import', 'export'])
    root
      .find(kind === 'import' ? j.ImportDeclaration : j.ExportNamedDeclaration)
      .filter(({ node }) => Boolean(node.source))
      .forEach(({ node }) => {
        const range = ranges[kind](node);
        if (!range) return;
        const text = file.source.slice(range.start, range.end);
        const specifierType = kind === 'import' ? 'ImportSpecifier' : 'ExportSpecifier';
        declarations.push({
          node,
          kind,
          range,
          source: node.source.value,
          typeOnly: (kind === 'import' ? node.importKind : node.exportKind) === 'type',
          // Only a declaration of named specifiers can take or give names.
          named: (node.specifiers ?? []).every((specifier) => specifier.type === specifierType),
          quote: node.source.extra?.raw?.[0] ?? "'",
          semicolon: text.trimEnd().endsWith(';') ? ';' : '',
          multiline: text.includes('\n'),
          specifiers: (node.specifiers ?? []).map((specifier) => ({
            name: specifier.type === specifierType ? importedName(specifier) : undefined,
            local: (kind === 'import' ? specifier.local : specifier.exported)?.name,
            text: specifierText(specifier, kind),
          })),
          added: [],
          changed: false,
        });
      });

  /** A declaration as text, with its specifiers on one line, or one a line where it had several. */
  const render = (declaration) => {
    const type = declaration.typeOnly ? 'type ' : '';
    const names = declaration.specifiers.map((specifier) => specifier.text);
    const list = declaration.multiline
      ? `{${eol}${names.map((name) => `${indent}${name},`).join(eol)}${eol}}`
      : `{ ${names.join(', ')} }`;
    const { quote } = declaration;
    return `${declaration.kind} ${type}${list} from ${quote}${declaration.source}${quote}${declaration.semicolon}`;
  };

  for (const declaration of declarations) {
    const entry = moving.get(declaration.source);
    if (!entry || !declaration.named) continue;
    const moved = new Map();
    declaration.specifiers = declaration.specifiers.filter((specifier) => {
      const target = entry.moved.get(specifier.name);
      if (target === undefined) return true;
      moved.set(target, [...(moved.get(target) ?? []), specifier]);
      return false;
    });
    if (moved.size === 0) continue;
    declaration.changed = true;
    for (const [target, specifiers] of moved) {
      const existing =
        declarations.find(
          (other) =>
            other.source === target &&
            other.kind === declaration.kind &&
            other.typeOnly === declaration.typeOnly &&
            other.named,
        ) ??
        declarations
          .flatMap((other) => other.added)
          .find(
            (other) =>
              other.source === target &&
              other.kind === declaration.kind &&
              other.typeOnly === declaration.typeOnly,
          );
      const into = existing ?? {
        ...declaration,
        source: target,
        specifiers: [],
        multiline: false,
        added: [],
      };
      if (!existing) declaration.added.push(into);
      const locals = new Set(into.specifiers.map((specifier) => specifier.local));
      for (const specifier of specifiers)
        if (!locals.has(specifier.local)) into.specifiers.push(specifier);
      into.changed = true;
    }
  }

  const edits = [];
  for (const declaration of declarations) {
    if (!declaration.changed) continue;
    const texts = [
      ...(declaration.specifiers.length > 0 ? [render(declaration)] : []),
      ...declaration.added.map(render),
    ];
    let { start, end } = declaration.range;
    // A declaration left with no names goes with its line.
    if (texts.length === 0 && file.source.startsWith(eol, end)) end += eol.length;
    edits.push({ start, end, text: texts.join(eol) });
  }

  // A use through a namespace import of the old entry point is reported.
  root.find(j.ImportDeclaration).forEach(({ node }) => {
    const entry = moving.get(node.source.value);
    if (!entry) return;
    for (const specifier of node.specifiers ?? []) {
      if (specifier.type !== 'ImportNamespaceSpecifier') continue;
      const namespace = specifier.local.name;
      const reported = new Set();
      const report = (where, name) => {
        const target = entry.moved.get(name);
        // A JSX element names it twice, in its opening and its closing tag.
        const key = `${where.loc?.start.line}:${name}`;
        if (target && !reported.has(key) && reported.add(key))
          reporter.warn(
            where,
            `${namespace}.${name} comes from ${target} in 1.0, whose libraries the application installs: import ${name} from there.`,
          );
      };
      root
        .find(j.MemberExpression, { object: { type: 'Identifier', name: namespace } })
        .forEach(({ node: member }) => {
          if (!member.computed && member.property.type === 'Identifier')
            report(member, member.property.name);
        });
      root
        .find(j.JSXMemberExpression, { object: { type: 'JSXIdentifier', name: namespace } })
        .forEach(({ node: member }) => report(member, member.property.name));
      root
        .find(j.TSQualifiedName, { left: { type: 'Identifier', name: namespace } })
        .forEach(({ node: name }) => report(name, name.right.name));
    }
  });

  // An export of the whole entry point, or of it as a namespace, no longer carries the moved names.
  const reportExport = (node, text) => {
    const entry = moving.get(node.source?.value);
    if (!entry) return;
    for (const [target, names] of movedBy(entry))
      reporter.warn(
        node,
        `${text} no longer re-exports ${list(names)}: they come from ${target} in 1.0, whose libraries the application installs. Re-export them from there too, such as export * from '${target}'.`,
      );
  };
  root
    .find(j.ExportAllDeclaration)
    .forEach(({ node }) =>
      reportExport(
        node,
        `export * ${node.exported ? `as ${node.exported.name} ` : ''}from '${node.source?.value}'`,
      ),
    );
  root.find(j.ExportNamedDeclaration).forEach(({ node }) => {
    const namespace = (node.specifiers ?? []).find(
      (specifier) => specifier.type === 'ExportNamespaceSpecifier',
    );
    if (namespace)
      reportExport(node, `export * as ${namespace.exported.name} from '${node.source?.value}'`);
  });

  // A module loaded at run time, by import() or require(): the moved names aren't on it, in a file
  // that names them.
  const mentions = (name) => new RegExp(String.raw`\b${name}\b`).test(file.source);
  root.find(j.CallExpression).forEach(({ node }) => {
    const call =
      node.callee.type === 'Import'
        ? 'import'
        : node.callee.type === 'Identifier' && node.callee.name === 'require'
          ? 'require'
          : undefined;
    const [argument] = node.arguments ?? [];
    const source = typeof argument?.value === 'string' ? argument.value : undefined;
    const entry = call ? moving.get(source) : undefined;
    if (!entry) return;
    for (const [target, names] of movedBy(entry)) {
      const named = names.filter(mentions);
      if (named.length > 0)
        reporter.warn(
          node,
          `${call}('${source}') has no ${list(named)} in 1.0: load ${named.length === 1 ? 'it' : 'them'} from ${target}, whose libraries the application installs.`,
        );
    }
  });

  reporter.flush();
  if (edits.length === 0) return undefined;
  let output = file.source;
  for (const { start, end, text } of edits.sort((x, y) => y.start - x.start))
    output = output.slice(0, start) + text + output.slice(end);
  return output;
}
