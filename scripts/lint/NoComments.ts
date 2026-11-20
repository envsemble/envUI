import type { AST, ESLint, Rule, SourceCode } from 'eslint';
import { repositoryPath } from '../RepositoryPaths.ts';

type Comment =
  | ReturnType<SourceCode['getAllComments']>[number]
  | { type: 'Shebang'; value: string; range?: [number, number]; loc?: undefined };
type AnyNode = { type: string; range?: [number, number]; [key: string]: unknown };

const commentMessage = 'Name it in the code instead: a constant, a function or a better name.';
const reasonMessage = `Drop the reason after the directive. ${commentMessage}`;

const eslintDirective =
  /^(?:eslint(?:-disable(?:-next-line|-line)?|-enable)?|globals?|exported)(?:\s|$)/;
const typeScriptDirective = /^@ts-(?:expect-error|ignore|nocheck|check)(?=\s|:|$)/;
const bundlerAnnotation = /^(?:[@#]__(?:PURE|NO_SIDE_EFFECTS)__|@vite-ignore)$/;
const tripleSlashDirective = /^\/\s*<reference\s/;
const clientModuleMarker = /^@client-module(?=\s|:|$)/;
const knipTag = /^\*\s*@internal\s*$/;
const jsDocTypeTag =
  /^@(?:type|typedef|callback|template|satisfies|import|param|returns?|property|overload)\b/;
const licenceWords = /\b(?:copyright|licen[cs]e|spdx-license-identifier)\b/i;
const scriptFile = /\.[cm]?js$/;

function directiveStatus(comment: Comment): 'directive' | 'reasoned' | undefined {
  const text = comment.value.trim();
  if (eslintDirective.test(text)) return /\s--(?:\s|$)/.test(text) ? 'reasoned' : 'directive';
  const typeScript = typeScriptDirective.exec(text);
  if (typeScript) return text.slice(typeScript[0].length).trim() ? 'reasoned' : 'directive';
  if (text === 'prettier-ignore' || bundlerAnnotation.test(text)) return 'directive';
  const clientModule = comment.type === 'Line' && clientModuleMarker.exec(text);
  if (clientModule) return text.slice(clientModule[0].length).trim() ? 'reasoned' : 'directive';
  if (comment.type === 'Block' && knipTag.test(comment.value)) return 'directive';
  if (comment.type === 'Line' && tripleSlashDirective.test(comment.value)) return 'directive';
  return undefined;
}

const isDocComment = (comment: Comment) =>
  comment.type === 'Block' && comment.value.startsWith('*');

function docLines(comment: Comment) {
  return comment.value
    .split('\n')
    .map((line) => line.replace(/^\s*\*+\s?/, '').trim())
    .filter(Boolean);
}

const isJsDocTypeAnnotation = (comment: Comment) =>
  isDocComment(comment) && docLines(comment).every((line) => jsDocTypeTag.test(line));

function isLicenceHeader(comment: Comment, text: string) {
  const before = text.slice(0, comment.range?.[0] ?? 0).replace(/^#!.*/, '');
  return before.trim() === '' && licenceWords.test(comment.value);
}

const declarationTypes = new Set([
  'VariableDeclaration',
  'FunctionDeclaration',
  'ClassDeclaration',
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
  'TSEnumDeclaration',
  'TSDeclareFunction',
  'TSModuleDeclaration',
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
  'ExportAllDeclaration',
]);

const memberListKeys: Record<string, string> = {
  TSTypeLiteral: 'members',
  TSInterfaceBody: 'body',
  TSEnumBody: 'members',
  TSEnumDeclaration: 'members',
  ClassBody: 'body',
};

const childNodes = (node: AnyNode) =>
  Object.entries(node)
    .filter(([key]) => key !== 'parent' && key !== 'loc' && key !== 'range')
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is AnyNode => !!value && typeof value === 'object' && 'type' in value);

function members(node: AnyNode): AnyNode[] {
  const key = memberListKeys[node.type];
  const own = key && Array.isArray(node[key]) ? (node[key] as AnyNode[]) : [];
  return [...own, ...childNodes(node).flatMap(members)];
}

const expressionWrappers = new Set(['TSAsExpression', 'TSSatisfiesExpression']);

function unwrapped(node: AnyNode | null | undefined): AnyNode | undefined {
  if (!node) return undefined;
  return expressionWrappers.has(node.type) ? unwrapped(node.expression as AnyNode) : node;
}

function declarationsOf(statement: AnyNode): AnyNode[] {
  const declaration = (statement.declaration as AnyNode | null | undefined) ?? statement;
  return declaration.type === 'VariableDeclaration' ? (declaration.declarations as AnyNode[]) : [];
}

function objectProperties(statement: AnyNode): AnyNode[] {
  return declarationsOf(statement).flatMap((declarator) => {
    const value = unwrapped(declarator.init as AnyNode | null);
    return value?.type === 'ObjectExpression' ? (value.properties as AnyNode[]) : [];
  });
}

function documentableStarts(program: AST.Program) {
  const statements = (program.body as unknown as AnyNode[]).filter((node) =>
    declarationTypes.has(node.type),
  );
  return new Set(
    [
      ...statements,
      ...statements.flatMap(objectProperties),
      ...childNodes(program as unknown as AnyNode).flatMap(members),
    ].map((node) => node.range?.[0]),
  );
}

function isAttachedDocComment(comment: Comment, text: string, starts: Set<number | undefined>) {
  if (!isDocComment(comment) || !comment.range) return false;
  const rest = text.slice(comment.range[1]);
  const gap = rest.length - rest.trimStart().length;
  return starts.has(comment.range[1] + gap);
}

const noComments: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Reports comments other than tool directives, licence headers and doc comments on declarations and members of the public API.',
    },
    schema: [
      {
        type: 'object',
        properties: { publicApi: { type: 'string' } },
        additionalProperties: false,
      },
    ],
    messages: { comment: commentMessage, reason: reasonMessage },
  },
  create(context) {
    const { publicApi } = (context.options[0] ?? {}) as { publicApi?: string };
    const { sourceCode } = context;
    const documented =
      publicApi !== undefined && new RegExp(publicApi).test(repositoryPath(context.filename));
    const typedWithJsDoc = scriptFile.test(context.filename);
    return {
      Program(program) {
        const starts = documented ? documentableStarts(program) : new Set<number | undefined>();
        for (const comment of sourceCode.getAllComments() as Comment[]) {
          if (comment.type === 'Shebang') continue;
          const status = directiveStatus(comment);
          if (status === 'directive') continue;
          if (
            !status &&
            (isLicenceHeader(comment, sourceCode.text) ||
              (typedWithJsDoc && isJsDocTypeAnnotation(comment)) ||
              isAttachedDocComment(comment, sourceCode.text, starts))
          )
            continue;
          context.report({
            loc: comment.loc ?? program.loc,
            messageId: status === 'reasoned' ? 'reason' : 'comment',
          });
        }
      },
    };
  },
};

export const noCommentsPlugin: ESLint.Plugin = {
  meta: { name: 'repository' },
  rules: { 'no-comments': noComments },
};
