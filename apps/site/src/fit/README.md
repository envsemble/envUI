# fit

Drawing a tile's or a figure's picture to fit its stage. Each fitter measures what it shows and sets what follows, and measures again as anything that changes it does through the site's shared measuring loop (`remeasure`, [`shared/Remeasure.ts`](../shared/Remeasure.ts)).

## The fitters

| What is fitted                                                                     | Fitter                                                                                                        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| A gallery's tile, a page's own tile, and an example's or a specimen's picture      | `useFit.ts`, by its `FitKind` (`FitKind.ts`), deciding in `FitScreen.ts`, `FitPlaying.ts` and `FitResting.ts` |
| An application's tile, which fills its card                                        | `standalone/useAppFit.ts`                                                                                     |
| A device figure: a phone or a window around its example                            | `standalone/useDeviceFit.ts`, deciding in `standalone/DeviceFit.ts`                                           |
| An Adapting to width figure's frames, and an anatomy figure's subject from a width | `standalone/WidthFit.tsx`                                                                                     |
| An open example's room for the overlays it rests open on                           | `standalone/OverlayRoom.ts`                                                                                   |
| A do or don't figure's example, also as its animated specimen plays it             | `standalone/useVerdictFit.ts`                                                                                 |

The standalone fitters differ from `useFit` in what they measure and set, not only in how they choose a scale: an application's tile lays its canvas out over the card at a set scale and measures nothing it shows; a device figure draws its device at a scale, and a view of its screen, that keep what the figure needs whole and cut its edges between words, rendered through React state; the width figures draw a frame of a given width smaller; an open example grows its room for what opens; a do or don't figure grows the box its example lays out in.

The motion that plays a stage is in `motion/`, which tells the fit where its pointer heads (`StageScript`).

## Words

- **picture**: what a tile or a figure shows, rendered in its canvas. **stage**: the box it is shown in. **canvas**: the box the picture lays out in, moved and scaled to its place. **crop**: the box around a tile's canvas, which clips it at the stage and fades out at its foot (`figures/TileStage.tsx`).
- **view**: where the canvas is drawn in its stage, the point it centres and its scale, and where it eases to (`ViewEasing.ts`). **Framed**: the view a resting picture was placed at, with what it was measured as then, which it holds while only its popups move (`holdsFrame`, `HeldView.ts`).
- **still**, **at rest**: a tile that isn't playing, and what it shows then. **playing**: its script runs, on hover or by itself. **Shown** (`data-fitted`): once its first fit has held, it fades in.
- **what it paints**: the boxes that show something of their own, such as a fill, an edge or text, rather than boxes that only lay others out (`shownBoxes`, `PaintedBoxes.ts`, on dev mode's `paintsOf`).
- **the script**: what a tile's animation tells its fit (`StageScript`): what it acts on, which the view keeps in view (it **names** them), where its pointer heads now (**heading**) and over the whole script (**course**). **A held view**: a tile whose still is written as its largest state, such as a picker resting open, holds its view as it plays, framed once on its still.
- **drawn out**: a playing tile's view moved and drawn smaller, once, so what it opened fits.
- **cut**: the sides a picture reaches past its stage at (`data-cut`), where it fades out. **trimmed**: the rows past the crop's foot hidden whole (`trimRows`, `FitDraw.ts`).
- **popup**: what opens in a picture's overlay layer. **overlay**: a tile that is one, such as a notification, drawn at the overlays' scale. **modal**: a dialog, a sheet or a palette over its backdrop, whose screen is the stage (`FitScreen.ts`).
- **kept**: what one fit decides that the next goes by (`kept`, `useFit.ts`).
