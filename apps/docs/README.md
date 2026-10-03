# Documentation application

This React application consumes only the public `@envsemble/envui`, per-icon `@envsemble/envui/icons/Name` and `@envsemble/envui/styles.css` exports. Per-icon imports keep development/build tooling from loading the complete catalogue. It has no private library imports or duplicated component styles.

Run `npm run dev` from the repository root for local live development. `npm run build` produces the library and one self-contained offline documentation HTML file. All pages use hash routes, including `#/getting-started` and `#/components/buttons/preview`; the release needs no server or sibling assets.

`src/Reference.ts` is the stable entry shared by the application and package build. Maintained reference content lives in `src/reference/`, with one file per component family, foundation content, setup snippets, shared types and `UsageMarkdown.ts` for the package's generated `USAGE.md`. Foundations document the shared rules and their APIs: Typography owns Text, Colors & themes owns Theme, and Icons & assets owns icon/brand usage. Component groups follow purpose, from layout and surfaces through actions, forms, navigation, content and feedback.

`src/App.tsx` owns the documentation shell, appearance and example reset controls. `src/pages/` holds Overview, Getting started and the component Catalogue; `src/navigation/` holds the sidebar, topic icons, previous/next links and the hash route subscription. Overview is a centered hub with a component catalogue grouped by purpose. Every page follows the selected appearance; the theme button switches the entire documentation between light and dark.

Every reference topic uses the same `ReferenceContent` renderer and public Tabs component for Preview, Guidelines and Usage. `src/Documentation.ts` owns routes, legacy aliases and the reading order. Previous/next links move between topics and retain the current view. Old Text and combined notes links still resolve; Text now belongs to Typography and chips/notes have separate pages.

Keep shared rules in foundations and component behavior on its own page. Related-topic links connect them without repeating demonstrations: spacing shows tokens, layout shows Stack/ActionGroup, and grouped rows show connected geometry.

`src/Documentation.css` owns documentation layout and artificial state specimens only. Theme, typography, colors, controls, cards and feedback are supplied by the package. Each preview renders once and retains its interaction state when the theme changes.

Headers, previews, articles, catalogues and page navigation share one centered content frame with equal side gutters. Text and specimens keep their own alignment inside that frame.

`PageHeader` composes a page banner from Card, Stack and Text, with view tabs and page controls inside it. Overview uses its existing logo surface as the banner and includes the same theme control.

`src/previews/` groups live examples by component family. Each topic owns its interaction state; `Preview` supplies one specimen area using the current theme. Foundation demonstrations live in `src/previews/foundations/`; measured token values refresh when the theme changes. `Example` is a private specimen frame composed from public Stack and Text. The catalogue uses Card links and the overview uses Button links. Managed toasts inherit the same theme as their controls. Examples use public props rather than selectors into component internals.

Keep routes, previews, token measurements, code blocks and prop tables here. Reusable interaction, visual variants and spacing contracts belong in `packages/ui`; do not recreate them in the documentation.

Surface is the visual base for background fill, padding and corners. Card builds on Surface with standard content layout; specialized cards add their own composition. Stack and ActionGroup own layout. Use Surface for plain panes and compose an existing layout element through `render` when both belong on the same root. The overview hero consumes Surface; content card specimens use Card.

Keep previews focused on the subject. Use Text and invisible layout containers for headings, descriptions and tab panels. Do not add decorative Cards, Surfaces, rows, chips or disclosure notes to another component's demonstration. Other visible controls are appropriate only when they demonstrate a required feature, such as tab buttons, action slots, modal triggers or toast delivery. The banner, catalogue navigation and previous/next links are documentation navigation, not specimens.

Example sections share the content frame. Size limits belong to the demonstrated content: compact controls, fields and card specimens have bounded widths; comparison grids use the available column width and reflow as space narrows. Avoid fixed grid column counts, centered individual specimens and arbitrary offsets. Related variants use plain Specimen labels and consistent gaps.
