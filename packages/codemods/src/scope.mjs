// Lexical scopes for the transforms: which scope declares a name where it is used.
//
// ast-types gives scopes to programs, functions and catch clauses only, and hoists every `let`,
// `const` and `class` to the function around it, so a `const Input` inside a block, a `for` head or
// a `case` read as a declaration of the whole function, or of the file. This module follows the
// language instead: blocks, `for` heads, `switch` cases, class names, type parameters, enums and
// TypeScript namespaces each have their own scope, and a name is looked up in one of the three
// spaces TypeScript keeps apart:
// - `value`: what an expression or JSX element refers to;
// - `type`: what a type reference such as `InputProps` refers to;
// - `namespace`: what the left side of a qualified type name such as `Menu.ItemProps` refers to.
// A `const Menu` hides an imported Menu from `<Menu>` but not from `Menu.ItemProps`, and a local
// `interface Input` hides it from `let field: Input` but not from `<Input />`.

const functionTypes = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassMethod',
  'ClassPrivateMethod',
  'TSDeclareFunction',
  'TSDeclareMethod',
]);

/** Type-level nodes whose type parameters and parameters are in scope inside them. */
const signatureTypes = new Set([
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
  'TSMethodSignature',
  'TSCallSignatureDeclaration',
  'TSConstructSignatureDeclaration',
  'TSFunctionType',
  'TSConstructorType',
]);

/** Statements whose bodies hold nested statements, for finding the `var`s a function hoists. */
const nestedStatements = {
  BlockStatement: ['body'],
  IfStatement: ['consequent', 'alternate'],
  ForStatement: ['init', 'body'],
  ForInStatement: ['left', 'body'],
  ForOfStatement: ['left', 'body'],
  WhileStatement: ['body'],
  DoWhileStatement: ['body'],
  TryStatement: ['block', 'handler', 'finalizer'],
  CatchClause: ['body'],
  SwitchStatement: ['cases'],
  SwitchCase: ['consequent'],
  LabeledStatement: ['body'],
  WithStatement: ['body'],
  ExportNamedDeclaration: ['declaration'],
};

const spaces = () => ({ value: new Set(), type: new Set(), namespace: new Set() });

/** The name of a type parameter: a string in Babel 7, an Identifier in later ASTs. */
const typeParameterName = (parameter) =>
  typeof parameter?.name === 'string' ? parameter.name : parameter?.name?.name;

/** Adds the names a binding pattern declares, as in `{ a, b: [c, ...d] = [] }`, to a set. */
function addPatternNames(pattern, names) {
  if (!pattern) return;
  switch (pattern.type) {
    case 'Identifier':
      names.add(pattern.name);
      break;
    case 'ObjectPattern':
      for (const property of pattern.properties)
        addPatternNames(
          property.type === 'RestElement' ? property.argument : property.value,
          names,
        );
      break;
    case 'ArrayPattern':
      for (const element of pattern.elements) addPatternNames(element, names);
      break;
    case 'AssignmentPattern':
      addPatternNames(pattern.left, names);
      break;
    case 'RestElement':
      addPatternNames(pattern.argument, names);
      break;
    case 'TSParameterProperty':
      addPatternNames(pattern.parameter, names);
      break;
  }
}

/** Whether a namespace declares values, so that its name is a value too. */
function isInstantiated(namespace) {
  const body = namespace.body;
  if (!body) return false;
  if (body.type === 'TSModuleDeclaration') return isInstantiated(body);
  return body.body.some((statement) => {
    const declaration =
      statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (!declaration) return false;
    if (declaration.type === 'TSInterfaceDeclaration') return false;
    if (declaration.type === 'TSTypeAliasDeclaration') return false;
    if (declaration.type === 'TSModuleDeclaration') return isInstantiated(declaration);
    return true;
  });
}

/** Adds what the statements of one block declare for the whole block: `let`, `const`, classes… */
function addLexical(statements, names) {
  for (const statement of statements ?? []) {
    const node =
      statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration'
        ? statement.declaration
        : statement;
    if (!node) continue;
    switch (node.type) {
      case 'VariableDeclaration':
        if (node.kind !== 'var')
          for (const declarator of node.declarations) addPatternNames(declarator.id, names.value);
        break;
      case 'FunctionDeclaration':
      case 'TSDeclareFunction':
        if (node.id) names.value.add(node.id.name);
        break;
      case 'ClassDeclaration':
        if (node.id) {
          names.value.add(node.id.name);
          names.type.add(node.id.name);
        }
        break;
      case 'TSEnumDeclaration':
      case 'TSImportEqualsDeclaration':
        names.value.add(node.id.name);
        names.type.add(node.id.name);
        names.namespace.add(node.id.name);
        break;
      case 'TSModuleDeclaration':
        // `declare global { … }` and `declare module 'name' { … }` declare no name here.
        if (node.id.type !== 'Identifier' || node.global || node.kind === 'global') break;
        names.namespace.add(node.id.name);
        if (isInstantiated(node)) names.value.add(node.id.name);
        break;
      case 'TSInterfaceDeclaration':
      case 'TSTypeAliasDeclaration':
        names.type.add(node.id.name);
        break;
    }
  }
}

