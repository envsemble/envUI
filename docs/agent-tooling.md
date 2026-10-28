---
aliases:
  - agents
  - coding agents
  - AI agents
  - AGENTS.md
  - SKILL.md
  - setup skill
  - llms.txt
---

# For agents

Coding agents build with envUI the way people do: they read its documentation, and its lint rules tell them when they write a control or a color by hand. One prompt sets an application up for them.

## Set up with the hosted skill

Paste this into a coding agent working in the application's folder:

```text
Set up envUI in my app: envui.envsemble.com/SKILL.md
```

The agent reads the setup skill the site serves at `envui.envsemble.com/SKILL.md`, shows a short checklist and waits for a yes. Then it:

1. installs `@envsemble/envui` at an exact version from GitHub Packages, signing in with the GitHub CLI, and connects its styles and theme as [setup](setup.md) describes;
2. adds [the AGENTS.md pointer](#the-agentsmd-pointer);
3. installs and turns on [the lint rules](#lint-feedback) at the same version;
4. checks that the application builds, lints and starts.

The pointer and the lint rules are recommended, and any step can be skipped. In an application with UI of its own, the agent changes none of it, and offers to plan a move to envUI with you after [the migration guide](migration.md).

An agent that arrives at the site rather than at a project finds `envui.envsemble.com/llms.txt`, in the [llms.txt](https://llmstxt.org) format: it says what envUI is and points to the setup skill and the documentation the installed package ships, and lists no pages of its own.

## The AGENTS.md pointer

Agents read `AGENTS.md` at the start of every task. A few lines there lead them to the docs of the installed version, about 100 tokens:

```md
<!-- BEGIN envui -->

## UI: envUI

Use envUI (`@envsemble/envui`) for every UI element. Its docs for the installed version are in `node_modules/@envsemble/envui/docs/`: start at `docs/index.md`, and copy from the examples in `docs/examples/`. When envUI lacks something, propose an addition to envUI instead of writing a local copy.

<!-- END envui -->
```

- Keep the markers: the skill replaces what is between them when it runs again.
- Where a workspace installs envUI in a folder above, the path leads there from `AGENTS.md`, such as `../../node_modules/@envsemble/envui/docs/`.
- Claude Code reads `CLAUDE.md`, which imports `AGENTS.md` with a line `@AGENTS.md`.

## The docs in the package

The pointer leads to the documentation the package ships, which describes exactly the installed version:

| Path in `node_modules/@envsemble/envui/` | What it holds                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `docs/index.md`                          | Every page, with what it is for.                                                               |
| `docs/`                                  | These pages, with their examples and props filled in.                                          |
| `docs/examples/<page>/<Name>.tsx`        | Every example as a file an application can copy.                                               |
| `docs/generated/props.json`              | The props of every export, from the TypeScript declarations.                                   |
| `docs/generated/parts.json`              | The part classes, state attributes and color properties of every component, with what each is. |
| `dist/**/*.d.ts`                         | The type declarations, the exact API.                                                          |

## Lint feedback

[`@envsemble/eslint-plugin-envui`](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin) and [`@envsemble/stylelint-config-envui`](https://github.com/envsemble/envUI/tree/main/packages/stylelint-config) report hand-built controls and raw colors, naming the envUI component or token to use. Agents see their messages in the usual edit-and-check loop, even when they skipped the docs. They are released with envUI at the same version:

```sh
npm install --save-dev --save-exact @envsemble/eslint-plugin-envui@<version> @envsemble/stylelint-config-envui@<version>
```

Each one's README says how to turn it on.

## Upgrade

Raise `@envsemble/envui`, the ESLint plugin and the Stylelint config together, to the same exact version. The pointer needs no change: it names no version, and the docs it leads to are always the installed ones.
