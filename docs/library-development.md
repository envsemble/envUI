# Extend the shared library

Read this page when a task authorizes changes inside envUI. First inspect [composition](foundations/composition.md), public slots and existing variants. Product-specific wrappers can attach business meaning while shared components continue to own appearance.

## Public API and source ownership

Keep authored components in their existing family under `packages/ui/src`, named React exports in PascalCase files, and shared styles in `src/styles`. Add public exports to `index.ts`, `content.ts` or `rich-text.ts` according to the feature. Applications use those public entries and installed declarations; avoid private component imports, private-DOM selectors and copied component CSS.

The catalogue owns routes, page grids, specimen state and token measurement. Reusable UI behavior belongs in the package. Icons and brand wrappers are generated from their existing pinned inputs.

When a shared capability is missing, identify the required behavior and reusable API. Implement a variant, slot or component when library work is within scope. Otherwise report the concrete gap and preserve functioning product behavior. Keep routing, authorization, validation, preference and persistence in the application.

## Design tokens

The tokens are data: `packages/ui/tokens` holds them as DTCG 2025.10 `.tokens.json` files, with `envui.resolver.json` describing the themes. The base set has every token as the light theme shows it, and `color-scheme/dark.tokens.json` overrides what the dark theme changes; the `contrast` and `scale` modifiers are declared with no values yet. A token's path names its custom property: `color.text-muted` is `--color-text-muted`.

`npm run tokens:build` runs Terrazzo (`packages/ui/terrazzo.config.mjs`), which lints the tokens and writes `src/styles/Tokens.css`, the internal typed module `src/generated/tokens.ts` and the token list `src/generated/tokens.json`. Commit them with the token change; `npm run tokens:check` fails when they are stale, and the catalogue rebuilds them on every token edit. Every color needs a dark value; the few that look the same in both themes are listed in the config until the palette gives them one. What DTCG can't express yet, such as derived hover colors and font shorthands, is in `src/styles/TokensHandwritten.css`.

## One documentation source

Edit the relevant Markdown page under `docs/`; add a focused page when a new topic needs one. Register it in [the index](index.md) beneath its existing family. The index defines catalogue grouping and reading order, and page titles must match their entries. A component page carries its summary and metadata in frontmatter and follows the page template, with examples as files and props generated from the TypeScript declarations: [write a component page](component-pages.md) describes it, and how to convert a page that predates it. Other entries have a title, relative path and one-line purpose.

Keep examples, behavior and contracts in the Markdown page and its example files. The build generates the catalogue's internal TypeScript data from these files, and compiles the packaged documentation with the examples and props tables filled in; edit the maintained Markdown, examples and TSDoc, not generated files.

The two skills contain routing and workflow instructions. Move conditional component details into their owning documentation page. Improve that page when integration reveals a gap rather than adding another guide.

## Record the change

A change that people using envUI notice carries a changeset: a Markdown file in `.changeset/` that names the version bump and holds the changelog entry. Run `npm run changeset`, select `@envsemble/envui` and the bump, and write the entry as it should read in the changelog: what changed for someone using the package and, for a breaking change, how to migrate. Commit it with the change. Tests, tooling and catalogue-only changes need none.

- `major`: a breaking change, such as a removed or renamed component, prop or value.
- `minor`: a new component, prop, variant or token.
- `patch`: a fix that keeps the API.

Describe the pattern rather than the application that needed it: changesets, the changelog and this documentation name no products, and `npm test` rejects them. Releases turn the changesets into the changelog; see `CONTRIBUTING.md` in the envUI repository.

## Verify

Run `npm run verify` at the envUI root. It checks generated icons and tokens, lint, formatting, types, documentation links, package and offline-catalogue builds, isolated tarball consumers, SSR, browser acceptance, accessibility and the visual baseline.

- `npm run lint` runs ESLint over components, the catalogue, tests and scripts. It reports likely bugs and the Rules of Hooks, not style.
- `npm run lint:css` runs Stylelint over the library's and the catalogue's CSS. Colors, stacking order (`z-index`) and font weights come from tokens, also in the `font` shorthand. Lengths that follow the text size use rem, and px is only for hairlines: border and outline widths, focus-ring offsets and shadow offsets, also as a `var()` fallback and in custom properties named for them, such as `--…-border-width`, `--…-ring-offset` or `--…-shadow`. em is only for typography that follows the element's own font size: `font`, `font-size`, `line-height`, `letter-spacing`, `word-spacing`, `text-indent` and underline offsets and thicknesses. Boxes, spacing and motion use rem, even when they sit in text; where a box must follow its own line of text, such as an icon as tall as the first line, disable the rule on that line with the reason. Library components take their sizes from tokens rather than literal rem values.
- `npm run format:check` checks Prettier formatting; `npm run format` applies it.

Where a rule does not fit one line, disable it on that line with the reason: a comment above `// eslint-disable-next-line rule`, or `/* stylelint-disable-next-line rule -- reason */`.

Style violations from before these rules are recorded per file and rule in `stylelint-suppressions.json` until the tokens replace them. A listed file fails once it has more violations of a rule than recorded, and a new file has none to spare. `npm test` also lints without the suppressions and requires every recorded count to equal the real one, since a count above it would leave room for new violations. After removing some, run `npm run lint:css -- --suppress` while `npm run lint:css` passes, so the lower counts are recorded; the file only shrinks.

The browser suite starts or reuses the catalogue on port 8770 and the test fixture on 8766. To run it beside another checkout’s servers, choose free ports, for example `ENVUI_CATALOGUE_PORT=8772 ENVUI_FIXTURE_PORT=8767 npm run test:browser`; a reused server on the default ports would otherwise serve the other checkout’s code.

`npm run test:a11y` scans every catalogue page, preview and usage, in both themes with axe in Chromium, against WCAG 2.2 A and AA and axe’s best practices. Today’s violations are listed in `tests/accessibility/KnownViolations.json` by page, theme, rule and element. A violation not on the list fails, and so does a listed one that no longer occurs. After fixing violations, run `npm run test:a11y:update` and commit the shorter list; add to it only for a reviewed reason.

`npm run test:visual` compares the catalogue’s specimens, their forced interaction states and the density specimens in both themes with the screenshots in `tests/visual/snapshots`. It renders inside the Linux Playwright image in Docker, pinned by digest in `scripts/VisualTests.mjs` and run as `linux/amd64`, with Linux dependencies in named volumes, so every machine draws the same pixels; after raising Playwright, add the new image’s digest there. Each page’s images must match its specimens exactly: a specimen that stops rendering leaves its image missing, an image no specimen takes is orphaned, and both fail. After an intended visual change, run `npm run test:visual:update` and review the changed images like code. It writes changed and missing images, and removes a page’s orphaned ones only once the page has rendered, so a failed update deletes nothing.

`npm run verify` needs Docker for the visual baseline and stops at the start when Docker is not running. To run every other check, use `npm run verify:no-visual` or set `ENVUI_SKIP_VISUAL=1`; both end with a warning that no screenshot was compared, so the run does not count as verified.

Exercise meaningful interaction changes in both themes, with keyboard focus and dismissal, native form submit/reset, narrow containers and enlarged text. Check portals, wrapping and local scrolling where affected. Inspect bundle boundaries when optional content or icon imports change.

Validate both skill folders with the available skill validator after editing them. Report changes, checks and remaining gaps.