/** Adds the `var`s that statements hoist to their function, without entering nested functions. */
function addHoisted(node, names) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const child of node) addHoisted(child, names);
    return;
  }
  if (node.type === 'VariableDeclaration') {
    if (node.kind === 'var')
      for (const declarator of node.declarations) addPatternNames(declarator.id, names.value);
    return;
  }
  for (const field of nestedStatements[node.type] ?? []) addHoisted(node[field], names);
}

/** Adds the type parameters of a generic declaration or signature. */
function addTypeParameters(node, names) {
  for (const parameter of node.typeParameters?.params ?? [])
    names.type.add(typeParameterName(parameter));
}

/** Adds the names that `infer` declares in a conditional type's `extends` clause. */
function addInferred(node, names) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) addInferred(child, names);
    return;
  }
  if (node.type === 'TSInferType') names.type.add(typeParameterName(node.typeParameter));
  // A nested conditional type keeps its own `infer` names.
  if (node.type === 'TSConditionalType') {
    addInferred(node.checkType, names);
    return;
  }
  for (const [key, child] of Object.entries(node))
    if (key !== 'loc' && key !== 'comments' && child && typeof child === 'object')
      addInferred(child, names);
}

/** The field of its parent that holds a path: `body` for the third statement of a block. */
const fieldOf = (path) => (typeof path.name === 'number' ? path.parentPath.name : path.name);

/**
 * Looks names up through the scopes around a path. One instance caches what each scope declares,
 * so it is meant for one parsed file.
 */
export function createScopes() {
  const cache = new WeakMap();

  /** What a scope node declares in each space, whatever child the lookup came from. */
  function declared(node) {
    if (cache.has(node)) return cache.get(node);
    const names = spaces();
    let imports;
    let body;
    switch (node.type) {
      case 'Program':
        imports = new Set();
        for (const statement of node.body)
          if (statement.type === 'ImportDeclaration')
            for (const specifier of statement.specifiers ?? []) imports.add(specifier.local.name);
          else if (
            statement.type === 'TSImportEqualsDeclaration' &&
            statement.moduleReference?.type === 'TSExternalModuleReference'
          )
            // `import ui = require('…')` imports a module as `import * as ui` does.
            imports.add(statement.id.name);
        addLexical(node.body, names);
        addHoisted(node.body, names);
        break;
      case 'BlockStatement':
        addLexical(node.body, names);
        break;
      case 'StaticBlock':
      case 'TSModuleBlock':
        addLexical(node.body, names);
        addHoisted(node.body, names);
        break;
      case 'SwitchStatement':
        for (const switchCase of node.cases) addLexical(switchCase.consequent, names);
        break;
      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement': {
        const head = node.type === 'ForStatement' ? node.init : node.left;
        if (head?.type === 'VariableDeclaration' && head.kind !== 'var')
          for (const declarator of head.declarations) addPatternNames(declarator.id, names.value);
        break;
      }
      case 'CatchClause':
        addPatternNames(node.param, names.value);
        break;
      case 'ClassDeclaration':
      case 'ClassExpression':
        if (node.id) {
          names.value.add(node.id.name);
          names.type.add(node.id.name);
        }
        addTypeParameters(node, names);
        break;
      case 'TSMappedType':
        names.type.add(typeParameterName(node.typeParameter ?? node.key));
        break;
      case 'TSEnumDeclaration':
        // Inside its body, an enum's members are in scope by their names.
        for (const member of node.members ?? node.body?.members ?? [])
          if (member.id?.type === 'Identifier') names.value.add(member.id.name);
        break;
      default:
        if (functionTypes.has(node.type)) {
          for (const parameter of node.params ?? []) addPatternNames(parameter, names.value);
          if (node.type === 'FunctionExpression' && node.id) names.value.add(node.id.name);
          addTypeParameters(node, names);
          // The body's `var`s are in scope for the body only, not for parameter defaults.
          if (node.body?.type === 'BlockStatement') {
            body = spaces();
            addHoisted(node.body.body, body);
          }
        } else if (signatureTypes.has(node.type)) {
          for (const parameter of node.parameters ?? node.params ?? [])
            addPatternNames(parameter, names.value);
          addTypeParameters(node, names);
        }
    }
    const result = { names, imports, body };
    cache.set(node, result);
    return result;
  }

  /** Whether a scope node is in scope for the child a lookup came from. */
  function covers(node, field) {
    if (node.type === 'SwitchStatement') return field === 'cases';
    // Computed keys and decorators are evaluated outside the function or class.
    if (field === 'key' || field === 'decorators') return false;
    return true;
  }

  /**
   * The scope that declares `name` in `space` at `path`: `{ node, imported }`, where `imported`
   * tells that the program declares it by an import, or undefined for a name nothing in the file
   * declares, such as a global.
   */
  function lookup(path, name, space) {
    let child = path;
    for (let current = path.parent; current; child = current, current = current.parent) {
      const { node } = current;
      if (!node || !covers(node, fieldOf(child))) continue;
      if (node.type === 'TSConditionalType') {
        if (fieldOf(child) !== 'trueType') continue;
        const inferred = spaces();
        addInferred(node.extendsType, inferred);
        if (inferred[space].has(name)) return { node, imported: false };
        continue;
      }
      const { names, imports, body } = declared(node);
      if (imports?.has(name)) return { node, imported: true };
      if (names[space].has(name)) return { node, imported: false };
      if (body?.[space].has(name) && fieldOf(child) === 'body') return { node, imported: false };
    }
    return undefined;
  }

  return { lookup };
}
