# Write a pattern page

A pattern page (`docs/patterns/<id>.md`) says how envUI's components combine for a recurring need, such as an app frame, forms or empty states. It uses the [component page](component-pages.md) template's section titles, a subset of them, and its example files; the build validates them as it does component pages. [Loading](patterns/loading.md) is the model pattern page.

## Frontmatter

```yaml
---
title: Settings
summary: Let people change how the application works for them, and see each change apply. # One sentence.
status: beta # experimental, beta, stable or deprecated.
since: 1.0.0 # A released version, or the next.
intent: Enter and change data # Patterns only: one of the three intents below.
aliases: [preferences, options, notification settings] # At least one.
useWhen:
  - Someone changes a preference that applies at once.
avoidWhen:
  - text: Several answers given together and submitted once.
    see: forms # A page to read instead, by its file name.
  - text: Confirming a destructive action.
    use: ConfirmDialog # Or an export to use instead.
composes: [Switch, Select, Field, Button, Toast, Column] # The exports it combines: namespaces, not parts.
---
```

- **`intent`** groups patterns by what people are doing: _Enter and change data_, _Keep people informed_ or _Find and navigate_.
- **`composes`** names every envUI export the page's example files import, and only exports; `npm test` checks both.
- **`avoidWhen`** is the page's one list of related pages, shown as Related at its end, as on [component pages](component-pages.md#frontmatter). **`see`** names an indexed page, a pattern or component page; **`use`** names an export. An entry has one or the other, and names each once.

Register the page in [the index](index.md) under `## Patterns`, with only its title and path; the summary comes from the frontmatter. Patterns are listed in intent order.

A pattern page may instead be on the [figure template](component-pages.md#sections) of component pages, with a `## When to use` section: live figures, do and don't pairs and an anatomy figure, whose `of` names the component it labels. [Loading](patterns/loading.md) is on it.

## Pattern sections

| Section              | Required | Holds                                                                                                                                       |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview             | yes      | One paragraph, "Use this pattern to …", naming the problem, then the lead example. The catalogue adds When to use, When not and Built from. |
| Anatomy              | yes      | The parts of the composition, numbered, each naming its component and the props that matter.                                                |
| States and behaviour |          | The flow and its timing: when to validate, when a toast appears and leaves, what happens on failure, and responsive behaviour.              |
| Content guidelines   | yes      | The pattern's copy rules, linking to the content guidelines rather than repeating them.                                                     |
| Do and don't         |          | A `### Do` and a `### Don't` list.                                                                                                          |
| Accessibility        | yes      | `### Focus and keyboard`, the flow of focus rather than a table of keys, and `### envUI provides` and `### You provide` lists.              |
| Examples             | yes      | At least two more live compositions, each under a `###` heading with a sentence or two, so a pattern shows at least three example files.    |
| Changelog            |          | Releases that changed the pattern.                                                                                                          |

Related is generated from `avoidWhen`. A pattern shows each composition in context, so its examples differ from the component pages' ones. The Site leaves out the `### envUI provides` and `### You provide` lists, as on component pages; the packaged page and the agents' files keep them.
