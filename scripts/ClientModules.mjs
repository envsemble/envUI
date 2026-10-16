// Which of the library's modules are client modules for React Server Components, by what they
// use: React hooks, createContext and createPortal, Base UI's parts (client modules of their own),
// functions the module creates and hands to an element or component, or class components. Each
// such module starts with 'use client', as Base UI's parts do; the entry points and the
// `export * as` lines in them carry no directive, so a server component imports Menu.Item through
// them as a client reference. Everything else, such as Badge, Card or Text, stays a module a server
// component renders itself.
//
// The reading is type-aware: a handler passed by name (`onMouseDown={focusControl}`), one in a
// spread object or in createElement's props, and a hook imported under another name all count,
// while a function the module only passes on from its own props does not, since a server parent
// cannot have given it one. A module that needs the directive for a reason this cannot see says
// so in a comment, `// @client-module <why>`, which the check reads as its reason.
//
//   node scripts/ClientModules.mjs           add the directive where a module needs it
//   node scripts/ClientModules.mjs --check   fail when a module lacks it or has it without need
//
// tests/ClientDirectives.test.mjs runs the check, and checks the built dist and a server render.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const sourceDirectory = resolve(repositoryRoot, 'packages/ui/src');
const configFile = resolve(repositoryRoot, 'packages/ui/tsconfig.json');

/** The directive, as the modules write it. */
export const directive = "'use client';";

/**
 * The comment that gives a module the directive for a reason the reading cannot see, tested on the
 * module's comments only, so that the words in a string don't count.
 */
const annotation = /(?:\/\/|\/\*+|^\s*\*)\s*@client-module\b[ \t:—-]*([^\n]*?)\s*(?:\*\/)?$/m;

/** The text of every comment in a source file. */
function commentsOf(sourceFile) {
  const text = sourceFile.getFullText();
  const seen = new Set();
  const comments = [];
  const collect = (ranges) => {
    for (const range of ranges ?? [])
      if (!seen.has(range.pos)) {
        seen.add(range.pos);
        comments.push(text.slice(range.pos, range.end));
      }
  };
  const visit = (node) => {
    collect(ts.getLeadingCommentRanges(text, node.getFullStart()));
    collect(ts.getTrailingCommentRanges(text, node.getEnd()));
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  collect(ts.getLeadingCommentRanges(text, sourceFile.endOfFileToken.getFullStart()));
  return comments;
}

/** Calls that only work in the browser's React: createContext and react-dom's createPortal. */
const clientCalls = new Set(['createContext', 'createPortal']);
/** Calls whose second argument is an element's props. */
const elementCalls = new Set(['createElement', 'cloneElement', 'jsx', 'jsxs', 'jsxDEV']);

/** Whether a source file starts with the 'use client' directive. */
export function hasClientDirective(sourceFile) {
  const [first] = sourceFile.statements;
  return Boolean(
    first &&
      ts.isExpressionStatement(first) &&
      ts.isStringLiteral(first.expression) &&
      first.expression.text === 'use client',
  );
}

/** An expression without the parentheses, `as`, `satisfies` and `!` around it. */
function skipOuter(node) {
  let current = node;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current) ||
    ts.isTypeAssertionExpression(current)
  )
    current = current.expression;
  return current;
}

/** Whether a declaration is a parameter, or a name destructured from one. */
function isParameter(declaration) {
  let node = declaration;
  while (ts.isBindingElement(node)) node = node.parent.parent;
  return ts.isParameter(node);
}

/**
 * Reads one module's reasons with a type checker, or by syntax alone without one, in which case a
 * handler is only seen when it is written inline.
 */
