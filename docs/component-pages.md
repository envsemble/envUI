# Write a component page

Every component has one page in `docs/components/`, named after the component in kebab case and the singular: `text-field.md` for TextField, `button.md` for Button and its family. The same Markdown feeds the catalogue, the package and agents, so a page is written once. A page is on the [figure template](#sections): ordinary sections of live figures and a few short sentences, visual first. [Button](components/button.md) and [Card](components/card.md) are the model pages; read them before writing another. Pattern and template pages use the same template with their own frontmatter: [write a pattern or template page](pattern-pages.md).

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

## Sections

A component page is a reference page in the traditional style: ordinary headings, short direct text and live figures, in a fixed order so readers and agents know where to look. After the `# Title`, a page has these `##` sections in this order. Omit an optional one where it doesn't apply. The build fails on another heading, a wrong order or a missing required section. A component page with a `## When to use` section is on this template; one without is on the [section template](#pages-on-the-section-template).

| Section           | Required | Holds                                                                                                                 |
| ----------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| Overview          | yes      | What it is in one sentence, its family as figures, and `###` subsections on what it does on its own, such as pending. |
| Variants          |          | Variants, tones, layouts and sizes: a table of the values, examples and specimens.                                    |
| When to use       | yes      | Do and don't pairs and the few rules they don't show; a `### Labels` or `### Content` subsection on writing its text. |
| Anatomy           |          | An anatomy figure with its legend, and one sentence naming parts the figure can't show.                               |
| Adapting to width |          | A sentence and an example at several widths.                                                                          |
| Accessibility     | yes      | A `### Keyboard` table (Key, Action) where it handles keys, and `### envUI provides` and `### You provide` lists.     |
| Changelog         |          | Releases that changed the component, newest first, such as `- **0.6.0**: The quiet variant.`                          |

The build adds **Props** and **Related** before Changelog; don't write them, and don't list props anywhere, as [Props](#props) describes. In the catalogue every section is in the page's Overview view, which ends with a Props section that leads to the Props view. Don't use blockquotes: the build rejects them. Write a point as a sentence, or a judgment as a do and don't pair.

### Write little

The docs are mainly visual. Let the figures, the do and don't pairs and the anatomy teach, and write a sentence or two around them:

- **Show, then say little.** Cut every sentence a figure already shows, such as what a variant looks like, its colors or its corners. A sentence beside a figure says what the figure can't: the prop that makes it, or the rule it illustrates.
- **Say each thing once.** Each kind of information has one place on a page, in the table below; don't repeat it in a caption, a legend, a list and another section.
- **Short over complete.** Leave out what the generated props reference holds, such as each prop's values and defaults, and what the code does for itself, such as an exact delay or padding, unless a reader chooses it.

| Information                                   | Its one place                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| What it is                                    | One sentence at the start of Overview.                                                                  |
| What it looks like                            | Figures, with no sentence describing them.                                                              |
| When to use it, and what to use instead       | The frontmatter's `useWhen` and `avoidWhen`, which When to use shows first.                             |
| A judgment, such as one primary button        | A do and don't pair whose captions are the rule. A pair never pictures a `useWhen` or `avoidWhen` item. |
| Rules no picture shows                        | A short list after the pairs, two or three items at most.                                               |
| Variants, tones and sizes                     | One table of the values and what each is for.                                                           |
| What it does on its own, such as pending      | A `###` subsection of Overview, a sentence beside its figure.                                           |
| Its parts and their class names               | The anatomy legend, names only.                                                                         |
| How it adapts to width                        | A sentence and an example at several widths.                                                            |
| Keys, roles and what the application must add | Accessibility.                                                                                          |
| Props                                         | The generated Props view; never in prose.                                                               |
| Releases                                      | Changelog.                                                                                              |

Choose the form that teaches each point best rather than a column of paragraphs: a live example for how it looks and behaves, a do and don't pair for a judgment, an anatomy figure for parts, an example at several widths for how it adapts, a table for values, a short list for rules. The catalogue lays out some patterns for you:

- **Figures in a row**: figures that follow each other with only blank lines between them sit side by side, such as a do and a don't, or the members of a family. Put a sentence between figures that should not share a row.
- **A subsection beside its figure**: a `###` subsection of text, with no table or list at its start, followed by exactly one figure, sits beside that figure on a wide page, such as each kind of card under Variants.
- **Lists in columns**: two or more `###` subsections in a row that each hold only a list sit side by side, such as `### envUI provides` and `### You provide`.
- **When to use** starts with the frontmatter: `useWhen` as a short plain list under Use it when, then under Use something else a tile for each component or page an `avoidWhen` item names in `use` or `see`, its lead example small and inert on the dotted stage with its name and the item's text below. The tiles render once the section nears the viewport. A page with an open anatomy figure, such as Dialog or Menu, is shown by that figure instead; an alternative without an example shows a page icon on the same stage; an item that names nothing follows the tiles as a plain list. Four tiles go four across where they fit, else two by two, else one column; three, five, six and nine go in rows of three. Write what follows them, not the same points again.

### Layout: equal cells, spacing with rhythm

- **Cells that share a row are one size.** Figures side by side take equal widths, and their stages are as tall as the tallest, with their captions and Code toggles lined up across the row. Never put cells of different sizes side by side: an example at several widths shows one frame to a row, each centred on its own stage. A row of figures stays one column until all of them fit side by side, so no row is left with an orphan: an even run, do and don't pairs included, two to a row from 38 rem, and a run of three, do and don't figures included, three across from 58 rem; write two or three figures in a row, or four as two pairs, and never five.
- **Related things sit close, unrelated things apart.** A heading sits close to its first content, text close to the figure it introduces, and a figure's stage, caption and Code toggle close together. One sub-topic, such as a `###` subsection or the next figure after a caption, sits clearly apart from the last, also where the last is only text, a list or a table, and one section further still. The catalogue spaces them with the spacing tokens: 1 rem for what belongs together, 3 rem between sub-topics and 4 rem between sections.
- **No separators.** Space, not lines, separates sections and sub-topics.
- **One frame per figure.** A dotted stage is the figure's only frame: never put it inside another framed or filled box, such as a Surface or Card around a specimen grid, or a stage inside a stage. A do or don't figure's stage and its bar are one figure: two blocks joined as envUI's connected rows (`env-connected-rows`), with the outer corners rounded large and the inner ones small, and the small gap of a list's rows between them. A tile of When to use is its stage, with its name and line below it in no box. A catalogue browser test fails on a stage with a bordered, filled or shadowed ancestor in the article.

### Learn from Material's docs

Material Design 3's component pages, such as [buttons](https://m3.material.io/components/buttons/guidelines) and [cards](https://m3.material.io/components/cards/guidelines), are the reference for explaining visually. Borrow their approach, not their layout, which the fixed sections replace, and copy none of their text or images:

- A figure for each point, with one sentence under it that states the point rather than describing the picture.
- Do and don't figures on the same situation, each with a one-sentence caption, and a third figure where two dos make the point, such as a button that fits its label and one that stretches.
- An anatomy figure with a numbered legend of part names only; guidance on a part goes in its own figure or pair.
- Short paragraphs beside figures, and accessibility as what people do with assistive technology, a keyboard table and how to label.

## Figures

A figure is an [example file](#examples) placed with an empty fence whose info string names its kind and file. Every figure sits on the same dotted stage, in the theme the reader has chosen, centred horizontally and vertically, so a reader can always tell an example from the page around it; a specimen on a page on the figure template sits on it too. The stage is the catalogue's (`apps/catalogue/src/styles/Stage.css`), not envUI's.

Under every figure the catalogue shows a closed Code toggle with the file's source and a copy button, so every figure can be copied as it is. Open code always spans the whole content column: a figure that shares its row, or sits beside text, opens its code below the row, across the column, so code never scrolls sideways in a narrow cell. Where the column is narrower than a 100-character line, the code soft-wraps instead of scrolling; keep example lines within the formatter's 100 characters. Attributes follow the name as `name="value"`; a value without spaces needs no quotes. Write a caption as one sentence. A value can't contain a double quote, not even as `\"`, so quote with ' or “ ”.

| Fence                            | Shows                                                                     | Attributes                                                    |
| -------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| ` ```tsx example=Name `          | The example, live on the dotted stage.                                    | `caption`: a sentence below it. `widths`: see below.          |
| ` ```tsx do=Name caption="…" `   | The example on the stage joined to a green Do bar, and the caption below. | `caption`, required: what to do, as one sentence.             |
| ` ```tsx dont=Name caption="…" ` | The same with a red Don't bar.                                            | `caption`, required: what not to do and why, as one sentence. |
| ` ```tsx anatomy=Name `          | The example in the reader's theme, with numbered callouts on its parts.   | `of`: see below. `caption`: a sentence below it.              |

Each kind also takes the flag `open`, written alone, such as ` ```tsx do=OneMenu open caption="…" `: see [open overlays](#open-overlays).

### Stage fill

`stage=raised` fills a figure's stage with the pane background (`--env-color-bg-default`) instead of the page's, in the light theme only, standard and high contrast; the dots and the frame stay. Use it only when the default doesn't show the subject clearly: when the subject has the page's color in the light theme, such as an open menu or popover, white on white. In the dark theme a popup is already a step lighter than the page, so the stage keeps the page's color there. `stage=shaded` fills it a shade darker than both the page's and the navigation's backgrounds, in each theme, for a figure that shows both, such as a Scaffold with its navigation, top bar and body; a Scaffold on the stage paints the page's background in its body. Don't draw a frame or an edge around the subject instead. Check the figure in light and dark.

### Open overlays

A popup, a menu, a tooltip, a dialog, a sheet or a toast renders in a portal, outside the figure, so a figure of it shows only its trigger. With `open` on its fence, a figure shows it open, as a picture: the catalogue renders the example's overlays into its stage through envUI's `PortalContainer`, `contained`, so they neither lock the page's scroll, take focus nor close when the reader presses elsewhere, and the figure is inert.

- The example opens them itself, as an application would: `defaultOpen` on a Menu.Root, Dialog, Select, Tooltip or Popover, an `open` state that starts true for a CommandPalette, and a toast shown from an effect with `duration: Infinity`, dismissed in its cleanup. Say so in a comment, such as "Shown open after a send with a mistyped address."
- A popup opens beside its trigger, and the figure centres the two together on the stage, growing to hold them; a dialog, a sheet or a palette is placed on the stage, over its scrim, which fills the stage; a toast sits at the stage's edge, clear of the trigger.
- In an anatomy figure, the callouts number the open parts like any other, and keep clear of what opens a popup, such as a select's field; the scrim is left out, so name it in the sentence below. Leave out the trigger where the anatomy is of the overlay, such as a dialog without `trigger`.
- Use it for figures whose point is in the open overlay: a menu's items, a dialog's buttons, a tooltip's words, a toast's message. A figure whose point is the trigger stays closed.

### Examples at several widths

`widths="16 30"` shows the example in a frame of each width in rem, one to a row, each centred on its own stage with its width outlined and labelled, where it responds to that width: its container queries see the frame. Choose widths on either side of where the component changes, such as `widths="24 40"` around a card's 38 rem. Where a frame is wider than the page, its stage scrolls.

### Do and don't pairs

Put a `do` fence and a `dont` fence after each other, so they sit side by side; write two pairs one after the other, and they line up two to a row. Make both examples show the same situation, so the only difference is the point: the same dialog's actions with one primary button and with three. A caption is the rule in a few words, such as "One primary button per group, at the end of its actions."; don't repeat it in a list below. Each is a whole example file an application could copy, the don't included. Avoid a don't that the accessibility scan would flag, such as a button inside a link; say that in a rule instead. Rules that don't need a picture stay a list below the pairs.

### Anatomy figures

An ordered list right after an anatomy fence is its legend. Each item names its part by class name in a code span, and the catalogue puts that item's number on the part, measured from the live component in the theme the reader has chosen; the callouts follow the figure as it resizes and as the theme changes. The legend holds names only: what a part looks like is in the figure, and what it does belongs in the section that covers it.

````md
```tsx anatomy=CardAnatomy

```

1. **Surface** (`env-card`)
2. **Title** (`env-card-heading`, `title`)
3. `env-card-footer`
````

- The first code span that starts with `env-` is the part; a second code span may name the prop that fills it. Start each item with the part's name in bold, and write nothing after the parentheses.
- A part reference is a class name such as `env-card-heading`, or a selector of class names written without their dot, such as `env-button > env-icon:first-child` for a button's start icon. `::text` at the end points at the element's own text rather than its box, such as `env-button::text` for a label that has no element of its own.
- An item that holds only the code span takes its description from `docs/generated/parts.json`. A fence without a list numbers every part `parts.json` lists for the page's component, or for the one `of="Name"` names.
- `docs/generated/parts.json` is generated from the library: under `components`, each component by its export name, with its `root` class, its `parts` (`class` and `description`) and its `states` (`attribute`, `values` and the `parts` that carry it); under `shared`, the groups of parts several components share, such as `ConnectedRows`. Read a component's entry there before writing its legend.
- The build fails on a legend class that neither packages/ui's CSS nor `parts.json` has, and on a fence without a legend whose component has no parts there. A part the example doesn't render leaves its number off the figure, which the catalogue's browser test that counts every anatomy figure's callouts catches.
- The catalogue shows a small subject, such as a badge or a checkbox, half as large again where its stage has room, so its callouts don't crowd.
- Make the anatomy example small and complete, with every part the legend names present once: the root first, then the parts in reading order. Name parts the figure can't show in one sentence below it, such as "Not shown: the spinner, `env-button-spinner`."

## Pages on the section template

Pages not yet converted to the figure template are on an earlier template: after the `# Title`, these `##` sections in this order, with Overview, Accessibility and Examples required.

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
- Keep it small: the stage centres the example at its own width. Give the root a width where it should be wider than its content, such as `inlineSize: '100%'` on a grid of cards. A root that is or holds a size container, such as a feature card or a page header, fills the stage, since centred it would have no width.
- Name the file after what it shows, such as `ConfirmInPlace.tsx`.
- Start an example's own headings at level 3, since the page's sections are `h2`: set `headingLevel={3}` on a component that renders a heading of its own at level 2, such as a feature Card, and render other headings as `h3` or lower.

Reference it from the Markdown with an empty fence. On a page on the figure template it is a [figure](#figures), anywhere in a section; on a page on the section template it goes under `## Examples`, after its `###` heading and a sentence or two:

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

On a page on the figure template, keep a specimen only where it shows what an example can't, such as forced hover and pressed looks or every size side by side; a matrix that repeats the variants an example already shows goes. On its stage, a grid of specimens is centred with even space on its four sides, in columns of one width, each specimen's content centred in its column unless it fills it, such as cards; a matrix, such as forced states by variant, has a label column and then columns of one width, with each cell centred and each label on its row's centre line. The catalogue's CSS does this; a specimen adds no wrapper of its own around its grid or table. Give it a `###` heading and its sentence in the Markdown before it, so the text sits next to the figure; the specimen itself takes no title there, and its parts' titles are `h4`. Elsewhere a specimen's title is an `h2` and its parts' `h3`. The catalogue sets the level; a specimen's `Example` and `Specimen` take it from there.

The visual baseline captures a page's specimens, and its first example when it has no specimen.

## Props

The Props section and `docs/generated/props.json` come from the component's TypeScript: each prop's type, its default from the destructured parameter, whether it is required and its TSDoc. To change them, edit the source:

- Write a TSDoc comment on every prop of the component's props interface: what it does, its values and its default where the code can't show it.
- Add `@default` where the default is computed, such as `@default 'outlined', or 'secondary' with icon`, and `@deprecated` with what to use instead.
- Run `npm run docs:props` and commit `docs/generated/props.json`. `npm run docs:check` and `npm test` fail while it is stale.
- Then run `npm run docs:manifest` and commit `docs/generated/manifest.json` and `llms.txt`, which agents read; they follow every change to a page's frontmatter, examples and props.

Native DOM props are summarised by element, so document only the props envUI declares or narrows.

## Convert a page

### To the figure template

To convert a page on the section template to the figure template:

1. Read the component's source, its CSS for the part class names, and its browser tests in `tests/browser`.
2. Move each section's content into the section of the figure template that holds it: Variants and sizes into Variants; States and behaviour into `###` subsections of Overview, or into Variants where a state belongs to one variant; Content guidelines into a `### Labels` or `### Content` subsection of When to use; Do and don't into pairs under When to use, with the rules no picture needs as a short list; Examples into the sections they illustrate, as figures with a caption or under a `###` subsection. Keep what a reader needs, check it against the code, and drop what a figure, the props reference or another section already says.
3. Keep every heading another page links to, such as `#confirm-in-place`, as a `###` subsection: the build fails on a link to a heading that is gone.
4. Write the new example files: the do and don't pairs, the anatomy example and, where the component adapts, an example for `widths`. Keep specimens where they show what code can't, such as forced hover and pressed states.
5. Cut the page down: each thing once, in its place in [the table](#write-little), and no sentence a figure already shows. Run `npm run check`, and look at the page in the catalogue at a narrow and a wide width, in light and dark: cells that share a row of one size, the callouts on their parts, one for each legend item, figures centred on their stages, open code across the column and nothing overflowing. Check the outline too, in the browser's accessibility tree or with a headings list: one `h2` per section and nothing else at that level, so no specimen or example adds an `h2` of its own. Update browser tests that visited the page's Guidelines or Accessibility view; on the figure template, those headings are in its Overview.

### From the earliest pages

Pages written before the template have `## React usage` and `### Props & contracts` sections and a preview in `apps/catalogue/src/previews`. To convert one:

1. Read the component's source and its browser tests in `tests/browser`.
2. Move what the props table says into TSDoc on the props, then run `npm run docs:props`.
3. Write the sections of the figure template. Keep the guidance a reader needs, and check each claim against the code.
4. Turn the preview's specimens into example files, or into specimens where they only serve review. Remove the page's case from `apps/catalogue/src/previews/ComponentPreview.tsx` and its preview function.
5. Take the page out of `unconverted` in `tests/DocumentationPages.test.mjs`.
6. Update browser tests that visited the old preview, then run `npm run typecheck`, `npm test`, the Chromium tests, and `npm run test:a11y:update` and `npm run test:visual:update`; review the changed images and accessibility entries.

The [library guide](library-development.md) describes the checks and the changeset a change needs.
