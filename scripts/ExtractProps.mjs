// Extracts the props of every public component from the library's TypeScript source into
// docs/generated/props.json, which the documentation build turns into the Props section of each
// page, in the catalogue and in the packaged Markdown.
//
//   node scripts/ExtractProps.mjs           rewrite docs/generated/props.json
//   node scripts/ExtractProps.mjs --check   fail when it differs from the source
//
// For each export of the public entry points (not the icons) it records the kind (component,
// namespace of parts, or function) and its TSDoc. For a component it lists the props declared by
// envUI itself, with a readable type, the default (a TSDoc @default, or the default of the
// component's destructured parameter), whether it is required, the TSDoc and @deprecated. Props
// that come from React's DOM types are summarised by element, such as "<button> or <a>", instead
// of listing some 280 attributes; props declared by Base UI are listed with their source. Props
// types that are unions of forms, such as Button's icon-only form, are merged: a prop required in
// only some forms names the prop that selects them, such as `iconOnly` being `true`.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Node, Project, ts } from 'ts-morph';

const root = fileURLToPath(new URL('../', import.meta.url));
const libraryDirectory = resolve(root, 'packages/ui');
const sourceDirectory = resolve(libraryDirectory, 'src');
export const propsFile = resolve(root, 'docs/generated/props.json');

/** Public entry points and the module specifier consumers import them from. */
const entries = [
  ['index.ts', '@envsemble/envui'],
  ['content.ts', '@envsemble/envui/content'],
  ['diff.ts', '@envsemble/envui/diff'],
  ['rich-text.ts', '@envsemble/envui/rich-text'],
  ['theme-bootstrap.ts', '@envsemble/envui/theme-bootstrap'],
  ['dev.ts', '@envsemble/envui/dev'],
];

/** React's per-element attribute interfaces, by the element they describe. */
const attributeElements = {
  AnchorHTMLAttributes: 'a',
  ButtonHTMLAttributes: 'button',
  InputHTMLAttributes: 'input',
  TextareaHTMLAttributes: 'textarea',
  SelectHTMLAttributes: 'select',
  LabelHTMLAttributes: 'label',
  FormHTMLAttributes: 'form',
  ImgHTMLAttributes: 'img',
  LiHTMLAttributes: 'li',
  OlHTMLAttributes: 'ol',
  TableHTMLAttributes: 'table',
  TdHTMLAttributes: 'td',
  ThHTMLAttributes: 'th',
  TimeHTMLAttributes: 'time',
  DetailsHTMLAttributes: 'details',
  DialogHTMLAttributes: 'dialog',
  MeterHTMLAttributes: 'meter',
  ProgressHTMLAttributes: 'progress',
  OutputHTMLAttributes: 'output',
  FieldsetHTMLAttributes: 'fieldset',
  SVGAttributes: 'svg',
};
/** DOM element interfaces, by tag, for props types that only use the generic HTMLAttributes. */
const domElements = {
  HTMLAnchorElement: 'a',
  HTMLButtonElement: 'button',
  HTMLDivElement: 'div',
  HTMLSpanElement: 'span',
  HTMLInputElement: 'input',
  HTMLTextAreaElement: 'textarea',
  HTMLSelectElement: 'select',
  HTMLUListElement: 'ul',
  HTMLOListElement: 'ol',
  HTMLLIElement: 'li',
  HTMLDListElement: 'dl',
  HTMLParagraphElement: 'p',
  HTMLHeadingElement: 'h2',
  HTMLPreElement: 'pre',
  HTMLImageElement: 'img',
  HTMLLabelElement: 'label',
  HTMLFormElement: 'form',
  HTMLTableElement: 'table',
  HTMLTableRowElement: 'tr',
  HTMLTableSectionElement: 'tbody',
  HTMLTableCellElement: 'td',
  HTMLTableCaptionElement: 'caption',
  HTMLTimeElement: 'time',
  HTMLDetailsElement: 'details',
  HTMLDialogElement: 'dialog',
  HTMLElement: 'element',
  SVGSVGElement: 'svg',
};

