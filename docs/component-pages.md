# Write a component page

Every component has one page in `docs/components/`, named after the component in kebab case and the singular: `text-field.md` for TextField, `button.md` for Button and its family. Pattern and foundation pages are written the same way, with their own frontmatter: [write a pattern page](pattern-pages.md), and [foundation pages](#foundation-pages) below.

A page's Markdown is the one source for three readers:

- **The Usage guide** shows its plain sections with figures, for people looking at envUI.
- **The Docs** show the developer part the Usage guide leaves out, so the two complement each other and neither repeats the other.
- **Agents** read the whole file as the package ships it, in the same order, with each example's code once.

[Button](components/button.md), [Form layout and validation](patterns/forms.md) and [Spacing & density](foundations/spacing.md) are the model pages; read them, in the Markdown and on the website, before writing another. The build fails on a component, pattern or foundation page that isn't in this structure, the one-file structure.

## Write rules, not essays

Every page is read by people scanning it and by agents following it, so its text is written as rules:

- **A block is a lead and its rules.** A `###` heading, one short lead that says its point, then its rules as bullets, one fact each. The Usage guide sets the bullets as quiet dots below the lead.
- **One more point is a sentence.** A block with one more point keeps it as a second sentence of the lead; never a bullet alone.
- **Short over complete, never at a fact's cost.** Shorten by form, not content: a long paragraph becomes a lead and bullets with every fact kept. "Error: invalid input" becomes a bullet of its own, not a lost example.
- **Short paragraphs.** One point each, at most 240 characters, about three lines; `npm test` fails a longer one in the Usage guide's text.
- **Plain words where people read, code where developers do.** The plain sections name no props, values or tokens; Compose holds them, so nothing a developer or an agent needs is lost.

The [writing guide](writing.md) holds the rules for the words of an interface; the [typography](foundations/typography.md) foundation, the leads, quieter supporting text, short paragraphs and measure the Usage guide sets them in.

## The structure

After the YAML frontmatter and the `# Title`, a page has these `##` sections in this order, the Usage guide's, so an agent reads the file as people see the page. Omit an optional one where it doesn't apply.

| Section                            | Required                       | Holds                                                                                                                                         |
| ---------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview                           | generated                      | The frontmatter's overview examples, side by side; don't write it.                                                                            |
| Variants (Options on a foundation) |                                | The variants figure and its option table, then the options in titled blocks, each beside its figure.                                          |
| Anatomy                            |                                | The anatomy figure and its legend, and one sentence naming the parts the figure can't show.                                                   |
| Behaviour                          |                                | States and what it does on its own, such as pending work or dismissing, in titled blocks, ending with `### Adapting to width`.                |
| Rules                              | yes                            | A short lead, the do and don't figures, and titled blocks of rules, such as `### Labels`.                                                     |
| Accessibility                      | on a component or pattern page | `### Keyboard`, a Key and Action table, or the focus and keys in a block of their own; then `### envUI provides` and `### You provide` lists. |
| Words to use                       |                                | The phrases people ask for, as an option table; a column headed In code gives the props each phrase means.                                    |
| Compose                            |                                | The developer part: [Compose](#compose-the-developer-part).                                                                                   |
| Changelog                          |                                | Releases that changed the component, newest first, such as `- **0.6.0**: The quiet variant.`                                                  |

The build adds **Props**, generated from the TypeScript declarations, after Compose, and **Related**, from `avoidWhen`; don't write them, and don't list props anywhere, as [Props](#props) describes. It fails on:

- a section the structure doesn't know, a section twice or out of this order, or no Rules;
- a page of these kinds without `examples` in its frontmatter;
- an example placed twice, placed but not listed, or listed and placed nowhere, but the overview's;
- a component or pattern page without an overview example, or without Accessibility's two lists;
- content before the first `##`, a blockquote, a heading written as HTML, or a props table by hand.

## Frontmatter

A page opens with YAML frontmatter. The build validates it and fails on an unknown field, a missing one or a wrong value.

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
examples: # Each example file once, by its name, with its role and, where it has one, its caption.
  SignUp: overview # A role alone.
  LabelOutside:
    role: do # Or a role and a caption.
    caption: A label above the field, always in view.
---
```

- **`examples`** lists each example once. Its role is `overview`, shown side by side at the top of the page as its Overview and never placed in the body; `example`; `variants` and `anatomy`, with the legend that follows them; or `do` and `dont`, whose caption is their rule and so required.
- **An overview's framing.** Nothing places an overview, so its entry says how it is framed, validated as a fence's attributes: `open: true` shows its overlays open, as on [HoverCard](components/hover-card.md), and `stage: shaded` the deeper stage of a whole window, as on [Scaffold](components/scaffold.md). Other roles take them on their fence. The package leaves them out.
- **`statuses`** gives an export listed in `components` a status other than the page's, such as a beta editor on a page whose renderer is stable; the Usage guide shows it beside the page's.
- **`avoidWhen`** is the page's one list of related components and pages, its **Related** section: each entry names an export in `use` or an indexed page in `see`, never both, with a line saying when to pick it instead. The catalogue links it to the page that documents it, and agents read it as "need this, use that". Name each export or page once, and not both an export and its page; the build fails on a relation named twice. An entry may name a member of the page's own family, such as Textarea on the TextField page. Relate only what a reader might pick instead: a page that is only used alongside, such as Accessibility or Icons, is linked from the sentence that needs it, if anywhere.
- **`components`** lists a family's members, such as IconButton on the button page, and the page documents them in its sections. A namespace, such as `Menu`, covers all its parts; list the namespace, never a part such as `Menu.Item`.
- **Guides**, the pages at the top of `docs/`, may list the exports they document with only `components`, `aliases`, `exportAliases` and `statuses`. `exportAliases` maps an export listed in `components` to the words people search for it by, such as `ThemeToggle: [theme switcher]` on the setup page, for exports without a component page of their own. The exports a guide documents are `stable`; `statuses` gives one another status, such as `useContainerSize: beta`.

Register the page in [the index](index.md) under its group, with only its title and path: `- [TextField](components/text-field.md)`. The index orders the pages; the summary comes from the frontmatter.

## How the website and the package show it

### The Usage guide

The Usage guide shows the sections up to Words to use in three groups, far apart:

1. What it is: Overview, Variants, Anatomy and Behaviour.
2. Its Rules, alone on the page's one band. They open with Use it when, the frontmatter's `useWhen`, in two columns where the list has more than three items and there is room, and, on a pattern, Built from.
3. Accessibility and Words to use, then Related.

It leaves out Compose, the changelog, Accessibility's `### envUI provides` and `### You provide`, Accessibility where nothing else is in it, and every table column headed In code. A foundation's page sits on the page, without the band.

### The Docs

A page in the Docs shows the developer part alone:

- the banner, with breadcrumbs, title, summary, status and the Usage guide button;
- Compose: the generated Import, Usage, Composition and Customize, with their code; an example a section names shows as its code, never as the Usage guide's figure;
- what envUI and the application provide, under Accessibility;
- the In code column of Words to use beside the words, as Words in code;
- the generated Props, Part names and Color properties, and the changelog, collapsed.

None of the Usage guide's sections or figures, no Related and no band; the contents beside the page list these headings alone, each once. [Field](components/field.md), which has no page in the Usage guide, shows its whole page in the Docs.

### The package

Agents read the file as the package ships it, with each example's code once:

- the frontmatter as written, each example's entry on one line under a comment that says where its file is;
- a run of figures as one line that names them, such as `Examples: OnePrimaryAction (do), SeveralPrimaryActions (don't).`;
- an anatomy figure as its legend, a variants figure as its option table and a foundation's figure as its legend;
- Compose with its code, and the props after it, each prop said once in a family.

The changelog stays on the Docs and in the package's CHANGELOG.md, and Related in the frontmatter's `avoidWhen`.

## Plain language in the Usage guide

The Usage guide is for people looking at envUI, often not developers: they look at what envUI offers, then ask an AI agent to build with it. It shows and introduces, and gives them the words to ask for what they want; the Docs teach how to build with it. Outside the Code disclosures under its figures, a page's Usage guide shows no code and no values:

- **No inline code.** Name no props, values, part classes, tokens or container names, such as `variant="ghost"` or `--env-card-container`. Say in plain words what matters: "the ghost variant", "one card can take colors of its own", "a sheet from the bottom". Component names, such as SearchField, are names, not code. `npm test` fails on a code span in the Usage guide's text of any page but Field's: its sections, captions, anatomy legend names, `useWhen` and `avoidWhen`.
- **No technical values.** No token names, hex colors, lengths in rem, px or em, durations, percentages, contrast ratios or other code-like text, in its text, captions, specimen titles and labels, swatches and legends alike. Say what the value does instead, such as "the most space, between sections", and put the value in Compose. A catalogue browser test fails on any on a foundation page and the component pages it holds to the rule, and counts them on the rest; `npm test` fails on any on a component page and counts them in the Usage guide's Markdown, both with `technicalText` in `scripts/SiteContent.mjs`.
- **Options in words.** A table of variants, tones, sides or sizes names each option as people see it, such as Outline, Floating and Ghost, or From the bottom, never its value.
- **No links into the Docs.** The Usage guide reaches the Docs only through a page's Docs button and the Docs link at the top of every page. Link other component, pattern and foundation pages, a foundation without a heading, and say a point of a Docs page, such as setup or Customize colors, without the link. `npm test` checks it; Compose, the changelog and the lists of what envUI and the application provide, which the Docs show, may link anywhere.

## Text in titled blocks

Every piece of text in the Usage guide belongs to a titled block: a heading and a short lead, with its rules and its figure where it has one, as Pending work and Confirm in place are written on [Button](components/button.md). A section's own heading titles the lead that opens it; any other text is a `###` block of its own.

- **No loose sentences.** A paragraph after a figure, a do and don't pair, a legend or a list, with no heading between them, is loose, and so is one between two figures: give it a heading, or fold it into the block it belongs to. The one exception is the sentence right after an anatomy legend that names the parts the figure can't show.
- **At most three short paragraphs to a block.** More are two blocks with headings of their own.
- **envUI's type scale.** A section's lead is set a step larger, a block's heading is a title, its rules and supporting text are quieter, and a figure's caption is the small muted text under it, as the [typography](foundations/typography.md) foundation sets them. The catalogue styles them; don't fake a heading with bold text or HTML.

`npm test` fails on loose text and long paragraphs in the Usage guide's sections of any page but Field's, with `siteStructure` and `longParagraphs` in `scripts/SiteContent.mjs`.

## Write little

The docs are mainly visual. Let the figures, the do and don't pairs and the anatomy teach, and write a lead and a few rules around them:

- **Show, then say little.** Cut every sentence a figure already shows, such as what a variant looks like, its colors or its corners. Text beside a figure says what the figure can't, such as the rule it illustrates; the prop that makes it belongs in Compose.
- **Say each thing once.** Each kind of information has one place on a page, in the table below; don't repeat it in a caption, a legend, a list and another section. Nor does a rule repeat a `useWhen` or `avoidWhen` entry, which Rules and Related show.
- **Leave out what is generated.** Each prop's values and defaults are in the props reference, and what the code does for itself, such as an exact delay or padding, needs no sentence unless a reader chooses it.

| Information                                   | Its one place                                                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| What it is                                    | The frontmatter's `summary`, which the banner shows above the Overview.                                        |
| What it looks like                            | The overview figures and the others, with no sentence describing them.                                         |
| When to use it                                | The frontmatter's `useWhen`, which Rules opens with as Use it when.                                            |
| What to use instead                           | The frontmatter's `avoidWhen`, which Related shows at the end of the page.                                     |
| Variants, tones and sizes                     | Variants: a variants figure and one option table of the options in words and what each is for.                 |
| Its parts                                     | Anatomy: the legend, which the Usage guide shows as names only; the class names are for Compose.               |
| What it does on its own, such as pending      | Behaviour: a titled block beside its figure.                                                                   |
| How it adapts to width                        | Behaviour's last block, `### Adapting to width`, with an example at several widths.                            |
| A judgment, such as one primary button        | Rules: a do and don't pair whose captions are the rule. A pair never pictures a `useWhen` or `avoidWhen` item. |
| Rules no picture shows                        | Rules: a titled block after the pairs.                                                                         |
| Keys, roles and what the application must add | Accessibility: keys in its Keyboard table, roles and what the application adds in its two lists.               |
| The words people ask for                      | Words to use: an option table, with the props each phrase means under In code.                                 |
| How to use it in code                         | Compose: props and values, short code, how its parts compose, its color properties and tokens.                 |
| Props                                         | Generated on the component's page in the Docs; never in prose.                                                 |
| Releases                                      | Changelog.                                                                                                     |

Choose the form that teaches each point best rather than a column of paragraphs: a live example for how it looks and behaves, a do and don't pair for a judgment, an anatomy figure for parts, an example at several widths for how it adapts, a table for values. The catalogue lays out some forms for you:

- **Figures in a row**: figures that follow each other with only blank lines between them sit side by side, such as a do and a don't, or the members of a family. Put a titled block between figures that should not share a row.
- **A block beside its figure**: a `###` block of text, with no table or list at its start, followed by exactly one figure, sits beside that figure on a wide page, such as each kind of card under Variants. A figure that needs the room stays across the column with the flag [`wide`](#wide-figures).
- **Check lists**: the Usage guide shows a page's lists of what it is for as check lists. An item that ends with a component's name in parentheses, such as "(IconButton)", shows the name after a muted dot, linked to its page where that is another page.
- **Related** ends the page, from the frontmatter's `avoidWhen`: a tile for each component or page an entry names, its lead example small and inert on its canvas, with its name and the entry's text below. The tiles render once the section nears the viewport. A page with an open anatomy figure, such as Dialog or Menu, is shown by that figure instead; a page without an example shows a page icon on the same stage. Four tiles go four across where they fit, else two by two, else one column; three, five, six and nine go in rows of three.

## Layout: equal cells, spacing with rhythm

- **Cells that share a row are one size.** Figures side by side take equal widths, and their stages are as tall as the tallest, with their captions and Code toggles lined up across the row. Never put cells of different sizes side by side: an example at several widths shows one frame to a row, each centred on its own stage. A row of figures stays one column until all of them fit side by side, so no row is left with an orphan: an even run, do and don't pairs included, two to a row from 38 rem, and a run of three three across from 58 rem; write two or three figures in a row, or four as two pairs, and never five.
- **Related things sit close, unrelated things apart.** A heading sits close to its first content, text close to the figure it introduces, and a figure's stage, caption and Code toggle close together. One block sits clearly apart from the last, one section further from the next in its group, and one group far further still, so a page reads as parts rather than one stream. The catalogue spaces them with the spacing tokens: 1 rem for what belongs together, 2.5 rem between blocks, 4 rem between the sections of a group, and 8 rem between groups. Section headings are larger than a block's.
- **No separators.** Space, not lines, separates sections and blocks.
- **One band, for Rules.** Rules, the group that turns from what the subject is to how to use it, sits on one subtle band: a fill a small step from the page, just beyond the navigation's, across the whole content pane, gutters included, so it reads as a region of the page rather than a surface. It is the one band of a component or pattern page: Related, the groups around it, a foundation page and every page of the Docs sit on the page. The contrast gate measures text, links and inline code on the band's fill. Examples on the band sit on the page's canvas in the dark themes, deeper than the band, and on a canvas of the page's own color in the light ones, lighter than the band.
- **One frame per figure.** A figure's stage is its only frame: never put it inside another framed or filled box, such as a Surface or Card around a specimen grid, or a stage inside a stage. A do or don't figure's stage and its bar are one figure: two blocks joined as envUI's connected rows (`env-connected-rows`), with the outer corners rounded large and the inner ones small. A tile of Related is its stage, with its name and line below it in no box. A catalogue browser test fails on a stage with a bordered, filled or shadowed ancestor in the article.

## Learn from Material's docs

Material Design 3's component pages, such as [buttons](https://m3.material.io/components/buttons/guidelines) and [cards](https://m3.material.io/components/cards/guidelines), are the reference for explaining visually. Borrow their approach, not their layout, which the fixed sections replace, and copy none of their text or images:

- A figure for each point, with one sentence under it that states the point rather than describing the picture.
- Do and don't figures on the same situation, each with a one-sentence caption, and a third figure where two dos make the point, such as a button that fits its label and one that stretches.
- An anatomy figure with a numbered legend of part names only; guidance on a part goes in its own figure or pair.
- Short text beside figures, and accessibility as what people do with assistive technology, a keyboard table and how to label.

## Figures

A figure is an [example file](#examples) listed in the frontmatter and placed with an empty fence that names it, ` ```tsx figure=Name `, anywhere in a section but Compose and the changelog. Its role and caption come from the frontmatter; its framing from the attributes after the name, written as `name="value"`, or `name=value` without spaces, and flags, such as `open`, as their name alone. A value can't hold a double quote, not even as `\"`, so quote with ' or “ ”.

| Role         | Shows                                                                               | Attributes on its fence           |
| ------------ | ----------------------------------------------------------------------------------- | --------------------------------- |
| `example`    | The example, live on the stage, with its caption below.                             | `widths`, `open`, `stage`, `wide` |
| `do`, `dont` | The example on the stage joined to a green Do or red Don't bar, and its rule below. | `open`, `stage`                   |
| `anatomy`    | The example on the stage, with numbered callouts on its parts and the legend below. | `of`, `open`, `stage`, `enlarge`  |
| `variants`   | The example on the stage, with a callout naming each variant, and the legend below. | `stage`                           |

Every figure sits on the same stage, centred horizontally and vertically, in the theme, contrast and scale the reader has chosen: a recessed canvas, a well a shade deeper than the page, with a surface's corners and no edge, so the example's own surfaces rise out of it and a reader can always tell an example from the page around it. Under forced colors the canvas takes a frame instead. A specimen sits on it too. The canvas is the catalogue's (`apps/catalogue/src/styles/Stage.css`), not envUI's.

- **Code under every figure.** The catalogue shows a closed Code toggle with the file's source and a copy button, so every figure can be copied as it is. Open code always spans the whole content column, and soft-wraps where the column is narrower than a 100-character line; keep example lines within the formatter's 100 characters.
- **A caption is one sentence**, in the frontmatter.
- **The finger mark.** Only a stage whose example can be used, such as a live button, shows a small finger icon at its bottom end, named "Interactive: try it". An anatomy or variants figure, a figure shown open, and a specimen whose parts are inert show none. The catalogue finds it from the stage's content; the page writes nothing for it.

### Stage fill

The canvas is deeper than the page in every theme, so an open popup on it stands out as it does in an application, by its own fill and edge.

- `stage=shaded` is for a figure that shows a whole window, such as a Scaffold with its navigation, top bar and body, whose edges must show on the canvas. In the light themes it recesses the canvas from the navigation's fill instead of the page's, or from the band's on the band; in the dark themes it changes nothing.
- A Scaffold on the stage paints the page's background in its body. Don't draw a frame or an edge around the subject instead, and check the figure in light and dark.

### Open overlays

A popup, a menu, a tooltip, a dialog, a sheet or a toast renders in a portal, outside the figure, so a figure of it shows only its trigger. With `open`, on its fence or, for an overview, as `open: true` in its entry, a figure shows it open, as a picture: the catalogue renders the example's overlays into its stage through envUI's `PortalContainer`, `contained`, so they neither lock the page's scroll, take focus nor close when the reader presses elsewhere, and the figure is inert.

- The example opens them itself, as an application would: `defaultOpen` on a Menu.Root, Dialog, Select, Tooltip, Popover, HoverCard or Sheet, an `open` state that starts true for a CommandPalette, and a toast shown from an effect with `duration: Infinity`, dismissed in its cleanup. Say so in a comment, such as "Shown open in the docs; without defaultOpen, it opens from its trigger."
- A popup opens beside its trigger, and the figure centres the two together on the stage, growing to hold them; a dialog, a sheet or a palette is placed on the stage, over its scrim, which fills the stage; a toast sits at the stage's edge, clear of the trigger.
- In an anatomy figure, the callouts number the open parts like any other, and keep clear of what opens a popup, such as a select's field; the scrim is left out, so name it in the sentence below. Leave out the trigger where the anatomy is of the overlay, such as a dialog without `trigger`.
- Use it for figures whose point is in the open overlay: a menu's items, a dialog's buttons, a tooltip's words, a toast's message. A figure whose point is the trigger stays closed.

### Examples at several widths

`widths="16 30"` shows the example in a frame of each width in rem, one to a row, each centred on its own stage with its width outlined and labelled, where it responds to that width: its container queries see the frame. Choose widths on either side of where the component changes, such as `widths="24 40"` around a card's 38 rem. Where a frame is wider than the page, its stage scrolls.

### Wide figures

The flag `wide` keeps an example alone in its row, across the whole column, rather than beside the block before it or in a run of figures. Give it to a figure that needs the room, such as a popover open beside its trigger, as Sides on [Popover](components/popover.md) is. A foundation's figure says so in its registration (`FoundationFigures.ts`).

### Do and don't pairs

List a `do` and a `dont` example and place them one after the other, so they sit side by side; place two pairs one after the other, and they line up two to a row.

- Make both examples show the same situation, so the only difference is the point: the same dialog's actions with one primary button and with three.
- A caption is the rule in a few plain words, such as "One primary button per group, at the end of its actions."; don't repeat it below.
- Each is a whole example file an application could copy, the don't included. Avoid a don't that the accessibility scan would flag, such as a button inside a link; say that in a rule instead.
- Rules that don't need a picture go below the pairs in [titled blocks](#text-in-titled-blocks).

### Anatomy figures

An ordered list right after an anatomy figure is its legend. Each item starts with the part's name in bold, which is all the Usage guide shows of it, and names the part by class name in a code span, which the Docs and agents keep; the catalogue puts that item's number on the part, measured from the live component, and the callouts follow the figure as it resizes and as the theme changes. The legend holds names only: what a part looks like is in the figure, and what it does belongs in the section that covers it.

````md
```tsx figure=CardAnatomy

```

1. **Surface** (`env-card`)
2. **Title** (`env-card-heading`, `title`)
3. **Footer** (`env-card-footer`)
````

- The first code span that starts with `env-` is the part; a second code span may name the prop that fills it. Start each item with the part's name in bold, which the build checks, and write nothing after the parentheses.
- A part reference is a class name such as `env-card-heading`, or a selector of class names written without their dot, such as `env-button > env-icon:first-child` for a button's start icon. `::text` at the end points at the element's own text rather than its box, such as `env-button::text` for a label that has no element of its own.
- A figure without a list numbers every part `parts.json` lists for the page's component, or for the one `of="Name"` names, each shown by its description there.
- `docs/generated/parts.json` is generated from the library: under `components`, each component by its export name, with its `root` class, its `parts` (`class` and `description`) and its `states` (`attribute`, `values` and the `parts` that carry it); under `shared`, the groups of parts several components share, such as `ConnectedRows`. Read a component's entry there before writing its legend.
- The build fails on a legend class that neither packages/ui's CSS nor `parts.json` has, and on a figure without a legend whose component has no parts there. A part the example doesn't render leaves its number off the figure, which the catalogue's browser test that counts every anatomy figure's callouts catches.
- The catalogue shows a small subject, such as a badge or a checkbox, half as large again where its stage has room, so its callouts don't crowd. The flag `enlarge` does the same for a larger subject whose parts sit close together, such as a bar's item or a table's header cells.
- Make the anatomy example small and complete, with every part the legend names present once: the root first, then the parts in reading order. Name parts the figure can't show in one plain sentence below it, such as "Not shown: the spinner.", and their classes in Compose.

### Variants figures

A figure that shows named variants, tones or sizes side by side names each with a callout, as an anatomy figure numbers its parts, rather than with labels or captions inside the example. An ordered list right after a variants figure names them, each item the variant's name in bold, in the order the example shows them:

````md
```tsx figure=Variants

```

1. **Outline**
2. **Floating**
````

Each name labels the example's next item: a child of its root, such as a field in a Column, or of the one element the root holds. An item may name what it labels with a part reference instead, such as ``**Ghost** (`env-text-field[data-variant='ghost']`)``. Items one under another take their names on the start side, items side by side above them; write a long run, such as six tones, one under another, so it never wraps. The names are the figure's alone: the option table below names each option in the same words and says what it is for, and Compose gives its value.

### Option tables

Variants, tones, sizes, sides and layouts are written as an option table: a Markdown table whose first column names each option in words, as people see it, and whose last column, headed **Use for**, says what it is for. A column between them adds a detail, such as the tones each variant takes, and a column headed **In code**, which only the Docs and agents read, the props an option means. The table is the source, which the packaged page and agents read as it is; the Usage guide shows it as a legend, each option's name in the same tag a variants figure's callouts use, followed by what it is for, with its details below in small muted text. Right after a variants figure's legend, it is that figure's legend, under its stage.

````md
```tsx figure=Variants

```

1. **Outline**
2. **Floating**

| Variant  | Use for                                             |
| -------- | --------------------------------------------------- |
| Outline  | In forms, dialogs, panes and toolbars. The default. |
| Floating | A long form on a page.                              |
````

- **Names are tags.** Each option's name is a few words of plain text, such as Outline or From the bottom, named once, with no link, image or HTML, and each option says what it is for; the build checks both. After a variants figure, the names are the figure's, in its order, which `npm test` checks on every page.
- **One kind per table.** Sides and widths are two tables, each in its own titled block, as on [Sheet](components/sheet.md); a sentence about them is the block's lead, before the table, never loose after it.
- **Other tables stay tables.** Only a table whose last column is Use for is a legend; a keyboard table or a comparison stays a table.

## Compose: the developer part

Nothing a developer or an agent needs is lost to plain language: it goes in `## Compose`, after Words to use and before Changelog. The Usage guide leaves it out; the page in the Docs shows it first, and the packaged page keeps it in place. Write it in the same file as the rest, as the code that goes with what the plain sections say:

````md
## Compose

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
- **`### Import` is generated** from the exports the page documents, or a pattern's `composes`, and opens the section; don't write it. A page without Compose gets one holding it.
- **Code.** Write a snippet of a few lines in an ordinary `tsx` fence, or show an example file of the page as code with an empty `tsx source=Name` fence, which the build fills in, rather than copying it; at most one full example a page, its canonical one. Compose holds no figures or specimens, and a `source` fence anywhere else fails the build.
- **What goes here** is everything the plain sections leave out: props and values, such as `side="bottom"` or `modal={false}`; class names, such as those of the parts an anatomy figure can't show; color properties and tokens, every one the component has, which `npm test` checks; and the exact behaviour of a prop, such as a default width in rem. Accessibility's `### envUI provides` and `### You provide` stay where they are, also for developers only.

Write the keyboard table from the code and its browser tests, not from the pattern in general: list the keys the component handles, and Tab for how focus enters and leaves. "envUI provides" names the roles, names, announcements and focus handling the component does itself; "You provide" names what the application must add, such as a label or an accessible name.

## Examples

An example is a file in `apps/catalogue/src/examples/<page>/<Name>.tsx`: a small component, default-exported, that an application could copy as it is.

- Import only what an application can: `react`, `@envsemble/envui`, its `/content`, `/diff`, `/rich-text` and `/color` entries, and icons from `@envsemble/envui/icons/<Name>`.
- No catalogue classes (`docs-*`) or helpers. Lay out with envUI's components; where envUI has no layout for it yet, a short inline style with a comment is fine.
- Use the neutral [sample data](#sample-data) below, and never the name of an application built on envUI.
- Keep state inside the example, and stand in for slow work with a timer.
- Keep it small: the stage centres the example at its own width. Give the root a width where it should be wider than its content, such as `inlineSize: '100%'` on a grid of cards. A root that is or holds a size container, such as a feature card or a page header, fills the stage, since centred it would have no width.
- Name the file after what it shows, such as `ConfirmInPlace.tsx`.
- Start an example's own headings at level 3, since the page's sections are `h2`: set `headingLevel={3}` on a component that renders a heading of its own at level 2, such as a feature Card, and render other headings as `h3` or lower.

Every example file is listed in its page's frontmatter and placed once, but an overview, which the Overview shows; Compose may show any of them as code besides. `npm test` checks that every file is on its page once. The fence stays empty in `docs/`: the catalogue renders the file live, with its source and a copy button, and the package ships the file in `docs/examples/`, its page naming it.

### Sample data

Examples, screenshots and tests use one neutral set of sample data, so they look like a real application without naming one.

- **People:** Alex Morgan, Sam Lee, Priya Shah, Jordan Kim, Maria Garcia and Chen Wei, with email addresses at `example.com`, such as `alex.morgan@example.com`.
- **Organisation and application:** Northwind.
- **Things:** projects, such as Website refresh, Quarterly report, Onboarding guide, Mobile release, Data migration and Annual review; documents; tasks; teams.
- **Dates:** absolute dates in February and March 2026, so relative times read naturally.
- **No names of the applications built on envUI, and no logos.** envUI never names the applications that use it, in code, documentation, comments or sample data; describe the behaviour instead of the application that asked for it. Other products, such as a design system envUI follows, may be named.

Its words follow the [writing guide](writing.md), as an application's would.

## Specimens

Some visual references are not examples: a matrix of every variant in every form, or controls forced into their hover and pressed looks. These are specimens in `apps/catalogue/src/specimens/<page>/<Name>.tsx`. They may use the catalogue's helpers in `apps/catalogue/src/previews`, and a page places one with a comment, which the packaged page leaves out:

```md
<!-- specimen: VariantMatrix -->
```

- **Only what an example can't show**, such as forced hover and pressed looks or every size side by side; a matrix that repeats the variants an example already shows goes.
- **Laid out by the catalogue.** On its stage, a grid of specimens is centred with even space on its four sides, in columns of one width; a matrix, such as forced states by variant, has a label column and then columns of one width, with each cell centred. A specimen adds no wrapper of its own around its grid or table.
- **Titled by the block before it.** Give it a `###` heading and its lead in the Markdown before it; the specimen itself takes no title there, and its parts' titles are `h4`.
- **Plain language too.** Its titles, captions and matrix headers name options in words, as its page's option table does, such as Small, Large or Step 1, never by their values or tokens. A catalogue browser test fails on a title that starts in lower case or is written as code.

The visual baseline captures a page's specimens, and its first example when it has no specimen.

## Foundation pages

A foundation page, such as Spacing & density or Colors & themes, explains how envUI handles one subject across every component. Its reader wants to understand envUI well enough to ask an agent for what they want, such as "more room between these sections", "a quieter surface for this panel" or "tighter rows". Write it from that reader's side: after reading it, what do they understand, and which words can they now use?

- **The same structure.** Its sections are a component's, with Options in place of Variants: its topics as titled blocks under Options, Behaviour and Rules, Accessibility only where it has something to say, its Words to use, and its tokens and values under Compose.
- **How envUI handles it, in pictures.** Each block explains one idea, such as "space shows what belongs together" or "colors are roles", with a real envUI example, such as a small screen, a form or a toolbar, rather than a ladder of values. Where the idea is in the example's layout, mark it on the example, as Spacing & density numbers the space between groups, with a numbered legend below in plain words.
- **Its figures are the catalogue's.** They are drawn in its preview in `apps/catalogue/src/previews/foundations/`, which keeps only the figures, take their words from the legend after their fence, `1. **Name**: what it means`, and are registered by name in `FoundationFigures.ts`. They take no attributes on their fence, and the package ships their legends.
- **The words to use.** Its Words to use is an option table whose In code column maps each phrase to the props and tokens it means, so an agent turns the reader's words into code; the Docs show that column as Words in code.
- **No technical text** in its plain sections, its figures included: name a swatch by its role and use, such as "Supporting text: details, captions and icons", never by its token or value.

Its frontmatter has `title`, `summary`, `aliases`, its figures under `examples` and its related pages under `avoidWhen`, and may list the exports it documents under `components`; its index entry has no summary. Its Usage guide sits on the page, without the band, and its page in the Docs shows Compose, Words in code and, where it has them, what envUI and the application provide.

## Props

The Props section and `docs/generated/props.json` come from the component's TypeScript: each prop's type, its default from the destructured parameter, whether it is required and its TSDoc. To change them, edit the source:

- Write a TSDoc comment on every prop of the component's props interface: what it does, its values and its default where the code can't show it.
- Add `@default` where the default is computed, such as `@default 'outlined', or 'secondary' with icon`, and `@deprecated` with what to use instead.
- Run `npm run docs:props` and commit `docs/generated/props.json`. `npm run docs:check` and `npm test` fail while it is stale.

Native DOM props are summarised by element, so document only the props envUI declares or narrows. Don't write props anywhere: the build rejects a table whose first column is Name, Prop, Option, Attribute or the like beside a Type, Default or Contract column, and a `###` or deeper heading named Props or Props & contracts. A table of attributes and their values, or a heading such as Props forwarding, is fine.

## Write a new page

1. Read the component's source, its CSS for the part class names, its entry in `parts.json` and its browser tests in `tests/browser`.
2. Write the example files: the overview, the variants and anatomy examples, the do and don't pairs, and, where the component adapts, an example for `widths`. Keep specimens only where they show what code can't.
3. Write the frontmatter, listing every example with its role and caption, then the sections in order, each block a lead and its rules, with the developer detail in Compose. Register the page in the index.
4. Regenerate: `npm run docs:props && npm run docs:parts && node scripts/GenerateDocumentation.mjs`, then run `npm run check`.
5. Look at the page in the Usage guide and the Docs at a narrow and a wide width, in light and dark: cells that share a row of one size, the callouts on their parts, figures centred on their stages, open code across the column and nothing overflowing. Check the outline too: one `h2` per section and nothing else at that level.

The [library guide](library-development.md) describes the checks and the changeset a change needs.
