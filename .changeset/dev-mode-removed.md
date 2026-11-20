---
'@envsemble/envui': major
---

Dev mode is removed. The lint rules, the contrast of the tokens and the components' accessibility already hold what its readout checked, and a page's layout is the browser's developer tools' to show.

Breaking changes:

- The entry point `@envsemble/envui/dev` is removed, with `installDevMode`, `layout`, `window.envui.layout`, the Alt+Shift+D view and the types `DevModeHandle`, `DevModeOptions`, `LayoutApi`, `LayoutAtResult`, `LayoutOptions`, `LayoutSize`, `LayoutProblem`, `LayoutProblemRule`, `PartsEntry`, `PartsFile` and `SkeletonShiftOptions`: delete the `import('@envsemble/envui/dev')` behind the development check. Lint with [`@envsemble/eslint-plugin-envui` and `@envsemble/stylelint-config-envui`](https://github.com/envsemble/envUI/blob/main/docs/setup.md), and inspect a page's layout in the browser's developer tools.