const posix = (path) => path.split(sep).join('/');
const collapse = (text) => text.replace(/\s+/g, ' ').trim();
/** Type text on one line, without import() qualifiers or the trailing commas of wrapped lists. */
const tidyType = (text) =>
  collapse(text)
    .replace(/import\(['"][^'"]+['"]\)\./g, '')
    .replace(/,\s*([)>\]])/g, '$1')
    .replace(/([(<[])\s+/g, '$1')
    .replace(/\s+([)>\]])/g, '$1');
/** One member of a union, in parentheses when it is a function type. */
const unionMember = (text) => (/=>/.test(text) && !text.startsWith('((') ? `(${text})` : text);

/** Where a declaration comes from: envUI's source, Base UI, or React's DOM types. */
function originOf(declaration) {
  const file = resolve(declaration.getSourceFile().fileName);
  if (!relative(sourceDirectory, file).startsWith('..')) return 'envui';
  if (/[\\/]node_modules[\\/]@base-ui[\\/]/.test(file)) return 'base-ui';
  return 'native';
}

/** The TSDoc of a declaration: its text, @default and @deprecated. */
function documentation(declaration) {
  const docs = ts.getJSDocCommentsAndTags(declaration).filter(ts.isJSDoc);
  const text = (comment) => collapse(ts.getTextOfJSDocComment(comment) ?? '');
  const tags = docs.flatMap((doc) => doc.tags ?? []);
  const tag = (name) => tags.find((item) => item.tagName.text === name);
  const deprecated = tag('deprecated');
  return {
    description: docs
      .map((doc) => text(doc.comment))
      .filter(Boolean)
      .join(' '),
    default: tag('default') ? text(tag('default').comment) : undefined,
    deprecated: deprecated ? text(deprecated.comment) || true : undefined,
  };
}

