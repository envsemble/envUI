import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { libraryDirectory, librarySourceDirectory } from '../RepositoryPaths.ts';

const configFile = resolve(libraryDirectory, 'tsconfig.json');

const directive = "'use client';";

const annotation = /(?:\/\/|\/\*+|^\s*\*)\s*@client-module\b[ \t:—-]*([^\n]*?)\s*(?:\*\/)?$/m;

function commentsOf(sourceFile: ts.SourceFile) {
  const text = sourceFile.getFullText();
  const seen = new Set<number>();
  const comments: string[] = [];
  const collect = (ranges: ts.CommentRange[] | undefined) => {
    for (const range of ranges ?? [])
      if (!seen.has(range.pos)) {
        seen.add(range.pos);
        comments.push(text.slice(range.pos, range.end));
      }
  };
  const visit = (node: ts.Node) => {
    collect(ts.getLeadingCommentRanges(text, node.getFullStart()));
    collect(ts.getTrailingCommentRanges(text, node.getEnd()));
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  collect(ts.getLeadingCommentRanges(text, sourceFile.endOfFileToken.getFullStart()));
  return comments;
}

const clientHookName = /^use[A-Z]/;

const clientCalls = new Set(['createContext', 'createPortal']);
const elementCalls = new Set(['createElement', 'cloneElement', 'jsx', 'jsxs', 'jsxDEV']);

function hasClientDirective(sourceFile: ts.SourceFile) {
  const [first] = sourceFile.statements;
  return Boolean(
    first &&
    ts.isExpressionStatement(first) &&
    ts.isStringLiteral(first.expression) &&
    first.expression.text === 'use client',
  );
}

function skipOuter(node: ts.Expression) {
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

function createReader(checker: ts.TypeChecker | undefined) {
  const declarationOf = (identifier: ts.Node) => {
    const symbol = checker?.getSymbolAtLocation(identifier);
    return symbol?.valueDeclaration ?? symbol?.declarations?.[0];
  };

  const initializerOf = (declaration: ts.Node | undefined, seen: Set<ts.Node>) => {
    if (!declaration || !ts.isVariableDeclaration(declaration) || !declaration.initializer) return;
    if (seen.has(declaration)) return;
    seen.add(declaration);
    return declaration.initializer;
  };

  const isCallable = (node: ts.Node) => {
    if (!checker) return false;
    const type = checker.getNonNullableType(checker.getTypeAtLocation(node));
    const types = type.isUnion() ? type.types : [type];
    return types.some((member) => member.getCallSignatures().length > 0);
  };

  const isPassedOn = (node: ts.Expression, seen = new Set<ts.Node>()): boolean => {
    const expression = skipOuter(node);
    if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression))
      return isPassedOn(expression.expression, seen);
    return ts.isIdentifier(expression) && holdsPassedOn(declarationOf(expression), seen);
  };

  const holdsPassedOn = (declaration: ts.Node | undefined, seen = new Set<ts.Node>()): boolean => {
    if (!declaration || seen.has(declaration)) return false;
    seen.add(declaration);
    const makesDefault = (node: ts.BindingElement | ts.ParameterDeclaration): boolean =>
      Boolean(node.initializer && createsFunction(node.initializer));
    let variable: ts.Node = declaration;
    while (ts.isBindingElement(variable)) {
      if (makesDefault(variable)) return false;
      variable = variable.parent.parent;
    }
    if (ts.isParameter(variable)) return !makesDefault(variable);
    return Boolean(
      ts.isVariableDeclaration(variable) &&
      variable.initializer &&
      isPassedOn(variable.initializer, seen),
    );
  };

  const createsFunction = (node: ts.Expression, seen = new Set<ts.Node>()): boolean => {
    const expression = skipOuter(node);
    if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) return true;
    const madeOnlyWhenParentPassesOne = (test: ts.Expression): boolean =>
      isCallable(test) && isPassedOn(test);
    const negated = (test: ts.Expression) => {
      const condition = skipOuter(test);
      return (
        ts.isPrefixUnaryExpression(condition) &&
        condition.operator === ts.SyntaxKind.ExclamationToken &&
        madeOnlyWhenParentPassesOne(condition.operand)
      );
    };
    if (ts.isConditionalExpression(expression))
      return (
        (!madeOnlyWhenParentPassesOne(expression.condition) &&
          createsFunction(expression.whenTrue, seen)) ||
        (!negated(expression.condition) && createsFunction(expression.whenFalse, seen))
      );
    if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
    )
      return (
        !madeOnlyWhenParentPassesOne(expression.left) && createsFunction(expression.right, seen)
      );
    if (
      ts.isBinaryExpression(expression) &&
      [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(
        expression.operatorToken.kind,
      )
    )
      return createsFunction(expression.left, seen) || createsFunction(expression.right, seen);
    if (!isCallable(expression) || isPassedOn(expression)) return false;
    const held = ts.isIdentifier(expression)
      ? initializerOf(declarationOf(expression), seen)
      : undefined;
    return held ? createsFunction(held, seen) : true;
  };

  const propsCarryFunction = (node: ts.Expression, seen = new Set<ts.Node>()): boolean => {
    const expression = skipOuter(node);
    if (ts.isObjectLiteralExpression(expression))
      return expression.properties.some((property): boolean => {
        if (ts.isPropertyAssignment(property)) return createsFunction(property.initializer);
        if (ts.isShorthandPropertyAssignment(property)) {
          const value = checker?.getShorthandAssignmentValueSymbol(property);
          const declaration = value?.valueDeclaration ?? value?.declarations?.[0];
          if (holdsPassedOn(declaration)) return false;
          const held = initializerOf(declaration, seen);
          if (held) return createsFunction(held, seen);
          return checker ? isCallable(property.name) : true;
        }
        if (ts.isSpreadAssignment(property)) return propsCarryFunction(property.expression, seen);
        return true;
      });
    if (ts.isConditionalExpression(expression))
      return (
        propsCarryFunction(expression.whenTrue, seen) ||
        propsCarryFunction(expression.whenFalse, seen)
      );
    const held = ts.isIdentifier(expression)
      ? initializerOf(declarationOf(expression), seen)
      : undefined;
    return held ? propsCarryFunction(held, seen) : false;
  };

  const calleeName = (call: ts.CallExpression) => {
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

  return function clientReasons(sourceFile: ts.SourceFile): string[] {
    const reasons = new Set<string>();
    const marked = commentsOf(sourceFile)
      .map((comment) => annotation.exec(comment))
      .find(Boolean);
    if (marked) reasons.add(`is marked @client-module${marked[1] ? `: ${marked[1]}` : ''}`);
    const visit = (node: ts.Node) => {
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
        if (name && clientHookName.test(name))
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

function clientReasons(sourceFile: ts.SourceFile, checker?: ts.TypeChecker) {
  return createReader(checker)(sourceFile);
}

function libraryProgram(paths: string[]) {
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
    options: { ...config!.options, noEmit: true },
  });
  return { program, checker: program.getTypeChecker() };
}

export function clientReasonsOf(
  text: string,
  fileName = join(librarySourceDirectory, 'Example.tsx'),
) {
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
    options: { ...config!.options, noEmit: true },
    host,
  });
  const sourceFile = program.getSourceFiles().find((file) => resolve(file.fileName) === path);
  return clientReasons(sourceFile!, program.getTypeChecker());
}

