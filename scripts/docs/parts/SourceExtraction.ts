// The part classes and state attributes the library's TypeScript sets, read with ts-morph: the
// `env-*` literals in class names (`className`, `classNames(…)`, a `class` property, a variable named
// for a class), with `env-x-${value}` expanded over the value's type, and the `data-*` attributes set
// in JSX on an element with a part class, with the values of the attribute's type.
import { relative, resolve } from 'node:path';
import { Node, Project, SyntaxKind, type JsxAttribute, type SourceFile, type Type } from 'ts-morph';
import { kebab } from '../PageStructure.ts';
import { libraryDirectory, librarySourceDirectory } from '../../RepositoryPaths.ts';
import { isPrivateState, repositoryPath, type StateRecord } from './Library.ts';

/** An `env-*` class in a string, not part of a selector, custom property or data attribute. */
const classPattern = /(?<![\w.#-])env-[a-z\d]+(?:-[a-z\d]+)*(-?)/g;
/** Attribute and property names whose values are class names. */
const isClassName = (name: string) => /^(?:class|className|\w+ClassName)$/.test(name);

/** The string values a type can take, or undefined when it takes any string or number. */
function literalValues(type: Type): Set<string> | undefined {
  const values = new Set<string>();
  for (const member of type.isUnion() ? type.getUnionTypes() : [type]) {
    if (member.isUndefined() || member.isNull() || member.isNever()) continue;
    if (member.isStringLiteral() || member.isNumberLiteral())
      values.add(String(member.getLiteralValue()));
    else if (member.isBooleanLiteral()) values.add(member.getText());
    else if (member.isBoolean()) values.add('true').add('false');
    else return undefined;
  }
  return values;
}

/**
 * The part classes and the state attributes the library's TypeScript sets: each class with the
 * files it occurs in, and each element's data attributes with the classes on that element.
 */
export function readSource() {
  const project = new Project({ tsConfigFilePath: resolve(libraryDirectory, 'tsconfig.json') });
  const classes = new Map<string, { files: Set<string> }>();
  const warnings: string[] = [];
  /** The JSX element whose attribute holds a node, if any. */
  const elementOf = (node: Node) => {
    const attribute = node.getFirstAncestor(
      (ancestor) => Node.isJsxAttribute(ancestor) && isClassName(ancestor.getNameNode().getText()),
    );
    return attribute?.getParent()?.getParent();
  };
  const classesOnElement = new Map<Node, Set<string>>();
  const statesOnElement = new Map<Node, StateRecord[]>();
  // Every data attribute each file writes, with its values, wherever it writes it: on an element of
  // another component, in an object of props, or through an element's dataset. They complete the
  // values of a state its parts take, such as a variant set through a component's props.
  const written = new Map<string, Map<string, Set<string> | undefined>>();
  // The same, written through an element's dataset alone, which only the element's own code does.
  const writtenToDataset = new Map<string, Map<string, Set<string> | undefined>>();
  const write = (
    path: string,
    attribute: string,
    values: Set<string> | undefined,
    into = written,
  ) => {
    if (!attribute.startsWith('data-') || isPrivateState(attribute)) return;
    const byAttribute = into.get(path) ?? new Map<string, Set<string> | undefined>();
    const known = byAttribute.get(attribute);
    byAttribute.set(
      attribute,
      byAttribute.has(attribute) && (known === undefined || values === undefined)
        ? undefined
        : new Set([...(known ?? []), ...(values ?? [])]),
    );
    into.set(path, byAttribute);
  };
  // The elements whose class name reads a variable, by the variable's declaration, such as
  // `const className = 'env-x'` before `<span className={className}>`.
  const elementsOfVariable = new Map<Node, Set<Node>>();
  const elementsOf = (node: Node): Node[] => {
    const element = elementOf(node);
    if (element) return [element];
    const declaration = node.getFirstAncestor(Node.isVariableDeclaration);
    return declaration ? [...(elementsOfVariable.get(declaration) ?? [])] : [];
  };
  // Dev mode (dev.ts and dev/) is development tooling: its own UI's classes are no contract.
  const files = project
    .getSourceFiles()
    .filter(
      (file) =>
        !/^dev(?:\.ts$|[\\/])|[\\/](?:generated|icons)[\\/]/.test(
          relative(librarySourceDirectory, file.getFilePath()),
        ),
    );
  for (const file of files) {
    const path = repositoryPath(file.getFilePath());
    const anchors: (Node | undefined)[] = [];
    file.forEachDescendant((node) => {
      if (Node.isJsxAttribute(node)) {
        const name = node.getNameNode().getText();
        const initializer = node.getInitializer();
        if (isClassName(name) && initializer) {
          anchors.push(initializer);
          const element = node.getParent().getParentOrThrow();
          for (const identifier of initializer.getDescendants())
            if (Node.isIdentifier(identifier))
              for (const declaration of identifier.getSymbol()?.getDeclarations() ?? [])
                if (Node.isVariableDeclaration(declaration))
                  elementsOfVariable.set(
                    declaration,
                    new Set([...(elementsOfVariable.get(declaration) ?? []), element]),
                  );
        } else if (name.startsWith('data-') && !isPrivateState(name)) {
          const element = node.getParent().getParentOrThrow();
          const list = statesOnElement.get(element) ?? [];
          list.push({ attribute: name, values: attributeValues(node), path });
          statesOnElement.set(element, list);
        }
        if (name.startsWith('data-')) write(path, name, attributeValues(node));
      } else if (Node.isPropertyAssignment(node) && Node.isStringLiteral(node.getNameNode())) {
        // `{ 'data-variant': variant }`, props spread onto an element or passed to a component.
        const initializer = node.getInitializer();
        if (initializer)
          write(
            path,
            node.getNameNode().getText().slice(1, -1),
            literalValues(initializer.getType()),
          );
      } else if (Node.isBinaryExpression(node) && node.getOperatorToken().getText() === '=') {
        // `row.dataset.moving = mode`.
        const left = node.getLeft();
        if (
          Node.isPropertyAccessExpression(left) &&
          /\.dataset$/.test(left.getExpression().getText())
        )
          write(
            path,
            `data-${kebab(left.getName())}`,
            literalValues(node.getRight().getType()),
            writtenToDataset,
          );
      } else if (Node.isCallExpression(node) && node.getExpression().getText() === 'classNames')
        anchors.push(...node.getArguments());
      else if (Node.isPropertyAssignment(node) && isClassName(node.getName()))
        anchors.push(node.getInitializer());
      else if (
        Node.isVariableDeclaration(node) &&
        /class/i.test(node.getName()) &&
        node.getInitializer()
      )
        anchors.push(node.getInitializer());
    });
    for (const { name, node } of classesIn(anchors, path, warnings)) {
      const entry = classes.get(name) ?? { files: new Set<string>() };
      entry.files.add(path);
      classes.set(name, entry);
      for (const element of elementsOf(node)) {
        const set = classesOnElement.get(element) ?? new Set<string>();
        set.add(name);
        classesOnElement.set(element, set);
      }
    }
  }
  const states: StateRecord[] = [];
  for (const [element, list] of statesOnElement) {
    const names = classesOnElement.get(element);
    if (!names) continue;
    for (const state of list) states.push({ ...state, classes: [...names] });
  }
  return {
    classes,
    states,
    imports: importsOf(files),
    renders: rendersOf(files),
    warnings,
    written,
    writtenToDataset,
  };
}

/**
 * The part classes the strings in and under `anchors` name, each with the node that names it, a
 * class that ends in `-` expanded over the values of the expression that completes it. One whose
 * expression is no list of strings is a warning.
 */
function classesIn(anchors: (Node | undefined)[], path: string, warnings: string[]) {
  const found: { name: string; node: Node }[] = [];
  const seen = new Set<Node>();
  for (const anchor of anchors) {
    if (!anchor) continue;
    for (const node of [anchor, ...anchor.getDescendants()]) {
      if (seen.has(node)) continue;
      seen.add(node);
      const piece = classText(node);
      if (!piece) continue;
      const { text, next } = piece;
      for (const match of text.matchAll(classPattern)) {
        const [token, dash] = match;
        if (!dash) {
          found.push({ name: token, node });
          continue;
        }
        const ends = match.index + token.length === text.length;
        const values = ends && next ? literalValues(next.getType()) : undefined;
        if (!values?.size) {
          warnings.push(`${path}: ${token}… takes a value that is not a list of strings`);
          continue;
        }
        for (const value of values) found.push({ name: `${token}${value}`, node });
      }
    }
  }
  return found;
}

/**
 * The text of a string or template piece that may hold class names, and for a piece followed by
 * an expression, that expression, which completes a class that ends in `-`.
 */
function classText(node: Node): { text: string; next?: Node } | undefined {
  if (
    Node.isStringLiteral(node) ||
    Node.isNoSubstitutionTemplateLiteral(node) ||
    Node.isTemplateTail(node)
  )
    return { text: node.getLiteralText() };
  if (Node.isTemplateHead(node))
    return {
      text: node.getLiteralText(),
      next: node
        .getParentIfKindOrThrow(SyntaxKind.TemplateExpression)
        .getTemplateSpans()[0]
        ?.getExpression(),
    };
  if (Node.isTemplateMiddle(node)) {
    const span = node.getParentIfKindOrThrow(SyntaxKind.TemplateSpan);
    const spans = span.getParentIfKindOrThrow(SyntaxKind.TemplateExpression).getTemplateSpans();
    return { text: node.getLiteralText(), next: spans[spans.indexOf(span) + 1]?.getExpression() };
  }
  return undefined;
}

/**
 * The library modules each file imports, by the file: a component's files are its own and the
 * internal modules it imports, so shared anatomy, such as the list row of menus, counts as used by
 * the components that render it.
 */
function importsOf(files: SourceFile[]) {
  return new Map(
    files.map((file) => [
      repositoryPath(file.getFilePath()),
      file
        .getImportDeclarations()
        .map((declaration) => declaration.getModuleSpecifierSourceFile())
        .filter((imported) => imported !== undefined)
        .map((imported) => repositoryPath(imported.getFilePath())),
    ]),
  );
}

/**
 * The components each file imports as values, by their module: the names it imports, or every
 * export of the module for a namespace import, such as Bar's `import * as Menu`.
 */
function rendersOf(files: SourceFile[]) {
  return new Map(
    files.map((file) => [
      repositoryPath(file.getFilePath()),
      file.getImportDeclarations().flatMap((declaration) => {
        const imported = declaration.getModuleSpecifierSourceFile();
        if (declaration.isTypeOnly() || !imported) return [];
        return [
          {
            source: repositoryPath(imported.getFilePath()),
            names: declaration
              .getNamedImports()
              .filter((specifier) => !specifier.isTypeOnly())
              .map((specifier) => specifier.getName()),
            namespace: declaration.getNamespaceImport() !== undefined,
          },
        ];
      }),
    ]),
  );
}

/** The values a JSX data attribute takes: its literal, or the string values of its type. */
function attributeValues(attribute: JsxAttribute): Set<string> | undefined {
  const initializer = attribute.getInitializer();
  // `<div data-open>` renders data-open="true".
  if (!initializer) return new Set(['true']);
  if (Node.isStringLiteral(initializer)) return new Set([initializer.getLiteralText()]);
  const expression = Node.isJsxExpression(initializer) ? initializer.getExpression() : undefined;
  return expression ? literalValues(expression.getType()) : undefined;
}
