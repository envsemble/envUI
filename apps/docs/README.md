# Documentation application

This React application consumes only the public `@envsemble/envui`, `@envsemble/envui/icons` and `@envsemble/envui/styles.css` exports. It has no private library imports or duplicated component styles.

Run `npm run dev` from the repository root for local live development. `npm run build` produces the library and one self-contained offline documentation HTML file. All pages use hash routes, including `#/getting-started` and `#/components/buttons/preview`; the release needs no server or sibling assets.

`src/Reference.ts` owns the topic hierarchy, guidelines, usage examples, public contracts and the package's generated `USAGE.md`. Foundations document the shared rules and their APIs: Typography owns Text, Colors & themes owns Theme, and Icons & assets owns icon/brand usage. Component groups follow purpose, from layout and surfaces through actions, forms, navigation, content and feedback.

Overview is a centered hub with a component catalogue grouped by purpose. Foundation and component Preview pages compare both themes; Guidelines and Usage use the current appearance.

Every reference topic uses the same `ReferenceContent` renderer and public Tabs component for Preview, Guidelines and Usage. `src/Documentation.ts` owns routes, legacy aliases and the reading order. Previous/next links move between topics and retain the current view. Old Text and combined notes links still resolve; Text now belongs to Typography and chips/notes have separate pages.

Keep shared rules in foundations and component behavior on its own page. Related-topic links connect them without repeating demonstrations: spacing shows tokens, layout shows Stack/ActionGroup, and grouped rows show connected geometry.

`src/Documentation.css` owns documentation layout and artificial state specimens only. Theme, typography, colors, controls, cards and feedback are supplied by the package. Paired previews use one React state model, distinct form names and the same geometry in both appearances.

`Example` is a private specimen frame composed from public Stack and Text. The catalogue uses Card links, the overview uses Button links, and managed-toast appearance uses Tabs. Content cards, field guidance and compact navigation use public props rather than selectors into component internals.

Keep routes, paired previews, token measurements, code blocks and prop tables here. Reusable interaction, visual variants and spacing contracts belong in `packages/ui`; do not recreate them in the documentation.

Surface is the visual base for background fill, padding and corners. Card builds on Surface with standard content layout; specialized cards add their own composition. Stack and ActionGroup own layout. Use Surface for plain panes and compose an existing layout element through `render` when both belong on the same root. The overview hero, typography specimen and managed toast pane consume Surface; actual content cards continue to use Card.
