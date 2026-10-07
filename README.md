<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/envUI/envUI-lockup-white.svg">
  <img src="assets/brand/envUI/envUI-lockup-black.svg" alt="envUI" width="240">
</picture>

**The shared interface library for envsemble.**

[![CI](https://github.com/envsemble/envUI/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/envsemble/envUI/actions/workflows/ci.yml)
![React 19](https://img.shields.io/badge/React-19-149eca)
![Node.js 24+](https://img.shields.io/badge/Node.js-24%2B-417e38)
![Private package](https://img.shields.io/badge/GitHub_Packages-private-6e40c9)

envUI brings consistent themes, composition and interaction to React applications: from a button or a native form to dialogs, notifications and rich text. It ships as a private ESM package with TypeScript declarations, local fonts, icons and two versioned agent skills. The first official private release is being prepared.

[Use envUI](.agents/skills/envui-use/SKILL.md) · [Migrate an app](.agents/skills/envui-migrate/SKILL.md) · [Changelog](packages/ui/CHANGELOG.md) · [CI](https://github.com/envsemble/envUI/actions/workflows/ci.yml)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/readme/catalogue-dark.png">
  <img src="assets/readme/catalogue-light.png" alt="The envUI catalogue showing buttons, icons and navigation in the light theme" width="1440">
</picture>

_Actual envUI components in the local catalogue. The preview follows your light or dark appearance._

## What’s inside

- **Shared foundations:** scoped light/dark themes, design tokens, Inter, typography, surfaces and layout primitives.
- **Everyday interactions:** actions, navigation, native form controls, selection, color picking, dialogs and toasts, with Base UI underpinning complex interactions.
- **Content tools:** Markdown, code highlighting and Tiptap rich text on separate entry points.
- **Local assets:** official Material Symbols Rounded icons and envsemble branding, with no font or icon CDN required.
- **A visual catalogue:** live component previews plus a self-contained HTML build that opens offline.

## Start using envUI

Requires React and React DOM 19, plus access to the private `@envsemble` GitHub Packages registry. See the [usage skill](.agents/skills/envui-use/SKILL.md) for registry setup and the installed version’s API.

```sh
npm install --save-exact @envsemble/envui@<version>
```

Import the stylesheet once at your application entry point, then compose public components:

```tsx
import { Button, Card, Stack, Text, Theme } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import '@envsemble/envui/styles.css';

export function App() {
  return (
    <Theme theme="light">
      <Card as="article">
        <Stack gap={3}>
          <Text as="h1" variant="page-heading">
            Projects
          </Text>
          <Text tone="muted">A shared space for your team’s work.</Text>
        </Stack>
        <Button startIcon={<Add />}>Create project</Button>
      </Card>
    </Theme>
  );
}
```

Native form behavior stays familiar. Render this inside your application’s theme:

```tsx
import { ActionGroup, Button, Input, Stack } from '@envsemble/envui';

export function ProjectForm() {
  return (
    <form>
      <Stack gap={4}>
        <Input name="projectName" label="Project name" required />
        <ActionGroup>
          <Button type="submit">Create project</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </ActionGroup>
      </Stack>
    </form>
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

There are two guides:

| Skill                                                  | Responsibility                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| [envui-use](.agents/skills/envui-use/SKILL.md)         | Build interfaces, choose and compose components, handle themes and extend the library |
| [envui-migrate](.agents/skills/envui-migrate/SKILL.md) | Adopt envUI in existing projects while preserving routes, forms, data and behavior    |

The usage skill owns the component references; the catalogue renders those same references. Public TypeScript declarations define the exact API for each installed version. Improve guidance in these skills as integrations reveal gaps.

Both skill folders ship under `skills/` in the npm package. Install or copy them from `node_modules/@envsemble/envui/skills` into your project’s `.agents/skills`, keeping them together and aligned with the package version. Installing the npm package does not register the skills automatically.

## Explore and develop

Requires Node.js 24 or newer. Run commands from the repository root:

```sh
npm ci
npm run dev
```

Open the catalogue at [localhost:8770](http://127.0.0.1:8770). It consumes library source directly and updates as you edit.

| Command                | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `npm run dev:library`  | Watch compiled exports for a linked external app   |
| `npm run typecheck`    | Check the library and catalogue                    |
| `npm run build`        | Build the package and offline catalogue            |
| `npm test`             | Test package consumers, SSR and hydration          |
| `npm run test:browser` | Check interactions in Chromium, Firefox and WebKit |
| `npm run verify`       | Run the complete CI verification sequence          |

Install browser engines before running the full checks:

```sh
npx playwright install chromium firefox webkit
npm run verify
```

Build outputs are `packages/ui/dist/` and `dist/envUI.html`. CI retains the offline catalogue and browser diagnostics as artifacts.

## Repository map

```text
.agents/skills/       The two agent skills and canonical component references
apps/catalogue/      Live previews and the offline catalogue application
packages/ui/         The publishable @envsemble/envui package
  src/               Components by family, styles and public entry points
  licenses/          Third-party license texts
assets/brand/        Original envUI and envsemble artwork
assets/readme/       Light/dark captures of the catalogue for this README
scripts/             Builds, asset generation, local watching and release validation
tests/               Package contract tests, browser specs and React fixtures
.github/workflows/   CI and tagged package releases
```

React components and scripts use PascalCase filenames; hooks and helpers use camelCase. Keep standard tool filenames such as `package.json`, `index.ts` and `vite.config.ts`. Generated icons, manifests, builds and packaged copies of the README and skills have explicit sources; edit the source and regenerate.

## Releases

The [Release workflow](https://github.com/envsemble/envUI/actions/workflows/release.yml) verifies a version tag, publishes privately to GitHub Packages and attaches the matching offline HTML. Prereleases use `next`; stable releases use `latest`.

Align `packages/ui/package.json`, the dependency in `apps/catalogue/package.json` and the lockfile, then update the [changelog](packages/ui/CHANGELOG.md). Verify, review and merge before pushing `v<version>`. Published versions are immutable. During `0.x`, breaking changes require a new minor version and migration notes; after `1.0`, a new major version.

Grant consuming repositories package Read access for their GitHub Actions workflows. If only the HTML upload fails, recover it from the same tag without republishing the package.

envUI is proprietary and distributed privately. Bundled third-party assets and dependencies retain their [notices](packages/ui/THIRD_PARTY_NOTICES.md) and [licenses](packages/ui/licenses/).
