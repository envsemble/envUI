/*
 * The reader that tells a fit what a playing stage's script does (StageScript, fit/FitKind.ts).
 * The script registers what it acts on and where its pointer heads in motion/MustShow.ts. fit/
 * does not import motion/, so the figures that fit a playing stage pass this reader in:
 * TileStage.tsx to useFit and DeviceFrame.tsx to useDeviceFit.
 */
import type { ScriptReader } from '../fit/FitKind';
import {
  courseOf,
  headingEvent,
  headingOf,
  holdsFromTop,
  holdsView,
  mustShowOf,
} from '../motion/MustShow';
import { aimedElement } from '../motion/pointer/PointerPlan';
import { narrowGallery } from '../tiles/Tiles';

/** Reads a stage's script from the stage's root element, and names the event of a new heading. */
export const stageScript: ScriptReader = {
  read: (root) => ({
    holdsView: holdsView(root),
    fromTop: holdsFromTop(root),
    named: mustShowOf(root),
    anywhere: mustShowOf(root, true),
    heading: headingOf(root),
    course: courseOf(root),
    aimed: (selector) => aimedElement(root, selector),
    narrow: matchMedia(narrowGallery).matches,
  }),
  heading: headingEvent,
};
