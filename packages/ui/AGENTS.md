# The library: rules for working on it

The rules for `packages/ui`, beside [the rules for the whole repository](../../AGENTS.md), which this file doesn't repeat. Paths are from the repository's root.

## Files

- Put a component in the family folder of its page's category under `packages/ui/src`, such as Overlays in `overlays/`; `tests/library/ComponentFolders.test.mjs` maps them.
- Name its file after its main export: PascalCase for a component, a context or a namespace; `useX` for a hook; camelCase for other modules; entry points lowercase.
- Keep a namespace's parts in its file, or, when they are many, in a folder of its own whose entry is the namespace's file and holds the parts' names, as `actions/menu/Menu.tsx` does.
- Put code one family uses in its `internal/` folder, and code two families use in the top-level `internal/`, grouped by concern, such as `internal/field/`; only a helper most families use, such as `flag.ts`, or a module whose concern no other shares, such as `useCopy.ts`, stays at its top. ESLint rejects an import of another family's `internal/`, and of a folder `privateFolders` in `eslint.config.mjs` keeps to the modules it names.
- A component with many private modules may take its own folder in its family, with its own `internal/`, such as `feedback/toast/` and `forms/color/`.
- `tests/composition/Rules.json` gives each module its layer (imports go down: internal, foundations, base, composites, shell) and each class its owner, and `tests/library/Composition.test.mjs` holds the library to it. A folder's layer is under `layers.directories`; a module whose layer isn't its folder's is under `layers.modules` with its reason.

## Entry points

- Public exports go through the entry points, such as `index.ts`, `markdown.ts` and `rich-text.ts`.
- An entry point other than `index.ts` holds what loads an optional dependency, and is named after what it holds, such as `code` for Code and CodeBlock on Shiki.
- Whatever a module the entry points `export *` exports is public: `docs/generated/exports.json` records every name and its kind (`npm run docs:exports`).
- `npm run docs:check` fails on a change to the exports without a changeset, major for a name that goes.

## Props

- A boolean defaults to false, unless it turns off a feature shown by default: then name it after the feature, such as `header`, `closeButton` or a field's `visibleLabel`, and default it to true.
- `show*` is for an opt-in display, such as Spinner's `showLabel`.
- Signatures use envUI's own types; a third-party type stays where it is the point of a prop, such as Tiptap's `Editor` on RichTextEditor.

## Messages

- A component's strings live in `packages/ui/src/foundations/messages/`, one namespace per component or family, named after it (`copyButton`) or after the concept a family sets (`themePreference`).
- Name a prop that overrides a string after its key: `<x>Label` reads `messages.<namespace>.<x>`.
- A number that picks a plural form arrives as `count` with `countText`, the count in the locale's digits; any other number arrives as locale text.

## What belongs in envUI

- A variant, slot or component every application needs, built on envUI's primitives and tokens.
- Routing, authorization, validation, preferences and persistence stay in the application.
- The one supported exception is Panes' `persist`, the width people chose kept in a cookie, which `packages/ui/src/layout/panesSize.ts` reads and writes.

## Changing a component touches

