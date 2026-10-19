// A Node module hook that does what a React Server Components bundler does with 'use client'
// modules in the server's module graph: it never runs them, and gives each of their exports as a
// client reference instead. Load it with `--import` and run with `--conditions=react-server`, so
// React is its server build, which has no state, effect or context hooks.
import { registerHooks } from 'node:module';
import ts from 'typescript';

/** The names a module exports, read from its source without running it. */
function exportNames(source, url) {
  const file = ts.createSourceFile(url, source, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);
  const names = [];
  const exported = (node) =>
    node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
  const isDefault = (node) =>
    node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
  for (const statement of file.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (!statement.exportClause)
        throw new Error(`${url} re-exports with export *, which a client module cannot name.`);
      if (ts.isNamedExports(statement.exportClause))
        for (const element of statement.exportClause.elements) names.push(element.name.text);
      else names.push(statement.exportClause.name.text);
    } else if (ts.isExportAssignment(statement)) names.push('default');
    else if (ts.isVariableStatement(statement) && exported(statement))
      for (const declaration of statement.declarationList.declarations)
        names.push(declaration.name.getText(file));
    else if (
      (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) &&
      exported(statement)
    )
      names.push(isDefault(statement) ? 'default' : statement.name.text);
  }
  return names;
}

registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    if (result.format !== 'module' || result.source == null) return result;
    const source = String(result.source);
    if (!/^\s*(['"])use client\1/.test(source)) return result;
    const stub = [
      'const reference = (name) => Object.defineProperties(',
      "  () => { throw new Error('The server called ' + name + \", which is a client module's.\"); },",
      "  { $$typeof: { value: Symbol.for('react.client.reference') }, $$id: { value: name } },",
      ');',
      ...exportNames(source, url).map((name) => {
        const id = JSON.stringify(`${url}#${name}`);
        return name === 'default'
          ? `export default reference(${id});`
          : `export const ${name} = reference(${id});`;
      }),
    ].join('\n');
    return { format: 'module', source: stub, shortCircuit: true };
  },
});
