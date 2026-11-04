# Write a component, pattern or foundation page

Every component, pattern and foundation has one page in `docs/`: `docs/components/`, `docs/patterns/` or `docs/foundations/`, named in kebab case and the singular, such as `text-field.md` for TextField and its family. A page's Markdown is the one source for three readers:

- **The catalogue** shows its plain sections with figures, for people looking at envUI.
- **The Docs** show the developer part the catalogue leaves out, so neither repeats the other.
- **Agents** read the whole file as the package ships it, in the same order, with each example's code once.

[Button](../docs/components/button.md), [Form layout and validation](../docs/patterns/forms.md) and [Spacing & density](../docs/foundations/spacing.md) are the model pages; read them, in the Markdown and on the website, before writing another. The build fails on a page outside this structure, the one-file structure.

## Write rules, not essays

People scan a page and agents follow it, so its text is written as rules:

- **A block is a lead and its rules.** A `###` heading, one short lead that says its point, then its rules as bullets, one fact each.
- **One more point is a sentence.** A block with one more point keeps it as a second sentence of the lead; never a bullet alone.
- **Short over complete, never at a fact's cost.** Shorten by form, not content: a long paragraph becomes a lead and bullets with every fact kept.
- **Short paragraphs.** One point each, at most 240 characters, about three lines.
- **Plain words where people read, code where developers do.** The plain sections name no props, values or tokens; Compose holds them, so nothing a developer or an agent needs is lost.
- **People, not users.** Call the reader "you", and the people who use an application "people", never "the user".

The [writing guide](../docs/writing.md) holds the rules for the words of an interface; the [typography](../docs/foundations/typography.md) foundation, how the catalogue sets leads, supporting text and paragraphs.

## The structure

After the YAML frontmatter and the `# Title`, a page has these `##` sections in this order, the catalogue's, so an agent reads the file as people see the page. Omit an optional one where it doesn't apply.

