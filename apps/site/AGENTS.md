# The site: rules for working on it

The rules for `apps/site`, the website, beside [the rules for the whole repository](../../AGENTS.md), which this file doesn't repeat. Paths are from the repository's root.

## Name things for where they belong

- The website has two parts. **site** names the whole website: its shell, build and hosting, and what both parts use. **catalogue** names the part at the root, for people looking at envUI. **docs** names the part under /docs, the developer reference.
- Identifiers, files, CSS classes (`site-`, `catalogue-`, `docs-`) and custom properties follow the rule by where they render; Stylelint holds the site's CSS to it.
- A data attribute the site sets inside an example takes `data-catalogue-`.

## One word for each thing the site shows

Each has one folder in `apps/site/src`:

| Word          | Means                                                            | Where                                                |
| ------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| example       | A page's usage file, live with its code, placed by `figure=`     | `examples/<page>/`                                   |
| specimen      | A picture of the catalogue's own, with no code, or a playback    | `specimens/<page>/`                                  |
| playback      | An example played, or held in a moment: the specimen of its name | `specimens/<page>/<Example>.tsx`                     |
| tile          | A gallery's small live picture of a page                         | `tiles/`; its stage in `figures/TileStage.tsx`       |
| figure        | The frame that shows an example or a specimen on a page          | `figures/`; a foundation's in `figures/foundations/` |
| fit           | Drawing a tile's or a figure's picture to fit its stage          | [`fit/`](src/fit/README.md), its words               |
| motion        | Scripts that play a stage, where a tile or figure plays live     | `motion/`                                            |
| shared        | The measuring loop and motion tokens that several folders use    | `shared/`                                            |
| loading       | Skeletons, load boundaries and retries while a part loads        | `loading/`                                           |
| template      | The sections of a component or pattern page, in their order      | `template/`                                          |
| page          | A route's page in the catalogue or the Docs, and its data        | `pages/`                                             |
| route         | Addresses old and new, the rail, drawers, trails and the pager   | `routes/`                                            |
| banner        | A page's banner, contents, footer and failure                    | `banner/`                                            |
| display       | The Display menu: theme, contrast, scale, motion and palette     | `display/`                                           |
| search        | The site's search and its index                                  | `search/`                                            |
| brand         | The wordmarks and logos                                          | `brand/`                                             |
| release notes | The highlights on the Docs' Changelog page                       | `releases/release-notes.md`                          |
| style         | The site's style sheets                                          | `styles/`                                            |
| generated     | The site's data, written by `scripts/`: never edit it            | `generated/`                                         |
| documentation | The Markdown in `docs/` and the model generated from it          | `scripts/docs/`, its model in `scripts/docs/model/`  |
| Docs          | The part under /docs, and nothing else                           | `docs-` classes, `Docs*` names                       |

- Give every folder of `apps/site/src` its row above.
- Other words for these, such as preview, demo, showcase and sample, are older names; don't add new uses. ESLint rejects a name the site declares with preview in it.
- A playback depends on its example: change or rename the two together.

## What the site shares with the scripts and the library

- What the site and its build scripts both read, the documentation's model and the search's terms and anchors, is in `scripts/docs/model/`, which the site imports as `@docs-model/<Module>`.
- The site uses the library through its entry points. `@envui-internal/<path>`, `packages/ui/src/<path>`, is its only door into what they don't export, such as `internal/motion/reducedMotion`.
- The site's tsconfig, Vite config and `tests/support/importSource.mjs` alias both; ESLint rejects a relative path into `packages/ui/src` or `scripts/`.

## Where a component behaves differently than in a fixture

- Look first at `apps/site/src/motion/BrowserStandIns.ts`: the site replaces `focus`, `matches`, the pointer-capture methods and `scrollIntoView` on the page's prototypes there.
- It changes what a call does only inside the stages its pointer plays, and calls the browser's own method everywhere else.

## Files for agents

- The site serves two files for agents, from `scripts/site/SiteAgentFiles.ts`.
- `SKILL.md` is the setup skill (`apps/site/hosting/SKILL.md`, with the version in place of `{{version}}`): short, with setup steps only.
- `llms.txt` is a signpost to the skill and the installed docs, and lists no pages.

## Hosting

- `wrangler.jsonc` says how the site is hosted and deployed.
