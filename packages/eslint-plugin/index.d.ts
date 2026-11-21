import type { ESLint, Linter } from 'eslint';

declare const plugin: ESLint.Plugin & {
  meta: { name: string; version: string; namespace: 'envui' };
  configs: { recommended: Linter.Config; strict: Linter.Config };
};

export default plugin;
