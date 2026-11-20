# Write a component or foundation page

Every component and foundation has one page, `docs/components/<name>.md` or `docs/foundations/<name>.md`, named in kebab case after its title. The catalogue, the Docs and the package all read it. A page holds what is generated or runs, its figures and examples, plus one sentence on what the component is for and a short use when and don't use when. Everything else is in the API, the generated reference or the figures. [Button](../docs/components/button.md) is the model page; the build fails on a page outside the structure.

## Frontmatter

```yaml
---
title: TextField
summary: A labelled single-line text input with a description and an error.
status: beta # alpha, beta, stable or deprecated
since: 1.0.0
category: Forms & selection # its group in the index and its family folder
aliases:
  - text input
useWhen:
  - A short value on one line, such as a name
avoidWhen: # each names an export in use or a page in see
  - text: Text that runs over several lines.
    use: Textarea
components:
  - TextField
  - Textarea
examples: # each example file once, by name, with its role
  SignUp: overview
  LabelOutside:
    role: do
    caption: A label above the field, always in view.
---
```

- **Roles:** `overview`, shown at the top and never placed; `example`; `variants` and `anatomy`, with a legend; `do`, `dont` and `caution`, whose caption is their rule.
- An overview's entry takes its framing: `open: true`, `stage: shaded`, `wide: true`, `motion: true`, `device: phone` or `window`.
- A namespace, such as `Menu`, covers its parts: list the namespace, never `Menu.Item`.
- Register the page in [the index](../docs/index.md) under its group, with its title and path only.

## The body

A component page writes no prose: after `# Title` come its examples under headings, their legends and specimens, in these `##` sections, in this order, each where it has something to show:

| Section       | Holds                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------ |
| Variants      | The variants figure and its legend, then a `###` heading over each other figure            |
| Anatomy       | The anatomy figure and its legend                                                          |
| Behaviour     | Figures of its states and what it does on its own; `### Adapting to width` last            |
| Rules         | The do and don't figures                                                                   |
| Accessibility | `### Keyboard`, a Key and Action table, only where its keys are not the ones people expect |

What it is for goes in `summary`, `useWhen` and `avoidWhen`. The build writes the Overview, Rules' Use it when, the Import, Props from the TypeScript declarations, Part names and Color properties from `docs/generated/parts.json`, and Related; the rest is in the API.

## Figures

Place an example file with an empty fence that names it, ` ```tsx figure=Name `, anywhere but Compose and the changelog. Its role and caption come from the frontmatter; attributes after the name frame it, as `name="value"` or a flag alone. The build says which attributes each role takes.

- `widths="16 30"` shows it at each width in rem; `widths="30 16" sweep` sweeps one frame between them.
- `open` shows its overlay open, as a picture; the example opens it itself with `defaultOpen`.
- `stage="shaded"` for a whole window or a surface; `device="phone"` or `"window"` draws a whole screen on that device.
- `wide` keeps it alone in its row; `motion` plays it through its playback, the specimen of its name.
- Figures with only blank lines between them sit side by side, two or three to a row.

An ordered list right after an anatomy or variants figure is its legend: each item a name in bold, then for anatomy the part's class in a code span, `1. **Title** (`env-card-title`, `title`)`. An anatomy figure without one numbers every part `parts.json` lists, or those of `of="Name"`.

The catalogue shows no code or values outside the Code disclosures: legends name options in words, and props, tokens and values are in the generated reference or a foundation's Compose.

## Examples, specimens and tiles

- **An example** is `apps/site/src/examples/<page>/<Name>.tsx`: a small default-exported component an application could copy, importing only `react`, envUI's entry points and its icons. It keeps its state inside, starts its headings at level 3, and uses the sample data: Alex Morgan, Sam Lee, Priya Shah, Jordan Kim, Maria Garcia and Chen Wei at `example.com`, Northwind, projects such as Website refresh, and dates in February and March 2026.
- **A specimen** is `apps/site/src/specimens/<page>/<Name>.tsx`, for what an example can't show, such as forced states, placed with `<!-- specimen: Name -->`. A playback, an animated specimen named after its example, plays it on a `MotionStage` with `usePointer` or `useTimeline`, loops back to where it began, and aims at accessible names, destinations and public parts. Change or rename a playback with its example.
- **A tile** is `apps/site/src/tiles/<Page>.tsx`: the component alone, large and centred, whose still is the first frame of the script it plays on hover.

## Foundation pages

A foundation takes the same sections, with Options in place of Variants, a few sentences around its figures, and `## Compose` with `### Usage` and `### Customize`. Its figures are the catalogue's, in `apps/site/src/figures/foundations/`, registered by name in `FoundationFigures.ts`. Its `### Customize` under Compose is generated from the token list by `npm run docs:guides` (`scripts/docs/GenerateGuideTables.ts`), which places each token in one foundation's tables. Its frontmatter has `title`, `summary`, `aliases` and `examples`, and may have `avoidWhen` and `components`.

## Props

Props come from the TypeScript: each prop's type, default and doc comment. Write a doc comment on every prop, with `@default` where the default is computed and `@deprecated` with what to use instead, then run `npm run docs:props`.
