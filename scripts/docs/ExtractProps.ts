// Extracts the props of every public component from the library's TypeScript source into
// docs/generated/props.json, which the documentation build turns into the Props section of each
// page, in the catalogue and in the packaged Markdown.
//
//   node scripts/docs/ExtractProps.ts           rewrite docs/generated/props.json
//   node scripts/docs/ExtractProps.ts --check   fail when it differs from the source
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

const root = fileURLToPath(new URL('../../', import.meta.url));
const libraryDirectory = resolve(root, 'packages/ui');
const sourceDirectory = resolve(libraryDirectory, 'src');
export const propsFile = resolve(root, 'docs/generated/props.json');

/** Public entry points and the module specifier consumers import them from. */
const entries: [file: string, specifier: string][] = [
  ['index.ts', '@envsemble/envui'],
  ['content.ts', '@envsemble/envui/content'],
  ['diff.ts', '@envsemble/envui/diff'],
  ['color.ts', '@envsemble/envui/color'],
  ['rich-text.ts', '@envsemble/envui/rich-text'],
  ['theme-bootstrap.ts', '@envsemble/envui/theme-bootstrap'],
  ['dev.ts', '@envsemble/envui/dev'],
];

/** React's per-element attribute interfaces, by the element they describe. */
const attributeElements: Record<string, string> = {
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
const domElements: Record<string, string> = {
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

const posix = (path: string) => path.split(sep).join('/');
const collapse = (text: string) => text.replace(/\s+/g, ' ').trim();
/** Type text on one line, without import() qualifiers or the trailing commas of wrapped lists. */
const tidyType = (text: string) =>
  collapse(text)
    .replace(/import\(['"][^'"]+['"]\)\./g, '')
    .replace(/,\s*([)>\]])/g, '$1')
    .replace(/([(<[])\s+/g, '$1')
    .replace(/\s+([)>\]])/g, '$1');
/** One member of a union, in parentheses when it is a function type. */
const unionMember = (text: string) =>
  /=>/.test(text) && !text.startsWith('((') ? `(${text})` : text;
const code = (text: string) => '`' + text + '`';

/** Where a declaration comes from: envUI's source, Base UI, or React's DOM types. */
type Origin = 'envui' | 'base-ui' | 'native';

function originOf(declaration: ts.Node): Origin {
  const file = resolve(declaration.getSourceFile().fileName);
  if (!relative(sourceDirectory, file).startsWith('..')) return 'envui';
  if (/[\\/]node_modules[\\/]@base-ui[\\/]/.test(file)) return 'base-ui';
  return 'native';
}

/** Whether a declaration is envUI's own, rather than the platform's or a dependency's. */
const isLibrary = (declaration: ts.Node) =>
  !relative(sourceDirectory, declaration.getSourceFile().fileName).startsWith('..');

/** The TSDoc of a declaration: its text, @default and @deprecated. */
function documentation(declaration: ts.Node) {
  const docs = ts.getJSDocCommentsAndTags(declaration).filter(ts.isJSDoc);
  const text = (comment: ts.JSDoc['comment']) => collapse(ts.getTextOfJSDocComment(comment) ?? '');
  const tags = docs.flatMap((doc) => doc.tags ?? []);
  const tag = (name: string) => tags.find((item) => item.tagName.text === name);
  const deprecated = tag('deprecated');
  return {
    description: docs
      .map((doc) => text(doc.comment))
      .filter(Boolean)
      .join(' '),
    default: tag('default') ? text(tag('default')!.comment) : undefined,
    deprecated: deprecated ? text(deprecated.comment) || true : undefined,
  };
}

const isUndefinedOnly = (type: ts.Type): boolean =>
  (type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Never)) !== 0 ||
  (type.isUnion() && type.types.every(isUndefinedOnly));
const withoutUndefined = (type: ts.Type) =>
  type.isUnion() ? type.types.filter((member) => !isUndefinedOnly(member)) : [type];

const keywordTypes = new Set([
  ts.SyntaxKind.BooleanKeyword,
  ts.SyntaxKind.StringKeyword,
  ts.SyntaxKind.NumberKeyword,
  ts.SyntaxKind.NullKeyword,
  ts.SyntaxKind.UndefinedKeyword,
]);

/** The longest default, as text, that a props table shows in place of a private name. */
const longestDefault = 200;

/** A function that implements a component. */
type Implementation = ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction;