| Section                            | Required                       | Holds                                                                                                                                         |
| ---------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview                           | generated                      | The frontmatter's overview examples, side by side, the first on a component's page with its code open; don't write it.                        |
| Variants (Options on a foundation) |                                | The variants figure and its option table, then the options in titled blocks, each beside its figure.                                          |
| Anatomy                            |                                | The anatomy figure and its legend, and one sentence naming the parts the figure can't show.                                                   |
| Behaviour                          |                                | States and what it does on its own, such as pending work or dismissing, in titled blocks, ending with `### Adapting to width`.                |
| Rules                              | yes                            | A short lead, the do and don't figures, and titled blocks of rules, such as `### Labels`.                                                     |
| Accessibility                      | on a component or pattern page | `### Keyboard`, a Key and Action table, or the focus and keys in a block of their own; then `### envUI provides` and `### You provide` lists. |
| Words to use                       |                                | The phrases people ask for, as an option table; a column headed In code gives the props each phrase means.                                    |
| Compose                            |                                | The developer part: [Compose](#compose-the-developer-part).                                                                                   |
| Changelog                          |                                | Releases that changed the component, newest first, such as `- **1.1.0**: The quiet variant.`                                                  |

The build adds **Props**, generated from the TypeScript declarations, after Compose, and **Related**, from `avoidWhen`; don't write them. It also fails on content before the first `##`, a blockquote, a heading written as HTML, or a component or pattern page without an overview example or Accessibility's two lists.

## Frontmatter

A page opens with YAML frontmatter, which the build validates field by field.

```yaml
---
title: TextField # The component's name; the file is its kebab case.
summary: A labelled single-line text input with a description and an error. # One sentence.
status: beta # alpha, beta, stable or deprecated.
statuses: # Optional: the exports whose status differs from the page's.
  SearchField: stable
since: 1.0.0 # The release that added the component, under any earlier name: a released version, or the next.
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

- **`status`** is a ladder, `alpha`, `beta`, `stable`, then `deprecated`. The catalogue and the Docs show it under the title, and alpha and deprecated beside the page's name in the Docs' navigation too.
- **`examples`** lists each example once. Its role is `overview`, shown side by side at the top of the page and never placed in the body; `example`; `variants` and `anatomy`, with the legend that follows them; or `do`, `dont` and `caution`, whose caption is their rule and so required.
- **An overview's framing.** Nothing places an overview, so its entry says how it is framed: `open: true` shows its overlays open, as on [HoverCard](../docs/components/hover-card.md), which an overlay's overview takes: the component at rest, open and live, so people see it at a glance and can use it, its overlay pressed open from its trigger where the example doesn't open it itself; `stage: shaded` the deeper stage of a whole window or a surface, as on [Scaffold](../docs/components/scaffold.md) and [Card](../docs/components/card.md), `wide: true` a row of its own, as on [Markdown](../docs/components/markdown.md), and `motion: true` plays it. Other roles take them on their fence.
- **`statuses`** gives an export listed in `components` a status other than the page's, such as a beta editor on a page whose renderer is stable.
- **`avoidWhen`** is the page's one list of related components and pages, its **Related** section: each entry names an export in `use` or an indexed page in `see`, never both, with a line saying when to pick it instead. Name each export or page once. Relate only what a reader might pick instead: a page that is only used alongside, such as Accessibility or Icons, is linked from the sentence that needs it.
- **`components`** lists a family's members, such as IconButton on the button page. A namespace, such as `Menu`, covers all its parts; list the namespace, never a part such as `Menu.Item`.
- **Guides**, the pages at the top of `docs/`, may take only `status`, `components`, `aliases`, `exportAliases` and `statuses`. `exportAliases` maps an export listed in `components` to the words people search for it by, such as `ThemeToggle: [theme switcher]` on the setup page. A guide's exports take its status, else `stable`; `statuses` gives one another, such as `useContainerSize: beta`.

Register the page in [the index](../docs/index.md) under its group, with only its title and path: `- [TextField](components/text-field.md)`. The index orders the pages; the summary comes from the frontmatter.

## What each reader sees

- **The catalogue** shows the sections up to Words to use in three groups: what it is (Overview to Behaviour); its Rules, opening with Use it when, from `useWhen`, and on a pattern Built from; then Accessibility, Words to use and Related. It leaves out Compose, the changelog, the two lists of what is provided and every column headed In code.
- **The Docs** show Compose, the two lists under Accessibility, the In code column as Words in code, and the generated Props, Part names and Color properties, with the changelog collapsed. [Field](../docs/components/field.md), which has no page in the catalogue, shows its whole page there.
- **The package** keeps the whole file: each example's entry on one line, a run of figures as one line that names them, an anatomy or variants figure as its legend or option table, and Compose with the props after it.

## Plain language in the catalogue

The catalogue is for people looking at envUI, often not developers, who then ask an agent to build with it. Outside the Code disclosures under its figures, it shows no code and no values:

- **No inline code.** Name no props, values, part classes, tokens or container names. Say what matters in plain words: "the ghost variant", "a sheet from the bottom". Component names, such as SearchField, are names, not code.
- **No technical values.** No hex colors, lengths, durations, percentages or contrast ratios, in text, captions, specimen titles, swatches and legends alike. Say what the value does, such as "the most space, between sections", and put the value in Compose.
- **Options in words.** A table of variants, tones, sides or sizes names each option as people see it, such as Outline or From the bottom.
- **No links into the Docs.** The catalogue reaches the Docs only through a page's Docs button. Link component, pattern and foundation pages, and say a point of a Docs page without the link; Compose, the changelog and the two lists of what is provided may link anywhere.

## Text in titled blocks

Every piece of text in the catalogue belongs to a titled block: a heading and a short lead, with its rules and its figure, as Pending work is written on [Button](../docs/components/button.md). A section's own heading titles the lead that opens it.

- **No loose sentences.** A paragraph after a figure, a pair, a legend or a list, with no heading between, is loose: give it a heading, or fold it into its block. The one exception is the sentence after an anatomy legend that names the parts the figure can't show.
- **At most three short paragraphs to a block.** More are two blocks.
- **No fake headings.** The catalogue sets the type; don't make a heading with bold text or HTML.

## Write little

The docs are mainly visual. Let the figures teach, and write a lead and a few rules around them:

- **Show, then say little.** Cut every sentence a figure already shows, such as what a variant looks like. Text beside a figure says what the figure can't, such as the rule it illustrates.
- **Say each thing once.** Each kind of information has one place, in the table below. A rule doesn't repeat a `useWhen` or `avoidWhen` entry either.
- **Leave out what is generated.** Each prop's values and defaults are in Props, and what the code does for itself, such as an exact delay, needs no sentence unless a reader chooses it.
- **Write envUI's version as `{{version}}`.** The Docs, the packaged docs and the setup skill fill in the package's version as they build, so a command such as the install runs as people copy it.

| Information                                   | Its one place                                                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| What it is                                    | The frontmatter's `summary`, which the banner shows above the Overview.                                        |
| What it looks like                            | The overview figures and the others, with no sentence describing them.                                         |
| When to use it                                | The frontmatter's `useWhen`, which Rules opens with as Use it when.                                            |
| What to use instead                           | The frontmatter's `avoidWhen`, which Related shows at the end of the page.                                     |
| Variants, tones and sizes                     | Variants: a variants figure and one option table of the options in words and what each is for.                 |
| Its parts                                     | Anatomy: the legend, which the catalogue shows as names only; the class names are for Compose.                 |
| What it does on its own, such as pending      | Behaviour: a titled block beside its figure.                                                                   |
| How it adapts to width                        | Behaviour's last block, `### Adapting to width`, with an example at several widths.                            |
| A judgment, such as one primary button        | Rules: a do and don't pair whose captions are the rule. A pair never pictures a `useWhen` or `avoidWhen` item. |
| Rules no picture shows                        | Rules: a titled block after the pairs.                                                                         |
| Keys, roles and what the application must add | Accessibility: keys in its Keyboard table, roles and what the application adds in its two lists.               |
| The words people ask for                      | Words to use: an option table, with the props each phrase means under In code.                                 |
| How to use it in code                         | Compose: props and values, short code, how its parts compose, and its tokens.                                  |
| Props, part names, color properties, strings  | Generated on the page in the Docs and the package; never in prose.                                             |
| Releases                                      | Changelog.                                                                                                     |

Choose the form that teaches each point best: a live example for how it looks and behaves, a do and don't pair for a judgment, an anatomy figure for parts, an example at several widths for how it adapts, a table for values. Material Design 3's component pages are the reference for explaining visually; borrow their approach, never their text or images.

## Layout

The catalogue lays a page out; the page decides only what sits together:

- **Figures in a row**: figures with only blank lines between them sit side by side, in equal cells. Write two or three in a row, or four as two pairs, never five; put a titled block between figures that should not share a row.
- **A block beside its figure**: a `###` block of text, with no table or list at its start, followed by exactly one figure, sits beside it on a wide page. A figure that needs the room takes [`wide`](#wide-figures).
- **One frame per figure.** A figure's stage is its only frame: never put it inside a Surface, Card or another stage.
- **Spark lists**: an item of a list of what something is for that ends with a component's name in parentheses, such as "(IconButton)", shows the name linked to its page.

## Figures

A figure is an [example file](#examples) listed in the frontmatter and placed with an empty fence that names it, ` ```tsx figure=Name `, anywhere but Compose and the changelog. Its role and caption come from the frontmatter; its framing from attributes after the name, written as `name="value"`, and flags, such as `open`, as their name alone. A value can't hold a double quote, so quote with ' or “ ”.

| Role                    | Shows                                                                                                   | Attributes on its fence                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `example`               | The example, live on the stage, with its caption below.                                                 | `widths`, `sweep`, `classes`, `fit`, `open`, `stage`, `wide`, `motion` |
| `do`, `dont`, `caution` | The example on a square stage joined to a green Do, red Don't or amber Caution bar, and its rule below. | `open`, `stage`, `wide`, `motion`                                      |
| `anatomy`               | The example on the stage, with numbered callouts on its parts and the legend below.                     | `of`, `open`, `stage`, `enlarge`, `width`, `specimen`                  |
| `variants`              | The example on the stage, each variant's name in plain text beside or under it, and the legend below.   | `stage`                                                                |

Every figure sits on the catalogue's recessed stage, in the theme, contrast and scale the reader chose, with a closed Code toggle under it holding the file's source. Keep example lines within the formatter's 100 characters, and a caption to one sentence.

- **`stage=shaded`** is for a figure whose subject's own fill must show: a whole window, such as a Scaffold, whose edges must show, or a surface standing on the stage, such as a Card or a Table. In light it makes the stage a shade deeper than the window's page. Don't draw a frame around the subject instead.
- **`open`** shows a figure's popup, menu, tooltip, dialog, sheet or toast open, as a picture, rendered into the stage and inert; an overview's is live instead. The example opens it itself, with `defaultOpen` or an `open` state that starts true, and says so in a comment. Use it where the point is in the open overlay; a figure whose point is the trigger stays closed.

### Examples at several widths

`widths="16 30"` shows the example in a frame of each width in rem, one to a row, where its container queries see the frame. Choose widths on either side of where the component changes, such as `widths="24 40"` around a card's 38 rem.

An Adapting to width figure sweeps instead: `widths="30 16" sweep` moves one frame from the first width through the others and back, so the example reflows for real; the frame is an `env-window` container, so window classes follow it too.

- **The first width is the still**, shown where motion is paused or reduced; list the widths in the order the item describes.
- **`classes`** names the window class on the ruler, such as "40 rem · Medium".
- **`fit`** lets the frame be drawn as small as 0.6 to reach its widest width, for an example that changes only wider than the column.
- **More than a sweep**, such as opening a sheet at the narrow end, is a specimen: `WidthSweep` (`apps/site/src/motion/WidthSweep.tsx`) on a `MotionStage`, given `at` from a `useTimeline` step or a `usePointer` cue.

### Wide figures

`wide` keeps an example alone in its row, across the column, rather than beside the block before it or in a run, for a figure that needs the room, such as a popover open below its trigger. A foundation's figure says so in its registration (`FoundationFigures.ts`).

### Do and don't pairs

List a `do` and a `dont` example and place them one after the other, so they sit side by side on small square stages. A do or a don't may stand alone where only one side is worth a picture.

- **Only what a picture shows best.** Picture a real, tempting mistake and its fix; say a rule no picture shows in a titled block.
- **The same situation**, so the only difference is the point: the same dialog's actions with one primary button and with three.
- **A caption is the rule** in a few plain words, such as "One primary button per group, at the end of its actions."
- **Whole examples.** Each is a file an application could copy, the don't included. Avoid a don't the accessibility scan would flag; say it in a rule instead.
- **A caution** is acceptable with care rather than a mistake: its caption says the cost and what to prefer.
- **A wide pair**, such as panes that narrow from side by side, takes `wide` on both, the do above the don't.

### Anatomy figures

An ordered list right after an anatomy figure is its legend: each item the part's name in bold, which is all the catalogue shows, then its class in a code span, which the Docs and agents keep. The catalogue puts the item's number on the part, measured from the live component.

````md
```tsx figure=CardAnatomy

```

1. **Surface** (`env-card`)
2. **Title** (`env-card-title`, `title`)
3. **Footer** (`env-card-footer`)
````

- The first code span that starts with `env-` is the part; a second may name the prop that fills it. Write nothing after the parentheses.
- A part reference is a class name, or a selector of class names without their dot, such as `env-button > env-icon:first-child`; `::text` at the end points at the element's own text, such as `env-button::text`.
- A figure without a list numbers every part `docs/generated/parts.json` lists for the page's component, or for the one `of="Name"` names. Read a component's entry there before writing its legend.
- `enlarge` draws a subject whose parts sit close half as large again; `width="38"` lays out a subject that shows all its parts only from a width, such as [Panes](../docs/components/panes.md) side by side.
- Make the example small and complete, every part the legend names present once, the root first, then the parts in reading order. Name the parts it can't show in one sentence below, such as "Not shown: the spinner."
- **Callouts on what shows.** A callout points at what shows of a part: its edge, its text or its icon; only a region, with no edge of its own around several things, such as a card's actions, is outlined. The catalogue names in the legend alone, unnumbered, the outermost part around the others that has no edge of its own, such as a text field's root, and the part inside it as wide as it that holds several others, such as its control.
- **Two callouts, two things.** No two callouts land on one box, and none points at nothing. Parts that look alike at rest, such as AnimatedNumber's window and its value, show apart with `specimen`: the catalogue numbers them on the specimen of the same name, which holds the example in that moment, and a caption says which.

### Variants figures and option tables

A variants figure names each variant with a callout rather than labels inside the example. An ordered list right after it names them, each item the name in bold, in the order the example shows them; each names the example's next item, or what a part reference after it selects, such as ``**Ghost** (`env-text-field[data-variant='ghost']`)``. Write a long run, such as six tones, one under another.

Variants, tones, sizes, sides and layouts are written as an option table: the first column names each option in words, the last, headed **Use for**, says what it is for, and a column headed **In code**, which only the Docs and agents read, gives its props. The catalogue shows the table as a legend; right after a variants figure's list, it is that figure's legend.

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

- **Names are tags**: a few words of plain text, named once, with no link, image or HTML. After a variants figure, they are the figure's names, in its order.
- **One kind per table.** Sides and widths are two tables, each in its own titled block, as on [Sheet](../docs/components/sheet.md).
- **Other tables stay tables.** Only a table whose last column is Use for is a legend.

## Compose: the developer part

Everything the plain sections leave out goes in `## Compose`, after Words to use: props and values, such as `side="bottom"`, class names, tokens and the exact behaviour of a prop. The catalogue leaves it out; the Docs show it first.

````md
## Compose

### Usage

`variant` is `outline`, the default, `floating` or `ghost`.

```tsx source=Variants

```

### Composition

TextField is built from Field's parts: …

### Customize

An outline field takes no fill of its own; give it one with its container color.
````

- **Its `###` subsections, in this order:** `### Usage`, required, with short code for its common uses and options; `### Composition`, how its parts and the components around it fit together; `### Customize`, only what is particular to it, such as an edge drawn only at high contrast. Use `####` headings inside them.
- **Generated around it:** `### Import`, from the exports the page documents or a pattern's `composes`, opens the section; Part names, Color properties and Strings follow Props, from `docs/generated/parts.json` and `defaultMessages`. Don't write them, nor the sentence [customizing](../docs/customizing.md) says once about color properties.
- **Code.** A snippet of a few lines in a `tsx` fence, or an example file of the page as code in an empty `tsx source=Name` fence, which the build fills in; at most one full example a page. `npm run docs:snippets` type-checks the snippets against envUI's API, supplying the imports and names they leave out; one that is pseudo-code on purpose takes `tsx nocheck`.
- **Accessibility's lists** stay in Accessibility. Write the keyboard table from the code and its browser tests: the keys the component handles, and Tab for how focus enters and leaves. "envUI provides" names the roles, names, announcements and focus handling it does itself; "You provide", what the application must add, such as a label.

## Examples

An example is a file in `apps/site/src/examples/<page>/<Name>.tsx`: a small, default-exported component an application could copy as it is.

- Import only what an application can: `react`, `@envsemble/envui`, its `/content`, `/diff`, `/rich-text` and `/color` entries, and icons, `Icon<Name>` from `@envsemble/envui/icons/<Name>`.
- No catalogue classes or helpers. Lay out with envUI's components; where envUI has no layout for it yet, a short inline style with a comment.
- Keep state inside the example, and stand in for slow work with a timer.
- Keep it small: the stage centres it at its own width. Give the root a width where it should be wider, such as `inlineSize: '100%'`; a root that is a size container fills the stage.
- Name the file after what it shows, such as `ConfirmInPlace.tsx`.
- Start its own headings at level 3: `headingLevel={3}` on a component that renders an `h2`, and `h3` or lower for others.
- A field on its own, such as a search above a list, takes `variant="floating"`.

Every example is listed in its page's frontmatter and placed once, but an overview; Compose may also show any of them as code. The fence stays empty: the catalogue renders the file live, and the package ships it in `docs/examples/`.

### Sample data

Examples, screenshots and tests share one neutral set of sample data:

- **People:** Alex Morgan, Sam Lee, Priya Shah, Jordan Kim, Maria Garcia and Chen Wei, with addresses at `example.com`, such as `alex.morgan@example.com`.
- **Organisation and application:** Northwind.
- **Things:** projects, such as Website refresh, Quarterly report, Onboarding guide, Mobile release, Data migration and Annual review; documents; tasks; teams.
- **Dates:** absolute dates in February and March 2026, so relative times read naturally.
- **No names of applications built on envUI, and no logos** ([AGENTS.md](../AGENTS.md)).

Its words follow the [writing guide](../docs/writing.md).

## Specimens

A visual reference that is not an example, such as controls forced into their hover and pressed looks, is a specimen in `apps/site/src/specimens/<page>/<Name>.tsx`. It may use the catalogue's figure helpers (`apps/site/src/figures`) and motion (`apps/site/src/motion`), and a page places it with a comment the package leaves out:

```md
<!-- specimen: VariantMatrix -->
```

- **Only what an example can't show**, such as forced states or every size side by side.
- **Laid out by the catalogue**, with no wrapper of its own around its grid or table.
- **Titled by the block before it**: a `###` heading and its lead in the Markdown; its parts' titles are `h4`.
- **Plain language too**: titles and headers name options in words, as the option table does.

The visual baseline captures a page's specimens, or its first example when it has none; an animated figure as its still, the first frame of its loop.

### Animated specimens

Where a section is about a change, such as a slider stretching past its ends or a reply arriving, a specimen plays it: the live component on a `MotionStage` (`apps/site/src/motion/MotionStage.tsx`), driven by a script of a pointer no one sees (`usePointer`) or by steps of its props (`useTimeline`), both in `apps/site/src/motion/Motion.tsx`.

- **The component's own behaviour.** The pointer hovers, presses, drags, types and uses keys as a person would, so the component shows its own states; change props only where no person could.
- **It loops**, ending where it began, at one height, so the page never moves; give `MotionStage` a `height` that holds what opens, or `roomFor` where wrapped rows grow it, and `top` where that room is for what opens below the control, such as a select's list.
- **Overlays open in the stage** while it plays, contained: a dialog's backdrop covers the stage, not the page.
- **The reader can take it over.** A click on a figure the pointer plays, or the keyboard reaching it, stops it and hands the reader the example at its start, live, its overlays opening as in an application; its play button plays it again. A figure driven by `useTimeline` stays a recording, so a page whose component people operate keeps an example or a pointer-played figure.
- **In place of an example**: an example the catalogue plays takes `motion`, on its fence or as `motion: true` in an overview's entry, and its specimen of the same name imports it and plays it. The figure keeps the example's caption and code; the Docs and the package keep the example.
- **Pairs in step**: a do and a don't that play one sequence take their steps from `useSharedTimeline`, or `usePointer` with the same `clock`.
- `PointerStep` in `Motion.tsx` lists what the pointer can do, `PressedKeys` shows the keys it presses, and `Renew` redraws an example a loop can't put back.

## Tiles

The galleries and Related show each page by a tile: `apps/site/src/tiles/<Page>.tsx`, the page's id in PascalCase, default-exported.

- **The component alone, large and centred**, with as little else as it needs to be recognised.
- **A still that is its animation's first frame.** On hover or focus it plays a short script of the component in use, and on a touch screen the tile nearest the middle plays once scrolling settles. The script ends where it began.
- **Its window** is 14 by 10.5 rem, the same for every tile, so components show at one scale; only a component too large for it takes a larger one in `tileWindows` (`apps/site/src/tiles/Tiles.ts`).
- **A still with a popup open** keeps it in state and puts it back with `usePointer`'s `onRest`.

## Pattern pages

A pattern page says how envUI's components combine for a recurring need, such as an app frame, forms or empty states: a need that takes two or more components together, or a choice between components. Guidance that fits one section of one component page is a variant or an example there instead. It is written in the same structure, with these differences:

- **Frontmatter.** No `category`, `components` or `statuses`; `intent` groups it by what people are doing, _Enter and change data_, _Keep people informed_, _Work with lists and tables_ or _Frame the application_, and `composes` names every envUI export its examples import, namespaces rather than parts. Register it in the index under `## Patterns`, in intent order.
- **Its decision**: which component or form to use when, as an option table under Rules, such as `### Which to use`.
- **Its compositions**: the arrangements no component page shows, such as type to confirm, as titled blocks beside their figures under Variants, in examples of its own.
- **Anatomy** numbers the composition's parts, with `of` naming the component it numbers.
- **Behaviour** holds the flow and its timing, such as when to check and what happens on failure.
- **Accessibility** opens with `### Focus and keyboard`, the flow of focus rather than a table of keys.
- **Compose** shows its canonical example once, in full, as a `source` fence under Usage.
- **It links, never repeats**: each component's own behaviour, such as how long a toast stays, is on its page. The words of its kind of screen are a block under Rules.

The catalogue's Rules shows what it is Built from, the pages of its `composes`, without hooks, providers and layout primitives.

## Foundation pages

A foundation page, such as Spacing & density, explains how envUI handles one subject across every component, so its reader can ask an agent for what they want, such as "more room between these sections". Write it from that reader's side: what do they understand after reading it, and which words can they now use?

- **The same structure**, with Options in place of Variants, Accessibility only where it has something to say, and its tokens and values under Compose.
- **How envUI handles it, in pictures.** Each block explains one idea, such as "space shows what belongs together", on a real envUI example rather than a ladder of values, with what the idea is marked on it and a numbered legend in plain words.
- **Its figures are the catalogue's**, in `apps/site/src/figures/foundations/`, registered by name in `FoundationFigures.ts`, with their words from the legend after their fence, `1. **Name**: what it means`. A figure that shows what an application writes has an example of its name as its code; a pure illustration, such as the palette, has none.
- **Animated figures**: `Figure` (`figures/foundations/Topic.tsx`) with `motion` plays one on a `MotionStage`; a nested `Theme` in it cross-fades between themes.
- **The words to use**: an option table whose In code column maps each phrase to the props and tokens it means.

Its frontmatter has `title`, `summary`, `aliases`, its figures under `examples` and its related pages under `avoidWhen`, and may list the exports it documents under `components`.

## Props

Props come from the component's TypeScript: each prop's type, its default from the destructured parameter, whether it is required and its TSDoc.

- Write a TSDoc comment on every prop of the props interface: what it does, its values and its default where the code can't show it.
- Add `@default` where the default is computed, and `@deprecated` with what to use instead.
- Run `npm run docs:props` and commit `docs/generated/props.json`.

Document only the props envUI declares or narrows; native props are summarised by element. Never write a props table by hand.

## Write a new page

1. Read the component's source, its CSS for the part classes, its entry in `parts.json` and its browser tests.
2. Write the example files: the overview, the variants and anatomy examples, the do and don't pairs, and an example for `widths` where it adapts.
3. Write the frontmatter, then the sections in order, each block a lead and its rules, with the developer detail in Compose. Register the page in the index.
4. Regenerate with `npm run docs:props && npm run docs:parts && node scripts/docs/GenerateDocumentation.ts`, then run `npm run check`.
5. Look at the page in the catalogue and the Docs, narrow and wide, in light and dark: callouts on their parts, figures centred, nothing overflowing, and one `h2` per section.
