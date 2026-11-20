import { readdirSync, readFileSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';
import ts from 'typescript';
import { librarySourceDirectory, styleSheetsDirectory } from '../../scripts/RepositoryPaths.ts';

export const libraryModulePath = (file: string) =>
  relative(librarySourceDirectory, file).split(sep).join('/');

function walk(directory: string, found: string[] = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (path !== styleSheetsDirectory && entry.name !== 'assets') walk(path, found);
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) found.push(path);
  }
  return found;
}

export function libraryModules() {
  return walk(librarySourceDirectory).map(libraryModulePath).sort();
}

export const readLibraryModule = (module: string) =>
  readFileSync(join(librarySourceDirectory, module), 'utf8');

export function resolveImport(from: string, specifier: string, modules: ReadonlySet<string>) {
  if (!specifier.startsWith('.')) return undefined;
  const target = posix.normalize(posix.join(posix.dirname(from), specifier)).replace(/\.js$/, '');
  return [`${target}.tsx`, `${target}.ts`, `${target}/index.ts`, `${target}/index.tsx`].find(
    (candidate) => modules.has(candidate),
  );
}

export interface ModuleImport {
  specifier: string;
  line: number;
  kind: 'static' | 'type' | 'dynamic';
}

export function importsOf(module: string, text = readLibraryModule(module)): ModuleImport[] {
  const file = ts.createSourceFile(module, text, ts.ScriptTarget.Latest, true);
  const found: ModuleImport[] = [];
  const add = (literal: ts.Node | undefined, kind: ModuleImport['kind']) => {
    if (literal && ts.isStringLiteralLike(literal))
      found.push({
        specifier: literal.text,
        line: file.getLineAndCharacterOfPosition(literal.getStart(file)).line + 1,
        kind,
      });
  };
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node))
      add(node.moduleSpecifier, node.importClause?.isTypeOnly ? 'type' : 'static');
    else if (ts.isExportDeclaration(node))
      add(node.moduleSpecifier, node.isTypeOnly ? 'type' : 'static');
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
      add(node.arguments[0], 'dynamic');
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
      add(node.argument.literal, 'type');
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}
