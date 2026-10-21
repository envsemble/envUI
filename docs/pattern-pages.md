# Write a pattern or template page

A pattern page (`docs/patterns/<id>.md`) says how envUI's components combine for a recurring need, such as forms or empty states. A template page (`docs/templates/<id>.md`) gives whole screens, such as a settings page, as source an application copies and edits. Both use the [component page](component-pages.md) template's section titles, a subset of them, and its example files; the build validates them as it does component pages. [Loading](patterns/loading.md) is the model pattern page.

## Frontmatter

```yaml
---
title: Settings
summary: Let people change how the application works for them, and see each change apply. # One sentence.
status: beta # experimental, beta, stable or deprecated.
since: 1.0.0 # A released version, or the next.
intent: Collect and change information # Patterns only: one of the three intents below.
aliases: [preferences, options, notification settings] # At least one.
useWhen:
  - Someone changes a preference that applies at once.
avoidWhen:
  - text: Several answers given together and submitted once.
    see: forms # A page to read instead, by its file name.
  - text: Confirming a destructive action.
    use: ConfirmDialog # Or an export to use instead.
composes: [Switch, Select, Field, Button, Toast, Column] # The exports it combines: namespaces, not parts.
related: [forms, switch]
---
```

- **`intent`** groups patterns by what people are doing: _Collect and change information_, _Keep people informed_ or _Find and navigate_.
- **`composes`** names every envUI export the page's example and template files import, and only exports; `npm test` checks both.
- **`see`** names an indexed page, a pattern, template or component page; **`use`** names an export. An entry has one or the other.
- A template page has no `intent`, and adds **`frame`**: `app` when its screens render inside the app frame template's main region, `none` when each is a whole screen of its own.

Register the page in [the index](index.md) under `## Patterns` or `## Templates`, with only its title and path; the summary comes from the frontmatter. Patterns are listed in intent order; template ids end in `-page` or `-pages`, except `app-frame`.

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

Related is generated from the frontmatter. A pattern shows each composition in context, so its examples differ from the component pages' ones.

## Template sections

| Section              | Required | Holds                                                                                                                                         |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview             | yes      | What screen this is and when to start from it, then the main screen in a ` ```tsx template=Name``` ` fence, without a heading.                |
| Anatomy              | yes      | The screen's regions, numbered, each naming its components.                                                                                   |
| States and behaviour |          | Empty, loading, error and no-results states; behaviour at the desktop, tablet and phone widths; and `### Connect your data`: what to replace. |
| Content guidelines   |          | Copy particular to the screen.                                                                                                                |
| Do and don't         |          | A `### Do` and a `### Don't` list.                                                                                                            |
| Accessibility        | yes      | `### Landmarks and headings`, `### envUI provides` and `### You provide` lists.                                                               |
| Examples             |          | Other screens of the template, ` ```tsx template=Name``` `, and snippets, ` ```tsx example=Name``` `, each under a `###` heading.             |
| Changelog            |          | Releases that changed the template.                                                                                                           |

A screen's fence may override the page's frame, as ` ```tsx template=NotFound frame=none``` ` on a page of `frame: app`. The catalogue shows each screen in two frames, comfortable and compact, at a desktop, tablet or phone width, each a page of its own at `?frame=<page>/<Name>&scale=<comfortable|compact>&theme=<light|dark>`. The packaged page gets the screen's source in its fence, as an example's.

## Template files

A template's screen is an example file, `apps/catalogue/src/examples/<page>/<Name>.tsx`, with the [example rules](component-pages.md#examples) and these, which `npm test` checks:

- One self-contained file per screen, with its sample data as `const`s at the end of the file.
- A default-exported component with no props. The app frame template, `app-frame/AppFrame.tsx`, is the one exception: it takes `children?` and `current?`, and renders a sample page without children.
- No providers: no Theme, EnvUIProvider, `Toast.Provider` or LinkProvider. An application has them at its root once; the page says so and links to [setup](setup.md).
- Nothing from the network: Avatars show initials from `name`, and there are no image URLs.
- Links go to application paths, such as `/projects/website-refresh`, never `#`.
- An inline `style` only where envUI has no layout for it yet, under a comment that starts "envUI has no", so a later component can find and replace it.
- Neutral sample data: Alex Morgan, Sam Lee, Priya Shah, Jordan Kim, Maria Garcia and Chen Wei; Northwind; email at `example.com`; absolute dates in February and March 2026. No product names and no logos.

The envUI ESLint rules check every example and template file, so a template uses envUI's components rather than raw elements, no private classes and no raw colors.
