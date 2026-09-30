# Documentation application

This React application consumes only the public `@envsemble/ui`, `@envsemble/ui/icons` and `@envsemble/ui/styles.css` exports. It has no private library imports or duplicated component styles.

Run `npm run dev` from the repository root for local live development. `npm run build` produces the library and one self-contained offline documentation HTML file. All pages use hash routes, including `#/getting-started` and `#/components/buttons/preview`; the release needs no server or sibling assets.

`src/Reference.ts` is the maintained source for component usage examples, public prop summaries and the package's generated `USAGE.md`. Update it when changing public APIs. The Preview and Guidelines views show visual behavior and design rules; implementation examples appear in Usage.

`src/Documentation.css` owns documentation layout and artificial state specimens only. Theme, typography, colors, controls, cards and feedback are supplied by the package. Paired previews use one React state model, distinct form names and the same geometry in both appearances.
