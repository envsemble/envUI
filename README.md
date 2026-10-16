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

| Command                | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev:library`  | Watch compiled exports for a linked external app                  |
| `npm run lint`         | Lint components, the catalogue, tests and scripts with ESLint     |
| `npm run lint:css`     | Lint styles with Stylelint                                        |
| `npm run format`       | Format with Prettier; `npm run format:check` only checks          |
| `npm run typecheck`    | Check the library and catalogue                                   |
| `npm run build`        | Build the package and offline catalogue                           |
| `npm run build:site`   | Build the hosted catalogue, described under Hosting below         |
| `npm run site:dev`     | Build the hosted catalogue and serve it locally                   |
| `npm test`             | Test package consumers, SSR and hydration                         |
| `npm run test:browser` | Check interactions in Chromium, Firefox and WebKit                |
| `npm run test:a11y`    | Scan every catalogue page with axe in both themes                 |
| `npm run test:visual`  | Compare screenshots with the visual baseline, in Docker           |
| `npm run verify`       | Run every check; the visual baseline only while Docker is running |
| `npm run changeset`    | Record a change for the changelog                                 |

Install browser engines before running the full checks:

```sh
npx playwright install chromium firefox webkit
npm run verify
```

Build outputs are `packages/ui/dist/`, `dist/envUI.html` and, from `npm run build:site`, `dist/site/`. CI retains the offline catalogue and browser diagnostics as artifacts. CI runs for pull requests into `main` and pushes to `main` only, and tests in Chromium alone, so run `npm run verify`, which tests all three engines, before pushing a branch or merging into `dev`.

## Repository map

```text
.agents/skills/       Two small entry points for agents
docs/                Canonical Markdown documentation and discovery index
apps/catalogue/      Live previews and the offline catalogue application
  site/              The hosted catalogue's Worker script and response headers
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

## Hosting

The catalogue is also a website for envsemble. It isn't deployed yet: the domain, most likely `envUI.envsemble.com`, and the connection to Cloudflare are still to be decided. Until then it runs locally.

- `npm run build:site` builds it into `dist/site/`: separate files with content-hashed names, so browsers keep them cached. It needs no network.
- `npm run site:dev` builds it and serves it at [localhost:8771](http://127.0.0.1:8771) in Wrangler, the Workers runtime that will host it. `npm run site:dev -- --port <port>` picks another port, and `npm run site:serve` serves the last build again.
- `npm run build:site -- --with-versions` also downloads the offline catalogue attached to each GitHub release. The newest patch of every minor goes to `/v<major>.<minor>/`, and `/versions.json` lists them. It reads the releases with `GH_TOKEN` or `GITHUB_TOKEN`, or else through a signed-in `gh` CLI. Without either, it skips them with a warning. With a token, a failed download fails the build.

`dist/envUI.html` stays the release artifact. The site is a Cloudflare Worker, configured in `wrangler.jsonc`, that serves `dist/site/` as static assets:

- A path without a file gets `index.html`, ready for routes in the URL path.
- `apps/catalogue/site/_headers` sets the security headers. Pages are revalidated on every load, and hashed files are cached for a year.
- A small Worker script answers a missing hashed file with 404, so a stale page never caches `index.html` under its name. Requests for files and page loads never run the script.

### Deploying

Builds run on Cloudflare with Workers Builds, so they use no GitHub Actions minutes. The free plan includes 3,000 build minutes a month.

1. **Connect the repository.** In the Cloudflare dashboard, open Workers & Pages, choose Create application and import `envsemble/envUI`. This installs Cloudflare's Workers and Pages app on the envsemble organization; limit it to this repository. The Worker must be named `envui`, as in `wrangler.jsonc`. Use these build settings:
   - Root directory: the repository root.
   - Build command: `npm run build:site -- --with-versions`. Dependencies are installed with `npm ci` before it runs.
   - Deploy command: `npx wrangler deploy`. Preview command: `npx wrangler preview`. Both are the defaults.
   - Build secret `GITHUB_TOKEN`: a fine-grained GitHub token with read-only Contents access to `envsemble/envUI` alone. Without it, the site deploys without its archived versions; once it expires, builds fail until it is renewed.
   - Node.js: the build image's default is 24. Set `NODE_VERSION` to pin a version.
2. **Branches.**
   - `main` is the production branch. It deploys to the custom domain and serves the latest release.
   - With preview builds enabled, every other branch gets a Preview URL that follows it: `<branch>-envui.<subdomain>.workers.dev`. `dev` serves "next" at a stable address.
   - Pull requests get a comment with their branch's preview.
3. **Custom domain.** Add the chosen hostname in the Worker's Settings → Domains & Routes. Alternatively, add `"routes": [{ "pattern": "envui.envsemble.com", "custom_domain": true }]` to `wrangler.jsonc`. The `envsemble.com` zone must be on the same Cloudflare account.
4. **Cloudflare Access.**
   - In Zero Trust, add GitHub login as an identity provider, with an OAuth app owned by the envsemble organization. Keep the one-time PIN login method as the email fallback.
   - In the Worker's Settings → Domains & Routes, choose Enable Cloudflare Access for workers.dev and the Preview URLs. Protect the custom domain with an Access application for its hostname.
   - The policy allows members of the envsemble organization. A second rule allows listed email addresses through the one-time PIN.
   - Access is free for up to 50 users.

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
