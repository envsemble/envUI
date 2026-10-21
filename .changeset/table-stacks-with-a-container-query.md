---
'@envsemble/envui': major
---

A Table with `narrowLayout="stack"` stacks its rows through a container query on its region instead of measuring it in script, so server-rendered markup and the first paint already stack in a narrow region and nothing moves as the page hydrates. `stackBelow` still takes any CSS length or a number of pixels.

- The `env-table-stack-probe` part, the invisible element the table measured, is gone. Migration: nothing to change unless your styles targeted it.
- A stacking region's font size is now `stackBelow / 37.5`, so that `37.5em` in the container query is `stackBelow`; the table and its cells set their own text, so only text placed directly in the region, outside the table, would follow it.
- A stacking region is now the `env-table` size container and fills the width its context gives it (`inline-size: 100%`), as a container must; give a stacking table a width where it sits in a row that sizes to its content.
- `data-stacked` and `onStackedChange` still report the layout once the table is in the document. Style stacked rows under `@container env-table (width < 37.5em)`, where the region makes 37.5em its `stackBelow`, rather than through `data-stacked`, so they apply before hydration.
