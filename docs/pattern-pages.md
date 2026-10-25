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

- **`intent`** groups patterns by what people are doing: _Enter and change data_, _Keep people informed_, _Work with lists and tables_ or _Frame the application_.
- **`composes`** names every envUI export the page's example files import, and only exports; `npm test` checks both.
- **`avoidWhen`** is the page's one list of related pages, shown as Related at its end, as on [component pages](component-pages.md#frontmatter). **`see`** names an indexed page, a pattern or component page; **`use`** names an export. An entry has one or the other, and names each once.

## What a pattern says

A pattern covers a need that takes two or more components together, or a choice between components; guidance that would fit in one section of one component page is a variant or an example on that page instead. A pattern keeps only two things: **its decision**, which component or which form to use when, and **its compositions**, the arrangements no single component page shows, such as type to confirm or a long form in steps. It links to each component for that component's own behaviour, such as how long a toast stays or where a confirmation puts focus, and never says it again. Its decision is a `### Which to use` block first under When to use: a sentence, then an [option table](component-pages.md#option-tables) that names each choice and says what it is for, which the Site shows as a legend. The words of its kind of screen, such as an empty state's titles or a form's error messages, are its Content block's, and the [writing guide](writing.md) holds the rules every screen shares.

The Site's When to use shows what a pattern is built from: the component pages of its `composes`, each once, without the hooks, helpers, providers and layout primitives, such as useToast, Column and Text, which the Docs and agents keep.

Register the page in [the index](index.md) under `## Patterns`, with only its title and path; the summary comes from the frontmatter. Patterns are listed in intent order.

A pattern page may instead be on the [figure template](component-pages.md#sections) of component pages, with a `## When to use` section: live figures, do and don't pairs and an anatomy figure, whose `of` names the component it labels. [Loading](patterns/loading.md) is on it.

[Form layout and validation](patterns/forms.md) is the model pattern page, in the [one-file structure](component-pages.md#one-file-per-page) that every page moves to: its frontmatter lists its examples with their roles and captions, and its sections are those of a component page in that structure. A pattern's decision, such as which control to use, is an option table under Rules; its compositions are titled blocks under Variants; its flow and timing, such as when to check and what happens on failure, go under Behaviour; `### Focus and keyboard` and what envUI and the application provide go under Accessibility, after Rules; and Compose shows its canonical example once, in full, as a `source` fence.

A pattern page follows the same writing rules as a component page: its Site speaks [plain language](component-pages.md#plain-language-on-the-site), with no inline code outside the Code disclosures, options named in words and lists used sparingly, for short items. Every piece of its text is in a [titled block](component-pages.md#text-in-titled-blocks), a heading and one short paragraph with its figure, never a loose sentence after a figure or a do and don't pair, and its options are [option tables](component-pages.md#option-tables), which the Site shows as legends. What developers need goes in its [developer-only part](component-pages.md#in-code-the-developer-only-part), `## In code`, after Accessibility: `### Usage`, how to build the composition in code, with the props that matter and an example file shown as code; `### Composition`, how its components fit together; and `### Customize` where it has one. Its generated Import names what the pattern `composes`. The Site's pattern page links to its guide in the Docs, `/docs/patterns/<id>`, as API, which complements it rather than repeating it: In code, what the application and envUI provide, and its changelog, without the Site's sections, figures, Related or band.

## Pattern sections

| Section              | Required | Holds                                                                                                                                    |
| -------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Overview             | yes      | One paragraph on how the pattern meets its need, which the summary above it names, then the lead example; never the summary again.       |
| Anatomy              | yes      | The parts of the composition, numbered, each naming its component and the props that matter.                                             |
| States and behaviour |          | The flow and its timing: when to validate, when a toast appears and leaves, what happens on failure, and responsive behaviour.           |
| Content guidelines   | yes      | The words of the pattern's kind of screen, which live here once; the writing guide holds the rules every screen shares.                  |
| Do and don't         |          | A `### Do` and a `### Don't` list.                                                                                                       |
| Accessibility        | yes      | `### Focus and keyboard`, the flow of focus rather than a table of keys, and `### envUI provides` and `### You provide` lists.           |
| Examples             | yes      | At least two more live compositions, each under a `###` heading with a sentence or two, so a pattern shows at least three example files. |
| Changelog            |          | Releases that changed the pattern.                                                                                                       |

Related is generated from `avoidWhen`. A pattern shows each composition in context, so its examples differ from the component pages' ones. The Site leaves out the `### envUI provides` and `### You provide` lists, as on component pages. The Docs show them on the pattern's guide, under Accessibility, and the packaged page and the agents' files keep them.