/** A property of one form of a props type, with what componentProps needs of it. */
interface FormProperty {
  name: string;
  declarations: ts.Declaration[];
  type: ts.Type;
  optional: boolean;
  /** Typed undefined or never: the form has no such prop. */
  absent: boolean;
  origin: Origin;
}

/** A prop's record in props.json. */
interface PropRecord {
  name: string;
  type: string | undefined;
  required: boolean;
  requiredWhen?: string;
  default?: string;
  defaultBuiltIn?: true;
  description: string;
  deprecated?: string | boolean;
  source?: 'base-ui';
}

/** An export's record in props.json, without the entry points it comes from. */
type ExportRecord =
  | { kind: 'namespace'; source: string; description: string; parts: string[] }
  | {
      kind: 'component';
      source: string;
      description: string;
      props: PropRecord[];
      native: string[];
    }
  | { kind: 'function'; source: string; description: string; signature: string };

/**
 * Reads the exports of the entry points with the type checker: their kinds, TSDoc and props, each
 * export with the entry points it comes from.
 */
class ExportReader {
  readonly checker: ts.TypeChecker;
  /** Every name the entry points export, which a default may name as it is. */
  readonly publicNames: Set<string>;
  readonly exportsByName = new Map<string, ExportRecord & { entries: string[] }>();

  constructor(checker: ts.TypeChecker, publicNames: Set<string>) {
    this.checker = checker;
    this.publicNames = publicNames;
  }

  // Types ------------------------------------------------------------------------------------

  literalText(type: ts.Type) {
    return type.isStringLiteral()
      ? `'${type.value}'`
      : type.isNumberLiteral()
        ? String(type.value)
        : this.checker.typeToString(type);
  }

  /** The text of a resolved type, such as an instantiated type parameter, without undefined. */
  resolvedText(type: ts.Type) {
    const texts = withoutUndefined(type).map((member) => this.literalText(member));
    if (texts.includes('true') && texts.includes('false')) {
      texts.splice(texts.indexOf('true'), 1, 'boolean');
      texts.splice(texts.indexOf('false'), 1);
    }
    return texts.join(' | ');
  }

  /** Whether a type node names a type parameter, such as State in CheckedProps<State>. */
  isTypeParameter(node: ts.TypeNode) {
    return (
      ts.isTypeReferenceNode(node) &&
      ((this.checker.getSymbolAtLocation(node.typeName)?.flags ?? 0) &
        ts.SymbolFlags.TypeParameter) !==
        0
    );
  }

  /** The symbol a name refers to, through an import. */
  target(node: ts.Node) {
    const symbol = this.checker.getSymbolAtLocation(node);
    return symbol && symbol.flags & ts.SymbolFlags.Alias
      ? this.checker.getAliasedSymbol(symbol)
      : symbol;
  }

  /**
   * The readable text of a type node: as written, with envUI's own aliases of literal unions, such
   * as ButtonVariant, spelled out as their values, since agents and readers need the values.
   */
  typeText(node: ts.TypeNode): string {
    if (ts.isUnionTypeNode(node)) return node.types.map((type) => this.typeText(type)).join(' | ');
    if (ts.isParenthesizedTypeNode(node)) return `(${this.typeText(node.type)})`;
    if (ts.isTypeReferenceNode(node) && !node.typeArguments) {
      const alias = this.target(node.typeName)?.declarations?.find(ts.isTypeAliasDeclaration);
      if (alias && originOf(alias) === 'envui') {
        const members = ts.isUnionTypeNode(alias.type) ? alias.type.types : [alias.type];
        const literal = (member: ts.TypeNode) =>
          ts.isLiteralTypeNode(member) ||
          keywordTypes.has(member.kind) ||
          (ts.isTypeReferenceNode(member) && this.typeText(member) !== member.getText());
        if (members.every(literal)) return this.typeText(alias.type);
      }
    }
    return tidyType(node.getText());
  }

  // Defaults ---------------------------------------------------------------------------------