function createReader(checker) {
  /** The declaration a name refers to, through an import or not. */
  const declarationOf = (identifier) => {
    const symbol = checker?.getSymbolAtLocation(identifier);
    return symbol?.valueDeclaration ?? symbol?.declarations?.[0];
  };

  /** Whether a value's type can be called: a function, or a union with one. */
  const isCallable = (node) => {
    if (!checker) return false;
    const type = checker.getNonNullableType(checker.getTypeAtLocation(node));
    const types = type.isUnion() ? type.types : [type];
    return types.some((member) => member.getCallSignatures().length > 0);
  };

  /** Whether an expression only passes on what a parameter of a function holds. */
  const isPassedOn = (node, seen = new Set()) => {
    const expression = skipOuter(node);
    if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression))
      return isPassedOn(expression.expression, seen);
    if (!ts.isIdentifier(expression)) return false;
    const declaration = declarationOf(expression);
    if (!declaration || seen.has(declaration)) return false;
    seen.add(declaration);
    if (isParameter(declaration)) return true;
    let variable = declaration;
    while (ts.isBindingElement(variable)) variable = variable.parent.parent;
    return Boolean(
      ts.isVariableDeclaration(variable) &&
        variable.initializer &&
        isPassedOn(variable.initializer, seen),
    );
  };

  /** Whether an expression is a function that this module creates, rather than one passed on. */
  const createsFunction = (node, seen = new Set()) => {
    const expression = skipOuter(node);
    if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) return true;
    // A function made only when the parent passed one, as in `onSelect && (() => onSelect(item))`
    // or `!onSelect ? undefined : () => onSelect(item)`, is never made under a server parent,
    // which cannot pass functions.
    const guarded = (test) => isCallable(test) && isPassedOn(test);
    const negated = (test) => {
      const condition = skipOuter(test);
      return (
        ts.isPrefixUnaryExpression(condition) &&
        condition.operator === ts.SyntaxKind.ExclamationToken &&
        guarded(condition.operand)
      );
    };
    if (ts.isConditionalExpression(expression))
      return (
        (!guarded(expression.condition) && createsFunction(expression.whenTrue, seen)) ||
        (!negated(expression.condition) && createsFunction(expression.whenFalse, seen))
      );
    if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
    )
      return !guarded(expression.left) && createsFunction(expression.right, seen);
    if (
      ts.isBinaryExpression(expression) &&
      [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(
        expression.operatorToken.kind,
      )
    )
      return createsFunction(expression.left, seen) || createsFunction(expression.right, seen);
    if (!isCallable(expression) || isPassedOn(expression)) return false;
    if (ts.isIdentifier(expression)) {
      const declaration = declarationOf(expression);
      // A const counts as what it holds: a function it makes, or one only passed on.
      if (
        declaration &&
        ts.isVariableDeclaration(declaration) &&
        declaration.initializer &&
        !seen.has(declaration)
      ) {
        seen.add(declaration);
        return createsFunction(declaration.initializer, seen);
      }
    }
    return true;
  };

  /** Whether props, as an object literal or a variable holding one, carry a function. */
  const propsCarryFunction = (node, seen = new Set()) => {
    const expression = skipOuter(node);
    if (ts.isObjectLiteralExpression(expression))
      return expression.properties.some((property) => {
        if (ts.isPropertyAssignment(property)) return createsFunction(property.initializer);
        // `{ onClick }` holds the value of the variable it names, which may only pass a prop on.
        if (ts.isShorthandPropertyAssignment(property)) {
          const value = checker?.getShorthandAssignmentValueSymbol(property);
          const declaration = value?.valueDeclaration ?? value?.declarations?.[0];
          if (declaration && isParameter(declaration)) return false;
          if (
            declaration &&
            ts.isVariableDeclaration(declaration) &&
            declaration.initializer &&
            !seen.has(declaration)
          ) {
            seen.add(declaration);
            return createsFunction(declaration.initializer, seen);
          }
          return checker ? isCallable(property.name) : true;
        }
        if (ts.isSpreadAssignment(property)) return propsCarryFunction(property.expression, seen);
        return true; // methods and accessors
      });
    if (ts.isConditionalExpression(expression))
      return (
        propsCarryFunction(expression.whenTrue, seen) ||
        propsCarryFunction(expression.whenFalse, seen)
      );
    if (ts.isIdentifier(expression)) {
      const declaration = declarationOf(expression);
      if (
        declaration &&
        ts.isVariableDeclaration(declaration) &&
        declaration.initializer &&
        !seen.has(declaration)
      ) {
        seen.add(declaration);
        return propsCarryFunction(declaration.initializer, seen);
      }
    }
    return false;
  };

  /** The name a call is made by: its imported name for an aliased import, as useState for state. */
  const calleeName = (call) => {
    const callee = skipOuter(call.expression);
    const identifier = ts.isPropertyAccessExpression(callee)
      ? callee.name
      : ts.isIdentifier(callee)
        ? callee
        : undefined;
    if (!identifier) return undefined;
    const declaration = checker?.getSymbolAtLocation(identifier)?.declarations?.[0];
    if (declaration && (ts.isImportSpecifier(declaration) || ts.isBindingElement(declaration)))
      return (declaration.propertyName ?? declaration.name).getText();
    return identifier.text;
  };

  /** What makes a module a client module, as reasons; none for a module a server can render. */
  return function clientReasons(sourceFile) {
    const reasons = new Set();
    const marked = commentsOf(sourceFile)
      .map((comment) => annotation.exec(comment))
      .find(Boolean);
    if (marked) reasons.add(`is marked @client-module${marked[1] ? `: ${marked[1]}` : ''}`);
    const visit = (node) => {
      if (
        ts.isImportDeclaration(node) &&
        !node.importClause?.isTypeOnly &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text.startsWith('@base-ui/')
      )
        reasons.add(`imports ${node.moduleSpecifier.text}`);
      if (ts.isCallExpression(node)) {
        const name = calleeName(node);
        const written = skipOuter(node.expression).getText();
        // Hooks are use followed by a capital; React's `use()` also works on the server.
        if (name && /^use[A-Z]/.test(name))
          reasons.add(name === written ? `calls ${name}` : `calls ${name} as ${written}`);
        if (name && clientCalls.has(name)) reasons.add(`calls ${name}`);
        if (
          name &&
          elementCalls.has(name) &&
          node.arguments[1] &&
          propsCarryFunction(node.arguments[1])
        )
          reasons.add(`passes a function to ${name}`);
      }
      if (
        ts.isJsxAttribute(node) &&
        node.initializer &&
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression &&
        createsFunction(node.initializer.expression)
      )
        reasons.add(`passes a function to ${node.name.getText()}`);
      if (ts.isJsxSpreadAttribute(node) && propsCarryFunction(node.expression))
        reasons.add(`spreads a function into ${node.parent.parent.tagName.getText()}`);
      if (
        ts.isClassDeclaration(node) &&
        node.heritageClauses?.some((clause) => /\b(?:Pure)?Component\b/.test(clause.getText()))
      )
        reasons.add('is a class component');
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return [...reasons];
  };
}

