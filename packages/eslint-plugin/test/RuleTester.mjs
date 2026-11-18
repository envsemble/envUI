import { RuleTester } from 'eslint';
import { describe, it } from 'node:test';
import tseslint from 'typescript-eslint';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const jsx = { parserOptions: { ecmaFeatures: { jsx: true } } };

export const ruleTester = new RuleTester({ languageOptions: jsx });

export const typeScriptRuleTester = new RuleTester({
  languageOptions: { ...jsx, parser: tseslint.parser },
});

export const named = (group, cases) =>
  cases.map((testCase) =>
    typeof testCase === 'string'
      ? { name: `${group}: ${testCase}`, code: testCase }
      : { ...testCase, name: `${group}: ${testCase.name ?? testCase.code}` },
  );
