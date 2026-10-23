<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/envUI/envUI-lockup-white.svg">
  <img src="assets/brand/envUI/envUI-lockup-black.svg" alt="envUI" width="240">
</picture>

**The shared interface library for envsemble.**

[![CI](https://github.com/envsemble/envUI/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/envsemble/envUI/actions/workflows/ci.yml)
![React 19](https://img.shields.io/badge/React-19-149eca)
![Node.js 22.13+ or 24+](https://img.shields.io/badge/Node.js-22.13%2B%20%7C%2024%2B-417e38)
![Private package](https://img.shields.io/badge/GitHub_Packages-private-6e40c9)

envUI brings consistent themes, composition and interaction to React applications: from a button or a native form to dialogs, notifications and rich text. It ships as a private ESM package with TypeScript declarations, local fonts, icons and tooling for coding agents.

[For agents](docs/agent-tooling.md) · [Use envUI](.agents/skills/envui-use/SKILL.md) · [Migrate an app](.agents/skills/envui-migrate/SKILL.md) · [Changelog](packages/ui/CHANGELOG.md) · [CI](https://github.com/envsemble/envUI/actions/workflows/ci.yml)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/readme/catalogue-dark.png">
  <img src="assets/readme/catalogue-light.png" alt="The envUI catalogue showing buttons, icons and navigation in the light theme" width="1440">
</picture>

_Actual envUI components in the local catalogue. The preview follows your light or dark appearance._

## What’s inside

- **Shared foundations:** scoped light/dark themes, design tokens, Inter, typography, surfaces and layout primitives.
- **Everyday interactions:** actions, navigation, native form controls, selection, color picking, dialogs and toasts, with Base UI underpinning complex interactions.
- **Content tools:** Markdown, code highlighting and Tiptap rich text on separate entry points.
- **Local assets:** Inter and the official Material Symbols Rounded icons, with no font or icon CDN required.
- **A visual catalogue:** live component previews plus a self-contained HTML build that opens offline.

## Start using envUI

Requires React and React DOM 19, Node.js 22.13 or a later 22 release, or Node.js 24 or newer, for the `envui` command and the lint packages, plus access to the private `@envsemble` GitHub Packages registry. See [setup](docs/setup.md) for registry access and the [documentation index](docs/index.md) for examples matching the installed version.

```sh
npm install --save-exact @envsemble/envui@<version>
```

Upgrading an application from envUI 0.x to 1.0? The `@envsemble/envui-codemods` package moves its imports, components, props, types and `env-*` classes to the 1.0 names and reports what needs a decision. Commit first, then run the six transforms in this order, before installing 1.0:

```sh
npx @envsemble/envui-codemods@<version> v1-names src
npx @envsemble/envui-codemods@<version> v1-structure src
npx @envsemble/envui-codemods@<version> v1-render src
npx @envsemble/envui-codemods@<version> v1-stack src
npx @envsemble/envui-codemods@<version> v1-props src
npx @envsemble/envui-codemods@<version> v1-classes src
```

The [migration guide](docs/migration.md), under "Upgrade from envUI 0.x to 1.0", explains each step, what the codemods leave to you and the renamed tokens.

Import the stylesheet once at your application entry point, then compose public components:

```tsx
import { Button, Card, Column, Text, Theme } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import '@envsemble/envui/styles.css';

export function App() {
  return (
    <Theme theme="light">
      <Card render={<article />}>
        <Column gap={3}>
          <Text render={<h1 />} variant="headline">
            Projects
          </Text>
          <Text emphasis="muted">A shared space for your team’s work.</Text>
        </Column>
        <Button startIcon={<Add />}>Create project</Button>
      </Card>
    </Theme>
  );
}
```

Native form behavior stays familiar. Render this inside your application’s theme:

```tsx
import { Button, Column, Row, TextField } from '@envsemble/envui';

export function ProjectForm() {
  return (
    <Column gap={4} render={<form />}>
      <TextField name="projectName" label="Project name" required />
      <Row wrap align="center" gap={4}>
        <Button type="submit">Create project</Button>
        <Button type="reset" variant="secondary">
          Reset
        </Button>
      </Row>
    </Column>
  );
}
```

| Entry point                   | Use it for                          |
| ----------------------------- | ----------------------------------- |
| `@envsemble/envui`            | Foundations and everyday components |
| `@envsemble/envui/icons/Name` | Individual icon imports             |
| `@envsemble/envui/content`    | Markdown, code and Markdown editing |
| `@envsemble/envui/rich-text`  | Rich-text rendering and editing     |
| `@envsemble/envui/styles.css` | Shared styles and local font        |

## Working with agents

Coding agents get the same documentation as people, plus what helps them find a component before writing their own. [For agents](docs/agent-tooling.md) describes it all:

- `npx --no envui agents` writes an index of envUI, under 8 KB, into the project's `AGENTS.md`, with the rule to search envUI before writing any UI element and to propose an addition instead of a local copy.
- `npx --no envui -v` prints the installed envUI version. Pass `--version` after `--`, as `npx --no -- envui --version`; without it, npx prints its own version.
- `npx --no envui mcp` serves the installed version's components, props, examples, patterns and tokens as an MCP server.
- `manifest.json`, `llms.txt` and `llms-full.txt` hold the library as data and as text, generated from the same pages.

| Skill                                                        | Responsibility                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| [envui-use](.agents/skills/envui-use/SKILL.md)               | Build interfaces, looking up every element in envUI first                               |
| [envui-migrate](.agents/skills/envui-migrate/SKILL.md)       | Adopt envUI, or upgrade it, while preserving routes, forms, data and behavior           |
| [envui-contribute](.agents/skills/envui-contribute/SKILL.md) | When envUI lacks something, propose and add it upstream instead of keeping a local copy |

The skills ship under `skills/` in the npm package; copy the three folders together into the project's skills folder, aligned with the package version. Installing the npm package registers nothing by itself.

Documentation ships under `node_modules/@envsemble/envui/docs/`, with examples and props tables filled in, the example files in `docs/examples/` and every export’s props in `docs/generated/props.json`. Each component page carries frontmatter (summary, status, aliases, when to use it and what to use instead) and a Props section generated from the public TypeScript declarations. Edit the maintained pages under `docs/`; improve the relevant page as integrations reveal gaps.

## Versions and license

Published versions are immutable; breaking changes come in a new major version with migration notes. Prereleases are published under their own name as the dist-tag, such as `prerelease` for `1.0.0-prerelease.0` (`npm install @envsemble/envui@prerelease`), and stable releases under `latest`. The [changelog](packages/ui/CHANGELOG.md) describes each release.

envUI is proprietary and distributed privately. Bundled third-party assets and dependencies retain their [notices](packages/ui/THIRD_PARTY_NOTICES.md) and [licenses](packages/ui/licenses/).

## Develop envUI

To work on envUI itself, run its catalogue and checks, or host and release it, see [contributing](CONTRIBUTING.md).