export function extractProps() {
  const project = new Project({ tsConfigFilePath: resolve(libraryDirectory, 'tsconfig.json') });
  const checker = project.getTypeChecker().compilerObject;
  /** Every name the entry points export, which a default may name as it is. */
  const publicNames = new Set(
    entries.flatMap(([file]) => [
      ...project
        .getSourceFileOrThrow(resolve(sourceDirectory, file))
        .getExportedDeclarations()
        .keys(),
    ]),
  );

  const isUndefinedOnly = (type) =>
    (type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Never)) !== 0 ||
    (type.isUnion() && type.types.every(isUndefinedOnly));
  const withoutUndefined = (type) =>
    type.isUnion() ? type.types.filter((member) => !isUndefinedOnly(member)) : [type];
  const literalText = (type) =>
    type.isStringLiteral()
      ? `'${type.value}'`
      : type.isNumberLiteral()
        ? String(type.value)
        : checker.typeToString(type);

  const keywordTypes = new Set([
    ts.SyntaxKind.BooleanKeyword,
    ts.SyntaxKind.StringKeyword,
    ts.SyntaxKind.NumberKeyword,
    ts.SyntaxKind.NullKeyword,
    ts.SyntaxKind.UndefinedKeyword,
  ]);
  /** The text of a resolved type, such as an instantiated type parameter, without undefined. */
  const resolvedText = (type) => {
    const texts = withoutUndefined(type).map(literalText);
    if (texts.includes('true') && texts.includes('false')) {
      texts.splice(texts.indexOf('true'), 1, 'boolean');
      texts.splice(texts.indexOf('false'), 1);
    }
    return texts.join(' | ');
  };
  /** Whether a type node names a type parameter, such as State in CheckedProps<State>. */
  const isTypeParameter = (node) =>
    node &&
    ts.isTypeReferenceNode(node) &&
    (checker.getSymbolAtLocation(node.typeName)?.flags ?? 0) & ts.SymbolFlags.TypeParameter;

  /**
   * The readable text of a type node: as written, with envUI's own aliases of literal unions, such
   * as ButtonVariant, spelled out as their values, since agents and readers need the values.
   */
  function typeText(node) {
    if (!node) return undefined;
    if (ts.isUnionTypeNode(node)) return node.types.map(typeText).join(' | ');
    if (ts.isParenthesizedTypeNode(node)) return `(${typeText(node.type)})`;
    if (ts.isTypeReferenceNode(node) && !node.typeArguments) {
      const symbol = checker.getSymbolAtLocation(node.typeName);
      const target =
        symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      const alias = target?.declarations?.find(ts.isTypeAliasDeclaration);
      if (alias && originOf(alias) === 'envui') {
        const members = ts.isUnionTypeNode(alias.type) ? alias.type.types : [alias.type];
        const literal = (member) =>
          ts.isLiteralTypeNode(member) ||
          keywordTypes.has(member.kind) ||
          (ts.isTypeReferenceNode(member) && typeText(member) !== member.getText());
        if (members.every(literal)) return typeText(alias.type);
      }
    }
    return tidyType(node.getText());
  }

  /** The function that implements a component, for its destructured defaults. */
  function implementationOf(node, seen = new Set()) {
    if (!node || seen.has(node)) return undefined;
    seen.add(node);
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))
      return node;
    if (ts.isVariableDeclaration(node)) return implementationOf(node.initializer, seen);
    if (
      ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node)
    )
      return implementationOf(node.expression, seen);
    // forwardRef(…), memo(…) and withDisplayName(…) wrap the implementation as their first argument.
    if (ts.isCallExpression(node)) return implementationOf(node.arguments[0], seen);
    if (ts.isIdentifier(node)) {
      const symbol = checker.getSymbolAtLocation(node);
      const target =
        symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      return implementationOf(target?.valueDeclaration ?? target?.declarations?.[0], seen);
    }
    return undefined;
  }

  /** The longest default, as text, that a props table shows in place of a private name. */
  const longestDefault = 200;

  /** The declaration a name refers to, through an import. */
  const declarationOf = (identifier) => {
    const symbol = checker.getSymbolAtLocation(identifier);
    const target =
      symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    return target?.valueDeclaration;
  };
  /** Whether a declaration is envUI's own, rather than the platform's or a dependency's. */
  const isLibrary = (declaration) =>
    !relative(sourceDirectory, declaration.getSourceFile().fileName).startsWith('..');

  /**
   * The text of an expression with each private name in it replaced by what it holds, or
   * undefined when one of them cannot be shown that way.
   */
  function inlined(expression, seen) {
    const replacements = [];
    let unresolved = false;
    const visit = (node) => {
      if (unresolved) return;
      if (ts.isPropertyAccessExpression(node)) {
        visit(node.expression);
        return;
      }
      if (ts.isIdentifier(node)) {
        const declaration = declarationOf(node);
        const inside =
          declaration &&
          declaration.pos >= expression.pos &&
          declaration.end <= expression.end &&
          declaration.getSourceFile() === expression.getSourceFile();
        if (
          !declaration ||
          inside ||
          ts.isParameter(declaration) ||
          // Another prop, as in step = Math.max(1, (max - min) / 10).
          (ts.isBindingElement(declaration) &&
            ts.isParameter(ts.walkUpBindingElementsAndPatterns(declaration))) ||
          !isLibrary(declaration) ||
          publicNames.has(node.text)
        )
          return;
        const text = privateValue(node, declaration, seen);
        if (text === undefined) unresolved = true;
        else replacements.push({ start: node.getStart(), end: node.getEnd(), text });
        return;
      }
      if (ts.isTypeNode(node)) return;
      ts.forEachChild(node, visit);
    };
    visit(expression);
    if (unresolved) return undefined;
    let text = expression.getText();
    const offset = expression.getStart();
    for (const { start, end, text: value } of replacements.sort((a, b) => b.start - a.start))
      text = text.slice(0, start - offset) + value + text.slice(end - offset);
    return collapse(text)
      .replace(/\s+as const$/, '')
      .replace(/([[(])\s+/g, '$1')
      .replace(/,\s*([\])])/g, '$1');
  }

  /**
   * What a private const or one-expression function holds, as text a reader can use. `seen` holds
   * the declarations being resolved around this one, so that a name that refers back to one of them
   * is left unresolved; a helper used twice side by side resolves both times.
   */
  function privateValue(identifier, declaration, seen) {
    if (seen.has(declaration)) return undefined;
    seen.add(declaration);
    try {
      return resolvedValue(declaration, seen);
    } finally {
      seen.delete(declaration);
    }
  }

  function resolvedValue(declaration, seen) {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      ts.getCombinedNodeFlags(declaration) & ts.NodeFlags.Const
    )
      return inlined(declaration.initializer, seen);
    if (ts.isFunctionDeclaration(declaration) && declaration.body) {
      const [statement, ...rest] = declaration.body.statements;
      if (rest.length || !statement || !ts.isReturnStatement(statement) || !statement.expression)
        return undefined;
      const body = inlined(statement.expression, seen);
      const parameters = declaration.parameters.map((parameter) => parameter.getText()).join(', ');
      return body === undefined ? undefined : collapse(`(${parameters}) => ${body}`);
    }
    return undefined;
  }

  /**
   * A default as a reader can use it. A name that envUI does not export reads as the value it holds:
   * 'env-theme' for defaultThemeStorageKey, or an arrow function for a label function, with the
   * private names inside resolved too. A default that cannot be shown that way within
   * longestDefault characters is undefined: the table says the prop has a built-in default rather
   * than name something no reader can import.
   */
  function defaultText(initializer) {
    const text = inlined(initializer, new Set());
    return text !== undefined && text.length <= longestDefault ? text : undefined;
  }

  /** Defaults of the implementation's destructured props, such as variant = 'primary'. */
  function destructuredDefaults(implementation) {
    const defaults = new Map();
    const pattern = implementation?.parameters[0]?.name;
    if (!pattern || !ts.isObjectBindingPattern(pattern)) return defaults;
    for (const element of pattern.elements) {
      if (!element.initializer || element.dotDotDotToken) continue;
      const key = element.propertyName ?? element.name;
      const name = ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : key.getText();
      // A default that cannot be shown, such as a toolbar built from private parts, is built in.
      defaults.set(name, defaultText(element.initializer));
    }
    return defaults;
  }

  /** Intrinsic elements that receive the implementation's rest props, such as <thead {...props}>. */
  function spreadElements(implementation) {
    const pattern = implementation?.parameters[0]?.name;
    const rest =
      pattern && ts.isObjectBindingPattern(pattern)
        ? pattern.elements.find((element) => element.dotDotDotToken)?.name
        : undefined;
    if (!rest || !ts.isIdentifier(rest) || !implementation.body) return [];
    const elements = new Set();
    let component = false;
    const visit = (node) => {
      if (ts.isJsxSpreadAttribute(node) && ts.isIdentifier(node.expression)) {
        if (node.expression.text === rest.text) {
          const tag = node.parent.parent.tagName.getText();
          if (/^[a-z]/.test(tag)) elements.add(tag);
          else component = true;
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(implementation.body);
    // Props that reach another component, such as Button, keep the elements of the props type.
    return component ? [] : [...elements];
  }

  /** The element whose native props a form of the props accepts, such as button. */
  function nativeElement(properties) {
    const elements = new Set();
    for (const { declarations } of properties)
      for (const declaration of declarations) {
        const owner = declaration.parent;
        if (owner && (ts.isInterfaceDeclaration(owner) || ts.isTypeAliasDeclaration(owner))) {
          const element = attributeElements[owner.name.text];
          if (element) elements.add(element);
        }
      }
    if (elements.size) return [...elements];
    // Only the generic attributes: the element type of the ref or of an event handler names it. A
    // ref to any HTMLElement, as Surface's, which render can make any element, names none.
    const text = ['ref', 'onClick']
      .map((probe) => properties.find(({ name }) => name === probe))
      .map((probe) => (probe ? checker.typeToString(probe.type) : ''))
      .join(' ');
    const element = Object.entries(domElements).find(([name]) =>
      new RegExp(`\\b${name}\\b`).test(text),
    );
    if (element) return [element[1]];
    return properties.some(({ origin }) => origin === 'native') ? ['element'] : [];
  }

  /** Props of one component: its own and Base UI's listed, React's DOM props summarised. */
  function componentProps(propsType, implementation) {
    const forms = propsType.isUnion() ? propsType.types : [propsType];
    const byName = new Map();
    const formProperties = forms.map((form, formIndex) =>
      checker.getPropertiesOfType(form).map((symbol) => {
        const declarations = (symbol.declarations ?? []).filter(
          (declaration) => declaration.getSourceFile,
        );
        const type = checker.getTypeOfSymbol(symbol);
        const optional = (symbol.flags & ts.SymbolFlags.Optional) !== 0;
        const property = {
          name: symbol.name,
          symbol,
          declarations,
          type,
          optional,
          absent: isUndefinedOnly(type),
          origin: declarations.length ? originOf(declarations[0]) : 'envui',
          formIndex,
        };
        if (!byName.has(symbol.name)) byName.set(symbol.name, []);
        byName.get(symbol.name).push(property);
        return property;
      }),
    );
    const defaults = destructuredDefaults(implementation);
    // The element the implementation spreads its other props on, such as <thead>, where it is a
    // plain element; otherwise the elements the props type names.
    const spread = spreadElements(implementation);
    const native = spread.length
      ? spread
      : [...new Set(formProperties.flatMap((properties) => nativeElement(properties)))];
    const props = [];
    for (const [name, occurrences] of byName) {
      const present = occurrences.filter((occurrence) => !occurrence.absent);
      if (!present.length) continue;
      // envUI's own declaration wins over the DOM attribute it narrows, such as aria-label.
      const listed =
        present.find((occurrence) =>
          occurrence.declarations.some((d) => originOf(d) === 'envui'),
        ) ??
        present.find((occurrence) =>
          occurrence.declarations.some((d) => originOf(d) === 'base-ui'),
        );
      if (!listed) continue;
      // The documented declaration of any form, such as iconOnly: true, rather than an
      // undocumented one, such as iconOnly?: false.
      const declarations = present.flatMap((occurrence) =>
        occurrence.declarations.filter((d) => originOf(d) !== 'native'),
      );
      const declaration =
        declarations.find((d) => documentation(d).description) ??
        listed.declarations.find((d) => originOf(d) !== 'native');
      const origin = originOf(declaration);
      const { required, requiredWhen } = requirement(name, formProperties);
      const texts = new Set(
        present
          .filter((o) => o.declarations.some((d) => originOf(d) !== 'native'))
          .map((o) => {
            const own = o.declarations.find((d) => originOf(d) !== 'native');
            // A type parameter reads as the type it is instantiated with, such as boolean | 'mixed'.
            if (!own.type || isTypeParameter(own.type)) return resolvedText(o.type);
            return typeText(own.type);
          }),
      );
      // Forms that each allow one boolean value, such as iconOnly?: false and iconOnly: true.
      if (texts.has('boolean') || (texts.has('true') && texts.has('false'))) {
        texts.delete('true');
        texts.delete('false');
        texts.add('boolean');
      }
      // Forms that share members, such as tone?: ButtonTone and tone?: 'neutral' | 'danger', list
      // each member once; a member with brackets of its own, such as a function, stays whole.
      const members = [
        ...new Set(
          [...texts].flatMap((text) => (/[(<{[]/.test(text) ? [text] : text.split(' | '))),
        ),
      ];
      const docs = documentation(declaration);
      const entry = {
        name,
        type: members.length > 1 ? members.map(unionMember).join(' | ') : members[0],
        required,
        ...(requiredWhen && { requiredWhen }),
        ...((docs.default ?? defaults.get(name)) !== undefined && {
          default: docs.default ?? defaults.get(name),
        }),
        ...(docs.default === undefined &&
          defaults.has(name) &&
          defaults.get(name) === undefined && { defaultBuiltIn: true }),
        description: docs.description,
        ...(docs.deprecated !== undefined && { deprecated: docs.deprecated }),
        ...(origin === 'base-ui' && { source: 'base-ui' }),
      };
      props.push(entry);
    }
    return { props, native };
  }

  /**
   * Whether a prop is required. In a union of forms, a prop required in only some of them names
   * what selects those forms: another prop's literal there, such as iconOnly being true; nothing,
   * when the prop selects them itself, such as href; another prop that is set exactly there, such
   * as icon; or the prop that is required in the other forms instead, such as aria-labelledby.
   */
  function requirement(name, formProperties) {
    const find = (properties, candidate) =>
      properties.find((property) => property.name === candidate);
    const requiredForms = (candidate) =>
      new Set(
        formProperties.flatMap((properties, index) => {
          const property = find(properties, candidate);
          return property && !property.optional && !property.absent ? [index] : [];
        }),
      );
    const requiredIn = requiredForms(name);
    const all = formProperties.length;
    if (requiredIn.size === all) return { required: true };
    if (requiredIn.size === 0) return { required: false };
    const code = (text) => '`' + text + '`';
    const literalsOf = (property) =>
      property
        ? withoutUndefined(property.type).filter(
            (member) => member.isLiteral() || member.flags & ts.TypeFlags.BooleanLiteral,
          )
        : [];
    const candidates = [...new Set(formProperties.flat().map((property) => property.name))].filter(
      (candidate) => candidate !== name,
    );
    for (const candidate of candidates) {
      const properties = formProperties.map((properties) => find(properties, candidate));
      const inside = [...requiredIn].map((index) => properties[index]);
      if (!inside.every((property) => property && !property.optional)) continue;
      const values = inside.map((property) => literalsOf(property).map(literalText));
      if (!values.every((members) => members.length === 1 && members[0] === values[0][0])) continue;
      const value = values[0][0];
      const outside = properties.filter((_, index) => !requiredIn.has(index));
      if (
        outside.every(
          (property) => !literalsOf(property).some((member) => literalText(member) === value),
        )
      )
        return { required: false, requiredWhen: `${code(candidate)} is ${code(value)}` };
    }
    // The prop selects its forms itself: elsewhere it is absent, or has none of its values there.
    const own = formProperties.map((properties) => find(properties, name));
    const insideValues = [...requiredIn].map((index) => literalsOf(own[index]).map(literalText));
    const literal = [...requiredIn].every(
      (index, position) =>
        insideValues[position].length > 0 &&
        insideValues[position].length === withoutUndefined(own[index].type).length,
    );
    const values = new Set(insideValues.flat());
    const selects = own.every((property, index) => {
      if (requiredIn.has(index) || !property || property.absent) return true;
      return literal && !literalsOf(property).some((member) => values.has(literalText(member)));
    });
    if (selects) return { required: false };
    for (const candidate of candidates) {
      const properties = formProperties.map((properties) => find(properties, candidate));
      if (
        properties.every((property, index) =>
          requiredIn.has(index)
            ? property && !property.optional && !property.absent
            : !property || property.absent,
        )
      )
        return { required: false, requiredWhen: `${code(candidate)} is set` };
    }
    for (const candidate of candidates) {
      const other = requiredForms(candidate);
      if (
        other.size > 0 &&
        other.size + requiredIn.size === all &&
        [...other].every((index) => !requiredIn.has(index))
      )
        return { required: false, requiredWhen: `${code(candidate)} is not set` };
    }
    return { required: false, requiredWhen: 'in some forms' };
  }

  const exportsByName = new Map();
  function record(name, entry, value) {
    const existing = exportsByName.get(name);
    if (existing) existing.entries.push(entry);
    else exportsByName.set(name, { ...value, entries: [entry] });
  }

  function describe(name, declaration, entry) {
    const node = declaration.compilerNode;
    if (Node.isSourceFile(declaration)) {
      const parts = [];
      for (const [partName, [partDeclaration]] of declaration.getExportedDeclarations()) {
        if (!isRuntime(partDeclaration)) continue;
        parts.push(`${name}.${partName}`);
        describe(`${name}.${partName}`, partDeclaration, entry);
      }
      record(name, entry, {
        kind: 'namespace',
        source: posix(relative(root, declaration.getFilePath())),
        description: '',
        parts,
      });
      return;
    }
    const nameNode = node.name ?? node;
    const type = checker.getTypeAtLocation(nameNode);
    const signature = type.getCallSignatures()[0];
    const implementation = implementationOf(node);
    const statement = ts.isVariableDeclaration(node) ? node.parent.parent : node;
    const description =
      documentation(statement).description ||
      (implementation ? documentation(implementation).description : '');
    const source = posix(relative(root, declaration.getSourceFile().getFilePath()));
    const leaf = name.split('.').pop();
    if (/^[A-Z]/.test(leaf) && signature) {
      const parameter = signature.getParameters()[0];
      const { props, native } = parameter
        ? componentProps(checker.getTypeOfSymbolAtLocation(parameter, nameNode), implementation)
        : { props: [], native: [] };
      record(name, entry, { kind: 'component', source, description, props, native });
    } else if (signature) {
      record(name, entry, {
        kind: 'function',
        source,
        description,
        signature: collapse(
          checker.signatureToString(signature, nameNode, ts.TypeFormatFlags.NoTruncation),
        ),
      });
    }
  }

  function isRuntime(declaration) {
    return (
      Node.isSourceFile(declaration) ||
      Node.isFunctionDeclaration(declaration) ||
      Node.isVariableDeclaration(declaration)
    );
  }

  for (const [file, entry] of entries) {
    const sourceFile = project.getSourceFileOrThrow(resolve(sourceDirectory, file));
    for (const [name, [declaration]] of sourceFile.getExportedDeclarations())
      if (isRuntime(declaration)) describe(name, declaration, entry);
  }
  const sorted = [...exportsByName].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return {
    $comment:
      'Generated by scripts/ExtractProps.mjs from the TypeScript source of the public entry points; do not edit. Run npm run docs:props after changing a public component.',
    exports: Object.fromEntries(sorted),
  };
}

export function serializeProps(props) {
  return `${JSON.stringify(props, null, 2)}\n`;
}

export function readProps() {
  return JSON.parse(readFileSync(propsFile, 'utf8'));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const output = serializeProps(extractProps());
  let current = '';
  try {
    current = readFileSync(propsFile, 'utf8');
  } catch {
    // A missing file differs from any output.
  }
  if (check) {
    if (current !== output) {
      console.error(
        'docs/generated/props.json differs from the TypeScript source. Run `npm run docs:props` and commit the result.',
      );
      process.exit(1);
    }
    console.log('docs/generated/props.json matches the TypeScript source.');
  } else {
    mkdirSync(dirname(propsFile), { recursive: true });
    if (current !== output) writeFileSync(propsFile, output);
    const count = Object.keys(JSON.parse(output).exports).length;
    console.log(`Extracted ${count} public exports into docs/generated/props.json.`);
  }
}
