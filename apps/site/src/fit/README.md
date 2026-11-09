# fit

Draws a tile's or a figure's picture so it fits its stage. Each fitter measures what the picture shows and sets sizes, scales and positions from it. It measures again whenever something that can change the result changes, through the site's shared measuring loop (`remeasure`, [`shared/Remeasure.ts`](../shared/Remeasure.ts)), which also owns the site's one pixel tolerance (`pixelTolerance`).

## The fitters

| What is fitted                                                                     | Fitter                                                                                                          |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| A gallery's tile, a page's own tile, and an example's or a specimen's picture      | `useFit.ts`, by its `FitKind` (`FitKind.ts`), deciding in `FitScreen.ts`, `FitPlaying.ts` and `FitResting.ts`   |
| An application's tile, which fills its card                                        | `standalone/useAppFit.ts`                                                                                       |
| A device figure: a phone or a window around its example                            | `standalone/useDeviceFit.ts`, measuring in `standalone/DeviceMeasure.ts`, deciding in `standalone/DeviceFit.ts` |
| An Adapting to width figure's frames, and an anatomy figure's subject from a width | `standalone/WidthFit.tsx`                                                                                       |
| An open example's room for the overlays it rests open on                           | `standalone/OverlayRoom.ts`                                                                                     |
| A do or don't figure's example, also as its animated specimen plays it             | `standalone/useVerdictFit.ts`                                                                                   |

The standalone fitters differ from `useFit` in what they measure and set, not only in how they choose a scale:

- an application's tile lays its canvas out over the card at a set scale, and measures nothing it shows;
- a device figure draws the device at a scale and shows part of its screen, keeping what the figure needs whole and placing the cut edges between words; it renders through React state;
- the width figures draw a frame of a given width smaller;
- an open example makes its room larger for what opens in it;
- a do or don't figure grows the box its example lays out in.

A new kind of figure becomes a `FitKind` of `useFit` (`FitKind.ts`) before anyone writes another standalone fitter; a standalone one is for a figure whose fit measures or sets something else, and takes its row above.

## How `useFit` runs

Each time the measuring loop calls it, in this order:

1. `useFit.ts`: `fitPicture` reads the script (`ScriptReader`, `FitKind.ts`) and what the picture paints (`shownBoxes`, `PaintedBoxes.ts`), waits while something is still moving (`settling`), and keeps the framed view while the picture shows the same thing (`holdsFrame`, `HeldView.ts`).
2. `FitMeasure.ts`: `frame` (`useFit.ts`) measures the picture (`measure`) and picks the moment's mode (`fitModeOf`, `FitKind.ts`): a modal's screen, playing or at rest.
3. `FitScreen.ts`, on a modal's screen: its scale (`decideScreenScale`), drawn as the screen's size (`drawScreenSize`, `FitDraw.ts`), then the view's place (`decideScreenPlace`).
4. `FitResting.ts`, otherwise: where the popups go (`decidePopups`).
5. `FitPlaying.ts`, while playing: the view drawn out for what opened (`decideDrawOut`), moved toward the pointer's heading (`decideHeading`, with `PointerCourse.ts`), and the cut sides (`decidePlayCut`).
6. `FitResting.ts`, at rest: what a held view must show (`measureHeld`, `FitMeasure.ts`), the scale (`decideRestingScale`), drawn into the layout (`drawLayoutScale`, `FitDraw.ts`), then the place (`decideRestingPlace`, with `HeldView.ts`).
7. `FitDraw.ts` and `ViewEasing.ts`: the cut sides and the trimmed rows (`drawCut`, `trim`), and the view eased to its place (`glideTo`, `settle`).

`FitGeometry.ts` holds the sizes and tolerances the steps share.

## Fit and motion

The scripts that play a stage are in `motion/`. Imports run one way: `motion/` may import `fit/`, and `fit/` never imports `motion/` (ESLint rejects it, [apps/site/AGENTS.md](../../AGENTS.md)). A script registers what it acts on and where its pointer heads in `motion/MustShow.ts`; the fit reads that as a `StageScript` through a `ScriptReader` (`FitKind.ts`), which the figures pass in (`figures/StageScript.ts`).

## Words

The comments in this folder use these words as defined here.

- **picture**: what a tile or a figure shows, rendered in its canvas.
- **stage**: the box the picture is shown in.
- **canvas**: the box the picture lays out in; the fit moves and scales it into place.
- **crop**: the box around a tile's canvas. It clips the canvas at the stage and fades it out at its bottom (`figures/TileStage.tsx`).
- **view**: where the canvas is drawn in its stage: the canvas point at the stage's middle, the scale, and where it is easing to (`ViewEasing.ts`).
- **framed**: the view a resting picture was placed at, with what it was measured as then. The picture keeps that view while only its popups move (`holdsFrame`, `HeldView.ts`).
- **still**, **at rest**: a tile that is not playing, and what it shows then.
- **playing**: the tile's script runs, on hover or by itself.
- **shown** (`data-fitted`): set once the first fit has held still; the picture then fades in.
- **what it paints**: the boxes that show something of their own, such as a fill, an edge or text, as opposed to boxes that only lay out others (`shownBoxes`, `PaintedBoxes.ts`, built on dev mode's `paintsOf`).
- **the script**: what a tile's animation tells its fit (`StageScript`): the elements it acts on, which the view keeps in view (it **names** them), where its pointer heads now (the **heading**), and all the points it heads to over the script (the **course**).
- **held view**: a tile whose still is written as its largest state, such as a picker resting open. It keeps its view while it plays, framed once on its still.
- **draw out**: while a tile plays, move its view and draw it smaller, once, so what it opened fits.
- **cut**: the sides at which a picture reaches past its stage (`data-cut`), where it fades out.
- **trimmed**: the rows past the crop's bottom, hidden whole (`trimRows`, `FitDraw.ts`).
- **popup**: what opens in a picture's overlay layer.
- **overlay**: a tile that is itself an overlay, such as a notification, drawn at the overlays' scale.
- **modal**: a dialog, a sheet or a command palette over its backdrop. Its screen is the stage (`FitScreen.ts`).
- **kept**: what one fit decides that the next fit reads (`kept`, `useFit.ts`).
