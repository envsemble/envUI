# Write a component page

Every component has one page in `docs/components/`, named after the component in kebab case and the singular: `text-field.md` for TextField, `button.md` for Button and its family. The same Markdown feeds the catalogue, the package and agents, so a page is written once. [Button](components/button.md) is the model page; read it before writing another.

## Frontmatter

A component page opens with YAML frontmatter. The build validates it and fails on an unknown field, a missing one or a wrong value.

```yaml
---
title: TextField # The component's name; the file is its kebab case.
summary: A labelled single-line text input with a description and an error. # One sentence.
status: beta # experimental, beta, stable or deprecated.
since: 0.1.0 # The release that added the component, under any earlier name: a released version, or the next.
category: Forms & selection # The index group the page is listed under.
aliases: # Words people and agents search for, including earlier names; at least one.
  - Input
  - text input
  - text box
useWhen: # Situations the component is for.
  - Someone types a single line, such as a name or an address.
avoidWhen: # Situations it is not for, each naming what to use instead where something fits.
  - text: Text that runs over several lines.
    use: Textarea
related: # Other indexed pages, by file name, not the page itself.
  - select
  - combobox
components: # The exports the page documents; each export has exactly one page.
  - TextField
  - SearchField
  - Textarea
---
```

- `use` names an export. The catalogue links it to the page that documents it, and agents read it as "need this, use that".
- List a family's members, such as IconButton on the button page, in `components`; the page then documents them in its sections. A namespace, such as `Menu`, covers all its parts; list the namespace, never a part such as `Menu.Item`.
- Foundation and workflow pages may list the components they document, such as `Text` on the typography page, with only `components` and `aliases`.

Register the page in [the index](index.md) under its group, with only its title and path: `- [TextField](components/text-field.md)`. The index orders the pages; the summary comes from the frontmatter.

## Sections

After the `# Title`, a page has these `##` sections in this order. Omit a section only where it doesn't apply, such as Anatomy for a component without parts. The build fails on another heading, a wrong order or a missing required section.

| Section              | Required | Holds                                                                                                       |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| Overview             | yes      | What the component is, its family, and one example shown first. The catalogue adds when to use it and not.  |
| Anatomy              |          | Its parts, numbered, with their props.                                                                      |
| Variants and sizes   |          | A table of variants and what each is for; sizes in rem.                                                     |
| States and behaviour |          | Hover, focus, disabled, pending and open states; what it does on its own, such as dismissing or announcing. |
| Content guidelines   |          | How to write its labels and text.                                                                           |
| Do and don't         |          | A `### Do` and a `### Don't` list.                                                                          |
| Accessibility        | yes      | A `### Keyboard` table (Key, Action), and `### envUI provides` and `### You provide` lists.                 |
| Examples             | yes      | One `###` heading per example, a sentence or two, and the example's fence.                                  |
| Changelog            |          | Releases that changed the component, newest first, such as `- **0.6.0**: The quiet variant.`                |

The build adds **Props**, generated from the TypeScript declarations, and **Related**, from the frontmatter, before Changelog. Don't write them, and don't list props anywhere: the build rejects a table whose first column is Name, Prop, Option, Attribute or the like beside a Type, Default or Contract column, and a `###` or deeper heading named Props or Props & contracts. A table of attributes and their values, or a heading such as Props forwarding, is fine. Write headings in Markdown, not as HTML. A page that uses the template's parts, such as an example fence or `useWhen`, must start with `## Overview`.

In the catalogue the sections become tabs: Overview (overview, examples, related, changelog), Guidelines (anatomy to do and don't), Accessibility and Props.

Write the keyboard table from the code and its browser tests, not from the pattern in general: list the keys the component handles, and Tab for how focus enters and leaves. "envUI provides" names the roles, names, announcements and focus handling the component does itself; "You provide" names what the application must add, such as a label or an accessible name.

## Examples

An example is a file in `apps/catalogue/src/examples/<page>/<Name>.tsx`: a small component, default-exported, that an application could copy as it is.

- Import only what an application can: `react`, `@envsemble/envui`, its `/content`, `/diff` and `/rich-text` entries, and icons from `@envsemble/envui/icons/<Name>`.
- No catalogue classes (`docs-*`) or helpers. Lay out with envUI's components; where envUI has no layout for it yet, a short inline style with a comment is fine.
- Use neutral sample data, such as Alex Morgan, Sam Lee, Priya Shah, Northwind or example.com, and never a product name.
- Keep state inside the example, and stand in for slow work with a timer.
- Name the file after what it shows, such as `ConfirmInPlace.tsx`.

Reference it from the Markdown with an empty fence, after its `###` heading and a sentence or two:

````md
### Confirm in place

ConfirmButton names the consequence on the first press and acts on the second.

```tsx example=ConfirmInPlace

```
````

The fence stays empty in `docs/`: the catalogue renders the file live, with its source and a copy button, and the packaged page gets the file's source in the fence, so agents read it inline. The Overview may show one example without a heading. Every example file is referenced exactly once, which `npm test` checks.

## Specimens

Some visual references are not examples: a matrix of every variant in every form, or controls forced into their hover and pressed looks. These are specimens in `apps/catalogue/src/specimens/<page>/<Name>.tsx`. They may use the catalogue's helpers in `apps/catalogue/src/previews`, and a page places one with a comment, which the packaged page leaves out:

```md
<!-- specimen: VariantMatrix -->
```

The visual baseline captures specimens and examples alike.

## Props

The Props section and `docs/generated/props.json` come from the component's TypeScript: each prop's type, its default from the destructured parameter, whether it is required and its TSDoc. To change them, edit the source:

- Write a TSDoc comment on every prop of the component's props interface: what it does, its values and its default where the code can't show it.
- Add `@default` where the default is computed, such as `@default 'outlined', or 'secondary' with icon`, and `@deprecated` with what to use instead.
- Run `npm run docs:props` and commit `docs/generated/props.json`. `npm run docs:check` and `npm test` fail while it is stale.

Native DOM props are summarised by element, so document only the props envUI declares or narrows.

## Convert a page

Pages written before the template have `## React usage` and `### Props & contracts` sections and a preview in `apps/catalogue/src/previews`. To convert one:

1. Read the component's source and its browser tests in `tests/browser`.
2. Move what the props table says into TSDoc on the props, then run `npm run docs:props`.
3. Write the sections. Keep the old page's guidance, and check each claim against the code.
4. Turn the preview's specimens into example files, or into specimens where they only serve review. Remove the page's case from `apps/catalogue/src/previews/ComponentPreview.tsx` and its preview function.
5. Take the page out of `unconverted` in `tests/DocumentationPages.test.mjs`.
6. Update browser tests that visited the old preview, then run `npm run typecheck`, `npm test`, the Chromium tests, and `npm run test:a11y:update` and `npm run test:visual:update`; review the changed images and accessibility entries.

The [library guide](library-development.md) describes the checks and the changeset a change needs.
