# envUI: rules for working on it

The rules every change to envUI follows, for agents and people alike. It stays in the repository and is not packaged; apps that build with envUI read the docs the package ships. Setting up and opening a change: [CONTRIBUTING.md](CONTRIBUTING.md). Writing a component, pattern or foundation page: [contributing/pages.md](contributing/pages.md).

## Never name the applications built on envUI

Not in code, docs, comments, changesets, release notes or sample data: its first versions gathered what those applications needed, and naming them makes a component read as built for one. Describe the pattern instead. Other products, such as the design systems envUI follows, may be named. `npm test` rejects the names.

## Checks: three tiers, never the full suite every turn

| Tier     | Command                  | When                                                                                       |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| Fast     | `npm run check`          | After each change, while you work: under a minute for a component change                   |
| Affected | `npm run check:affected` | Before pushing a branch or marking its pull request ready: a few minutes                   |
| Full     | `npm run verify`         | When asked, or to reproduce a failure of the Verify workflow on a pull request into `main` |

- **The fast tier** checks what the branch changed since its merge-base with `origin/envui-1.0`, else `origin/dev` (`--base <ref>` or `ENVUI_BASE` picks another), with uncommitted and untracked files: ESLint, Stylelint and Prettier on those files, unused files and exports (`npm run lint:unused`, `knip.jsonc`), incremental `tsc`, the generated-file checks the change touches, the unit tests that need no build, and the related browser specs in Chromium. `npm run check -- --dry-run` prints what it would run and why.
- **The affected tier** runs every related spec, also those the fast tier leaves out, and adds their `@engines` tests in Firefox and WebKit, the builds the change needs with the unit tests that read them, the layout check where pages or examples changed, and live development when the catalogue changed.
- **The full tier** runs everything, the accessibility scan of every page and the visual baseline in Docker included (`npm run verify:no-visual` skips the screenshots and says the run doesn't count). Don't run it, `test:browser`, `test:a11y` or `test:visual` as a routine step.
- **The selection** (`scripts/test/TestScope.ts`): a file runs the spec named after it or its folder, such as `Checkbox.css` → `Checkbox.spec.ts`, and the specs whose fixtures use it, found through their imports with the TypeScript parser (`scripts/test/FixtureImports.ts`): in the fast tier all of them when they are few, else the most specific six, and in the affected tier all of them. Add a file to `aliases` there only for a spec neither finds. `pathRules` there says, by glob, what other files need: the checks a configuration, token, icon or documentation file runs, and the specs of the shared files and the catalogue; a token, theme or shared file runs the contrast gate and a small shared set.
- **CI** checks every pull request once it is ready: the `CI` job for pull requests into `dev`, and `npm run verify` as the Verify workflow for those into `main`. Don't change `.github/workflows`, start or re-run runs, or change the required checks without asking.

### Write tests that stay fast

- Prefer a unit test (`node --test`) to a browser spec, and a computed-style or DOM assertion to a screenshot. A unit test goes in the folder of what it tests: `tests/library/`, `tests/site/`, `tests/docs/` (the documentation and its generators), `tests/tooling/` (the checks and the release) or `tests/lint/` (cases both lint packages' tests read; each package's own tests are in its `test/`).
- A browser spec of the library goes in `tests/browser/library/`, one of the site in `tests/browser/site/`, and what several share in `tests/browser/helpers/`. Give a library spec its own fixture (`?fixture=<name>` in `tests/fixture`) and name it after the component it covers. Test a behaviour once, in its component's spec; leave colour to the contrast gate and appearance to the visual baseline.
- Tag a test `@engines` when it depends on the engine (scrolling, focus, pointer and input methods, native forms, platform keys); Firefox and WebKit run only those.
- No fixed sleeps: wait for a condition, such as `expect.poll` or the element's animations finishing. Where a test proves nothing happens for a while, wait just past the delay and say so.
- Check independent states on one page load.

### Ports, workers and recorded lists

- The browser tests start or reuse the site on 8770 and the fixture on 8766, reusing a server only when it answers for this checkout. Beside another checkout's tests, set `ENVUI_SITE_PORT` and `ENVUI_FIXTURE_PORT`, such as 8832 and 8833. `ENVUI_WORKERS` sets the workers (default: half the cores).
- Lists that only shrink: `stylelint-suppressions.json` (after removing violations, `npm run lint:css -- --suppress`), `tests/accessibility/KnownViolations.json` (`npm run test:a11y:update`) and the visual baseline (`npm run test:visual:update`, then review the images like code). Add to them only for a reviewed reason.
- The layout check (`tests/browser/site/LayoutCheck.spec.ts`) runs dev mode on every figure at four widths; a problem an example has on purpose takes an allowance there, with its reason.
- Disable a rule on one line with the reason: `// eslint-disable-next-line rule -- reason`, `/* stylelint-disable-next-line rule -- reason */`.

## The library

- **Files.** A component lives in its family under `packages/ui/src`, in a file named after its main export: PascalCase for a component, a context or a namespace, `useX` for a hook, camelCase for other modules, entry points lowercase. Code one family uses sits in its `internal/` folder, shared code in the top-level `internal/`. Public exports go through the entry points, such as `index.ts`, `content.ts` and `rich-text.ts`.
- **Props.** A boolean defaults to false, unless it turns off a feature shown by default: then it is named after the feature, such as `header` or `closeButton`, and defaults to true; `show*` is for an opt-in display, such as Spinner's `showLabel`. Signatures use envUI's own types, but a third-party type stays where it is the point of a prop, such as Tiptap's `Editor` on RichTextEditor.
- **Messages.** A component's strings live in `foundations/messages/`, one namespace per component or family, named after it (`copyButton`) or after the concept a family sets (`themePreference`). A prop that overrides one is named after its key: `<x>Label` reads `messages.<namespace>.<x>`. A number that picks a plural form arrives as `count` with `countText`, the count in the locale's digits; any other number arrives as locale text.
- **What belongs in envUI.** A variant, slot or component every application needs, built on envUI's primitives and tokens; routing, authorization, validation, preferences and persistence stay in the application.
- **Generated files.** Icons, tokens, props, parts, the catalogue's data and packaged copies have sources: edit those and regenerate (`npm run tokens:build`, `docs:props`, `docs:parts`, `icons:generate`); `npm run check` fails while a generated file is stale. `src/generated/` holds the token build's output, `Tokens.css` and `tokens.json`: never edit it.

### Changing a component touches

- Its module in its family and its style sheet, `src/styles/<Name>.css`; a new component also its entry point's export.
- `src/parts.json` for a new part, state or color property, then `npm run docs:parts`; a prop's TSDoc, then `npm run docs:props`.
- Its strings in `src/foundations/messages/`.
- Its page, `docs/components/<name>.md` or `docs/patterns/`, with its examples in `apps/site/src/examples/<page>/` and its gallery tile in `apps/site/src/tiles/`.
- Its spec, `tests/browser/library/<Name>.spec.ts`, and fixture, `tests/fixture/<Name>s.tsx`, which `tests/fixture/App.tsx` mounts by name. The selection finds both from their names and imports; `npm run check -- --dry-run` shows what runs, and an alias in `scripts/test/TestScope.ts` covers what it misses.
- A changeset, when people using envUI notice the change.

### Tokens

- The tokens are DTCG files in `packages/ui/tokens`, with `envui.resolver.json` for the themes; a token's path names its custom property, `color.fg.muted` as `--env-color-fg-muted`. Every custom property takes the `--env-` prefix.
- `palette.tokens.json` is generated (`npm run palette:generate`) and internal: roles alias its grades, and grades 40, 50 and 70 apart give 3:1, 4.5:1 and 7:1.
- Colors are roles, `color.{bg|fg|border}.{role}.{emphasis}[.{state}]`, each with its dark, high-contrast and hover and pressed values; a size that follows the compact scale is a token. A component's own custom properties, such as `--env-card-padding`, take its name and are private.
- Change a color by choosing another grade for its role, then run `npm run test:contrast`. A pair that leaves `tests/contrast/Pairs.ts` is listed as dropped or renamed, and one held to less as `relaxed`, each with its reason; `npm run test:contrast -- --update-snapshots` records the change (`tests/contrast/Snapshot.ts` says how the record and the base branches hold it).
- What DTCG can't express is in `src/styles/TokensHandwritten.css`, its public tokens listed in `tokens/handwritten.json`.

### Style sheets

- Each component's CSS is a file of `src/styles` in `@layer env.components`. Its module imports `../styles/Base.css`, then the style sheets of what it builds on, then its own (`tests/library/StyleImports.test.mjs`). No specificity tricks to stay overridable, and nothing `!important`.
- Colors, `z-index` and font weights come from tokens; lengths that follow the text are rem, px only for hairlines, em only for typography that follows the element's own size (`npm run lint:css`).
- No drop shadows but Avatar's, the frosted popups' and a segmented control's thumb (`tests/library/NoShadows.test.mjs`); regions part by space and fill, and hairlines only separate the items of one list.
- Hover and focus never change layout: movement on hover uses `translate`, `rotate` or `scale` (`tests/library/StableHover.test.mjs`).
- A pill is `var(--env-radius-full)`, so a tall element becomes a rounded rectangle; `50%` only on parts that are always square (`tests/library/Corners.test.mjs`).
- Motion uses the motion tokens, movement only under `prefers-reduced-motion: no-preference`; under `forced-colors: active`, a state a fill or shadow carries takes system colors (`tests/browser/library/ForcedColors.spec.ts`).

### Part names and color properties

- A component's part classes (`env-<component>-<part>`), state attributes (`data-*`), color properties and the custom properties listed under `properties` are public and versioned. `npm run docs:parts` (`scripts/docs/GenerateParts.ts`) derives them from the source into `docs/generated/parts.json`; `packages/ui/src/parts.json` holds what can't be derived, such as a description of every part and property, and generation fails without one.
- A state that is on or off is present as `''` or absent, set through `flag()` (`src/internal/flag.ts`), which ESLint holds the library to; `data-env-ssr-*` attributes are private. Each attribute keeps one meaning: `data-active` what shows, `data-current` the page's destination, `data-selected` what is chosen, `data-highlighted` the list's cursor, and for a drag `data-dragging`, `data-moving`, `data-resizing` or `data-drag-over`.
- Color properties are `--env-<component>-<role>`, or the item's for a collection's rows, with the roles `container`, `content`, `outline`, `icon`, `selected`, `selected-content` and `indicator`. Each is registered at the top of its style sheet as `@property … { syntax: '*'; inherits: false; }` and only read, with the designed token as its fallback, so the default colors never change (`tests/browser/library/DefaultColors.spec.ts`) and states follow what an application sets as layers of the content over the container.
- Renaming or removing any of these is a `major` change, and `npm run docs:check` fails without a major changeset that names it; a new color property is `minor`.

### Dev mode

- `@envsemble/envui/dev`, entry point `src/dev.ts`, gives agents `envui.layout`, a readout of the page's layout and its problems, and people a 3D view with an inspector; [docs/dev-mode.md](docs/dev-mode.md) documents it. No other entry point imports it (`tests/library/DevMode.test.mjs`), so a production build holds none of it.
- Its code is in `src/dev/`: measuring the page (`measure.ts`), the data (`model.ts`) and the readout and its checks as plain functions of that data (`readout.ts`), the API (`api.ts`). The view is in `src/dev/ui/`, with its own style sheet, `DevMode.css`, which `install.tsx` imports as text and adds to the page, outside `src/styles`.
- A readout check gets a unit test on data in `tests/library/DevMode.test.mjs`; the view and `envui.layout` on a page in `tests/browser/library/DevMode.spec.ts`. The layout check runs the readout on every figure of the site.

## The lint packages

- `packages/eslint-plugin` and `packages/stylelint-config` hold applications to envUI's components and tokens; their READMEs document the rules and how to run their tests.
- A new ESLint rule is a file of `packages/eslint-plugin/src/rules/` named after it, registered in `src/index.js` and its recommended config, with its test in `test/<rule>.test.mjs` through `test/RuleTester.mjs`, and its section in the README. A Stylelint rule is configured in `packages/stylelint-config/index.js` and tested in `test/config.test.mjs`.
- Each package ships its own `tokens.js`, `colorPolicy.js` and `data/tokens.json`, copies that `npm run tokens:build` writes (`scripts/build/SyncLintPackages.ts`): `tokens.js` from `scripts/build/LintPackageTokens.js`, `colorPolicy.js`, what both count as a raw color, from `scripts/build/LintPackageColorPolicy.js`, the data from the library's `src/generated/tokens.json`. Edit the sources, never the copies; `npm run tokens:check` fails on a stale one.

## Record the change

A change people using envUI notice carries a changeset: `npm run changeset`, the package and its bump, and the entry as it should read in the changelog, for someone using the package. `major` breaks code, such as a renamed prop, value, part class or state; `minor` adds, such as a component, prop or token; `patch` fixes and keeps the API. Tests, tooling and catalogue-only changes need none. Link documentation from a changeset by its absolute URL on `main`, such as `https://github.com/envsemble/envUI/blob/main/docs/setup.md`, since the entry is read in several places.

## Pages

Every component, pattern and foundation page in `docs/` is one Markdown file that feeds the catalogue, the Docs and the package, written as [contributing/pages.md](contributing/pages.md) says; the build fails on a page outside the structure. Keep a fact on the page that owns it, and improve that page when an integration finds a gap rather than adding another guide.

The site serves two files for agents, from `scripts/site/SiteAgentFiles.ts`: `SKILL.md`, the setup skill (`apps/site/hosting/SKILL.md`, with the version in place of `{{version}}`), short, with setup steps only; and `llms.txt`, a signpost to the skill and the installed docs that lists no pages.

## Name things for where they belong

The website (`apps/site`) has two parts. **site** names the whole website: its shell, build and hosting, and what both parts use. **catalogue** names the part at the root, for people looking at envUI. **docs** names the part under /docs, the developer reference. Identifiers, files, CSS classes (`site-`, `catalogue-`, `docs-`) and custom properties follow the rule by where they render; Stylelint holds the site's CSS to it. A data attribute the site sets inside an example takes `data-catalogue-`. In the site, the tests and the scripts, a module's file is PascalCase, a hook's `useX`; a script run as a command starts with a verb, such as `GenerateParts.ts`. Documentation files are lowercase.

One word for each thing the site shows, and one folder in `apps/site/src` for each:

| Word          | Means                                                            | Where                                                |
| ------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| example       | A page's usage file, live with its code, placed by `figure=`     | `examples/<page>/`                                   |
| specimen      | A picture of the catalogue's own, with no code, or a playback    | `specimens/<page>/`                                  |
| playback      | An example played, or held in a moment: the specimen of its name | `specimens/<page>/<Example>.tsx`                     |
| tile          | A gallery's small live picture of a page                         | `tiles/`; its stage in `figures/TileStage.tsx`       |
| figure        | The frame that shows an example or a specimen on a page          | `figures/`; a foundation's in `figures/foundations/` |
| fit           | Drawing a tile's or a figure's picture to fit its stage          | `fit/`                                               |
| motion        | Scripts that play a stage, where a tile or figure plays live     | `motion/`                                            |
| loading       | Skeletons, load boundaries and retries while a part loads        | `loading/`                                           |
| template      | The sections of a component or pattern page, in their order      | `template/`                                          |
| page          | A route's page in the catalogue or the Docs, and its data        | `pages/`                                             |
| route         | Addresses old and new, the rail, drawers, trails and the pager   | `navigation/`                                        |
| banner        | A page's banner, contents, footer and failure                    | `layout/`                                            |
| display       | The Display menu: theme, contrast, scale, motion and palette     | `theme/`                                             |
| search        | The site's search and its index                                  | `search/`                                            |
| brand         | The wordmarks and logos                                          | `brand/`                                             |
| release notes | The highlights on the Docs' Changelog page                       | `releases/release-notes.md`                          |
| style         | The site's style sheets                                          | `styles/`                                            |
| generated     | The site's data, written by `scripts/`: never edit it            | `generated/`                                         |
| documentation | The Markdown in `docs/` and the model generated from it          | `scripts/docs/`, its model in `scripts/docs/model/`  |
| Docs          | The part under /docs, and nothing else                           | `docs-` classes, `Docs*` names                       |

A playback depends on its example: change or rename the two together. What the site and its build scripts both read, the documentation's model and the search's terms and anchors, is in `scripts/docs/model/`, which the site imports as `@docs-model/<Module>`. The site uses the library through its entry points, and `@envui-internal/<path>`, `packages/ui/src/<path>`, is its only door into what they don't export, such as `internal/reducedMotion`. Its tsconfig, Vite config and `tests/support/importSource.mjs` alias both, and ESLint rejects a relative path into `packages/ui/src` or `scripts/`.

Where a component behaves differently on the site than in a fixture, look first at `apps/site/src/motion/BrowserStandIns.ts`: the site replaces `focus`, `matches`, the pointer-capture methods and `scrollIntoView` on the page's prototypes there, changing what a call does only inside the stages its pointer plays and calling the browser's own method everywhere else.

Other words for these, such as preview, demo, showcase and sample, are older names; don't add new uses.

Every folder of `apps/site/src` has its row above, and ESLint rejects a name the site declares with preview in it.

## Releases

Releases are cut from `main` by merging `dev` into it; never release without being asked. The library and the lint packages are a fixed group in Changesets and share one version; a prerelease goes out under its name as the dist-tag, such as `prerelease`, a stable release under `latest`. Published versions are immutable.

1. **On the release branch**, for a stable release, leave prerelease mode first with `npx changeset pre exit`: `npm run changeset:version` in prerelease mode makes another prerelease (undo it with `git restore` and `git clean`, never by editing versions). Then `npm run changeset:version` writes the version, the lockfile and the changelogs.
2. **Finish the changelog section:** the date in its heading, as in `## 1.0.0 — 2026-10-20`, and one or two sentences on what the release brings, the headline changes rather than a list; leave the generated entries as they are.
3. **Check it** with `GITHUB_REF_NAME=v<version> node scripts/release/ValidateRelease.ts` (`--release-notes` prints the notes), retake the README's pictures with `npm run docs:readme-images` if the site's look changed, and commit it as `Release <version>`.
4. **Merge** the branch into `dev`, then `dev` into `main` with a merge commit, through pull requests. The Release workflow validates, builds, publishes the packages to GitHub Packages and the GitHub release; a re-run publishes only what is missing.
5. **Merge `main` back into `dev`**, and grant a new package's Actions access to the repositories that read `@envsemble/envui`.

`wrangler.jsonc` says how the site is hosted and deployed.
