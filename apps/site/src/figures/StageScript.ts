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
