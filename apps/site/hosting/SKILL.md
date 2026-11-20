---
name: envui-setup
description: Set up envUI, envsemble's React component library (@envsemble/envui), in a project with the user. Installs it at an exact version with its styles and theme, points the project's AGENTS.md at the docs in the package, and turns on its ESLint and Stylelint rules. Use when adding envUI to an app, or when an app with UI of its own wants to move to envUI.
compatibility: Needs React and React DOM 19 and Node.js 22.13 or later.
metadata:
  author: envsemble
  version: '{{version}}'
---

# Set up envUI

Guide the user through setup: do the work yourself and ask them only for what you can't do. It should take a few minutes and need almost nothing from them. Use the project's package manager throughout (from its lockfile: npm, pnpm, yarn or bun), and pin every envUI package at exactly `{{version}}`.

## Before you start

Inspect the project first: `package.json`, the lockfile, the client entry and the existing UI (component libraries such as MUI, Chakra, Ant Design or shadcn/ui, and folders of the app's own components). Never read environment files. Then show the user this checklist and wait for a yes:

```
Here's how I'll set up envUI:

1. Install @envsemble/envui {{version}} with its styles and theme.
2. Add a short note to AGENTS.md that points coding agents to envUI's docs. Recommended.
3. Turn on envUI's ESLint and Stylelint rules, which flag envUI used wrongly and raw colors. Recommended.
4. Check that the app builds, lints and starts.

I won't change your existing UI. You can skip any step. Shall I go ahead?
```

Leave out a step that is already done. Skip a step the user declines, and say once what they lose by it: without step 2, agents may write their own components instead of envUI's; without step 3, nothing flags envUI used wrongly or a raw color.

## UI of its own

If the app already has its own UI components or another component library, set envUI up beside them and change none of them. After setup, offer to plan the move with the user: map each existing component to envUI, choose a first slice, and agree what stays. Never rewrite, restyle or remove the app's UI without the user's approval of that plan.

## Step 1: Install envUI

Install the exact version with the project's package manager, such as `npm install --save-exact @envsemble/envui@{{version}}`.

Then, as `node_modules/@envsemble/envui/docs/setup.md` shows:

- with a bundler, the components bring their own styles; without one, import `@envsemble/envui/styles.css` once in the client entry, never both;
- define the app's theme once with `defineTheme` from `@envsemble/envui/theme-bootstrap`, give it to `ThemePreferenceProvider`'s `theme` around the app, and add `createThemeBootstrapScript(theme)` to the document head; keep the preference where the app keeps its settings, through the provider's `preference` and `onPreferenceChange`, or in localStorage with `@envsemble/envui/theme-storage`; use `Theme` alone for a fixed theme;
- register the app's router link with `LinkProvider`, from the recipes there.

## Step 2: Point AGENTS.md to the docs

Add this block to `AGENTS.md` in the project root, creating the file if missing and keeping the rest. Replace an earlier block between the same markers.

```md
<!-- BEGIN envui -->

## UI: envUI

Use envUI (`@envsemble/envui`) for every UI element. Its docs for the installed version are in `node_modules/@envsemble/envui/docs/`: start at `docs/index.md`, and copy from the examples in `docs/examples/`.

<!-- END envui -->
```

Where a workspace installs envUI in a folder above, write the path from `AGENTS.md` to it, such as `../../node_modules/@envsemble/envui/docs/`. If the project has a `CLAUDE.md` that doesn't import `AGENTS.md`, add a line `@AGENTS.md` to it; if it has none and the user works with Claude Code, create one with that line.

## Step 3: Turn on the lint rules

Install both as dev dependencies at exactly `{{version}}`, the same version as envUI:

- `@envsemble/eslint-plugin-envui`, needing ESLint 10 and a flat config: add `envui.configs.recommended` to `eslint.config.js`, imported from `@envsemble/eslint-plugin-envui`.
- `@envsemble/stylelint-config-envui`, needing Stylelint 17 or 18: add it to `extends` after the project's base config.

Each package's README in `node_modules/@envsemble/` has the options. If the project has neither tool, offer to add it with a minimal config. If it runs an older ESLint or a legacy `.eslintrc`, say so and skip rather than upgrading it. `envui.configs.strict`, in place of `envui.configs.recommended`, also reports hand-built controls and words outside envUI's writing guide: offer it only where the user wants that policy, since in an app with UI of its own its list is the work of moving to envUI, not this setup's. If the rules block the user's CI, ask whether to start them as warnings.

## Step 4: Verify

Run the project's type check or build and its lint, then start the app and confirm it renders as before with envUI's styles loaded and no new console errors. Fix what setup broke; report what was already failing.

## Critical rules

- Never read or print environment files.
- Pin `@envsemble/envui`, its ESLint plugin and its Stylelint config at the same exact version.
- Don't change the app's existing UI as part of setup.
- Take envUI's API from the docs and type declarations in `node_modules/@envsemble/envui/`, not from memory; the lint's messages say what to write instead.

## After setup

Tell the user what changed, file by file, and what they skipped. Then offer the next step: build a first screen with envUI or, for an app with UI of its own, plan the move. To upgrade later, raise all three packages to the same new version and read the changelog. For anything else, read https://envui.envsemble.com/llms.txt.
