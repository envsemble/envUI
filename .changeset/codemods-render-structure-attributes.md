---
'@envsemble/envui-codemods': minor
---

New transforms and map sections for the 1.0 vocabulary:

- `v1-render` turns a literal `as` into `render`, `as="h2"` into `render={<h2 />}`, on Text, Stack and Surface, and reports an expression.
- `v1-structure` rewrites elements whose 1.0 form is another element, as the map's `structure` section lists them: ActionGroup becomes a Stack row, or a column with `fullWidth` on its labelled Buttons when stacked.
- `v1-props` renames a prop whatever its value where the map gives it a `to`, such as Text's `tone` to `emphasis`, and moves the properties of the objects some calls take, such as `useToast().show({ … })`, as the `calls` section lists them.
- `v1-classes` turns modifier classes into the attributes 1.0 sets, with the specificity they had, as the `classAttributes` section lists them, and reports them in markup.

The rename map is a folder, `src/maps/v1`, of a header and one fragment per section and component family; `--map` takes such a folder or one JSON file with its sections merged.
