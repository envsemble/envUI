---
'@envsemble/envui-codemods': minor
---

The codemods cover what a run over real applications left to hand work:

- `v1-props` maps each literal of a conditional value, also in nested ternaries and beside `&&`, `||` and `??`: `tone={failed ? 'error' : 'info'}` becomes `tone={failed ? 'danger' : 'info'}`, and a value 1.0 drops as the default becomes `undefined`. It deletes Code's `appearance`, Markdown's `inlineCode` and CodeBlock's `theme`, which 0.7 removed, and reports one that is an expression.
- `v1-render` turns a ternary of element names into a ternary of elements: `as={section ? 'h2' : 'h1'}` becomes `render={section ? <h2 /> : <h1 />}`.
- `v1-classes` rewrites a removed custom property that one token replaces as it is, rather than reporting it: `--control-height-small` and `--icon-button-size` become `--env-control-height`, `--control-height-compact` `--env-control-height-sm`, and `--color-surface-base` and the other unused 0.7 colors their roles. It renames classes and tokens in CSS-in-JS templates tagged `css`, `keyframes`, `createGlobalStyle`, `injectGlobal` or `styled`, in test locators (`locator()`, `waitForSelector()`, `$()`), `toHaveClass()` and `expect(el.classList)` assertions, and, in test files, any string that is exactly one 0.x class; it reports a 0.x class in a regular expression or a longer string there, and a style for `env-code-subtle`.
- `v1-app-shell` puts NavList items behind a condition, in a fragment or from a `map` into the `NavList.Root`, and reports a navigation whose items sit beside other content or that it can't see into.
- `v1-names` reports ActionGroup, ActionCard, FeatureCard and AppShellSkeleton only where they are used other than as elements, which `v1-structure` and `v1-app-shell` rewrite.
- Declaration files (`.d.ts`, `.d.mts`, `.d.cts`) parse as declarations, so a run no longer fails on them.
