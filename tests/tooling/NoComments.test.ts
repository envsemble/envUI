import { RuleTester } from 'eslint';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import tseslint from 'typescript-eslint';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { noCommentsPlugin } from '../../scripts/lint/NoComments.ts';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});
const rule = noCommentsPlugin.rules!['no-comments'];
const options = [{ publicApi: '^packages/ui/src/(?!icons/|generated/)' }];

const script = resolve(repositoryRoot, 'scripts/test/Example.ts');
const configModule = resolve(repositoryRoot, 'packages/eslint-plugin/src/example.js');
const component = resolve(repositoryRoot, 'packages/ui/src/actions/Example.tsx');
const icon = resolve(repositoryRoot, 'packages/ui/src/icons/Example.tsx');

const comment = [{ messageId: 'comment' }];
const reason = [{ messageId: 'reason' }];

ruleTester.run('no-comments', rule, {
  valid: [
    {
      name: 'an ESLint directive',
      code: '// eslint-disable-next-line no-console\nconsole.log(1);',
    },
    { name: 'a bare @ts-expect-error', code: '// @ts-expect-error\nconst count: string = 1;' },
    { name: 'a triple-slash reference', code: '/// <reference types="node" />\nexport {};' },
    { name: 'prettier-ignore', code: '// prettier-ignore\nconst grid = [1,0,\n  0,1];' },
    { name: 'a bundler annotation', code: 'const made = /* @__PURE__ */ Object.freeze({});' },
    { name: 'a shebang', code: '#!/usr/bin/env node\nconst ready = true;' },
    {
      name: 'comment syntax inside a string',
      code: "const text = '// not a comment /* either */';",
    },
    {
      name: 'a licence header at the top of the file',
      code: '/* Copyright 2026 Example. Released under the MIT License. */\nconst ready = true;',
    },
    {
      name: 'a JSDoc type annotation in JavaScript',
      code: '/** @type {number} */\nconst count = 1;\nconst cast = /** @type {any} */ (count);',
      filename: configModule,
    },
    {
      name: 'a doc comment on an exported declaration of the public API',
      code: '/** A button. */\nexport function Button() {\n  return null;\n}',
      filename: component,
      options,
    },
    {
      name: 'a doc comment on a member of an exported interface of the public API',
      code: 'export interface ButtonProps {\n  /** The text it shows. */\n  label: string;\n}',
      filename: component,
      options,
    },
    {
      name: 'a doc comment on a member of an object type inside an exported type of the public API',
      code: 'export type Item = { id: string } & {\n  /** Where it goes. */\n  href: string;\n};',
      filename: component,
      options,
    },
    {
      name: 'a doc comment on an unexported declaration of the public API',
      code: '/** Internal. */\nfunction helper() {}\nexport const value = helper;',
      filename: component,
      options,
    },
    {
      name: 'a doc comment on a member of an unexported type of the public API',
      code: 'interface ItemProps {\n  /** Where it goes. */\n  href: string;\n}\nexport type Props = ItemProps;',
      filename: component,
      options,
    },
    {
      name: 'a doc comment on a member of an inline type of the public API',
      code: 'export function Item(props: {\n  /** Where it goes. */\n  href: string;\n}) {\n  return props;\n}',
      filename: component,
      options,
    },
    {
      name: 'a doc comment on a re-export of the public API',
      code: "/** The button. */\nexport { Button } from './Button.js';",
      filename: component,
      options,
    },
    {
      name: 'a doc comment on a part exported under another name',
      code: 'function Root() {\n  return null;\n}\n/** The root. */\nconst RootPart = Root;\nexport { RootPart as Root };',
      filename: component,
      options,
    },
    {
      name: 'a doc comment on a string of a messages object',
      code: "export const alertMessages = {\n  /** The dismiss button's name. */\n  dismiss: 'Dismiss',\n} as const;",
      filename: component,
      options,
    },
    {
      name: 'the client module marker',
      code: "// @client-module\nimport { useState } from 'react';",
      filename: component,
      options,
    },
    {
      name: 'a knip @internal tag',
      code: '/** @internal */\nexport const value = 1;',
      filename: script,
    },
    {
      name: 'a doc comment on a declaration the public API exports by name',
      code: '/** A link. */\nfunction Link() {\n  return null;\n}\nexport { Link };',
      filename: component,
      options,
    },
  ],
  invalid: [
    { name: 'a line comment', code: '// Explains.\nconst ready = true;', errors: comment },
    { name: 'a block comment', code: 'const ready = /* explains */ true;', errors: comment },
    {
      name: 'a reason after an ESLint directive',
      code: '// eslint-disable-next-line no-console -- logging on purpose\nconsole.log(1);',
      errors: reason,
    },
    {
      name: 'a reason after @ts-expect-error',
      code: '// @ts-expect-error A count is a number.\nconst count: string = 1;',
      errors: reason,
    },
    {
      name: 'licence words below the top of the file',
      code: 'const ready = true;\n/* MIT License */',
      errors: comment,
    },
    {
      name: 'prose in a JSDoc type annotation',
      code: '/**\n * How many there are.\n * @type {number}\n */\nconst count = 1;',
      filename: configModule,
      errors: comment,
    },
    {
      name: 'a JSDoc type annotation in TypeScript',
      code: '/** @type {number} */\nconst count = 1;',
      filename: script,
      errors: comment,
    },
    {
      name: 'a doc comment on an export outside the public API',
      code: '/** A helper. */\nexport function helper() {}',
      filename: script,
      options,
      errors: comment,
    },
    {
      name: 'a doc comment on an export of the generated icons',
      code: '/** An icon. */\nexport function Icon() {\n  return null;\n}',
      filename: icon,
      options,
      errors: comment,
    },
    {
      name: 'a doc comment inside a function of the public API',
      code: 'export function Button() {\n  /** Explains. */\n  return null;\n}',
      filename: component,
      options,
      errors: comment,
    },
    {
      name: 'a line comment on an export of the public API',
      code: '// A button.\nexport function Button() {\n  return null;\n}',
      filename: component,
      options,
      errors: comment,
    },
  ],
});
