---
title: LineArt
summary: A geometric drawing in faint hairlines that fills its box, for a banner's end, an empty state or the background of a header.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - line drawing
  - geometric drawing
  - geometric pattern
  - shapes
  - decoration
  - ornament
  - illustration
  - banner art
  - background pattern
  - hero art
useWhen:
  - The end of a banner or a page's header, beside its title
  - Above an empty state's message, where a screen has nothing else to show
  - The background of a header, clear of its text
avoidWhen:
  - text: A symbol that says what something is or does.
    see: icons
  - text: A region set apart by its fill and corners.
    use: Surface
components:
  - LineArt
examples:
  ProjectBanner: overview
  LineArtAnatomy: anatomy
  WhereItSits: variants
  RightToLeft: example
  CroppedFromItsStart: example
  OneAtTheEnd:
    role: do
    caption: One drawing at the banner's end, clear of its text.
  AboveAnEmptyState:
    role: do
    caption: One drawing on a screen, such as above an empty state's message.
---

# LineArt

## Variants

### Motions

A drawing can draw itself in, draw itself out, run in and out by turns, or play, its lines moving in the order it was constructed; every drawing takes as long.

- Draw it in as it arrives and out as it leaves.
- Run it in and out by turns while people wait.
- Play it where it already shows, such as on hover: it never leaves the screen empty.

### Sixteen drawings

Each is a construction from geometry, drawn whole on a sheet a little wider than tall.

- They are interchangeable: choose by what looks right in the space, or vary them from screen to screen.
- None of them means anything, so none of them suits a particular subject.
- The buttons under each drawing play its motions there.

<!-- specimen: Drawings -->

## Anatomy

```tsx figure=LineArtAnatomy

```

1. **Drawing** (`env-line-art`)

The drawing has no box of its own: it fills the one it is given.

## Behaviour

### Cropping and anchoring

The drawing covers its box, so a box of another shape crops it from the side away from where it sits. It always rests on the box's foot: a box wider than the drawing crops its top.

```tsx figure=WhereItSits

```

1. **At the end**
2. **At the start**
3. **In the centre**

| Place         | Use for                                                       |
| ------------- | ------------------------------------------------------------- |
| At the end    | A banner's end, cropped from its start. The default.          |
| At the start  | A drawing before the content, cropped from its end.           |
| In the centre | A box of its own, such as above a message, cropped both ways. |

### Right to left

In right-to-left text the drawing is mirrored, so it still sits at the end and is cropped from the start.

```tsx figure=RightToLeft

```

### Themes and high contrast

Its lines take the muted edge color in every theme, quiet on any surface, and stay a hairline at any size.

- With high contrast, they take that theme's muted edge.
- In forced colors, they take the system's gray text color.

<!-- specimen: Themes -->

### Adapting to width

As its box narrows, the drawing keeps its end in view and gives up its start.

```tsx figure=CroppedFromItsStart widths="44 24" sweep

```

## Rules

A drawing is decoration: one to a screen, beside what people read, never behind it.

```tsx figure=AboveAnEmptyState

```

### One per screen

A single drawing gives a screen a quiet character; several turn into noise.

- Vary the drawing between screens, not within one.
- Give a screen the same drawing every time it opens, such as by its place in the application.

### Never as content

A drawing doesn't say anything, so it never stands in for an image, a chart or an icon.

- Never put it behind text, a chart or controls that need their contrast.
- Never recolor it to draw attention: its quiet line is the point.

```tsx figure=OneAtTheEnd

```

## Accessibility

### Hidden by default

Assistive technology skips a drawing. One that means something in its place takes a label and is read as an image.

### envUI provides

- `aria-hidden="true"` on the drawing, which takes no focus and no pointer.
- With `label`, `role="img"` and `aria-label`, so it is read as an image of that name.
- Where reduced motion is preferred, no motion: each shows where it ends at once, and a loop keeps the drawing whole.

### You provide

- A `label` only where the drawing is content, such as a figure about geometry.
- The text around it, which keeps its contrast: never place it behind text.

## Words to use

Ask for a drawing in these words.

| Words        | In code                                           | Use for                                                      |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| Line art     | `<LineArt drawing="golden-section" />`            | A quiet geometric drawing that fills its box.                |
| Monochord    | `drawing="monochord"`, from `lineArtDrawings`     | One of the drawings, by its name.                            |
| At the end   | `align="end"`, the default                        | A drawing cropped from its start, as at a banner's end.      |
| At the start | `align="start"`                                   | A drawing cropped from its end.                              |
| Centred      | `align="center"`                                  | A drawing cropped from both sides, as above a message.       |
| Per screen   | `lineArtDrawings[index % lineArtDrawings.length]` | A different drawing on each screen, the same on every visit. |
| Described    | `label="…"`                                       | A drawing that is content, read as an image.                 |
| Appearing    | `motion="appear"`                                 | A drawing that draws itself in, as it arrives.               |
| Disappearing | `motion="disappear"`                              | A drawing that draws itself out, as it leaves.               |
| In and out   | `motion="loop"`                                   | A drawing that appears and disappears by turns, for a wait.  |
| Playing      | `motion="play"`                                   | A drawing that redraws itself and rests, such as on hover.   |

