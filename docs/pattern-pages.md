# Write a pattern page

A pattern page (`docs/patterns/<id>.md`) says how envUI's components combine for a recurring need, such as an app frame, forms or empty states. It is written as a [component page](component-pages.md) is, in the one-file structure: the same sections in the same order, figures placed by name, rules written as a lead and one-fact bullets, and Compose for developers. The build validates it as it does component pages. [Form layout and validation](patterns/forms.md) is the model pattern page.

## Frontmatter

```yaml
---
title: Settings
summary: Let people change how the application works for them, and see each change apply. # One sentence.
status: beta # experimental, beta, stable or deprecated.
since: 1.0.0 # A released version, or the next.
intent: Enter and change data # Patterns only: one of the intents below.
aliases: [preferences, options, notification settings] # At least one.
useWhen:
  - Someone changes a preference that applies at once.
avoidWhen:
  - text: Several answers given together and submitted once.
    see: forms # A page to read instead, by its file name.
  - text: Confirming a destructive action.
    use: ConfirmDialog # Or an export to use instead.
composes: [Switch, Select, Field, Button, Toast, Column] # The exports it combines: namespaces, not parts.
examples: # Each example file once, with its role and caption, as on a component page.
  SettingsPage: overview
  GroupedSettings: example
---
```

- **`intent`** groups patterns by what people are doing: _Enter and change data_, _Keep people informed_, _Work with lists and tables_ or _Frame the application_.
- **`composes`** names every envUI export the page's example files import, and only exports; `npm test` checks both. The generated Import in Compose names them.
- **`avoidWhen`** is the page's one list of related pages, shown as Related at its end, as on [component pages](component-pages.md#frontmatter). **`see`** names an indexed page, a pattern or component page; **`use`** names an export. An entry has one or the other, and names each once.
- **`examples`** lists each example file once, with its role, as on [component pages](component-pages.md#frontmatter). An overview that shows a whole window, as [App frame](patterns/app-frame.md)'s does, takes `stage: shaded`.

Register the page in [the index](index.md) under `## Patterns`, with only its title and path; the summary comes from the frontmatter. Patterns are listed in intent order.

## What a pattern says

A pattern covers a need that takes two or more components together, or a choice between components; guidance that would fit in one section of one component page is a variant or an example on that page instead. It keeps two things:

- **Its decision**: which component or which form to use when, as an [option table](component-pages.md#option-tables) under Rules, such as `### Which to use`, which the catalogue shows as a legend.
- **Its compositions**: the arrangements no single component page shows, such as type to confirm or a long form in steps, as titled blocks beside their figures under Variants.

It links to each component for that component's own behaviour, such as how long a toast stays or where a confirmation puts focus, and never says it again. The words of its kind of screen, such as an empty state's titles or a form's error messages, are a block under Rules, and the [writing guide](writing.md) holds the rules every screen shares.

## Its sections

A pattern uses the [structure](component-pages.md#the-structure) of a component page:

| Section       | Holds on a pattern page                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview      | Generated from its overview example, the lead composition.                                                                                        |
| Variants      | Its compositions, each a titled block beside its figure.                                                                                          |
| Anatomy       | The parts of the composition, on an anatomy figure whose `of` names the component it numbers, or the component each part is.                      |
| Behaviour     | The flow and its timing, such as when to check and what happens on failure, ending with `### Adapting to width` where it adapts.                  |
| Rules         | Its decision, its do and don't pairs and its words. The catalogue opens it with Use it when and Built from.                                       |
| Accessibility | `### Focus and keyboard`, the flow of focus rather than a table of keys, then `### envUI provides` and `### You provide`.                         |
| Words to use  | Optional: the phrases people ask for, with what each means in code.                                                                               |
| Compose       | `### Usage`, how to build it, with its canonical example once, in full, as a `source` fence; `### Composition`; `### Customize` where it has one. |
| Changelog     | Releases that changed the pattern.                                                                                                                |

- **Built from.** The catalogue's Rules shows what a pattern is built from: the component pages of its `composes`, each once, without the hooks, helpers, providers and layout primitives, such as useToast, Column and Text, which the Docs and agents keep.
- **Its own examples.** A pattern shows each composition in context, so its examples differ from the component pages' ones.
- **The same writing rules.** Its plain sections speak [plain language](component-pages.md#plain-language-in-the-catalogue), and every piece of its text is in a [titled block](component-pages.md#text-in-titled-blocks), a lead and its rules, with its figure; what developers need goes in [Compose](component-pages.md#compose-the-developer-part).
- **Its page in the Docs** is `/docs/patterns/<id>`, which the catalogue's page links to with its Docs button: Compose, what the application and envUI provide, and its changelog, without the catalogue's sections, figures or Related. The packaged page and the agents' files keep the whole file.
