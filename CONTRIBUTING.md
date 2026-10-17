# Contributing to envUI

This guide is for working on envUI itself: running the catalogue and the checks, hosting the catalogue and cutting releases. It stays in the repository; the package ships the [README](README.md), whose readers use envUI. How to change the library, record a change and what the checks cover is in [library development](docs/library-development.md).

## Explore and develop

Requires Node.js 24 or newer. Run commands from the repository root:

```sh
npm ci
npm run dev
```

Open the catalogue at [localhost:8770](http://127.0.0.1:8770). It consumes library source directly and updates as you edit.

The catalogue's navigation has the sections Get started, Foundations, Components, Patterns, Templates, Contributing and Changelog. ⌘K or Ctrl+K opens search, in envUI's `CommandPalette`: components by their names and frontmatter `aliases`, their props, the design tokens, and the foundations, patterns and guides; a result opens its page at the prop's or token's row. `scripts/SearchIndex.mjs` builds the MiniSearch index from `docs/`, `docs/generated/props.json` and the token list whenever the documentation is generated, into `apps/catalogue/src/generated/SearchIndex.json`; its `searchDocuments()` gives the same documents to other tools, and `scripts/SearchTerms.mjs` how words are split and matched. The Display menu below the navigation stores the reader's theme, contrast and scale in localStorage.

Routes live in the address's path in development and in the hosted catalogue, such as `/components/button/props#props-Button-variant`, and in its hash in the offline catalogue, `#/components/button/props?section=props-Button-variant`: a file opened from disk, or an archived version under `/v1.2/`, has no server that answers another path with its page. The hosted catalogue opens the hash addresses, and earlier names of pages, at their path addresses.

| Command                    | Purpose                                                       |
| -------------------------- | ------------------------------------------------------------- |
| `npm run dev:library`      | Watch compiled exports for a linked external app              |
| `npm run lint`             | Lint components, the catalogue, tests and scripts with ESLint |
| `npm run lint:css`         | Lint styles with Stylelint                                    |
| `npm run format`           | Format with Prettier; `npm run format:check` only checks      |
| `npm run typecheck`        | Check the library and catalogue, incrementally                |
| `npm run check`            | Fast tier: check what the branch changed, after each change   |
| `npm run check:affected`   | Affected tier: the change in every engine, before committing  |
| `npm run build`            | Build the package and offline catalogue                       |
| `npm run build:site`       | Build the hosted catalogue, described under Hosting below     |
| `npm run site:dev`         | Build the hosted catalogue and serve it locally               |
| `npm test`                 | Test package consumers, SSR and hydration                     |
| `npm run test:browser`     | Check interactions in Chromium, Firefox and WebKit            |
| `npm run test:a11y`        | Scan every page of the hosted build with axe in both themes   |
| `npm run test:visual`      | Compare screenshots with the visual baseline, in Docker       |
| `npm run verify`           | Full tier: every check and the visual baseline; needs Docker  |
| `npm run verify:no-visual` | Every check but the visual baseline, ending with a warning    |
| `npm run changeset`        | Record a change for the changelog                             |

Install browser engines before running the checks:

```sh
npx playwright install chromium firefox webkit
```

### Checks in three tiers

The checks come in three tiers, so that a change is checked in seconds while it is made and in full only before it ships:

1. **`npm run check`, after each change.** It looks at what the branch changed since it left the integration branch (`origin/envui-1.0`, else `origin/dev`; `--base <ref>` or `ENVUI_BASE` picks another), including uncommitted and untracked files, and runs ESLint, Stylelint and Prettier on those files, `tsc` incrementally, the generated-file checks the change touches, the unit tests that need no build, and the browser specs related to the change in Chromium. It prints what it selected and why; `npm run check -- --dry-run` prints only that, and options go after `--` in the same way. On a 24-thread machine it takes about 1 second with nothing changed, 10 to 20 seconds for a component, token or documentation change, and under a minute for a change across the catalogue.
2. **`npm run check:affected`, before committing a branch or merging it into the integration branch.** The fast tier, plus the related specs in Chromium, Firefox and WebKit, the builds the change needs and the unit tests that read them, and the accessibility scan and screenshots of the affected catalogue pages. The screenshots need Docker; `--skip-visual` leaves them out with a warning. About 2 minutes for a component change.
3. **`npm run verify`, before a release (tagging or publishing), before merging into `dev` or `main`, or when asked.** Every check: generated files, lint, formatting, types, the three builds, every unit test, every browser spec in all three engines with the contrast gate, the accessibility scan of every page, live development and the visual baseline. It builds once and runs independent checks side by side. About 20 minutes on a 24-thread machine; it took about 30 before the tiers. `npm run verify:no-visual` runs everything but the screenshots and ends with a warning that the run does not count as verified.

How the first two choose what to run is described in [library development](docs/library-development.md#verify). The browser suite uses half the cores; `ENVUI_WORKERS` sets another count or share, such as `ENVUI_WORKERS=25%`.

Build outputs are `packages/ui/dist/`, `dist/envUI.html` and, from `npm run build:site`, `dist/site/`. CI retains the offline catalogue and browser diagnostics as artifacts. CI runs for pull requests into `main` and pushes to `main` only, and tests in Chromium alone. Run `npm run check:affected` before pushing a branch or merging it into the integration branch, and `npm run verify`, which tests everything in all three engines, before merging into `dev` or `main` and before a release.

Some browser specs open the hosted catalogue from `dist/site/`. `npm run verify` and `npm run check:affected` build it before the browser tests, and so does CI's browser job, a step of a few seconds; where `CI` is set, a missing build fails those specs. A local `npm run test:browser` uses the last build and skips them without one, so run `npm run build:site` first when you change the catalogue's loading or the site build.

## Repository map

```text
AGENTS.md            The testing policy and pointers for agents working on envUI
.agents/skills/      The agent skills, the source of every copy
.agents/plugins/     A plugin marketplace that lists plugin/
.claude-plugin/      A plugin marketplace that lists plugin/ (one per client)
plugin/              The envui agent plugin: manifests, MCP server and a copy of the skills
docs/                Canonical Markdown documentation and discovery index
apps/catalogue/      Live previews and the offline catalogue application
  site/              The hosted catalogue's Worker script and response headers
packages/ui/         The publishable @envsemble/envui package
  src/               Components by family, styles and public entry points
  licenses/          Third-party license texts
packages/codemods/   @envsemble/envui-codemods: upgrades code from 0.x to 1.0
packages/eslint-plugin/      @envsemble/eslint-plugin-envui: lint rules for apps
packages/stylelint-config/   @envsemble/stylelint-config-envui: style rules for apps
assets/brand/        Original envUI artwork, used by the catalogue only
assets/readme/       Light/dark captures of the catalogue for the README
scripts/             Builds, asset generation, local watching and release validation
tests/               Package contract tests, browser specs and React fixtures
.github/workflows/   CI and tagged package releases
```

React components and scripts use PascalCase filenames; hooks and helpers use camelCase. Documentation uses lowercase filenames. Keep standard tool filenames such as `package.json`, `index.ts` and `vite.config.ts`. Generated icons, manifests, catalogue data, builds and packaged copies of the README, skills and documentation have explicit sources; edit the source and regenerate.

## Hosting

The catalogue is also a website for envsemble. It isn't deployed yet: the domain, most likely `envUI.envsemble.com`, and the connection to Cloudflare are still to be decided. Until then it runs locally.

- `npm run build:site` builds it into `dist/site/`: separate files with content-hashed names, so browsers keep them cached. It needs no network. It also writes `module-files.json`, from Vite's manifest: the files behind each part of a page that loads on its own, such as an example. When one fails to load, "Reload the page" fetches them again first, since WebKit otherwise keeps the failed file for the whole tab, and it doesn't reload when the connection seems to be down.
- `npm run site:dev` builds it and serves it at [localhost:8771](http://127.0.0.1:8771) in Wrangler, the Workers runtime that will host it. `npm run site:dev -- --port <port>` picks another port, and `npm run site:serve` serves the last build again.
- `npm run build:site -- --with-versions` also downloads the offline catalogue attached to each GitHub release. The newest patch of every minor goes to `/v<major>.<minor>/`, and `/versions.json` lists them. It reads the releases with `GH_TOKEN` or `GITHUB_TOKEN`, or else through a signed-in `gh` CLI. Without either, it skips them with a warning. With a token, a failed download fails the build, and so does a download, fresh or cached in `.cache/site-versions`, that does not match the SHA-256 digest listed for the release asset. A version whose `envUI.html` is over 25 MiB, more than a Worker serves, is skipped with a warning in a local build; a production build, on Workers Builds (which sets `CI`) or with `--production`, fails instead, so the site never deploys without it.

`dist/envUI.html` stays the release artifact. The site is a Cloudflare Worker, configured in `wrangler.jsonc`, that serves `dist/site/` as static assets:

- A path without a file gets `index.html`, so the catalogue's routes, which live in the URL path, load from a deep link and on a refresh. Links between its pages change the address without loading the catalogue again.
- `apps/catalogue/site/_headers` sets the security headers, and pages are revalidated on every load.
- A small Worker script runs first for `/assets/` (`run_worker_first`). It serves the hashed files there with a year-long cache, and answers a missing one with 404, also when a browser opens it as a page, so `index.html` is never cached under a file's name. These requests count as Worker requests; other files and page loads never run the script.
- `workers_dev` and `preview_urls` are `false`, so the site has no `workers.dev` address or Preview URLs until Cloudflare Access protects them; step 5 below turns them on.

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
   - With preview builds enabled and, after step 5, Preview URLs on, every other branch gets a Preview URL that follows it: `<branch>-envui.<subdomain>.workers.dev`. `dev` serves "next" at a stable address.
   - Pull requests get a comment with their branch's preview.
3. **Custom domain.** Add the chosen hostname in the Worker's Settings → Domains & Routes. Alternatively, add `"routes": [{ "pattern": "envui.envsemble.com", "custom_domain": true }]` to `wrangler.jsonc`. The `envsemble.com` zone must be on the same Cloudflare account.
4. **Cloudflare Access.**
   - In Zero Trust, add GitHub login as an identity provider, with an OAuth app owned by the envsemble organization. Keep the one-time PIN login method as the email fallback.
   - Protect the custom domain with an Access application for its hostname.
   - The policy allows members of the envsemble organization. A second rule allows listed email addresses through the one-time PIN.
   - Access is free for up to 50 users.
5. **workers.dev and Preview URLs, behind Access.** Only once Access is set up:
   - In the Worker's Settings → Domains & Routes, choose Enable Cloudflare Access for workers.dev and the Preview URLs, with the same policy.
   - Set `workers_dev` and `preview_urls` to `true` in `wrangler.jsonc` and merge the change, so the next deployment turns both on. A deployment with them `false` turns them off again.
   - In a private window, check that the `workers.dev` address and a branch's Preview URL both ask for the Access login.

## Releases

Releases are cut from `main`. Each change records its changelog entry as a changeset in `.changeset/`; see [library development](docs/library-development.md). To prepare a release, run `npm run changeset:version`. It applies the pending changesets to the four published packages (`packages/ui`, `packages/codemods`, `packages/eslint-plugin` and `packages/stylelint-config`), which share one version, the dependency in `apps/catalogue/package.json`, the lockfile, the version of the [agent plugin](docs/agent-tooling.md#how-a-release-updates-the-plugin) in `plugin/` and the [changelog](packages/ui/CHANGELOG.md), where it adds the version above the earlier ones. Add the date to its heading and a sentence on what the release brings, as earlier releases have. Verify, review and merge `dev` into `main` through a pull request, then push a `v<version>` tag on `main`. The [Release workflow](https://github.com/envsemble/envUI/actions/workflows/release.yml) then:

- rejects tags that are not on `main`;
- verifies the tag matches the package version;
- publishes the four packages privately to GitHub Packages;
- creates a GitHub release with that version's CHANGELOG section and the matching offline HTML.

Prereleases use `next`; stable releases use `latest`. The work towards 1.0 is in Changesets' prerelease mode for `next` (`.changeset/pre.json`), so each `npm run changeset:version` produces the next `1.0.0-next.N`. Breaking changes are `major` changesets, and the first prerelease needs one to start at 1.0.0. Before releasing 1.0.0, run `npx changeset pre exit`: the next `npm run changeset:version` then releases 1.0.0 with the entries of every prerelease. A later prerelease line starts with `npx changeset pre enter next`.

Published versions are immutable. Breaking changes require a new major version and migration notes.

Grant consuming repositories package Read access for their GitHub Actions workflows. If only the HTML upload fails, recover it from the same tag without republishing the package.