  /** The function that implements a component, for its destructured defaults. */
  implementationOf(
    node: ts.Node | undefined,
    seen = new Set<ts.Node>(),
  ): Implementation | undefined {
    if (!node || seen.has(node)) return undefined;
    seen.add(node);
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))
      return node;
    if (ts.isVariableDeclaration(node)) return this.implementationOf(node.initializer, seen);
    if (
      ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node)
    )
      return this.implementationOf(node.expression, seen);
    // forwardRef(…), memo(…) and withDisplayName(…) wrap the implementation as their first argument.
    if (ts.isCallExpression(node)) return this.implementationOf(node.arguments[0], seen);
    if (ts.isIdentifier(node)) {
      const target = this.target(node);
      return this.implementationOf(target?.valueDeclaration ?? target?.declarations?.[0], seen);
    }
    return undefined;
  }

  /**
   * The text of an expression with each private name in it replaced by what it holds, or
   * undefined when one of them cannot be shown that way.
   */
  inlined(expression: ts.Expression, seen: Set<ts.Declaration>): string | undefined {
    const replacements: { start: number; end: number; text: string }[] = [];
    let unresolved = false;
    const visit = (node: ts.Node) => {
      if (unresolved) return;
      if (ts.isPropertyAccessExpression(node)) {
        visit(node.expression);
        return;
      }
      if (ts.isIdentifier(node)) {
        const declaration = this.target(node)?.valueDeclaration;
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
          this.publicNames.has(node.text)
        )
          return;
        const text = this.privateValue(declaration, seen);
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
  privateValue(declaration: ts.Declaration, seen: Set<ts.Declaration>) {
    if (seen.has(declaration)) return undefined;
    seen.add(declaration);
    try {
      return this.resolvedValue(declaration, seen);
    } finally {
      seen.delete(declaration);
    }
  }

  resolvedValue(declaration: ts.Declaration, seen: Set<ts.Declaration>) {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      ts.getCombinedNodeFlags(declaration) & ts.NodeFlags.Const
    )
      return this.inlined(declaration.initializer, seen);
    if (ts.isFunctionDeclaration(declaration) && declaration.body) {
      const [statement, ...rest] = declaration.body.statements;
      if (rest.length || !statement || !ts.isReturnStatement(statement) || !statement.expression)
        return undefined;
      const body = this.inlined(statement.expression, seen);
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
  defaultText(initializer: ts.Expression) {
    const text = this.inlined(initializer, new Set());
    return text !== undefined && text.length <= longestDefault ? text : undefined;
  }

  /** Defaults of the implementation's destructured props, such as variant = 'primary'. */
  destructuredDefaults(implementation: Implementation | undefined) {
    const defaults = new Map<string, string | undefined>();
    const pattern = implementation?.parameters[0]?.name;
    if (!pattern || !ts.isObjectBindingPattern(pattern)) return defaults;
    for (const element of pattern.elements) {
      if (!element.initializer || element.dotDotDotToken) continue;
      const key = element.propertyName ?? element.name;
      const name = ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : key.getText();
      // A default that cannot be shown, such as a toolbar built from private parts, is built in.
      defaults.set(name, this.defaultText(element.initializer));
    }
    return defaults;
  }

  // Elements ---------------------------------------------------------------------------------

  /** The element whose native props a form of the props accepts, such as button. */
  nativeElement(properties: FormProperty[]) {
    const elements = new Set<string>();
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
      .map((probe) => (probe ? this.checker.typeToString(probe.type) : ''))
      .join(' ');
    const element = Object.entries(domElements).find(([name]) =>
      new RegExp(`\\b${name}\\b`).test(text),
    );
    if (element) return [element[1]];
    return properties.some(({ origin }) => origin === 'native') ? ['element'] : [];
  }

  // Props ------------------------------------------------------------------------------------

  /** Props of one component: its own and Base UI's listed, React's DOM props summarised. */
  componentProps(propsType: ts.Type, implementation: Implementation | undefined) {
    const forms = propsType.isUnion() ? propsType.types : [propsType];
    const byName = new Map<string, FormProperty[]>();
    const formProperties = forms.map((form) =>
      this.checker.getPropertiesOfType(form).map((symbol) => {
        const declarations = (symbol.declarations ?? []).filter(
          (declaration) => declaration.getSourceFile,
        );
        const type = this.checker.getTypeOfSymbol(symbol);
        const property: FormProperty = {
          name: symbol.name,
          declarations,
          type,
          optional: (symbol.flags & ts.SymbolFlags.Optional) !== 0,
          absent: isUndefinedOnly(type),
          origin: declarations.length ? originOf(declarations[0]!) : 'envui',
        };
        if (!byName.has(symbol.name)) byName.set(symbol.name, []);
        byName.get(symbol.name)!.push(property);
        return property;
      }),
    );
    const defaults = this.destructuredDefaults(implementation);
    // The element the implementation spreads its other props on, such as <thead>, where it is a
    // plain element; otherwise the elements the props type names.
    const spread = spreadElements(implementation);
    const native = spread.length
      ? spread
      : [...new Set(formProperties.flatMap((properties) => this.nativeElement(properties)))];
    const props: PropRecord[] = [];
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
        listed.declarations.find((d) => originOf(d) !== 'native')!;
      const origin = originOf(declaration);
      const { required, requiredWhen } = this.requirement(name, formProperties);
      const texts = new Set<string>(
        present
          .filter((o) => o.declarations.some((d) => originOf(d) !== 'native'))
          .map((o) => {
            const own = o.declarations.find(
              (d) => originOf(d) !== 'native',
            ) as ts.PropertySignature;
            // A type parameter reads as the type it is instantiated with, such as boolean | 'mixed'.
            if (!own.type || this.isTypeParameter(own.type)) return this.resolvedText(o.type);
            return this.typeText(own.type);
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
      const defaultValue = docs.default ?? defaults.get(name);
      props.push({
        name,
        type: members.length > 1 ? members.map(unionMember).join(' | ') : members[0],
        required,
        ...(requiredWhen && { requiredWhen }),
        ...(defaultValue !== undefined && { default: defaultValue }),
        ...(docs.default === undefined &&
          defaults.has(name) &&
          defaults.get(name) === undefined && { defaultBuiltIn: true }),
        description: docs.description,
        ...(docs.deprecated !== undefined && { deprecated: docs.deprecated }),
        ...(origin === 'base-ui' && { source: 'base-ui' }),
      });
    }
    return { props, native };
  }

  /** The literal members of a prop's type, such as true or 'primary'. */
  literalsOf(property: FormProperty | undefined) {
    return property
      ? withoutUndefined(property.type).filter(
          (member) => member.isLiteral() || member.flags & ts.TypeFlags.BooleanLiteral,
        )
      : [];
  }

  /**
   * Whether a prop is required. In a union of forms, a prop required in only some of them names
   * what selects those forms: another prop's literal there, such as iconOnly being true; nothing,
   * when the prop selects them itself, such as href; another prop that is set exactly there, such
   * as icon; or the prop that is required in the other forms instead, such as aria-labelledby.
   */
  requirement(
    name: string,
    formProperties: FormProperty[][],
  ): { required: boolean; requiredWhen?: string } {
    const find = (properties: FormProperty[], candidate: string) =>
      properties.find((property) => property.name === candidate);
    const requiredForms = (candidate: string) =>
      new Set<number>(
        formProperties.flatMap((properties, index): number[] => {
          const property = find(properties, candidate);
          return property && !property.optional && !property.absent ? [index] : [];
        }),
      );
    const requiredIn = requiredForms(name);
    const all = formProperties.length;
    if (requiredIn.size === all) return { required: true };
    if (requiredIn.size === 0) return { required: false };
    const literalTexts = (property: FormProperty | undefined) =>
      this.literalsOf(property).map((member) => this.literalText(member));
    const candidates = [
      ...new Set<string>(formProperties.flat().map((property) => property.name)),
    ].filter((candidate) => candidate !== name);
    for (const candidate of candidates) {
      const properties = formProperties.map((properties) => find(properties, candidate));
      const inside = [...requiredIn].map((index) => properties[index]);
      if (!inside.every((property) => property && !property.optional)) continue;
      const values = inside.map(literalTexts);
      if (!values.every((members) => members.length === 1 && members[0] === values[0]![0]))
        continue;
      const value = values[0]![0]!;
      const outside = properties.filter((_, index) => !requiredIn.has(index));
      if (outside.every((property) => !literalTexts(property).includes(value)))
        return { required: false, requiredWhen: `${code(candidate)} is ${code(value)}` };
    }
    // The prop selects its forms itself: elsewhere it is absent, or has none of its values there.
    const own = formProperties.map((properties) => find(properties, name));
    const insideValues = [...requiredIn].map((index) => literalTexts(own[index]));
    const literal = [...requiredIn].every(
      (index, position) =>
        insideValues[position]!.length > 0 &&
        insideValues[position]!.length === withoutUndefined(own[index]!.type).length,
    );
    const values = new Set(insideValues.flat());
    const selects = own.every((property, index) => {
      if (requiredIn.has(index) || !property || property.absent) return true;
      return literal && !literalTexts(property).some((text) => values.has(text));
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

  // Exports ----------------------------------------------------------------------------------

  record(name: string, entry: string, value: ExportRecord) {
    const existing = this.exportsByName.get(name);
    if (existing) existing.entries.push(entry);
    else this.exportsByName.set(name, { ...value, entries: [entry] });
  }

  /** Records an export: a namespace with its parts, a component with its props, or a function. */
  describe(name: string, declaration: Node, entry: string) {
    if (Node.isSourceFile(declaration)) {
      const parts: string[] = [];
      for (const [partName, [partDeclaration]] of declaration.getExportedDeclarations()) {
        if (!isRuntime(partDeclaration!)) continue;
        parts.push(`${name}.${partName}`);
        this.describe(`${name}.${partName}`, partDeclaration!, entry);
      }
      this.record(name, entry, {
        kind: 'namespace',
        source: posix(relative(root, declaration.getFilePath())),
        description: '',
        parts,
      });
      return;
    }
    const node = declaration.compilerNode;
    const nameNode = (node as ts.NamedDeclaration).name ?? node;
    const type = this.checker.getTypeAtLocation(nameNode);
    const signature = type.getCallSignatures()[0];
    const implementation = this.implementationOf(node);
    const statement = ts.isVariableDeclaration(node) ? node.parent.parent : node;
    const description =
      documentation(statement).description ||
      (implementation ? documentation(implementation).description : '');
    const source = posix(relative(root, declaration.getSourceFile().getFilePath()));
    const leaf = name.split('.').pop()!;
    if (/^[A-Z]/.test(leaf) && signature) {
      const parameter = signature.getParameters()[0];
      const { props, native } = parameter
        ? this.componentProps(
            this.checker.getTypeOfSymbolAtLocation(parameter, nameNode),
            implementation,
          )
        : { props: [], native: [] };
      this.record(name, entry, { kind: 'component', source, description, props, native });
    } else if (signature) {
      this.record(name, entry, {
        kind: 'function',
        source,
        description,
        signature: collapse(
          this.checker.signatureToString(signature, nameNode, ts.TypeFormatFlags.NoTruncation),
        ),
      });
    }
  }
}

/** Intrinsic elements that receive the implementation's rest props, such as <thead {...props}>. */
function spreadElements(implementation: Implementation | undefined) {
  const pattern = implementation?.parameters[0]?.name;
  const rest =
    pattern && ts.isObjectBindingPattern(pattern)
      ? pattern.elements.find((element) => element.dotDotDotToken)?.name
      : undefined;
  if (!rest || !ts.isIdentifier(rest) || !implementation!.body) return [];
  const elements = new Set<string>();
  let component = false;
  const visit = (node: ts.Node) => {
    if (ts.isJsxSpreadAttribute(node) && ts.isIdentifier(node.expression)) {
      if (node.expression.text === rest.text) {
        const tag = node.parent.parent.tagName.getText();
        if (/^[a-z]/.test(tag)) elements.add(tag);
        else component = true;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(implementation!.body);
  // Props that reach another component, such as Button, keep the elements of the props type.
  return component ? [] : [...elements];
}

/** Whether an exported declaration is a value at run time: a module, a function or a variable. */
function isRuntime(declaration: Node) {
  return (
    Node.isSourceFile(declaration) ||
    Node.isFunctionDeclaration(declaration) ||
    Node.isVariableDeclaration(declaration)
  );
}

export function extractProps() {
  const project = new Project({ tsConfigFilePath: resolve(libraryDirectory, 'tsconfig.json') });
  const publicNames = new Set(
    entries.flatMap(([file]) => [
      ...project
        .getSourceFileOrThrow(resolve(sourceDirectory, file))
        .getExportedDeclarations()
        .keys(),
    ]),
  );
  const reader = new ExportReader(project.getTypeChecker().compilerObject, publicNames);
  for (const [file, entry] of entries) {
    const sourceFile = project.getSourceFileOrThrow(resolve(sourceDirectory, file));
    for (const [name, [declaration]] of sourceFile.getExportedDeclarations())
      if (isRuntime(declaration!)) reader.describe(name, declaration!, entry);
  }
  const sorted = [...reader.exportsByName].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return {
    $comment:
      'Generated by scripts/docs/ExtractProps.ts from the TypeScript source of the public entry points; do not edit. Run npm run docs:props after changing a public component.',
    exports: Object.fromEntries(sorted),
  };
}

export function serializeProps(props: unknown) {
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
