# envUI: rules for working on it

The rules every change to envUI follows, for agents and people alike. They stay in the repository and are not packaged; apps that build with envUI read the docs the package ships. Paths are from the repository's root.

| Rules for                                                                                   | In                                             |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| The whole repository: names, checks, tests, generated files, changesets, pages and releases | This file                                      |
| The library, `packages/ui`: files, props, messages, tokens, style sheets, parts, dev mode   | [packages/ui/AGENTS.md](packages/ui/AGENTS.md) |
| The website, `apps/site`: its words and folders, and what it shares                         | [apps/site/AGENTS.md](apps/site/AGENTS.md)     |
| Setting up and opening a change                                                             | [CONTRIBUTING.md](CONTRIBUTING.md)             |
| Writing a component, pattern or foundation page                                             | [contributing/pages.md](contributing/pages.md) |

## Never name the applications built on envUI

- Don't name them in code, docs, comments, changesets, release notes or sample data: envUI's first versions gathered what those applications needed, and naming them makes a component read as built for one.
- Describe the pattern instead.
- Other products, such as the design systems envUI follows, may be named.
- `npm test` rejects the names.

## Name files

- In the site, the tests and the scripts, name a module's file in PascalCase and a hook's `useX`.
- Start the name of a script run as a command with a verb, such as `GenerateParts.ts`.
- Name documentation files in lowercase.
- The library names its files as [packages/ui/AGENTS.md](packages/ui/AGENTS.md#files) says.

## Checks: three tiers, never the full suite every turn

| Tier     | Command                  | When                                                                                       |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| Fast     | `npm run check`          | After each change, while you work: under a minute for a component change                   |
| Affected | `npm run check:affected` | Before pushing a branch or marking its pull request ready: a few minutes                   |
| Full     | `npm run verify`         | When asked, or to reproduce a failure of the Verify workflow on a pull request into `main` |

### The fast tier

- It checks what the branch changed since its merge-base with `origin/envui-1.0`, else `origin/dev`; `--base <ref>` or `ENVUI_BASE` picks another. Uncommitted and untracked files count.
- It runs ESLint, Stylelint and Prettier on those files, unused files and exports (`npm run lint:unused`, `knip.jsonc`), incremental `tsc`, the generated-file checks the change touches, the unit tests that need no build, and the related browser specs in Chromium.
- `npm run check -- --dry-run` prints what it would run and why.

### The affected tier

- It runs every related spec, also those the fast tier leaves out, and their `@engines` tests in Firefox and WebKit.
- It adds the builds the change needs with the unit tests that read them, the layout check where pages or examples changed, and live development when the catalogue changed.

### The full tier

- It runs everything, the accessibility scan of every page and the visual baseline in Docker included; `npm run verify:no-visual` skips the screenshots and says the run doesn't count.
- Don't run it, `test:browser`, `test:a11y` or `test:visual` as a routine step.

### What a changed file runs

`scripts/test/TestScope.ts` selects:

- The spec named after the file or its folder, such as `Checkbox.css` or `Checkbox.fixture.tsx` → `Checkbox.spec.ts`.
- The specs whose fixtures use the file, found through their imports with the TypeScript parser (`scripts/test/FixtureImports.ts`): in the fast tier all of them when they are few, else the most specific six; in the affected tier all of them.
- What `pathRules` there gives the file by glob: the checks a configuration, token, icon or documentation file runs, and the specs of the shared files and the catalogue. A token, theme or shared file runs the contrast gate and a small shared set.
- Add a file to `aliases` there only for a spec neither its name nor the imports find.

### CI

- CI checks every pull request once it is ready: the `CI` job for pull requests into `dev`, and `npm run verify` as the Verify workflow for those into `main`.
- Don't change `.github/workflows`, start or re-run runs, or change the required checks without asking.

## Write tests that stay fast

- Prefer a unit test (`node --test`) to a browser spec, and a computed-style or DOM assertion to a screenshot.
- Put a unit test in the folder of what it tests: `tests/library/`, `tests/site/`, `tests/docs/` (the documentation and its generators), `tests/tooling/` (the checks and the release) or `tests/lint/` (cases both lint packages' tests read; each package's own tests are in its `test/`).
- Put a browser spec of the library in `tests/browser/library/`, one of the site in `tests/browser/site/`, and what several specs share in `tests/browser/helpers/`.
- Test a behaviour once, in its component's spec. Leave colour to the contrast gate and appearance to the visual baseline.
- Tag a test `@engines` when it depends on the engine (scrolling, focus, pointer and input methods, native forms, platform keys); Firefox and WebKit run only those.
- No fixed sleeps: wait for a condition, such as `expect.poll` or the element's animations finishing. Where a test proves nothing happens for a while, wait just past the delay and say so.
- Check independent states on one page load.

### Fixtures

- Give a library spec its own fixture and name both after the component it covers: `tests/fixture/<Name>.fixture.tsx` and `tests/browser/library/<Name>.spec.ts`.
- `tests/fixture/App.tsx` mounts `<Name>.fixture.tsx` as `?fixture=<name>`, its file's name in kebab case, such as `ButtonGroup.fixture.tsx` as `?fixture=button-group`.
- Make the fixture its module's default export. By default it mounts once, in light, in the host page.
- Export `themes = true` to mount it once per theme, given as `theme`; `mount = 'standalone'` for a fixture that fills the viewport or needs it to itself; `mount = 'root'` for one that themes the document through its own provider.
- Keep one fixture to a file: a variant a spec opens on its own takes its own file, such as `TabsRtl.fixture.tsx`.
- Name a fixture several specs open after what it shows, such as `ChoiceControls.fixture.tsx` for Checkbox, Radio and Switch.
- A page of its own, `<Name>.html`, loads `<Name>.fixture.tsx`; list that module among the ones App.tsx leaves out.

## Ports, workers and recorded lists

- The browser tests start or reuse the site on 8770 and the fixture on 8766, reusing a server only when it answers for this checkout.
- Beside another checkout's tests, set `ENVUI_SITE_PORT` and `ENVUI_FIXTURE_PORT`, such as 8832 and 8833.
- `ENVUI_WORKERS` sets the workers (default: half the cores).
- Lists that only shrink: `stylelint-suppressions.json` (after removing violations, `npm run lint:css -- --suppress`), `tests/accessibility/KnownViolations.json` (`npm run test:a11y:update`) and the visual baseline (`npm run test:visual:update`, then review the images like code). Add to them only for a reviewed reason.
- The layout check (`tests/browser/site/LayoutCheck.spec.ts`) runs dev mode on every figure at four widths. Give a problem an example has on purpose an allowance there, with its reason.
- Disable a rule on one line with the reason: `// eslint-disable-next-line rule -- reason`, `/* stylelint-disable-next-line rule -- reason */`.

## Generated files

- Icons, tokens, props, parts, exports, the catalogue's data and packaged copies have sources: edit those and regenerate (`npm run tokens:build`, `docs:props`, `docs:parts`, `docs:exports`, `icons:generate`).
- `npm run check` fails while a generated file is stale.

## Record the change

- Give a change people using envUI notice a changeset: `npm run changeset`, the package and its bump, and the entry as it should read in the changelog, for someone using the package.
- `major` breaks code, such as a renamed prop, value, part class or state; `minor` adds, such as a component, prop or token; `patch` fixes and keeps the API.
- Tests, tooling and catalogue-only changes need none.
- Link documentation from a changeset by its absolute URL on `main`, such as `https://github.com/envsemble/envUI/blob/main/docs/setup.md`, since the entry is read in several places.

## Pages

- Every component, pattern and foundation page in `docs/` is one Markdown file that feeds the catalogue, the Docs and the package. Write it as [contributing/pages.md](contributing/pages.md) says; the build fails on a page outside the structure.
- Keep a fact on the page that owns it. When an integration finds a gap, improve that page rather than adding another guide.

## The lint packages

- `packages/eslint-plugin` and `packages/stylelint-config` hold applications to envUI's components and tokens; their READMEs document the rules and how to run their tests.
- Make a new ESLint rule a file of `packages/eslint-plugin/src/rules/` named after it, registered in `src/index.js` and its recommended config, with its test in `test/<rule>.test.mjs` through `test/RuleTester.mjs`, and its section in the README.
- Configure a Stylelint rule in `packages/stylelint-config/src/index.js` and test it in `test/config.test.mjs`.
- Each package ships its own `src/tokens.js`, `src/colorPolicy.js` and `src/data/tokens.json`, copies that `npm run tokens:build` writes (`scripts/build/SyncLintPackages.ts`): `tokens.js` from `scripts/build/LintPackageTokens.js`; `colorPolicy.js`, what both count as a raw color, from `scripts/build/LintPackageColorPolicy.js`; the data from the library's `packages/ui/src/generated/tokens.json`; and the ESLint plugin's `src/data/entryPoints.json` from the exports of `packages/ui/package.json`.
- Edit the sources, never the copies; `npm run tokens:check` fails on a stale one.

## Releases

- Cut a release from `main` by merging `dev` into it; never release without being asked.
- The library and the lint packages are a fixed group in Changesets and share one version.
- A prerelease goes out under its name as the dist-tag, such as `prerelease`; a stable release under `latest`.
- Published versions are immutable.

1. **On the release branch**, for a stable release, leave prerelease mode first with `npx changeset pre exit`: `npm run changeset:version` in prerelease mode makes another prerelease (undo it with `git restore` and `git clean`, never by editing versions). Then `npm run changeset:version` writes the version, the lockfile and the changelogs.
2. **Finish the changelog section:** the date in its heading, as in `## 1.0.0 — 2026-10-20`, and one or two sentences on what the release brings, the headline changes rather than a list; leave the generated entries as they are.
3. **Check it** with `GITHUB_REF_NAME=v<version> node scripts/release/ValidateRelease.ts` (`--release-notes` prints the notes), retake the README's pictures with `npm run docs:readme-images` if the site's look changed, and commit it as `Release <version>`.
4. **Merge** the branch into `dev`, then `dev` into `main` with a merge commit, through pull requests. The Release workflow validates, builds, publishes the packages to GitHub Packages and the GitHub release; a re-run publishes only what is missing.
5. **Merge `main` back into `dev`**, and grant a new package's Actions access to the repositories that read `@envsemble/envui`.
