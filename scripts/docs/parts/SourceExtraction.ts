// The part classes and state attributes the library's TypeScript sets, read with ts-morph: the
// `env-*` literals in class names (`className`, `classNames(…)`, a `class` property, a variable named
// for a class), with `env-x-${value}` expanded over the value's type, and the `data-*` attributes set
// in JSX on an element with a part class, with the values of the attribute's type.
import { relative, resolve } from 'node:path';
import {
  Node,
  Project,
  type JsxAttribute,
  type TemplateExpression,
  type TemplateSpan,
  type Type,
} from 'ts-morph';
import { kebab } from '../Schema.ts';
import {
  isPrivateState,
  libraryDirectory,
  repositoryPath,
  sourceDirectory,
  type StateRecord,
} from './Library.ts';

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
          relative(sourceDirectory, file.getFilePath()),
        ),
    );
  for (const file of files) {
    const path = repositoryPath(file.getFilePath());
    const anchors: (Node | undefined)[] = [];
    file.forEachDescendant((node) => {
      if (Node.isJsxAttribute(node)) {
        const name = node.getNameNode().getText();
        if (isClassName(name) && node.getInitializer()) {
          anchors.push(node.getInitializer());
          const element = node.getParent().getParent()!;
          for (const identifier of node.getInitializer()!.getDescendants())
            if (Node.isIdentifier(identifier))
              for (const declaration of identifier.getSymbol()?.getDeclarations() ?? [])
                if (Node.isVariableDeclaration(declaration))
                  elementsOfVariable.set(
                    declaration,
                    new Set([...(elementsOfVariable.get(declaration) ?? []), element]),
                  );
        } else if (name.startsWith('data-') && !isPrivateState(name)) {
          const element = node.getParent().getParent()!;
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
    const seen = new Set<Node>();
    const add = (name: string, node: Node) => {
      const entry = classes.get(name) ?? { files: new Set<string>() };
      entry.files.add(path);
      classes.set(name, entry);
      for (const element of elementsOf(node)) {
        const set = classesOnElement.get(element) ?? new Set<string>();
        set.add(name);
        classesOnElement.set(element, set);
      }
    };
    for (const anchor of anchors) {
      if (!anchor) continue;
      const pieces = [anchor, ...anchor.getDescendants()];
      for (const node of pieces) {
        if (seen.has(node)) continue;
        seen.add(node);
        let text: string;
        let next: Node | undefined;
        if (
          Node.isStringLiteral(node) ||
          Node.isNoSubstitutionTemplateLiteral(node) ||
          Node.isTemplateTail(node)
        )
          text = node.getLiteralText();
        else if (Node.isTemplateHead(node) || Node.isTemplateMiddle(node)) {
          text = node.getLiteralText();
          // The expression that follows the piece completes a class that ends in `-`.
          if (Node.isTemplateHead(node))
            next = (node.getParent() as TemplateExpression).getTemplateSpans()[0]?.getExpression();
          else {
            const span = node.getParent() as TemplateSpan;
            const spans = (span.getParent() as TemplateExpression).getTemplateSpans();
            next = spans[spans.indexOf(span) + 1]?.getExpression();
          }
        } else continue;
        for (const match of text.matchAll(classPattern)) {
          const [token, dash] = match;
          if (!dash) {
            add(token, node);
            continue;
          }
          const ends = match.index + token.length === text.length;
          const values = ends && next ? literalValues(next.getType()) : undefined;
          if (!values?.size) {
            warnings.push(`${path}: ${token}… takes a value that is not a list of strings`);
            continue;
          }
          for (const value of values) add(`${token}${value}`, node);
        }
      }
    }
  }
  const states: StateRecord[] = [];
  for (const [element, list] of statesOnElement) {
    const names = classesOnElement.get(element);
    if (!names) continue;
    for (const state of list) states.push({ ...state, classes: [...names] });
  }
  // A component's files: its own and the internal modules it imports, so shared anatomy, such as
  // the list row of menus, counts as used by the components that render it.
  const imports = new Map(
    files.map((file) => [
      repositoryPath(file.getFilePath()),
      file
        .getImportDeclarations()
        .map((declaration) => declaration.getModuleSpecifierSourceFile())
        .filter((imported) => imported !== undefined)
        .map((imported) => repositoryPath(imported.getFilePath())),
    ]),
  );
  // The components each file imports as values, by their module: the names it imports, or every
  // export of the module for a namespace import, such as Bar's `import * as Menu`.
  const renders = new Map(
    files.map((file) => [
      repositoryPath(file.getFilePath()),
      file
        .getImportDeclarations()
        .filter(
          (declaration) => !declaration.isTypeOnly() && declaration.getModuleSpecifierSourceFile(),
        )
        .map((declaration) => ({
          source: repositoryPath(declaration.getModuleSpecifierSourceFile()!.getFilePath()),
          names: declaration
            .getNamedImports()
            .filter((specifier) => !specifier.isTypeOnly())
            .map((specifier) => specifier.getName()),
          namespace: declaration.getNamespaceImport() !== undefined,
        })),
    ]),
  );
  return { classes, states, imports, renders, warnings, written, writtenToDataset };
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
