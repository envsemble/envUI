# Contributing to envUI

This guide is for working on envUI itself: running the catalogue and the checks, hosting the catalogue and cutting releases. It stays in the repository; the package ships the [README](README.md), whose readers use envUI. How to change the library, record a change and what the checks cover is in [library development](docs/library-development.md).

## Explore and develop

Requires Node.js 24 or newer. Run commands from the repository root:

```sh
npm ci
npm run dev
```

Open the catalogue at [localhost:8770](http://127.0.0.1:8770). It consumes library source directly and updates as you edit.

The catalogue's navigation has the sections Get started, Foundations, Components, Patterns, Contributing and Changelog. ⌘K or Ctrl+K opens search, in envUI's `CommandPalette`: components by their names and frontmatter `aliases`, their props, the design tokens, and the foundations, patterns and guides; a result opens its page at the prop's or token's row. `scripts/SearchIndex.mjs` builds the MiniSearch index from `docs/`, `docs/generated/props.json` and the token list whenever the documentation is generated, into `apps/catalogue/src/generated/SearchIndex.json`; its `searchDocuments()` gives the same documents to other tools, and `scripts/SearchTerms.mjs` how words are split and matched. The Display menu below the navigation stores the reader's theme, contrast and scale in localStorage.

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
| `npm run test:a11y`        | Scan every page of the hosted build with axe                  |
| `npm run test:visual`      | Compare screenshots with the visual baseline, in Docker       |
| `npm run verify`           | Full tier: every check and the visual baseline; needs Docker  |
| `npm run verify:no-visual` | Every check but the visual baseline, ending with a warning    |
| `npm run changeset`        | Record a change for the changelog                             |

Install browser engines before running the checks:

```sh
npx playwright install chromium firefox webkit
```

### Checks in three tiers

The checks come in three tiers, so that a change is checked in seconds while it is made and in full only before it ships. CI checks every pull request as well; see [CI](#ci).

1. **`npm run check`, after each change.** It looks at what the branch changed since it left the integration branch (`origin/envui-1.0`, else `origin/dev`; `--base <ref>` or `ENVUI_BASE` picks another), including uncommitted and untracked files, and runs ESLint, Stylelint and Prettier on those files, `tsc` incrementally, the generated-file checks the change touches, the unit tests that need no build, and the browser specs related to the change in Chromium. It prints what it selected and why; `npm run check -- --dry-run` prints only that, and options go after `--` in the same way. On a 24-thread machine it takes about 1 second with nothing changed and under a minute for a component, token or documentation change.
2. **`npm run check:affected`, before pushing a branch or marking its pull request ready.** The fast tier, plus the related specs in Chromium and their `@engines` tests in Firefox and WebKit, the builds the change needs and the unit tests that read them, and live development when the catalogue changed. A few minutes for a component change.
3. **`npm run verify`, when asked or to reproduce a failure of the Verify workflow, which runs it on every pull request into `main`.** Every check: generated files, lint, formatting, types, the three builds, every unit test, every browser spec in Chromium and the `@engines` tests in Firefox and WebKit, with the contrast gate, the accessibility scan of every page, live development and the visual baseline. It builds once and runs independent checks side by side. About 20 minutes on a 24-thread machine; it took about 30 before the tiers. `npm run verify:no-visual` runs everything but the screenshots and ends with a warning that the run does not count as verified.

How the first two choose what to run is described in [library development](docs/library-development.md#verify). The browser suite uses half the cores; `ENVUI_WORKERS` sets another count or share, such as `ENVUI_WORKERS=25%`.

Build outputs are `packages/ui/dist/`, `dist/envUI.html` and, from `npm run build:site`, `dist/site/`.

### CI

CI follows the envsemble organization's practice: it runs for pull requests only, once they are ready for review, on the Linux runner the organization variable `CI_LINUX_RUNNER` names. Drafts run nothing, a new push cancels the older run, and every job has a time limit.

- **Pull requests into `dev`** run one `CI` job: the generated-file checks, lint, formatting, types, the builds, the unit tests and the browser specs in Chromium, then a Betterleaks scan of the history. Every change runs the checks: envUI's Markdown is package content that ships and renders in the catalogue, and Prettier and the tests read the contributors' guides too.
- **Pull requests into `main`** are the releases. The Verify workflow runs the full `npm run verify` for them, and the `CI` job runs only the scan, so nothing runs twice. `main` requires `CI` and `Verify`, `dev` requires `CI`.
- **Merging a pull request into `main`** publishes its version when it isn't released yet; see [Releases](#releases).
- **Artifacts** come only from failures: the browser traces and screenshots, kept for the organization's retention. An upload that fails never fails the job.

Some browser specs open the hosted catalogue from `dist/site/`. `npm run verify` and `npm run check:affected` build it before the browser tests, and so does CI, a step of a few seconds; where `CI` is set, a missing build fails those specs. A local `npm run test:browser` uses the last build and skips them without one, so run `npm run build:site` first when you change the catalogue's loading or the site build.

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
.github/workflows/   CI, the release pull requests' Verify and the release on merge
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

Releases are cut from `main`. Each change records its changelog entry as a changeset in `.changeset/`; see [library development](docs/library-development.md). The four published packages (`packages/ui`, `packages/codemods`, `packages/eslint-plugin` and `packages/stylelint-config`) are a fixed group in Changesets and share one version. A prerelease goes out under its own name as the dist-tag, `prerelease` for `1.0.0-prerelease.N`; stable releases use `latest`. Breaking changes are `major` changesets.

Published versions are immutable. Breaking changes require a new major version and migration notes.

### Changelog links

A changeset's entry ends up in `packages/ui/CHANGELOG.md`, on the catalogue's Changelog page, in the CHANGELOG of the npm tarball and in the GitHub release notes. A relative link resolves differently in each, so changesets link to documentation with an absolute URL to the file on `main`, such as `https://github.com/envsemble/envUI/blob/main/docs/migration.md#tokens`, never `../../docs/migration.md#tokens` or `./docs/migration.md#tokens`. The repository is private, and the changelog's readers are envsemble members who can open it. Once a released entry links to a heading in `docs/migration.md`, keep that heading's anchor.

### Prepare the release commit

The release commit is made on the branch that carries the release, such as `envui-1.0`, before it is merged into `dev`:

1. **Leave prerelease mode, for a stable release.** The work towards 1.0 is in Changesets' prerelease mode for `prerelease` (`.changeset/pre.json`), where each `npm run changeset:version` produces the next `1.0.0-prerelease.N` and keeps the changesets it applied in `.changeset/pre/`. For a stable release, run `npx changeset pre exit` first. The order matters: `npm run changeset:version` still in prerelease mode makes another prerelease instead. If that happens, discard the result with `git restore` and `git clean` on `.changeset/`, `packages/`, `apps/catalogue/`, `plugin/` and the lockfile, rather than editing versions by hand.
2. **Apply the changesets.** `npm run changeset:version` writes the version into the four packages, the dependency in `apps/catalogue/package.json`, the lockfile, the version of the [agent plugin](docs/agent-tooling.md#how-a-release-updates-the-plugin) in `plugin/` and the changelogs, such as the [library's](packages/ui/CHANGELOG.md), where it adds the version above the earlier ones. It removes the changesets it applied, or in prerelease mode moves them into `.changeset/pre/`.
3. **Finish the changelog section.** Add the date to its heading, as in `## 1.0.0 — 2026-10-20`, and the summary below it; see [Release notes](#release-notes).
4. **Check it.** `GITHUB_REF_NAME=v1.0.0 node scripts/ValidateRelease.mjs` checks what the Release workflow checks before it publishes, with the version's tag: the four packages, the catalogue's dependency and both plugin manifests carry the version, and the changelog has a section for it. With `--release-notes` it prints that section as the release notes will read.
5. **Commit** the result as one release commit, such as `Release 1.0.0`.

A later prerelease line starts with `npx changeset pre enter prerelease`.

### Release notes

The GitHub release's notes are the version's changelog section, so its first paragraph, written by hand, is what most readers see:

- One or two sentences on what the release brings for people who use envUI, in the style of the earlier releases: the headline components and changes, not a list.
- For 1.0.0, say that it is the first stable release, that it breaks code written for 0.x, that `@envsemble/envui-codemods` makes most of the changes, and link the [migration guide](docs/migration.md) by its absolute URL on `main`.
- Name no products or applications, as in changesets.
- Leave the generated entries below as Changesets wrote them. Fix a wrong entry where it stands rather than rewriting the section.

### Release by merging into main

1. **Make the release commit** on the release branch, as [above](#prepare-the-release-commit), and merge the branch into `dev` through its pull request.
2. **Open a pull request from `dev` into `main`** (`gh pr create --base main --head dev`). CI and the Verify workflow check it; `main` requires both.
3. **Merge it with a merge commit**, not a squash, so `main` keeps the history of `dev`. The [Release workflow](https://github.com/envsemble/envUI/actions/workflows/release.yml) then, when the version isn't released yet:
   - validates the release with `scripts/ValidateRelease.mjs`;
   - builds the packages and the offline catalogue;
   - drafts a GitHub release with the version's CHANGELOG section and `dist/envUI.html`;
   - publishes the four packages to GitHub Packages under the version's dist-tag, the library first, then the codemods and the two lint packages;
   - publishes the release, which creates the `v<version>` tag on the merge commit.

   A failed run leaves the draft; re-running it publishes only the packages that are still missing, then the release. A merge whose version is already released publishes nothing.

4. **Grant package access** after the first release of a package. 1.0.0-prerelease.0 is the first release of `@envsemble/envui-codemods`, `@envsemble/eslint-plugin-envui` and `@envsemble/stylelint-config-envui`, and a new package grants no repository access. In each one's settings, `https://github.com/orgs/envsemble/packages/npm/<name>/settings`, check that it is linked to `envsemble/envUI`, and under Manage Actions access give Read to every repository that has Read on `@envsemble/envui`. Later releases keep these settings.
5. **Check the release.** In a consuming project, `npm view @envsemble/envui dist-tags` shows the version under its dist-tag, and after installing it `npx --no envui -v` prints it. `--version` must follow `--`, as in `npx --no -- envui --version`; `npx envui --version` prints npm's own version.
6. **Merge `main` back into `dev`** through a pull request (`gh pr create --base dev --head main`), so `dev` has the merge commit and the next release merges cleanly.

Consuming repositories need package Read access for their GitHub Actions workflows, on each of the packages they install.
