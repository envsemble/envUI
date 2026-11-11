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
| member tile   | The tile of an export documented on another's page               | `tiles/members/`, such as SearchField on TextField's |
| figure        | The frame that shows an example or a specimen on a page          | `figures/`; a foundation's in `figures/foundations/` |
| fit           | Drawing a tile's or a figure's picture to fit its stage          | [`fit/`](src/fit/README.md), its words               |
| standalone    | A fitter of one kind of figure that doesn't build on `useFit`    | `fit/standalone/`, listed in the fit's README        |
| motion        | Scripts that play a stage, where a tile or figure plays live     | `motion/`                                            |
| shared        | The measuring loop and motion tokens that several folders use    | `shared/`                                            |
| loading       | Skeletons, load boundaries and retries while a part loads        | `loading/`                                           |
| template      | The sections of a component or pattern page, in their order      | `template/`                                          |
| markdown      | A page's Markdown, also with its option tables as legends        | `markdown/`                                          |
| page          | A route's page in the catalogue or the Docs, and its data        | `pages/`                                             |
| route         | Addresses old and new, the page list, trails and scroll places   | `routes/`                                            |
| navigation    | The rail, drawers, pager, page actions and the site's link       | `navigation/`                                        |
| banner        | A page's banner, contents, footer and failure                    | `banner/`                                            |
| display       | The Display menu: theme, contrast, scale, motion and palette     | `display/`                                           |
| search        | The site's search and its index                                  | `search/`                                            |
| brand         | The wordmarks and logos                                          | `brand/`                                             |
| release notes | The highlights on the Docs' Changelog page                       | `releases/release-notes.md`                          |
| style         | The site-wide sheets, and `index.css`: every sheet, in its order | `styles/`; any other sheet beside the code it styles |
| generated     | The site's data, written by `scripts/`: never edit it            | `generated/`                                         |
| documentation | The Markdown in `docs/` and the model generated from it          | `scripts/docs/`, its model in `scripts/docs/model/`  |
| Docs          | The part under /docs, and nothing else                           | `docs-` classes, `Docs*` names                       |

- Give every folder of `apps/site/src` its row above.
- Put a style sheet beside the code it styles, named after it, and import it in `styles/index.css` at its place, never from a module: the site's sheets are outside cascade layers, so their order decides between rules that weigh the same, and one list keeps that order whatever loads first.
- Other words for these, such as preview, demo, showcase and sample, are older names; don't add new uses. ESLint rejects a name the site declares with preview in it.
- A playback depends on its example: change or rename the two together.

## Imports run down the folders

- A folder of `apps/site/src` imports only the folders after it in `siteFolders`, the order listed once in `eslint.config.mjs`, and `App.tsx` and `main.tsx` any. ESLint rejects an import up the list.
- What two folders both need sits in the lower one or below it. Where a lower folder needs to know something of a higher one, the higher one passes it in, as the figures pass `fit/` what a script tells it (`ScriptReader`, [`fit/`](src/fit/README.md)).
- A new folder takes its place in the order.

## What the site shares with the scripts and the library

- What the site and its build scripts both read, the documentation's model and the search's terms and anchors, is in `scripts/docs/model/`, which the site imports as `@docs-model/<Module>`.
- The site uses the library through its entry points. `@envui-internal/<path>`, `packages/ui/src/<path>`, is its only door into what they don't export, such as `internal/motion/reducedMotion`.
- The site's tsconfig, Vite config and `tests/support/ImportSource.mjs` alias both; ESLint rejects a relative path into `packages/ui/src` or `scripts/`.

## Where a component behaves differently than in a fixture

- Look first at `apps/site/src/motion/BrowserStandIns.ts`: the site replaces `focus`, `matches`, the pointer-capture methods and `scrollIntoView` on the page's prototypes there while a stage is mounted, and puts the browser's own back when the last stage unmounts.
- It changes what a call does only inside the stages its pointer plays, and calls the browser's own method everywhere else.

## Files for agents

- The site serves two files for agents, from `scripts/site/SiteAgentFiles.ts`.
- `SKILL.md` is the setup skill (`apps/site/hosting/SKILL.md`, with the version in place of `{{version}}`): short, with setup steps only.
- `llms.txt` is a signpost to the skill and the installed docs, and lists no pages.

## Pre-rendered pages

- `npm run build:site` renders every page to its own HTML file with the server entry, `src/Server.tsx` (`scripts/site/PrerenderSite.ts`), and `main.tsx` hydrates it. The development server renders on the client alone.
- A figure's example, specimen or picture renders in the browser alone: until `useFiguresMounted` (`loading/`) says the page has hydrated, and then until it nears the view (`figures/useSubjectShown.ts`), it shows its skeleton at its recorded size, which its style shows a moment after the first paint (`earlyPlaceholderDelay`, `loading/LoadingStore.tsx`). A spec that needs a pre-rendered page's figures scrolls to them.
- A page's code blocks are highlighted, and its Markdown parsed, as it pre-renders; its HTML carries their tokens and trees, which the browser gives before it hydrates (`pages/PageCode.ts`, `pages/PageMarkdownTrees.ts`).
- The page an address opens on hydrates with the frame around it, in one pass, without a Suspense boundary of its own until the reader leaves it (`PageColumns`, `App.tsx`).
- The page's contents list its sections from its data, not from its headings once mounted: the view's module gives them with the view (`contents` in `pages/PageViews.ts`), so a section a view adds or renames changes there too; `scripts/test/CheckContents.ts` checks them against every page's headings.
- A part of a page that loads on its own and that the server renders, such as the token reference, is a `lazyPart` in `pages/PageParts.ts`, listed for its pages by `partsOfPage` (`pages/ViewModules.ts`): the browser loads it before it hydrates, and the build fails on a page that renders one it doesn't list.
- The build also writes `404.html`, which the host answers an address with no page with, and `_redirects`, the old addresses whose path alone says where they lead (`oldPaths`, `routes/OldAddresses.ts`).

## Tests of the site

- A new kind of page takes a smoke journey in `tests/browser/site/SiteSmoke.spec.ts` and a place among the accessibility scan's kinds (`tests/accessibility/Accessibility.spec.ts`); a new page of a kind the site has takes neither.
- Check a page's words, contents and routes in Node, over the pre-rendered pages (`tests/site/`, through `scripts/site/PrerenderSite.ts`), rather than in a browser.

## Hosting

- `wrangler.jsonc` says how the site is hosted and deployed.
