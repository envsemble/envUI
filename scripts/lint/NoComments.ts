import type { AST, ESLint, Rule, SourceCode } from 'eslint';
import { relative, sep } from 'node:path';
import { repositoryRoot } from '../RepositoryPaths.ts';

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
]);

function declaredNames(node: AnyNode): string[] {
  if (node.type === 'VariableDeclaration')
    return (node.declarations as { id: AnyNode }[]).flatMap(({ id }) =>
      id.type === 'Identifier' ? [id.name as string] : [],
    );
  const id = node.id as AnyNode | null | undefined;
  return id?.type === 'Identifier' ? [id.name as string] : [];
}

function typeMembers(node: unknown): AnyNode[] {
  if (!node || typeof node !== 'object') return [];
  const typed = node as AnyNode;
  const own =
    typed.type === 'TSTypeLiteral'
      ? (typed.members as AnyNode[])
      : typed.type === 'TSInterfaceBody'
        ? (typed.body as AnyNode[])
        : [];
  const children = Object.entries(typed)
    .filter(([key]) => key !== 'parent' && key !== 'loc' && key !== 'range')
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]));
  return [...own, ...children.flatMap(typeMembers)];
}

function documentableStarts(program: AST.Program) {
  const body = program.body as unknown as AnyNode[];
  const exportedNames = new Set(
    body
      .filter((node) => node.type === 'ExportNamedDeclaration' && !node.source)
      .flatMap((node) => node.specifiers as { local: { name?: string } }[])
      .flatMap(({ local }) => (local.name ? [local.name] : [])),
  );
  const exported = body.flatMap((node): { start: AnyNode; declaration: AnyNode }[] => {
    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration')
      return node.declaration ? [{ start: node, declaration: node.declaration as AnyNode }] : [];
    if (
      declarationTypes.has(node.type) &&
      declaredNames(node).some((name) => exportedNames.has(name))
    )
      return [{ start: node, declaration: node }];
    return [];
  });
  const isTypeDeclaration = (node: AnyNode) =>
    node.type === 'TSInterfaceDeclaration' || node.type === 'TSTypeAliasDeclaration';
  return new Set(
    [
      ...exported.map(({ start }) => start),
      ...exported
        .filter(({ declaration }) => isTypeDeclaration(declaration))
        .flatMap(({ declaration }) => typeMembers(declaration)),
    ].map((node) => node.range?.[0]),
  );
}

function isAttachedDocComment(comment: Comment, text: string, starts: Set<number | undefined>) {
  if (!isDocComment(comment) || !comment.range) return false;
  const rest = text.slice(comment.range[1]);
  const gap = rest.length - rest.trimStart().length;
  return starts.has(comment.range[1] + gap);
}

const repositoryPath = (file: string) => relative(repositoryRoot, file).split(sep).join('/');

const noComments: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Reports comments other than tool directives, licence headers and doc comments on the public API.',
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

export const repositoryPlugin: ESLint.Plugin = {
  meta: { name: 'repository' },
  rules: { 'no-comments': noComments },
};
