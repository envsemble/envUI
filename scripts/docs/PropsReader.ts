import { relative, resolve } from 'node:path';
import { Node, ts } from 'ts-morph';
import { librarySourceDirectory, repositoryPath } from '../RepositoryPaths.ts';

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

const collapse = (text: string) => text.replace(/\s+/g, ' ').trim();
const tidyType = (text: string) =>
  collapse(text)
    .replace(/import\(['"][^'"]+['"]\)\./g, '')
    .replace(/,\s*([)>\]])/g, '$1')
    .replace(/([(<[])\s+/g, '$1')
    .replace(/\s+([)>\]])/g, '$1');
const unionMember = (text: string) =>
  /=>/.test(text) && !text.startsWith('((') ? `(${text})` : text;
const code = (text: string) => '`' + text + '`';

type Origin = 'envui' | 'base-ui' | 'native';

function originOf(declaration: ts.Node): Origin {
  const file = resolve(declaration.getSourceFile().fileName);
  if (!relative(librarySourceDirectory, file).startsWith('..')) return 'envui';
  if (/[\\/]node_modules[\\/]@base-ui[\\/]/.test(file)) return 'base-ui';
  return 'native';
}

const isLibrary = (declaration: ts.Node) =>
  !relative(librarySourceDirectory, declaration.getSourceFile().fileName).startsWith('..');

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

const longestDefault = 200;

type Implementation = ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction;

interface FormProperty {
  name: string;
  declarations: ts.Declaration[];
  type: ts.Type;
  optional: boolean;
  absent: boolean;
  origin: Origin;
}

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

export class PropsReader {
  readonly checker: ts.TypeChecker;
  readonly publicNames: Set<string>;
  readonly exportsByName = new Map<string, ExportRecord & { entries: string[] }>();

  constructor(checker: ts.TypeChecker, publicNames: Set<string>) {
    this.checker = checker;
    this.publicNames = publicNames;
  }

  literalText(type: ts.Type) {
    return type.isStringLiteral()
      ? `'${type.value}'`
      : type.isNumberLiteral()
        ? String(type.value)
        : this.checker.typeToString(type);
  }

  resolvedText(type: ts.Type) {
    const texts = withoutUndefined(type).map((member) => this.literalText(member));
    if (texts.includes('true') && texts.includes('false')) {
      texts.splice(texts.indexOf('true'), 1, 'boolean');
      texts.splice(texts.indexOf('false'), 1);
    }
    return texts.join(' | ');
  }

  isTypeParameter(node: ts.TypeNode) {
    return (
      ts.isTypeReferenceNode(node) &&
      ((this.checker.getSymbolAtLocation(node.typeName)?.flags ?? 0) &
        ts.SymbolFlags.TypeParameter) !==
        0
    );
  }

  target(node: ts.Node) {
    const symbol = this.checker.getSymbolAtLocation(node);
    return symbol && symbol.flags & ts.SymbolFlags.Alias
      ? this.checker.getAliasedSymbol(symbol)
      : symbol;
  }

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
    if (ts.isCallExpression(node)) return this.implementationOf(node.arguments[0], seen);
    if (ts.isIdentifier(node)) {
      const target = this.target(node);
      return this.implementationOf(target?.valueDeclaration ?? target?.declarations?.[0], seen);
    }
    return undefined;
  }

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

  defaultText(initializer: ts.Expression) {
    const text = this.inlined(initializer, new Set());
    return text !== undefined && text.length <= longestDefault ? text : undefined;
  }

  destructuredDefaults(implementation: Implementation | undefined) {
    const defaults = new Map<string, string | undefined>();
    const pattern = implementation?.parameters[0]?.name;
    if (!pattern || !ts.isObjectBindingPattern(pattern)) return defaults;
    for (const element of pattern.elements) {
      if (!element.initializer || element.dotDotDotToken) continue;
      const key = element.propertyName ?? element.name;
      const name = ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : key.getText();
      defaults.set(name, this.defaultText(element.initializer));
    }
    return defaults;
  }

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
          origin: declarations.length ? originOf(declarations[0]) : 'envui',
        };
        if (!byName.has(symbol.name)) byName.set(symbol.name, []);
        byName.get(symbol.name)!.push(property);
        return property;
      }),
    );
    const defaults = this.destructuredDefaults(implementation);
    const spread = spreadElements(implementation);
    const native = spread.length
      ? spread
      : [...new Set(formProperties.flatMap((properties) => this.nativeElement(properties)))];
    const props: PropRecord[] = [];
    for (const [name, occurrences] of byName) {
      const present = occurrences.filter((occurrence) => !occurrence.absent);
      if (!present.length) continue;
      const listed =
        present.find((occurrence) =>
          occurrence.declarations.some((d) => originOf(d) === 'envui'),
        ) ??
        present.find((occurrence) =>
          occurrence.declarations.some((d) => originOf(d) === 'base-ui'),
        );
      if (!listed) continue;
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
            if (!own.type || this.isTypeParameter(own.type)) return this.resolvedText(o.type);
            return this.typeText(own.type);
          }),
      );
      if (texts.has('boolean') || (texts.has('true') && texts.has('false'))) {
        texts.delete('true');
        texts.delete('false');
        texts.add('boolean');
      }
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

  literalsOf(property: FormProperty | undefined) {
    return property
      ? withoutUndefined(property.type).filter(
          (member) => member.isLiteral() || member.flags & ts.TypeFlags.BooleanLiteral,
        )
      : [];
  }

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
      if (!values.every((members) => members.length === 1 && members[0] === values[0][0])) continue;
      const value = values[0][0];
      const outside = properties.filter((_, index) => !requiredIn.has(index));
      if (outside.every((property) => !literalTexts(property).includes(value)))
        return { required: false, requiredWhen: `${code(candidate)} is ${code(value)}` };
    }
    const own = formProperties.map((properties) => find(properties, name));
    const insideValues = [...requiredIn].map((index) => literalTexts(own[index]));
    const literal = [...requiredIn].every(
      (index, position) =>
        insideValues[position].length > 0 &&
        insideValues[position].length === withoutUndefined(own[index]!.type).length,
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

  record(name: string, entry: string, value: ExportRecord) {
    const existing = this.exportsByName.get(name);
    if (existing) existing.entries.push(entry);
    else this.exportsByName.set(name, { ...value, entries: [entry] });
  }

  describe(name: string, declaration: Node, entry: string) {
    if (Node.isSourceFile(declaration)) {
      const parts: string[] = [];
      for (const [partName, [partDeclaration]] of declaration.getExportedDeclarations()) {
        if (!isRuntime(partDeclaration)) continue;
        parts.push(`${name}.${partName}`);
        this.describe(`${name}.${partName}`, partDeclaration, entry);
      }
      this.record(name, entry, {
        kind: 'namespace',
        source: repositoryPath(declaration.getFilePath()),
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
    const source = repositoryPath(declaration.getSourceFile().getFilePath());
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
  return component ? [] : [...elements];
}

export function isRuntime(declaration: Node) {
  return (
    Node.isSourceFile(declaration) ||
    Node.isFunctionDeclaration(declaration) ||
    Node.isVariableDeclaration(declaration)
  );
}
