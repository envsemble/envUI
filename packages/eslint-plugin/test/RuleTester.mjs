// ESLint's RuleTester, reporting through node:test, for JSX in JavaScript and in TypeScript.
import { RuleTester } from 'eslint';
import { describe, it } from 'node:test';
import tseslint from 'typescript-eslint';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const jsx = { parserOptions: { ecmaFeatures: { jsx: true } } };

/** Parses JSX with ESLint's default parser. */
export const ruleTester = new RuleTester({ languageOptions: jsx });

/** Parses TSX with the typescript-eslint parser, for type imports and qualified type names. */
export const typeScriptRuleTester = new RuleTester({
  languageOptions: { ...jsx, parser: tseslint.parser },
});