export async function libraryModules() {
  const entries = await readdir(librarySourceDirectory, { recursive: true, withFileTypes: true });
  const files = entries
    .filter(
      (entry) => entry.isFile() && /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts'),
    )
    .map((entry) => join(entry.parentPath, entry.name));
  const { program, checker } = libraryProgram(files);
  const read = createReader(checker);
  const modules: {
    file: string;
    path: string;
    text: string;
    reasons: string[];
    client: boolean;
  }[] = [];
  for (const path of files) {
    const file = relative(librarySourceDirectory, path).split('\\').join('/');
    const text = await readFile(path, 'utf8');
    const sourceFile = program.getSourceFile(path);
    modules.push({
      file,
      path,
      text,
      reasons: read(sourceFile!),
      client: hasClientDirective(sourceFile!),
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
        `${module.file} uses nothing client-only that the check can see: remove ${directive}, or mark it with // @client-module`,
      );
    if (missing.length + needless.length > 0) process.exitCode = 1;
    else console.log(`${modules.filter((module) => module.client).length} client modules.`);
    return;
  }
  const writtenByGenerateIcons = [...missing, ...needless].filter((module) =>
    module.file.startsWith('icons/'),
  );
  if (writtenByGenerateIcons.length > 0)
    throw new Error(
      `${writtenByGenerateIcons[0].file} and ${writtenByGenerateIcons.length - 1} more icons: run npm run icons:generate.`,
    );
  for (const module of missing) await writeFile(module.path, `${directive}\n\n${module.text}`);
  for (const module of needless)
    await writeFile(module.path, module.text.replace(/^'use client';\r?\n(?:\r?\n)?/, ''));
  console.log(`Added ${missing.length} and removed ${needless.length} directives.`);
}

if (import.meta.main) await main();
