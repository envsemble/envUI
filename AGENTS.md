# envUI: notes for agents

This file is for agents working on envUI itself. It stays in the repository and is not packaged; agents that build with envUI read the docs the package ships, as `docs/agent-tooling.md` describes.

## Testing: three tiers, never the full suite every turn

| Tier     | Command                  | When                                                                                       | Time (24 threads)                     |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------- |
| Fast     | `npm run check`          | After each change, while you work                                                          | Under a minute for a component change |
| Affected | `npm run check:affected` | Before pushing a branch or marking its pull request ready                                  | A few minutes for a component change  |
| Full     | `npm run verify`         | When asked, or to reproduce a failure of the Verify workflow on a pull request into `main` | About 20 min (30 before the tiers)    |

- **The fast tier** checks what the branch changed since its merge-base with `origin/envui-1.0` (else `origin/dev`; `--base <ref>` or `ENVUI_BASE` picks another), with uncommitted and untracked files: ESLint, Stylelint and Prettier on the changed files, incremental `tsc`, the generated-file checks the change touches, the unit tests that need no build, and the related browser specs in Chromium. It prints what it selected and why; `-- --dry-run` prints only that.
- **The affected tier** adds the related specs' `@engines` tests in Firefox and WebKit, the builds the change needs with the unit tests on them, and live development when the catalogue changed. The accessibility scan and the screenshots run in the full tier.
- **CI** checks every ready pull request: one `CI` job for pull requests into `dev`, and the full `npm run verify` as the Verify workflow for pull requests into `main`, the releases. Don't change `.github/workflows`, start or re-run runs, or change the required checks without asking.
- **The full tier** runs everything. Don't run it, or `npm run test:browser`, `test:a11y` or `test:visual`, as a routine step: they take minutes, and the tiers above answer for a change.
- A token, theme or other shared change runs the contrast gate and a small shared set of specs, not everything; the selection says so. Leave the rest to the full tier.
- A spec runs when the component it is named after changes (`scripts/TestScope.mjs`). When a file's name doesn't name its spec, add it to `aliases` there instead of running everything.
- Firefox and WebKit run only the tests tagged `@engines`: tag a test that depends on the engine (scrolling, focus, pointer and input methods, native forms, platform keys), and leave the rest to Chromium.

## Write tests that stay fast

- Prefer a unit test (`node --test`, `tests/*.test.mjs`) to a browser spec, and a computed-style or DOM assertion to a screenshot.
- Give a browser spec its own fixture (`?fixture=<name>` in `tests/fixture`) and name it after the component it covers, so the selection finds it. Test a behaviour once, in its component's spec; leave colour to the contrast gate and appearance to the visual baseline.
- No fixed sleeps: wait for a condition, such as `expect(…).toHaveText`, `expect.poll` or the element's animations finishing. Where a test must show that nothing happens for a while, wait just past the delay it proves and say so.
- Navigate only as much as the test needs; check independent states on one page load.
- Keep heavy checks out of the inner loop: builds, packed-tarball tests, three engines, the accessibility scan and the visual baseline belong to the affected and full tiers.

## Ports and workers

The browser tests start or reuse the catalogue on 8770 and the fixture on 8766, and reuse a server only when it answers for this checkout; when another checkout holds a port, this one takes ports of its own. When another checkout runs its servers or tests, set `ENVUI_CATALOGUE_PORT` and `ENVUI_FIXTURE_PORT` to free ports, such as 8832 and 8833. `ENVUI_WORKERS` sets the browser workers (default: half the cores).

## Write envUI's pages in the one-file structure

Every component, pattern and foundation page in `docs/` is one Markdown file that feeds the catalogue, the Docs and the agents' package. Write a new page, or change one, as [docs/component-pages.md](docs/component-pages.md) describes; the build fails on a page outside the structure.

- **The structure.** Frontmatter that lists each example once, with its role and caption, then `## Variants` (`## Options` on a foundation), `## Anatomy`, `## Behaviour`, ending with `### Adapting to width`, `## Rules`, `## Accessibility`, `## Words to use`, `## Compose` and `## Changelog`, in that order. Figures are placed by name, as an empty ` ```tsx figure=Name ` fence.
- **Rules, not essays.** Each block is a `###` heading, one short lead that says its point, then bullets, one fact each; a single extra point is a second sentence, never a lone bullet. Paragraphs stay under 240 characters. Shorten by form, never by dropping a fact.
- **Plain words above Compose.** The sections the catalogue shows name no props, values, tokens or classes; Compose holds the code, the props and the values, so agents lose nothing.
- **Model pages.** [Button](docs/components/button.md), [Form layout and validation](docs/patterns/forms.md) and [Spacing & density](docs/foundations/spacing.md).

## Everything else

- Running, building, hosting and releasing envUI: [CONTRIBUTING.md](CONTRIBUTING.md).
- Changing the library, its tokens, documentation and checks: [docs/library-development.md](docs/library-development.md).
- envUI never names the applications built on it, in code, docs, comments or sample data: its first versions gathered what those applications needed, and naming them makes a component read as built for one. Other products, such as the design systems envUI follows, may be named.