/**
 * What makes a module a client module, as reasons; none for a module a server can render. With a
 * type checker for the program the file belongs to, handlers passed by name count too.
 */
export function clientReasons(sourceFile, checker) {
  return createReader(checker)(sourceFile);
}

/** A program of the library's source, read with its tsconfig, and its type checker. */
function libraryProgram(paths) {
  const config = ts.getParsedCommandLineOfConfigFile(
    configFile,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      },
    },
  );
  const program = ts.createProgram({
    rootNames: paths,
    options: { ...config.options, noEmit: true },
  });
  return { program, checker: program.getTypeChecker() };
}

/**
 * The reasons of a module given as source text, read in a program of its own with the library's
 * options; for tests of the reading.
 */
export function clientReasonsOf(text, fileName = join(sourceDirectory, 'Example.tsx')) {
  const path = resolve(fileName);
  const host = ts.createCompilerHost({});
  const readFile = host.readFile.bind(host);
  const getSourceFile = host.getSourceFile.bind(host);
  host.readFile = (file) => (resolve(file) === path ? text : readFile(file));
  host.fileExists = (
    (exists) => (file) =>
      resolve(file) === path || exists(file)
  )(host.fileExists.bind(host));
  host.getSourceFile = (file, languageVersion, ...rest) =>
    resolve(file) === path
      ? ts.createSourceFile(file, text, languageVersion, true)
      : getSourceFile(file, languageVersion, ...rest);
  const config = ts.getParsedCommandLineOfConfigFile(
    configFile,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: () => {},
    },
  );
  const program = ts.createProgram({
    rootNames: [path],
    options: { ...config.options, noEmit: true },
    host,
  });
  const sourceFile = program.getSourceFiles().find((file) => resolve(file.fileName) === path);
  return clientReasons(sourceFile, program.getTypeChecker());
}

/** Every library module, the generated icons included, with whether it needs and has the directive. */
export async function libraryModules() {
  const entries = await readdir(sourceDirectory, { recursive: true, withFileTypes: true });
  const files = entries
    .filter(
      (entry) => entry.isFile() && /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts'),
    )
    .map((entry) => join(entry.parentPath, entry.name));
  const { program, checker } = libraryProgram(files);
  const read = createReader(checker);
  const modules = [];
  for (const path of files) {
    const file = relative(sourceDirectory, path).split('\\').join('/');
    const text = await readFile(path, 'utf8');
    const sourceFile = program.getSourceFile(path);
    modules.push({
      file,
      path,
      text,
      reasons: read(sourceFile),
      client: hasClientDirective(sourceFile),
    });
  }
  return modules.sort((a, b) => a.file.localeCompare(b.file));
}

async function main() {
  const check = process.argv.includes('--check');
  const modules = await libraryModules();
  const missing = modules.filter((module) => module.reasons.length > 0 && !module.client);
  const needless = modules.filter((module) => module.reasons.length === 0 && module.client);
  if (check) {
    for (const module of missing)
      console.error(`${module.file} ${module.reasons[0]}: start it with ${directive}`);
    for (const module of needless)
      console.error(
        `${module.file} uses nothing client-only that the check can see: remove ${directive}, or say why in a // @client-module comment`,
      );
    if (missing.length + needless.length > 0) process.exitCode = 1;
    else console.log(`${modules.filter((module) => module.client).length} client modules.`);
    return;
  }
  // The icons are generated: scripts/GenerateIcons.mjs writes their directive.
  const generated = [...missing, ...needless].filter((module) => module.file.startsWith('icons/'));
  if (generated.length > 0)
    throw new Error(
      `${generated[0].file} and ${generated.length - 1} more icons: run npm run icons:generate.`,
    );
  for (const module of missing) await writeFile(module.path, `${directive}\n\n${module.text}`);
  for (const module of needless)
    await writeFile(module.path, module.text.replace(/^'use client';\r?\n(?:\r?\n)?/, ''));
  console.log(`Added ${missing.length} and removed ${needless.length} directives.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