## Compose

### Usage

`drawing` names one of the sixteen drawings, listed in order as `lineArtDrawings`, such as `golden-section`. The drawing fills its container's box: the box sets its size and shape, and the drawing covers it.

```tsx source=ProjectBanner

```

`align` is `end`, the default, `start` or `center`: where the drawing sits as its box crops it, as `preserveAspectRatio` with `slice` on a sheet of 480 by 330. Right to left, the drawing is mirrored. `label` makes it `role="img"`, named by the label; without one it is `aria-hidden`.

#### The drawings

| Drawing                  | In code                  |
| ------------------------ | ------------------------ |
| Golden section           | `golden-section`         |
| Square, circle, triangle | `square-circle-triangle` |
| Whirling squares         | `whirling-squares`       |
| Triangle and circles     | `triangle-and-circles`   |
| Ford circles             | `ford-circles`           |
| Harmonic division        | `harmonic-division`      |
| Pappus chain             | `pappus-chain`           |
| Root rectangles          | `root-rectangles`        |
| Sacred cut               | `sacred-cut`             |
| Gothic tracery           | `gothic-tracery`         |
| Quartered square         | `quartered-square`       |
| Graded quadtree          | `graded-quadtree`        |
| Monochord                | `monochord`              |
| Logarithmic grid         | `logarithmic-grid`       |
| Pointed arcade           | `pointed-arcade`         |
| Root-two halving         | `root-two-halving`       |

#### Motion

`motion` moves the drawing's lines, one beat after another in the order of its construction, as it mounts or as `motion` changes; without it, the drawing is still.

- `appear` draws the lines in, from nothing to the whole drawing, the lines that frame it first.
- `disappear` draws them out, from the whole drawing to nothing, the other way round, and leaves nothing drawn.
- `loop` draws them in, holds the drawing whole a moment, and draws them out, for as long as it is set; each turn begins where the last one ends, with nothing drawn.
- `play` runs each line out past its end and draws it in again, the drawing whole throughout, and ends on the still.

`onMotionEnd` is called once `appear`, `disappear` or `play` has finished, such as to unmount a drawing that has disappeared, or to play it again by setting `motion` to `undefined` and back. Where reduced motion is preferred, it is called at once.

```tsx
function EmptyStateArt({ leaving, onGone }: { leaving: boolean; onGone: () => void }) {
  return (
    <LineArt
      drawing="pappus-chain"
      motion={leaving ? 'disappear' : 'appear'}
      onMotionEnd={() => {
        if (leaving) onGone();
      }}
    />
  );
}
```

#### A drawing for each screen

To vary the drawing between screens and keep it the same on each, pick it by the screen's place in the application's order. Neighbours never share a drawing, and none recurs within sixteen screens.

```tsx
const drawing = lineArtDrawings[screenIndex % lineArtDrawings.length]!;
```

### Composition

In a banner or a header, give the drawing a box at the end and keep the text above it: the container is positioned and clips, the drawing is placed absolutely across part of it, such as `inset-block: 0; inset-inline-end: 0; inline-size: 48%`, and the text after it is positioned so it paints over the drawing. Keep the text clear of the drawing, such as with a `max-inline-size`.

### Customize

The root is `env-line-art`, an SVG with `data-drawing` and `data-align`, whose shapes draw with `stroke: var(--env-color-border-muted)`, `stroke-width: 1px` and `vector-effect: non-scaling-stroke`, and `stroke: GrayText` in forced colors. Its `width` and `height` are its box's, `100%` of its container by default; set them, or its `style`, to place it.

In motion, the root also has `data-motion`, and `data-turn`, `in` or `out`, in a loop. A motion takes `--env-line-art-duration`, `calc(var(--env-motion-duration-slow) * 10)` by default, and `play` half as long again; set it on the drawing to slow it down or speed it up. Each line is a dash of `pathLength="1"`, moved by `stroke-dashoffset`, so nothing but the lines moves.

## Changelog

- **1.0.0**: LineArt, sixteen geometric drawings in hairlines, with `drawing`, `align` and `label`, and `lineArtDrawings`; `motion`, `appear`, `disappear`, `loop` or `play`, and `onMotionEnd`.
