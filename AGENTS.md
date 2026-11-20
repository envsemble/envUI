# envUI: working on it

For agents and people changing envUI. Applications built with envUI read the docs the package ships, not this. Paths are from the repository's root. The lint, the tests and `npm run check` hold most rules: when one fails, its message says what to write instead.

## Commands

| Command                            | When                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `npm run check`                    | After each change: lint, types, generated files and the related tests of what the branch changed |
| `npm run check -- --files <a,b>`   | The same for these files only; `--dry-run` says what it would run                                |
| `npm run check:affected`           | Before pushing or marking a pull request ready                                                   |
| `npm run verify`                   | Only when asked, or to reproduce the Verify workflow                                             |
| `node --test <file>`               | One unit test                                                                                    |
| `npm run test:component -- <file>` | One component test, in Chromium                                                                  |
| `npm run generate`                 | After changing a source of a generated file                                                      |
| `npm run changeset`                | For a change people using envUI notice                                                           |

Don't run `verify`, `test:browser`, `test:a11y` or `test:visual` as a routine step. `ENVUI_WORKERS` sets the workers.

## Where things are

| Path                                         | Holds                                                                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/<family>/`                  | Components, in the family of their page's category; `internal/` for what one family uses, the top-level `internal/` for two              |
| `packages/ui/src/styles/<Name>.css`          | Each component's style sheet, one flat folder                                                                                            |
| `packages/ui/src/foundations/messages/`      | Every built-in string, one namespace per component or family                                                                             |
| `packages/ui/src/partDescriptions.json`      | What the part contract can't derive: each part's and property's description, the color properties                                        |
| `packages/ui/tokens/`                        | The DTCG tokens and `envui.resolver.json`; `TokensHandwritten.css` and `handwritten.json` for what DTCG can't hold                       |
| `tests/library/rules/composition/`           | Each module's layer and each class's owner                                                                                               |
| `docs/`                                      | The pages the package ships and the site shows; [contributing/pages.md](contributing/pages.md) says how to write one                     |
| `apps/site/src/`                             | The site: `examples/<page>/`, `specimens/`, `tiles/`, `figures/`, `fit/`, `motion/`, `pages/`, `routes/`, `search/` and more             |
| `apps/site/hosting/SKILL.md`                 | The setup skill the site serves                                                                                                          |
| `packages/eslint-plugin`, `stylelint-config` | The lint packages, each with its README and tests                                                                                        |
| `scripts/`                                   | Build, docs, site, test and release scripts                                                                                              |
| `tests/`                                     | Unit tests by area, helpers in `support/`; `component/` with `fixture/`; Playwright in `browser/`, `accessibility/`, `visual/`; `types/` |

Generated, never edited by hand: `packages/ui/src/generated/`, `packages/ui/tokens/palette.tokens.json`, `packages/ui/src/icons/`, `docs/generated/`, the tables under the guides' generated headings, `apps/site/src/generated/` and the lint packages' copied `src/data/`, `tokens.js` and `colorPolicy.js`.

## Rules the code doesn't hold

- **No comments in envUI's code**, except doc comments on the public API, tool directives (`eslint-disable…`, `@ts-expect-error`) with no written reason, and licence headers. Code that needs explaining is renamed or restructured instead.
- **A design value apps line up with is a system token.**
- **Slots render through Slot**, which places what it holds and never styles it; no style sheet reaches inside a slot.
- **What belongs in envUI:** a variant, slot or component every application needs, built on envUI's primitives and tokens. Routing, authorization, validation and persistence stay in the application.
- **Props:** a boolean defaults to false, unless it turns off a feature shown by default; then it is named after the feature and defaults to true. A controlled value goes through `internal/react/useControllableState.ts`, where `null` is a controlled none. A prop that overrides a string is named after its key, `<x>Label`.
- **State attributes keep one meaning:** `data-active` what shows, `data-current` the page's destination, `data-selected` what is chosen, `data-highlighted` the list's cursor.
- **Colors:** change one by choosing another grade for its role, then `npm run test:contrast`; record a pair that leaves or loosens in `tests/contrast/PairHistory.ts`. Motion takes the motion tokens, and movement only under `prefers-reduced-motion: no-preference`.
- **A fact lives on the page that owns it.** When an integration finds a gap, fix the library or that page rather than adding a guide.
- **Lists that only shrink:** `stylelint-suppressions.json`, `tests/accessibility/KnownViolations.json` and the visual baseline. Add to them only for a reviewed reason.
- **Don't change `.github/workflows`** or the required checks, or start CI runs, without asking.

## Tests

- Take the first kind that can see it: a unit test in Node, then a component test (`tests/component/<Name>.test.tsx` with `tests/fixture/<Name>.fixture.tsx`, mounted with `mount` and driven by the real mouse and keys), then a Playwright spec, for a whole page: the site's, or the library's build hydrating.
- Add a test for the public contract (keyboard, focus, ARIA, behaviour, types, tokens) or a bug that happened; test a behaviour once. Don't test what TypeScript, the visual baseline or the contrast gate already see.
- No fixed sleeps: wait for a condition, or stop the page's timers (`stopTimers`, `passTime`). Tag a test `engines` when it depends on the engine, and `once` when it holds only for a fresh page (a module's first load, a report made once a page); every other test passes run again in the same page, as the burn-in runs it.
- A fixture is its file's default export: `themes = true` mounts it per theme, `mount = 'standalone'` or `'root'` gives it the page.

## Record the change

- A change people using envUI notice takes a changeset for `@envsemble/envui` and the lint packages, written as its changelog entry for someone using the package. Name each breaking change, and what to write instead, under a `Breaking changes:` line.
- Tests, tooling and catalogue-only changes take none. Link docs from a changeset by their absolute URL on `main`.

## Releases

Release only when asked, from `main`, by merging `dev` into it. The three packages share one version.

1. On the release branch, for a stable release, `npx changeset pre exit` first, then `npm run changeset:version`.
2. Date the changelog's heading, as in `## 1.0.0 — 2026-10-20`, and add a sentence or two on the release's headline changes.
3. Check it with `GITHUB_REF_NAME=v<version> node scripts/release/ValidateRelease.ts`, retake the README's pictures with `npm run docs:readme-images` if the look changed, and commit it as `Release <version>`.
4. Merge it into `dev`, then `dev` into `main` with a merge commit; the Release workflow publishes. Then merge `main` back into `dev`.