- Its module in its family and its style sheet, `packages/ui/src/styles/<Name>.css`; a new component also its entry point's export.
- `tests/composition/Rules.json` for a new component (`base` if it renders no other component, else `composites`, under `layers.modules`), a new folder, or classes and style sheets it shares with another component (`classes`).
- `packages/ui/src/partDescriptions.json` for a new part, state or color property, then `npm run docs:parts`; a prop's TSDoc, then `npm run docs:props`.
- Its strings in `packages/ui/src/foundations/messages/`.
- Its page, `docs/components/<name>.md` or `docs/patterns/`, with its examples in `apps/site/src/examples/<page>/` and its gallery tile in `apps/site/src/tiles/`.
- Its spec and fixture, named as [Fixtures](../../AGENTS.md#fixtures) says.
- A changeset, when people using envUI notice the change ([Record the change](../../AGENTS.md#record-the-change)).

## Tokens

- The tokens are DTCG files in `packages/ui/tokens`, with `envui.resolver.json` for the themes.
- A token's path names its custom property, `color.fg.muted` as `--env-color-fg-muted`. Every custom property takes the `--env-` prefix.
- `palette.tokens.json` is internal: roles alias its grades, and grades 40, 50 and 70 apart give 3:1, 4.5:1 and 7:1.
- Colors are roles, `color.{bg|fg|border}.{role}.{emphasis}[.{state}]`, each with its dark, high-contrast and hover and pressed values.
- A size that follows the compact scale is a token.
- A component's own custom properties, such as `--env-card-padding`, take its name and are private.
- Change a color by choosing another grade for its role, then run `npm run test:contrast`.
- List a pair that leaves `tests/contrast/Pairs.ts` as dropped or renamed, and one held to less as `relaxed`, each with its reason; `npm run test:contrast -- --update-snapshots` records the change (`tests/contrast/Snapshot.ts` says how the record and the base branches hold it).
- What DTCG can't express is in `packages/ui/src/styles/TokensHandwritten.css`, its public tokens listed in `packages/ui/tokens/handwritten.json`.

## Generated and vendored files

Never edit these; change their source and run their command.

- `packages/ui/src/generated/`: the token build's output, `Tokens.css` and `tokens.json` (`npm run tokens:build`).
- `packages/ui/tokens/palette.tokens.json`: the palette's grades (`npm run palette:generate`).
- `packages/ui/src/icons/`: one module per icon, from the SVGs `icon-manifest.json` lists (`npm run icons:generate`).
- `packages/ui/vendor/material-symbols-rounded/`: Material Symbols' SVGs, vendored unchanged, and `packages/ui/icon-manifest.json`, their pinned revision and hashes (`npm run icons:sync`).
- `docs/generated/`: `exports.json`, `props.json` and `parts.json` (`npm run docs:exports`, `docs:props`, `docs:parts`).
- `packages/ui/licenses/Runtime-Dependencies-LICENSE.txt`, and the git-ignored `packages/ui/README.md` and `packages/ui/docs/`: written by the library's build (`scripts/build/BuildLibrary.ts`).

## Style sheets

- Each component's CSS is a file of `packages/ui/src/styles` in `@layer env.components`.
- Keep `packages/ui/src/styles` one flat folder, apart from the modules: `package.json`'s `#styles/*` import, `scripts/build/BuildLibrary.ts`'s rewrite of `../styles/X.css` to `#styles/X.css` and the ordered `src/styles/index.css` rely on it.
- Its module imports `../styles/Base.css`, then the style sheets of what it builds on, then its own (`tests/library/StyleImports.test.mjs`).
- No specificity tricks to stay overridable, and nothing `!important`.
- Colors, `z-index` and font weights come from tokens.
- Lengths that follow the text are rem; px only for hairlines; em only for typography that follows the element's own size (`npm run lint:css`).
- No drop shadows but Avatar's, the frosted popups' and a segmented control's thumb (`tests/library/NoShadows.test.mjs`).
- Regions part by space and fill; hairlines only separate the items of one list.
- Keep `:has()` rules from restyling the whole page: Chromium works out the style of every element a `:has()` rule may match again whenever something its argument names changes on any element. Inside `:has()`, match a part's own attribute rather than `hidden`, which changes all over a page, as the tabs' indicator and the segmented control's thumb do with `data-placed`; and give a rule with `:has()` a subject by its part's class, never a pseudo-element or any element (`> *`, `> :first-child`): set a custom property on the part for its pseudo-element to read instead, as Checkbox's halo does, and name the children as `:where(...)`.
- Hover and focus never change layout: movement on hover uses `translate`, `rotate` or `scale` (`tests/library/StableHover.test.mjs`).
- A pill is `var(--env-radius-full)`, so a tall element becomes a rounded rectangle; `50%` only on parts that are always square (`tests/library/Corners.test.mjs`).
- Motion uses the motion tokens, and movement only under `prefers-reduced-motion: no-preference`.
- Under `forced-colors: active`, a state a fill or shadow carries takes system colors (`tests/component/ForcedColors.test.tsx`).

## Part names and color properties

- A component's part classes (`env-<component>-<part>`), state attributes (`data-*`), color properties and the custom properties listed under `properties` are public and versioned.
- `npm run docs:parts` (`scripts/docs/GenerateParts.ts`) derives them from the source into `docs/generated/parts.json`; `packages/ui/src/partDescriptions.json` holds what can't be derived, such as a description of every part and property, and generation fails without one.
- A state that is on or off is present as `''` or absent, set through `flag()` (`packages/ui/src/internal/flag.ts`), which ESLint holds the library to.
- `data-env-ssr-*` attributes are private.
- Each attribute keeps one meaning: `data-active` what shows, `data-current` the page's destination, `data-selected` what is chosen, `data-highlighted` the list's cursor, and for a drag `data-dragging`, `data-moving`, `data-resizing` or `data-drag-over`.
- Color properties are `--env-<component>-<role>`, or the item's for a collection's rows, with the roles `container`, `content`, `outline`, `icon`, `selected`, `selected-content` and `indicator`.
- Register each at the top of its style sheet as `@property … { syntax: '*'; inherits: false; }` and only read it, with the designed token as its fallback, so the default colors never change (`tests/component/DefaultColors.test.tsx`) and states follow what an application sets as layers of the content over the container.
- Renaming or removing any of these is a `major` change, and `npm run docs:check` fails without a major changeset that names it; a new color property is `minor`.

## Dev mode

- `@envsemble/envui/dev`, entry point `packages/ui/src/dev.ts`, gives agents `envui.layout`, a readout of the page's layout and its problems, and people a 3D view with an inspector; [docs/dev-mode.md](../../docs/dev-mode.md) documents it.
- No other entry point imports it (`tests/library/DevMode.test.mjs`), so a production build holds none of it.
- Its code is in `packages/ui/src/dev/`: measuring the page (`measure.ts`, with what nodes hold inside in `inner.ts`, the attributes and labels of elements in `elements.ts`, the open overlays in `overlays.ts`, the container queries in `queries.ts` and the part names in `parts.ts`), the data (`model.ts`), the readout and its checks as plain functions of that data (`readout.ts`, its lengths in `units.ts`), and the API (`api.ts`, with the skeleton shift check in `skeletonShift.ts`).
- The view is in `packages/ui/src/dev/ui/`, with the tokens the inspector shows from `usedTokens.ts`, and its own style sheet, `DevMode.css`, which `install.tsx` imports as text and adds to the page, outside `packages/ui/src/styles`.
- Give a readout check a unit test on data in `tests/library/DevMode.test.mjs`; test the view and `envui.layout` in the browser in `tests/component/DevMode.test.tsx`.
