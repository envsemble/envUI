# Extend the shared library

Read this page when a task authorizes changes inside envUI. First inspect [composition](foundations/composition.md), public slots and existing variants. Product-specific wrappers can attach business meaning while shared components continue to own appearance.

## Public API and source ownership

Keep authored components in their existing family under `packages/ui/src`, named React exports in PascalCase files, and shared styles in `src/styles`. Add public exports to `index.ts`, `content.ts` or `rich-text.ts` according to the feature. Applications use those public entries and installed declarations; avoid private component imports, private-DOM selectors and copied component CSS.

The catalogue owns routes, page grids, specimen state and token measurement. Reusable UI behavior belongs in the package. Icons and brand wrappers are generated from their existing pinned inputs.

When a shared capability is missing, identify the required behavior and reusable API. Implement a variant, slot or component when library work is within scope. Otherwise report the concrete gap and preserve functioning product behavior. Keep routing, authorization, validation, preference and persistence in the application.

## One documentation source

Edit the relevant Markdown page under `docs/`; add a focused page when a new topic needs one. Register it in [the index](index.md) beneath its existing family. Each entry has a title, relative path and one-line purpose. The index defines catalogue grouping and reading order. Page titles must match their index entries.

Update the public-API specimen under `apps/catalogue/src/previews` together with its documentation. Keep examples, behavior and contracts in the Markdown page. The build generates the catalogue's internal TypeScript data from these files and copies documentation into the package; edit the maintained Markdown, not generated files.

The two skills contain routing and workflow instructions. Move conditional component details into their owning documentation page. Improve that page when integration reveals a gap rather than adding another guide.

## Record the change

A change that people using envUI notice carries a changeset: a Markdown file in `.changeset/` that names the version bump and holds the changelog entry. Run `npm run changeset`, select `@envsemble/envui` and the bump, and write the entry as it should read in the changelog: what changed for someone using the package and, for a breaking change, how to migrate. Commit it with the change. Tests, tooling and catalogue-only changes need none.

- `major`: a breaking change, such as a removed or renamed component, prop or value.
- `minor`: a new component, prop, variant or token.
- `patch`: a fix that keeps the API.

Describe the pattern rather than the application that needed it: changesets, the changelog and this documentation name no products, and `npm test` rejects them. Releases turn the changesets into the changelog; see the README.

## Verify

Run `npm run verify` at the envUI root. It checks generated icons, lint, formatting, types, documentation links, package and offline-catalogue builds, isolated tarball consumers, SSR, browser acceptance, accessibility and the visual baseline.

- `npm run lint` runs ESLint over components, the catalogue, tests and scripts. It reports likely bugs and the Rules of Hooks, not style.
- `npm run lint:css` runs Stylelint over the library's and the catalogue's CSS. Colors, stacking order (`z-index`) and font weights come from tokens; lengths that follow the text size use rem, and px is only for hairlines: border and outline widths, focus-ring offsets and shadow offsets. Library components take their sizes from tokens rather than literal rem values.
- `npm run format:check` checks Prettier formatting; `npm run format` applies it.

Where a rule does not fit one line, disable it on that line with the reason: a comment above `// eslint-disable-next-line rule`, or `/* stylelint-disable-next-line rule -- reason */`.

Style violations from before these rules are recorded per file and rule in `stylelint-suppressions.json` until the tokens replace them. A listed file fails once it has more violations of a rule than recorded, and a new file has none to spare. After removing some, run `npm run lint:css -- --suppress` while `npm run lint:css` passes, so the lower counts are recorded; the file should only shrink.

The browser suite starts or reuses the catalogue on port 8770 and the test fixture on 8766. To run it beside another checkout’s servers, choose free ports, for example `ENVUI_CATALOGUE_PORT=8772 ENVUI_FIXTURE_PORT=8767 npm run test:browser`; a reused server on the default ports would otherwise serve the other checkout’s code.

`npm run test:a11y` scans every catalogue page, preview and usage, in both themes with axe in Chromium, against WCAG 2.2 A and AA and axe’s best practices. Today’s violations are listed in `tests/accessibility/KnownViolations.json` by page, theme, rule and element. A violation not on the list fails, and so does a listed one that no longer occurs. After fixing violations, run `npm run test:a11y:update` and commit the shorter list; add to it only for a reviewed reason.

`npm run test:visual` compares the catalogue’s specimens, their forced interaction states and the density specimens in both themes with the screenshots in `tests/visual/snapshots`. It renders inside the Linux Playwright image in Docker, with Linux dependencies in named volumes, so every machine draws the same pixels. After an intended visual change, run `npm run test:visual:update` and review the changed images like code. `npm run verify` skips the visual baseline with a warning when Docker is not running, so run it with Docker before a release.

Exercise meaningful interaction changes in both themes, with keyboard focus and dismissal, native form submit/reset, narrow containers and enlarged text. Check portals, wrapping and local scrolling where affected. Inspect bundle boundaries when optional content or icon imports change.

Validate both skill folders with the available skill validator after editing them. Report changes, checks and remaining gaps.
