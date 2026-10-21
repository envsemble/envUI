# Write a component page

Every component has one page in `docs/components/`, named after the component in kebab case and the singular: `text-field.md` for TextField, `button.md` for Button and its family. The same Markdown feeds the catalogue, the package and agents, so a page is written once. A page is written as [exchanges](#exchanges): questions someone might ask an agent about the component, each answered with prose and live figures. [Button](components/button.md) and [Card](components/card.md) are the model pages; read them before writing another. Pattern and template pages use the same template with their own frontmatter: [write a pattern or template page](pattern-pages.md).

## Frontmatter

A component page opens with YAML frontmatter. The build validates it and fails on an unknown field, a missing one or a wrong value.

```yaml
---
title: TextField # The component's name; the file is its kebab case.
summary: A labelled single-line text input with a description and an error. # One sentence.
status: beta # experimental, beta, stable or deprecated.
statuses: # Optional: the exports whose status differs from the page's.
  SearchField: stable
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

- `statuses` gives an export listed in `components` a status other than the page's, such as a beta editor on a page whose renderer is stable; the catalogue shows it beside the page's, and the manifest and `llms.txt` carry it.
- `use` names an export. The catalogue links it to the page that documents it, and agents read it as "need this, use that".
- List a family's members, such as IconButton on the button page, in `components`; the page then documents them in its sections. A namespace, such as `Menu`, covers all its parts; list the namespace, never a part such as `Menu.Item`.
- Foundation and workflow pages may list the components they document, such as `Text` on the typography page, with only `components`, `aliases`, `exportAliases` and `statuses`. `exportAliases` maps an export listed in `components` to the words people search for it by, such as `ThemeToggle: [theme switcher]` on the setup page, for exports without a component page of their own. The exports such a page documents are `stable` in the manifest and the MCP server; `statuses` gives one another status, such as `useContainerSize: beta`.

Register the page in [the index](index.md) under its group, with only its title and path: `- [TextField](components/text-field.md)`. The index orders the pages; the summary comes from the frontmatter.

## Exchanges

A component page reads as if its reader had asked an agent about the component: a fixed sequence of exchanges, each a question and its answer. It is a reference page, not a chat: one question per section, plus follow-ups where a topic needs them, and no conversation running through them. The questions are illustrative; write them as someone would ask, and the answers so they are accurate.

After the `# Title`, a page has these `##` sections in this order. Omit an optional one where it doesn't apply. The build fails on another heading, a wrong order or a missing required section.

| Section           | Required | The question it answers, and what the answer holds                                                                                                              |
| ----------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview          | yes      | What is it, and what does it look like? What it is, its family, and at least one example; follow-ups on what it does on its own, such as pending or dismissing. |
| Variants          |          | Which variants are there, and when do I use each? Variants, tones, layouts and sizes, as tables, examples and specimens.                                        |
| When to use       | yes      | When should I use it, and when something else? Do and don't pairs and the rules they don't show; a follow-up on writing its labels and text.                    |
| Anatomy           |          | What is it made of? An anatomy figure with its legend, and parts the figure can't show, such as a spinner while pending.                                        |
| Adapting to width |          | How does it behave when space runs out? What it does in a narrow container, with an example at several widths.                                                  |
| Accessibility     | yes      | How do I keep it accessible? A sentence or two, a `### Keyboard` table (Key, Action), and `### envUI provides` and `### You provide` lists.                     |
| Changelog         |          | No question: releases that changed the component, newest first, such as `- **0.6.0**: The quiet variant.`                                                       |

The build adds **Props** and **Related** before Changelog; don't write them, and don't list props anywhere, as [Props](#props) describes. In the catalogue every exchange is in the page's Overview view, which ends with a last exchange that leads to the Props view.

### Questions

Each section opens with its question, a blockquote of one sentence that ends with a question mark, right after the heading:

```md
## Variants

> Which variants are there, and when do I use each?
```

The catalogue shows it as a compact Message at the inline end of the heading's row, and the answer below across the full width. Another blockquote later in a section is a follow-up question, such as `> Which sizes are there?` under Variants, with its own answer below it. Don't use blockquotes for anything else on these pages. A page is read as exchanges when its `## Overview` opens with a question; a page whose Overview doesn't is on the [section template](#pages-on-the-section-template).

### Answers

Answer in plain, direct sentences, and choose the form that teaches each point best rather than a column of paragraphs: a table for values and what each is for, a live example for how it looks and behaves, a do and don't pair for a judgment, an anatomy figure for parts, an example at several widths for how it adapts, a list for rules. Keep paragraphs short; the catalogue keeps prose to a readable measure and gives figures the full width. The catalogue also lays out some patterns for you:

- **Figures in a row**: figures that follow each other with only blank lines between them sit side by side, such as a do and a don't, or the members of a family.
- **A subsection beside its figure**: a `###` subsection of text, with no table or list at its start, followed by exactly one figure, sits beside that figure on a wide page, such as each kind of card under Variants.
- **Lists in columns**: two or more `###` subsections in a row that each hold only a list sit side by side, such as `### envUI provides` and `### You provide`.
- **When to use** starts with the frontmatter's `useWhen` and `avoidWhen`, as two columns; write what follows them, not the same points again.

## Figures

A figure is an [example file](#examples) placed with an empty fence whose info string names its kind and file. Under every figure the catalogue shows a closed Code disclosure with the file's source and a copy button, so every figure can be copied as it is. Attributes follow the name as `name="value"`; a value without spaces needs no quotes. Write a caption as one sentence, without double quotes inside.

| Fence                            | Shows                                                                             | Attributes                                                    |
| -------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| ` ```tsx example=Name `          | The example, live in a hairline frame.                                            | `caption`: a sentence below it. `widths`: see below.          |
| ` ```tsx do=Name caption="…" `   | The example on a quiet stage with a green Do bar, and the caption below.          | `caption`, required: what to do, as one sentence.             |
| ` ```tsx dont=Name caption="…" ` | The same with a red Don't bar.                                                    | `caption`, required: what not to do and why, as one sentence. |
| ` ```tsx anatomy=Name `          | The example in the light and the dark theme, with numbered callouts on its parts. | `of`: see below. `caption`: a sentence below it.              |

### Examples at several widths

`widths="16 30"` shows the example in a frame of each width in rem, side by side and labelled, where it responds to that width: its container queries see the frame. Choose widths on either side of where the component changes, such as `widths="24 44"` around a card's 38 rem. Where the frames don't fit, the strip scrolls.

### Do and don't pairs

Put a `do` fence and a `dont` fence after each other, so they sit side by side; write two pairs one after the other, and they line up two to a row. Make both examples show the same situation, so the only difference is the point: the same dialog's actions with one primary button and with three. Each is a whole example file an application could copy, the don't included. Avoid a don't that the accessibility scan would flag, such as a button inside a link; say that in a rule instead. Rules that don't need a picture stay a list below the pairs.

### Anatomy figures

An ordered list right after an anatomy fence is its legend. Each item names its part by class name in a code span, and the catalogue puts that item's number on the part, measured from the live component in each theme; the callouts follow the figure as it resizes.

````md
```tsx anatomy=CardAnatomy

```

1. **Surface** (`env-card`, `background`, `padding`): the fill with 1.75 rem corners.
2. **Title** (`env-card-heading`, `title`): an `h3` in the title type.
3. `env-card-footer`
````

- The first code span that starts with `env-` is the part; other code spans, such as props, are text. Start each item with the part's name in bold.
- A part reference is a class name such as `env-card-heading`, or a selector of class names written without their dot, such as `env-button > env-icon:first-child` for a button's start icon. `::text` at the end points at the element's own text rather than its box, such as `env-button::text` for a label that has no element of its own.
- An item that holds only the code span takes its description from `docs/generated/parts.json`. A fence without a list numbers every part `parts.json` lists for the page's component, or for the one `of="Name"` names.
- Make the anatomy example small and complete, with every part the legend names present once: the root first, then the parts in reading order. List parts the figure can't show, such as a spinner while pending or a focus ring, below the legend.

## Pages on the section template

Pages not yet converted to exchanges are on an earlier template: after the `# Title`, these `##` sections in this order, with Overview, Accessibility and Examples required.

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

On a page on the section template, the catalogue shows the sections as tabs: Overview (overview, examples, related, changelog), Guidelines (anatomy to do and don't), Accessibility and Props.

Write the keyboard table from the code and its browser tests, not from the pattern in general: list the keys the component handles, and Tab for how focus enters and leaves. "envUI provides" names the roles, names, announcements and focus handling the component does itself; "You provide" names what the application must add, such as a label or an accessible name.

## Examples

An example is a file in `apps/catalogue/src/examples/<page>/<Name>.tsx`: a small component, default-exported, that an application could copy as it is.

- Import only what an application can: `react`, `@envsemble/envui`, its `/content`, `/diff` and `/rich-text` entries, and icons from `@envsemble/envui/icons/<Name>`.
- No catalogue classes (`docs-*`) or helpers. Lay out with envUI's components; where envUI has no layout for it yet, a short inline style with a comment is fine.
- Use neutral sample data, such as Alex Morgan, Sam Lee, Priya Shah, Northwind or example.com, and never a product name.
- Keep state inside the example, and stand in for slow work with a timer.
- Name the file after what it shows, such as `ConfirmInPlace.tsx`.

Reference it from the Markdown with an empty fence. On a page of exchanges it is a [figure](#figures), anywhere in an answer; on a page on the section template it goes under `## Examples`, after its `###` heading and a sentence or two:

````md
### Confirm in place

ConfirmButton names the consequence on the first press and acts on the second.

```tsx example=ConfirmInPlace

```
````

The fence stays empty in `docs/`: the catalogue renders the file live, with its source and a copy button, and the packaged page gets the file's source in the fence, so agents read it inline. On the section template the Overview may show one example without a heading. Every example file, do, don't and anatomy figures included, is referenced exactly once, which `npm test` checks.

## Specimens

Some visual references are not examples: a matrix of every variant in every form, or controls forced into their hover and pressed looks. These are specimens in `apps/catalogue/src/specimens/<page>/<Name>.tsx`. They may use the catalogue's helpers in `apps/catalogue/src/previews`, and a page places one with a comment, which the packaged page leaves out:

```md
<!-- specimen: VariantMatrix -->
```

The visual baseline captures a page's specimens, and its first example when it has no specimen.

## Props

The Props section and `docs/generated/props.json` come from the component's TypeScript: each prop's type, its default from the destructured parameter, whether it is required and its TSDoc. To change them, edit the source:

- Write a TSDoc comment on every prop of the component's props interface: what it does, its values and its default where the code can't show it.
- Add `@default` where the default is computed, such as `@default 'outlined', or 'secondary' with icon`, and `@deprecated` with what to use instead.
- Run `npm run docs:props` and commit `docs/generated/props.json`. `npm run docs:check` and `npm test` fail while it is stale.
- Then run `npm run docs:manifest` and commit `docs/generated/manifest.json` and `llms.txt`, which agents read; they follow every change to a page's frontmatter, examples and props.

Native DOM props are summarised by element, so document only the props envUI declares or narrows.

## Convert a page

### To exchanges

To convert a page on the section template into exchanges:

1. Read the component's source, its CSS for the part class names, and its browser tests in `tests/browser`.
2. Add the question under `## Overview`, and move each section's content into the exchange that answers it: Variants and sizes into Variants; States and behaviour into Overview follow-ups, or into Variants where a state belongs to one variant; Content guidelines into a follow-up under When to use; Do and don't into pairs under When to use, with the rules no picture needs as a list; Examples into the exchanges they illustrate, as figures with a caption or under a `###` subsection. Keep every claim, and check it against the code.
3. Keep every heading another page links to, such as `#confirm-in-place`, as a `###` subsection: the build fails on a link to a heading that is gone.
4. Write the new example files: the do and don't pairs, the anatomy example and, where the component adapts, an example for `widths`. Keep specimens where they show what code can't, such as forced hover and pressed states.
5. Run `npm run check`, and look at the page in the catalogue at a narrow and a wide width, in light and dark: the callouts on their parts, the pairs side by side and no figure overflowing. Update browser tests that visited the page's Guidelines or Accessibility view; on a page of exchanges, those headings are in its Overview.

### From the earliest pages

Pages written before the template have `## React usage` and `### Props & contracts` sections and a preview in `apps/catalogue/src/previews`. To convert one:

1. Read the component's source and its browser tests in `tests/browser`.
2. Move what the props table says into TSDoc on the props, then run `npm run docs:props`.
3. Write the exchanges. Keep the old page's guidance, and check each claim against the code.
4. Turn the preview's specimens into example files, or into specimens where they only serve review. Remove the page's case from `apps/catalogue/src/previews/ComponentPreview.tsx` and its preview function.
5. Take the page out of `unconverted` in `tests/DocumentationPages.test.mjs`.
6. Update browser tests that visited the old preview, then run `npm run typecheck`, `npm test`, the Chromium tests, and `npm run test:a11y:update` and `npm run test:visual:update`; review the changed images and accessibility entries.

The [library guide](library-development.md) describes the checks and the changeset a change needs.
