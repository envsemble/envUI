// Which of the library's modules are client modules for React Server Components, by what they
// use: React hooks, createContext, Base UI's parts (client modules of their own), functions written
// inline as JSX props, or class components. Each such module starts with 'use client', as Base UI's
// parts do; the entry points and the `export * as` lines in them carry no directive, so a server
// component imports Menu.Item through them as a client reference. Everything else, such as Badge,
// Card or Text, stays a module a server component renders itself.
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

/** The directive, as the modules write it. */
export const directive = "'use client';";

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

/** What makes a module a client module, as reasons; none for a module a server can render. */
export function clientReasons(sourceFile) {
  const reasons = new Set();
  const visit = (node) => {
    if (
      ts.isImportDeclaration(node) &&
      !node.importClause?.isTypeOnly &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text.startsWith('@base-ui/')
    )
      reasons.add(`imports ${node.moduleSpecifier.text}`);
    if (ts.isCallExpression(node)) {
      const callee = ts.isPropertyAccessExpression(node.expression)
        ? node.expression.name
        : node.expression;
      // Hooks are use followed by a capital; React's `use()` also works on the server.
      if (ts.isIdentifier(callee) && /^use[A-Z]/.test(callee.text))
        reasons.add(`calls ${callee.text}`);
      if (ts.isIdentifier(callee) && callee.text === 'createContext')
        reasons.add('calls createContext');
    }
    if (
      ts.isJsxAttribute(node) &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression &&
      (ts.isArrowFunction(node.initializer.expression) ||
        ts.isFunctionExpression(node.initializer.expression))
    )
      reasons.add(`passes a function to ${node.name.getText()}`);
    if (
      ts.isClassDeclaration(node) &&
      node.heritageClauses?.some((clause) => /\bComponent\b/.test(clause.getText()))
    )
      reasons.add('is a class component');
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return [...reasons];
}

/** Every library module, the generated icons included, with whether it needs and has the directive. */
export async function libraryModules() {
  const entries = await readdir(sourceDirectory, { recursive: true, withFileTypes: true });
  const modules = [];
  for (const entry of entries) {
    if (!entry.isFile() || !/\.tsx?$/.test(entry.name) || entry.name.endsWith('.d.ts')) continue;
    const path = join(entry.parentPath, entry.name);
    const file = relative(sourceDirectory, path).split('\\').join('/');
    const text = await readFile(path, 'utf8');
    const sourceFile = ts.createSourceFile(
      path,
      text,
      ts.ScriptTarget.Latest,
      true,
      path.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    modules.push({
      file,
      path,
      text,
      reasons: clientReasons(sourceFile),
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
      console.error(`${module.file} uses nothing client-only: remove ${directive}`);
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
