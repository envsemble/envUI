# Write a component page

Every component has one page in `docs/components/`, named after the component in kebab case and the singular: `text-field.md` for TextField, `button.md` for Button and its family. The same Markdown feeds the catalogue, the package and agents, so a page is written once. A page is on the [figure template](#sections): ordinary sections of live figures and a few short sentences, visual first, in plain language for people looking at envUI, then [In code](#in-code-the-developer-only-part), the part for people who build with it. [Button](components/button.md), [Card](components/card.md), [TextField](components/text-field.md) and [Sheet](components/sheet.md) are the model pages; read them before writing another. Pattern and template pages use the same template with their own frontmatter: [write a pattern or template page](pattern-pages.md).

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
useWhen: # Situations the component is for: short items, usually not sentences.
  - A short value on one line, such as a name
avoidWhen: # The page's one list of related components and pages: a need it doesn't meet, and what does.
  - text: Text that runs over several lines.
    use: Textarea
  - text: Several answers given together and submitted once.
    see: forms
components: # The exports the page documents; each export has exactly one page.
  - TextField
  - SearchField
  - Textarea
---
```

- `statuses` gives an export listed in `components` a status other than the page's, such as a beta editor on a page whose renderer is stable; the catalogue shows it beside the page's, and the manifest and `llms.txt` carry it.
- `avoidWhen` is the page's one list of related components and pages, its **Related** section: each entry names an export in `use` or an indexed page in `see`, never both, with a line saying when to pick it instead. The catalogue links it to the page that documents it, and agents read it as "need this, use that". Name each export or page once, and not both an export and its page; the build fails on a relation named twice. An entry may name a member of the page's own family, such as Textarea on the TextField page. Relate only what a reader might pick instead: a page that is only used alongside, such as Accessibility or Icons, is linked from the sentence that needs it, if anywhere.
- List a family's members, such as IconButton on the button page, in `components`; the page then documents them in its sections. A namespace, such as `Menu`, covers all its parts; list the namespace, never a part such as `Menu.Item`.
- Foundation and workflow pages may list the components they document, such as `Text` on the typography page, with only `components`, `aliases`, `exportAliases` and `statuses`. `exportAliases` maps an export listed in `components` to the words people search for it by, such as `ThemeToggle: [theme switcher]` on the setup page, for exports without a component page of their own. The exports such a page documents are `stable` in the manifest and the MCP server; `statuses` gives one another status, such as `useContainerSize: beta`.

Register the page in [the index](index.md) under its group, with only its title and path: `- [TextField](components/text-field.md)`. The index orders the pages; the summary comes from the frontmatter.

## Sections

A component page is a reference page in the traditional style: ordinary headings, short direct text and live figures, in a fixed order so readers and agents know where to look. After the `# Title`, a page has these `##` sections in this order. Omit an optional one where it doesn't apply. The build fails on another heading, a wrong order or a missing required section. A component page with a `## When to use` section is on this template; one without is on the [section template](#pages-on-the-section-template).

| Section           | Required | Holds                                                                                                                      |
| ----------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| Overview          | yes      | What the summary above it doesn't say, its family as figures, and `###` subsections on what it does on its own.            |
| Variants          |          | Variants, tones, layouts and sizes: a variants figure, its option table, which the Site shows as a legend, and examples.   |
| When to use       | yes      | Do and don't pairs, the few rules they don't show in titled blocks, and a `### Labels` or `### Content` block on its text. |
| Anatomy           |          | An anatomy figure with its legend, and one sentence naming parts the figure can't show.                                    |
| Adapting to width |          | A sentence and an example at several widths.                                                                               |
| Accessibility     | yes      | A `### Keyboard` table (Key, Action) where it handles keys, and `### envUI provides` and `### You provide` lists.          |
| In code           |          | The developer-only part: how to use it in code, in `### Usage`, `### Composition` and `### Customize`.                     |
| Changelog         |          | Releases that changed the component, newest first, such as `- **0.6.0**: The quiet variant.`                               |

The build adds **Props** and **Related**, from `avoidWhen`, before Changelog; don't write them, and don't list props anywhere, as [Props](#props) describes. On the website the page's sections up to Accessibility are its page on the Site, and its page in the Docs, which the Site's page links to as API, is its guide to using it in code: In code, what envUI and the application provide, then its props, part names and color properties as reference, and its changelog. The Site leaves out In code, Accessibility's `### envUI provides` and `### You provide`, and the whole of Accessibility where nothing else is in it. Don't use blockquotes: the build rejects them. Write a point as a sentence, or a judgment as a do and don't pair.

### Plain language on the Site

The Site is for people looking at envUI, not for developers: it shows and introduces, and the Docs teach how to build with it. Outside the Code disclosures under its figures, a page's Site shows no code:

- **No inline code.** Name no props, values, part classes, tokens or container names, such as `variant="ghost"` or `--env-card-container`. Say in plain words what matters: "the ghost variant", "one card can take colors of its own", "a sheet from the bottom". Component names, such as SearchField, are names, not code. The developer detail goes in [In code](#in-code-the-developer-only-part). `npm test` fails on a code span in the Site's text of a converted page, `plainPages` in `tests/DocumentationPages.test.mjs`: its sections, captions, anatomy legend names, `useWhen` and `avoidWhen`; it reports the count left on the other pages.
- **Options in words.** A table of variants, tones, sides or sizes names each option as people see it, such as Outline, Floating and Ghost, or From the bottom, never its value.
- **Lists sparingly.** A list is for a few short items, usually not full sentences, such as `useWhen`. Write rules as a sentence or two, or as a do and don't pair, rather than as a list of sentences.

### Text in titled blocks

Every piece of text on the Site belongs to a titled block: a heading and one short paragraph, beside or above its figure where it has one, as Colors of its own, Pending work and Confirm in place are written on [Button](components/button.md). A section's own heading titles the paragraph that opens it; any other text is a `###` subsection of its own.

- **No loose sentences.** A paragraph after a figure, a do and don't pair, a legend or a list, with no heading between them, is loose, and so is one between two figures: give it a heading, or fold it into the block it belongs to. The one exception is the sentence right after an anatomy legend that names the parts the figure can't show.
- **One paragraph per block.** Two short paragraphs under one heading, such as two one-line rules under Labels, are one paragraph, or two blocks with headings of their own.
- **envUI's type scale.** A block's heading is a title, its paragraph body text, and a figure's caption the small muted text under it, as the [typography](foundations/typography.md) foundation sets them. The catalogue styles them; don't fake a heading with bold text or HTML.

`npm test` finds loose text in the Site's sections, with `siteStructure` in `scripts/SiteContent.mjs`: it fails on a page in `plainPages` and reports the count on the others.

### Write little

The docs are mainly visual. Let the figures, the do and don't pairs and the anatomy teach, and write a sentence or two around them:

- **Show, then say little.** Cut every sentence a figure already shows, such as what a variant looks like, its colors or its corners. A sentence beside a figure says what the figure can't, such as the rule it illustrates; the prop that makes it belongs in In code.
- **Say each thing once.** Each kind of information has one place on a page, in the table below; don't repeat it in a caption, a legend, a list and another section. The banner shows the summary right above Overview, so Overview starts with what the summary doesn't say, such as how the component works or the prop that matters, or with its first figure; `npm test` fails on an Overview whose first sentence says the summary again. Nor does a sentence repeat a `useWhen` or `avoidWhen` entry, which When to use and Related show.
- **Short over complete.** Leave out what the generated props reference holds, such as each prop's values and defaults, and what the code does for itself, such as an exact delay or padding, unless a reader chooses it.
- **No links into the Docs.** The Site reaches the Docs only through a page's API button and the Docs link at the top of every page. Link other component, pattern and foundation pages, a foundation without a heading, since its headings are in its guide in the Docs, and say a point of a Docs page, such as setup or Customize colors, without the link. `npm test` checks it; the changelog and the lists of what envUI and the application provide, which the Docs show, may link anywhere.

| Information                                   | Its one place                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| What it is                                    | The frontmatter's `summary`, which the banner shows above Overview.                                     |
| What it looks like                            | Figures, with no sentence describing them.                                                              |
| When to use it                                | The frontmatter's `useWhen`, which When to use shows first.                                             |
| What to use instead                           | The frontmatter's `avoidWhen`, which Related shows at the end of the page.                              |
| A judgment, such as one primary button        | A do and don't pair whose captions are the rule. A pair never pictures a `useWhen` or `avoidWhen` item. |
| Rules no picture shows                        | A titled block after the pairs: a `###` heading and a sentence or two.                                  |
| Variants, tones and sizes                     | One option table of the options in words and what each is for, which the Site shows as a legend.        |
| What it does on its own, such as pending      | A `###` subsection of Overview, a sentence beside its figure.                                           |
| Its parts                                     | The anatomy legend, which the Site shows as names only; the class names are for In code.                |
| That it takes colors of its own               | A `### Colors` subsection of Anatomy, in words; the properties go in In code's Customize.               |
| How it adapts to width                        | A sentence and an example at several widths.                                                            |
| Keys, roles and what the application must add | Accessibility: keys in its Keyboard table, roles and what the application adds in its two lists.        |
| How to use it in code                         | In code: props and values, short code, how its parts compose, its color properties and tokens.          |
| Props                                         | Generated on the component's page in the Docs; never in prose.                                          |
| Releases                                      | Changelog.                                                                                              |

Choose the form that teaches each point best rather than a column of paragraphs: a live example for how it looks and behaves, a do and don't pair for a judgment, an anatomy figure for parts, an example at several widths for how it adapts, a table for values, a short list for rules. The catalogue lays out some patterns for you:

- **Figures in a row**: figures that follow each other with only blank lines between them sit side by side, such as a do and a don't, or the members of a family. Put a titled block between figures that should not share a row.
- **A subsection beside its figure**: a `###` subsection of text, with no table or list at its start, followed by exactly one figure, sits beside that figure on a wide page, such as each kind of card under Variants.
- **When to use** starts with the frontmatter's `useWhen`, a short plain list under Use it when, and on a pattern page with what it is built from. Write what follows it, not the same points again. An item that ends with a component's name in parentheses, such as "(IconButton)", shows the name after a muted dot, linked to its page where that is another page. The catalogue shows the lists of component, pattern and foundation pages as check lists.
- **Related** ends the page, from the frontmatter's `avoidWhen`: a tile for each component or page an entry names, its lead example small and inert on its canvas, with its name and the entry's text below. The tiles render once the section nears the viewport. A page with an open anatomy figure, such as Dialog or Menu, is shown by that figure instead; a page without an example shows a page icon on the same stage. Four tiles go four across where they fit, else two by two, else one column; three, five, six and nine go in rows of three.

### Layout: equal cells, spacing with rhythm

- **Cells that share a row are one size.** Figures side by side take equal widths, and their stages are as tall as the tallest, with their captions and Code toggles lined up across the row. Never put cells of different sizes side by side: an example at several widths shows one frame to a row, each centred on its own stage. A row of figures stays one column until all of them fit side by side, so no row is left with an orphan: an even run, do and don't pairs included, two to a row from 38 rem, and a run of three, do and don't figures included, three across from 58 rem; write two or three figures in a row, or four as two pairs, and never five.
- **Three larger sections.** The catalogue groups a page's sections into three larger ones, each holding its sections in their order: Overview with Variants; When to use with Anatomy; and Adapting to width with Accessibility. Related follows them. A page groups the sections it has; a group with none of them is left out.
- **Related things sit close, unrelated things apart.** A heading sits close to its first content, text close to the figure it introduces, and a figure's stage, caption and Code toggle close together. One sub-topic, such as a `###` subsection or the next figure after a caption, sits clearly apart from the last, also where the last is only text, a list or a table; one section further from the next in its group, and one group far further still, so a page reads as parts rather than one stream. The catalogue spaces them with the spacing tokens: 1 rem for what belongs together, 2.5 rem between sub-topics, 4 rem, the largest step, between the sections of a group, and 8 rem, twice that, between groups. Section headings are larger than a subsection's.
- **No separators.** Space, not lines, separates sections and sub-topics.
- **One band, for the middle group.** When to use and Anatomy, the group that turns from what the subject is to how to use it, sit on a band: the theme's muted fill across the whole content pane, gutters included, which stands apart from the page and the navigation, and in the light high-contrast theme is deepened to show on white, as far as code on it keeps its 7:1 contrast, since the muted fill there is nearly white. It is the one band of a component or pattern page; a page with neither When to use nor Anatomy has none, and a foundation page has none. Don't add bands elsewhere: one that marks every section marks nothing. The contrast gate measures text, links and inline code on the band's fill. Examples on the band sit on the page's canvas in the dark themes, deeper than the band, and on a canvas of the page's own color in the light ones, lighter than the band: there a canvas deeper than the band would take envUI's light colors below their contrast.
- **One frame per figure.** A figure's stage is its only frame: never put it inside another framed or filled box, such as a Surface or Card around a specimen grid, or a stage inside a stage. A do or don't figure's stage and its bar are one figure: two blocks joined as envUI's connected rows (`env-connected-rows`), with the outer corners rounded large and the inner ones small, and the small gap of a list's rows between them. A tile of Related is its stage, with its name and line below it in no box. The band is the page's background where it lies, not a frame. A catalogue browser test fails on a stage with a bordered, filled or shadowed ancestor in the article.

### Learn from Material's docs

Material Design 3's component pages, such as [buttons](https://m3.material.io/components/buttons/guidelines) and [cards](https://m3.material.io/components/cards/guidelines), are the reference for explaining visually. Borrow their approach, not their layout, which the fixed sections replace, and copy none of their text or images:

- A figure for each point, with one sentence under it that states the point rather than describing the picture.
- Do and don't figures on the same situation, each with a one-sentence caption, and a third figure where two dos make the point, such as a button that fits its label and one that stretches.
- An anatomy figure with a numbered legend of part names only; guidance on a part goes in its own figure or pair.
- Short paragraphs beside figures, and accessibility as what people do with assistive technology, a keyboard table and how to label.

## Figures

A figure is an [example file](#examples) placed with an empty fence whose info string names its kind and file. Every figure sits on the same stage, centred horizontally and vertically, in the theme, contrast and scale the reader has chosen: a recessed canvas, a well a shade deeper than the page, with a surface's corners and no edge, so the example's own surfaces rise out of it and a reader can always tell an example from the page around it. Under forced colors, where every fill is the system's, the canvas takes a frame instead. A specimen on a page on the figure template sits on it too. Only a figure that explains the system rather than showing envUI at work, such as a foundation page's scale of tokens or its palette, sits on the page itself, in line with the text. The canvas is the catalogue's (`apps/catalogue/src/styles/Stage.css`), not envUI's.

Under every figure the catalogue shows a closed Code toggle with the file's source and a copy button, so every figure can be copied as it is. Open code always spans the whole content column: a figure that shares its row, or sits beside text, opens its code below the row, across the column, so code never scrolls sideways in a narrow cell. Where the column is narrower than a 100-character line, the code soft-wraps instead of scrolling; keep example lines within the formatter's 100 characters. Attributes follow the name as `name="value"`; a value without spaces needs no quotes. Write a caption as one sentence. A value can't contain a double quote, not even as `\"`, so quote with ' or “ ”.

| Fence                            | Shows                                                                     | Attributes                                                    |
| -------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| ` ```tsx example=Name `          | The example, live on the stage.                                           | `caption`: a sentence below it. `widths`: see below.          |
| ` ```tsx do=Name caption="…" `   | The example on the stage joined to a green Do bar, and the caption below. | `caption`, required: what to do, as one sentence.             |
| ` ```tsx dont=Name caption="…" ` | The same with a red Don't bar.                                            | `caption`, required: what not to do and why, as one sentence. |
| ` ```tsx anatomy=Name `          | The example on the stage, with numbered callouts on its parts.            | `of`, `enlarge`: see below. `caption`: a sentence below it.   |
| ` ```tsx variants=Name `         | The example on the stage, with a callout naming each variant it shows.    | `caption`: a sentence below it. See below.                    |

Each kind also takes the flag `open`, written alone, such as ` ```tsx do=OneMenu open caption="…" `: see [open overlays](#open-overlays).

### Stage fill

The canvas is deeper than the page in every theme, so an open popup on it stands out as it does in an application, by its own fill and edge. `stage=shaded` is for a figure that shows a whole window, such as a Scaffold with its navigation, top bar and body, whose edges must show on the canvas: in the light themes, whose navigation is darker than the page, it recesses the canvas from the navigation's fill instead of the page's, or from the band's on the band. In the dark themes the canvas is already deeper than both, so it changes nothing there. A Scaffold on the stage paints the page's background in its body. Don't draw a frame or an edge around the subject instead. Check the figure in light and dark.

### Open overlays

A popup, a menu, a tooltip, a dialog, a sheet or a toast renders in a portal, outside the figure, so a figure of it shows only its trigger. With `open` on its fence, a figure shows it open, as a picture: the catalogue renders the example's overlays into its stage through envUI's `PortalContainer`, `contained`, so they neither lock the page's scroll, take focus nor close when the reader presses elsewhere, and the figure is inert.

- The example opens them itself, as an application would: `defaultOpen` on a Menu.Root, Dialog, Select, Tooltip or Popover, an `open` state that starts true for a CommandPalette, and a toast shown from an effect with `duration: Infinity`, dismissed in its cleanup. Say so in a comment, such as "Shown open after a send with a mistyped address."
- A popup opens beside its trigger, and the figure centres the two together on the stage, growing to hold them; a dialog, a sheet or a palette is placed on the stage, over its scrim, which fills the stage; a toast sits at the stage's edge, clear of the trigger.
- In an anatomy figure, the callouts number the open parts like any other, and keep clear of what opens a popup, such as a select's field; the scrim is left out, so name it in the sentence below. Leave out the trigger where the anatomy is of the overlay, such as a dialog without `trigger`.
- Use it for figures whose point is in the open overlay: a menu's items, a dialog's buttons, a tooltip's words, a toast's message. A figure whose point is the trigger stays closed.

### Examples at several widths

`widths="16 30"` shows the example in a frame of each width in rem, one to a row, each centred on its own stage with its width outlined and labelled, where it responds to that width: its container queries see the frame. Choose widths on either side of where the component changes, such as `widths="24 40"` around a card's 38 rem. Where a frame is wider than the page, its stage scrolls.

### Do and don't pairs

Put a `do` fence and a `dont` fence after each other, so they sit side by side; write two pairs one after the other, and they line up two to a row. Make both examples show the same situation, so the only difference is the point: the same dialog's actions with one primary button and with three. A caption is the rule in a few plain words, such as "One primary button per group, at the end of its actions."; don't repeat it below. Each is a whole example file an application could copy, the don't included. Avoid a don't that the accessibility scan would flag, such as a button inside a link; say that in a rule instead. Rules that don't need a picture go below the pairs in [titled blocks](#text-in-titled-blocks), each a `###` heading and a sentence or two.

### Anatomy figures

An ordered list right after an anatomy fence is its legend. Each item starts with the part's name in bold, which is all the Site shows of it, and names the part by class name in a code span, which the package and agents keep; the catalogue puts that item's number on the part, measured from the live component; the callouts follow the figure as it resizes and as the theme changes. The legend holds names only: what a part looks like is in the figure, and what it does belongs in the section that covers it.

````md
```tsx anatomy=CardAnatomy

```

1. **Surface** (`env-card`)
2. **Title** (`env-card-heading`, `title`)
3. `env-card-footer`
````

- The first code span that starts with `env-` is the part; a second code span may name the prop that fills it. Start each item with the part's name in bold, which the build checks, and write nothing after the parentheses.
- A part reference is a class name such as `env-card-heading`, or a selector of class names written without their dot, such as `env-button > env-icon:first-child` for a button's start icon. `::text` at the end points at the element's own text rather than its box, such as `env-button::text` for a label that has no element of its own.
- A fence without a list numbers every part `parts.json` lists for the page's component, or for the one `of="Name"` names, each shown by its description there.
- `docs/generated/parts.json` is generated from the library: under `components`, each component by its export name, with its `root` class, its `parts` (`class` and `description`) and its `states` (`attribute`, `values` and the `parts` that carry it); under `shared`, the groups of parts several components share, such as `ConnectedRows`. Read a component's entry there before writing its legend.
- The build fails on a legend class that neither packages/ui's CSS nor `parts.json` has, and on a fence without a legend whose component has no parts there. A part the example doesn't render leaves its number off the figure, which the catalogue's browser test that counts every anatomy figure's callouts catches.
- The catalogue shows a small subject, such as a badge or a checkbox, half as large again where its stage has room, so its callouts don't crowd. The flag `enlarge` on an anatomy fence does the same for a larger subject whose parts sit close together, such as a bar's item or a table's header cells.
- Make the anatomy example small and complete, with every part the legend names present once: the root first, then the parts in reading order. Name parts the figure can't show in one plain sentence below it, such as "Not shown: the spinner.", and their classes in In code.

### Variants figures

A figure that shows named variants, tones or sizes side by side names each with a callout, as an anatomy figure numbers its parts, rather than with labels or captions inside the example. An ordered list right after a `variants` fence names them, each item the variant's name in bold, in the order the example shows them:

````md
```tsx variants=Variants

```

1. **Outline**
2. **Floating**
````

Each name labels the example's next item: a child of its root, such as a field in a Column, or of the one element the root holds. An item may name what it labels with a part reference instead, such as ``**Ghost** (`env-text-field[data-variant='ghost']`)``. Items one under another take their names on the start side, items side by side above them; write a long run, such as six tones, one under another, so it never wraps. The names are the figure's alone: the option table below names each option in the same words and says what it is for, and In code gives its value.

### Option tables

Variants, tones, sizes, sides and layouts are written as an option table: a Markdown table whose first column names each option in words, as people see it, and whose last column, headed **Use for**, says what it is for. A column between them adds a detail, such as the tones each variant takes. The table is the source, which the packaged page and agents read as it is; the Site shows it as a legend, laid out as an anatomy figure's legend is, each option's name in the same tag a variants figure's callouts use, followed by what it is for, with its details below in small muted text. Right after a variants figure's legend, it is that figure's legend, under its stage.

````md
```tsx variants=Variants

```

1. **Outline**
2. **Floating**

| Variant  | Use for                                             |
| -------- | --------------------------------------------------- |
| Outline  | In forms, dialogs, panes and toolbars. The default. |
| Floating | A long form on a page.                              |
````

- **Names are tags.** Each option's name is a few words of plain text, such as Outline or From the bottom, named once, with no link, image or HTML, and each option says what it is for; the build checks both. After a variants figure, the names are the figure's, in its order, which `npm test` checks on the pages in `plainPages`.
- **One kind per table.** Sides and widths are two tables, each in its own titled block, as on [Sheet](components/sheet.md); a sentence about them is the block's paragraph, before the table, never loose after it.
- **Other tables stay tables.** Only a table whose last column is Use for is a legend; a keyboard table or a comparison, such as a pattern's table of needs, stays a table.

## In code: the developer-only part

Nothing a developer or an agent needs is lost to plain language: it goes in the page's last authored section, `## In code`, after Accessibility and before Changelog. The Site leaves it out; the page's guide in the Docs shows it first, and the packaged page, `llms-full.txt` and the agents' tools keep it in place. Write it in the same file as the rest, as the code that goes with what the Site says:

````md
## In code

### Usage

`variant` is `outline`, the default, `floating` or `ghost`.

```tsx source=Variants

```

#### Errors

`error` marks the field invalid and sets `aria-invalid`.

### Composition

TextField is built from Field's parts: …

### Customize

`--env-text-field-container` gives one field a fill, through `style` or CSS.
````

- **Its `###` subsections, in this order:** `### Usage`, required, with short code examples of its common uses and options and the props and values that make them; `### Composition`, how its parts and the components around it fit together, with the part classes; and `### Customize`, its color properties, tokens, and the part classes and state attributes CSS may target. Use `####` headings inside them, which the Docs show a level up. The build fails on another `###`, a wrong order, a missing Usage, or text before the first subsection.
- **`### Import` is generated** from the exports the page documents, or a pattern's `composes`, and opens the section; don't write it. A page without In code gets it too, in the Docs and the package.
- **Code.** Write a snippet of a few lines in an ordinary `tsx` fence, or show an example file of the page as code with an empty `tsx source=Name` fence, which the build fills in, rather than copying it. In code holds no figures or specimens, and a `source` fence anywhere else fails the build.
- **What moves here** is everything the Site no longer says: props and values, such as `side="bottom"` or `modal={false}`; class names, such as those of the parts an anatomy figure can't show; color properties and tokens; and the exact behaviour of a prop, such as a default width in rem. Accessibility's `### envUI provides` and `### You provide` stay where they are, also for developers only.

A component's page in the Docs shows, in order: Import, Usage, Composition and Customize from In code; Accessibility, what the application and envUI provide; then Props, Part names and Color properties as reference, generated from the source; and Changelog.

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

Write the keyboard table from the code and its browser tests, not from the pattern in general: list the keys the component handles, and Tab for how focus enters and leaves. "envUI provides" names the roles, names, announcements and focus handling the component does itself; "You provide" names what the application must add, such as a label or an accessible name. Both are for people who build with envUI: the component's page in the Docs shows them, and the Site leaves them out.

## Examples

An example is a file in `apps/catalogue/src/examples/<page>/<Name>.tsx`: a small component, default-exported, that an application could copy as it is.

- Import only what an application can: `react`, `@envsemble/envui`, its `/content`, `/diff`, `/rich-text` and `/color` entries, and icons from `@envsemble/envui/icons/<Name>`.
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
2. Move each section's content into the section of the figure template that holds it: Variants and sizes into Variants; States and behaviour into `###` subsections of Overview, or into Variants where a state belongs to one variant; Content guidelines into a `### Labels` or `### Content` subsection of When to use; Do and don't into pairs under When to use, with the rules no picture needs in titled blocks; Examples into the sections they illustrate, as figures with a caption or under a `###` subsection. Keep what a reader needs, check it against the code, and drop what a figure, the props reference or another section already says.
3. Keep every heading another page links to, such as `#confirm-in-place`, as a `###` subsection: the build fails on a link to a heading that is gone.
4. Write the new example files: the do and don't pairs, the anatomy example and, where the component adapts, an example for `widths`. Keep specimens where they show what code can't, such as forced hover and pressed states.
5. Cut the page down: each thing once, in its place in [the table](#write-little), no sentence a figure already shows, and every sentence in a [titled block](#text-in-titled-blocks). Run `npm run check`, and look at the page in the catalogue at a narrow and a wide width, in light and dark: cells that share a row of one size, the callouts on their parts, one for each legend item, figures centred on their stages, open code across the column and nothing overflowing. Check the outline too, in the browser's accessibility tree or with a headings list: one `h2` per section and nothing else at that level, so no specimen or example adds an `h2` of its own. Update browser tests that visited the page's old views; on the figure template, every heading is on its page.

### From the earliest pages

Pages written before the template have `## React usage` and `### Props & contracts` sections and a preview in `apps/catalogue/src/previews`. To convert one:

1. Read the component's source and its browser tests in `tests/browser`.
2. Move what the props table says into TSDoc on the props, then run `npm run docs:props`.
3. Write the sections of the figure template. Keep the guidance a reader needs, and check each claim against the code.
4. Turn the preview's specimens into example files, or into specimens where they only serve review. Remove its preview function from `apps/catalogue/src/previews`.
5. Take the page out of `unconverted` in `tests/DocumentationPages.test.mjs`.
6. Update browser tests that visited the old preview, then run `npm run typecheck`, `npm test`, the Chromium tests, and `npm run test:a11y:update` and `npm run test:visual:update`; review the changed images and accessibility entries.

The [library guide](library-development.md) describes the checks and the changeset a change needs.
