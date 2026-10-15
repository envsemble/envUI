<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/envUI/envUI-lockup-white.svg">
  <img src="assets/brand/envUI/envUI-lockup-black.svg" alt="envUI" width="240">
</picture>

**The shared interface library for envsemble.**

[![CI](https://github.com/envsemble/envUI/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/envsemble/envUI/actions/workflows/ci.yml)
![React 19](https://img.shields.io/badge/React-19-149eca)
![Node.js 24+](https://img.shields.io/badge/Node.js-24%2B-417e38)
![Private package](https://img.shields.io/badge/GitHub_Packages-private-6e40c9)

envUI brings consistent themes, composition and interaction to React applications: from a button or a native form to dialogs, notifications and rich text. It ships as a private ESM package with TypeScript declarations, local fonts, icons and two versioned agent skills.

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

Requires React and React DOM 19, plus access to the private `@envsemble` GitHub Packages registry. See [setup](docs/setup.md) for registry access and the [documentation index](docs/index.md) for examples matching the installed version.

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

The skills are short entry points. The [documentation index](docs/index.md) directs agents to focused Markdown pages with examples and behavior; they read only the topics needed for the task. The catalogue renders those same pages in its Usage tabs. Public TypeScript declarations define the exact API for each installed version.

Both skill folders ship under `skills/` in the npm package. Install or copy them from `node_modules/@envsemble/envui/skills` into your project’s `.agents/skills`, keeping them together and aligned with the package version. Installing the npm package does not register the skills automatically.

Documentation ships separately under `node_modules/@envsemble/envui/docs/`, so copied skills can consult the installed version without loading unrelated topics. Edit the maintained pages under `docs/`; improve the relevant page as integrations reveal gaps.

## Explore and develop

Requires Node.js 24 or newer. Run commands from the repository root:

```sh
npm ci
npm run dev
```

Open the catalogue at [localhost:8770](http://127.0.0.1:8770). It consumes library source directly and updates as you edit.

| Command                | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `npm run dev:library`  | Watch compiled exports for a linked external app              |
| `npm run lint`         | Lint components, the catalogue, tests and scripts with ESLint |
| `npm run lint:css`     | Lint styles with Stylelint                                    |
| `npm run format`       | Format with Prettier; `npm run format:check` only checks      |
| `npm run typecheck`    | Check the library and catalogue                               |
| `npm run build`        | Build the package and offline catalogue                       |
| `npm test`             | Test package consumers, SSR and hydration                     |
| `npm run test:browser` | Check interactions in Chromium, Firefox and WebKit            |
| `npm run verify`       | Run the complete CI verification sequence                     |
| `npm run changeset`    | Record a change for the changelog                             |

Install browser engines before running the full checks:

```sh
npx playwright install chromium firefox webkit
npm run verify
```

Build outputs are `packages/ui/dist/` and `dist/envUI.html`. CI retains the offline catalogue and browser diagnostics as artifacts. CI runs for pull requests into `main` and pushes to `main` only, and tests in Chromium alone, so run `npm run verify`, which tests all three engines, before pushing a branch or merging into `dev`.

## Repository map

```text
.agents/skills/       Two small entry points for agents
docs/                Canonical Markdown documentation and discovery index
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

React components and scripts use PascalCase filenames; hooks and helpers use camelCase. Documentation uses lowercase filenames. Keep standard tool filenames such as `package.json`, `index.ts` and `vite.config.ts`. Generated icons, manifests, catalogue data, builds and packaged copies of the README, skills and documentation have explicit sources; edit the source and regenerate.

## Releases

Releases are cut from `main`. Each change records its changelog entry as a changeset in `.changeset/`; see [library development](docs/library-development.md). To prepare a release, run `npm run changeset:version`. It applies the pending changesets to `packages/ui/package.json`, the dependency in `apps/catalogue/package.json`, the lockfile and the [changelog](packages/ui/CHANGELOG.md), where it adds the version above the earlier ones. Add the date to its heading and a sentence on what the release brings, as earlier releases have. Verify, review and merge `dev` into `main` through a pull request, then push a `v<version>` tag on `main`. The [Release workflow](https://github.com/envsemble/envUI/actions/workflows/release.yml) then:

- rejects tags that are not on `main`;
- verifies the tag matches the package version;
- publishes privately to GitHub Packages;
- creates a GitHub release with that version's CHANGELOG section and the matching offline HTML.

Prereleases use `next`; stable releases use `latest`. The work towards 1.0 is in Changesets' prerelease mode for `next` (`.changeset/pre.json`), so each `npm run changeset:version` produces the next `1.0.0-next.N`. Breaking changes are `major` changesets, and the first prerelease needs one to start at 1.0.0. Before releasing 1.0.0, run `npx changeset pre exit`: the next `npm run changeset:version` then releases 1.0.0 with the entries of every prerelease. A later prerelease line starts with `npx changeset pre enter next`.

Published versions are immutable. Breaking changes require a new major version and migration notes.

Grant consuming repositories package Read access for their GitHub Actions workflows. If only the HTML upload fails, recover it from the same tag without republishing the package.

envUI is proprietary and distributed privately. Bundled third-party assets and dependencies retain their [notices](packages/ui/THIRD_PARTY_NOTICES.md) and [licenses](packages/ui/licenses/).
