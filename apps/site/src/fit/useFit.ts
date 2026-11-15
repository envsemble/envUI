import { useLayoutEffect, useRef, type RefObject } from 'react';
import {
  drawCut,
  drawLayoutScale,
  drawScreenSize,
  markRunsOn,
  trim,
  type Placement,
} from './FitDraw';
import {
  cropped,
  fitModeOf,
  type FitKind,
  type Moment,
  type ScriptReader,
  type StageScript,
} from './FitKind';
import { measure, measureHeld, shapeOf, stageSize, type Measured, type Seen } from './FitMeasure';
import { decideDrawOut, decideHeading, decidePlayCut, startRun, type Run } from './FitPlaying';
import {
  decidePopups,
  decideRestingPlace,
  decideRestingScale,
  type Popups,
  type WholeFor,
} from './FitResting';
import { decideScreenPlace, decideScreenScale, modal, modalNeeds } from './FitScreen';
import { holdsFrame, type Follow, type Framed } from './HeldView';
import { settling, shownBoxes, type Shown } from './PaintedBoxes';
import { remeasure } from '../shared/Remeasure';
import { glideTo, newView, settle, type View } from './ViewEasing';

interface Kept {
  screen: boolean;
  framed: Framed | null;
  follow: Follow;
  wholeFor: WholeFor | null;
  fadeAt: number | null;
  run: Run | null;
}

export interface Fitting {
  stage: HTMLElement;
  canvas: HTMLElement;
  kind: FitKind;
  playing: { readonly current: boolean };
  readScript: ScriptReader['read'];
  update: () => void;
  observe: (element: Element) => void;
  kept: Kept;
  view: View;
}

export interface FitOptions {
  on: boolean;
  kind: FitKind;
  playing: boolean;
  script: ScriptReader;
}

export function useFit(
  stage: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLElement | null>,
  { on, kind, playing, script }: FitOptions,
) {
  const { read, heading } = script;
  const playingNow = useRef(playing);
  const refit = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    playingNow.current = playing;
    refit.current?.();
  }, [playing]);
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const canvasElement = canvas.current;
    if (!on || !stageElement || !canvasElement) return;
    const fits = remeasure(() => fitPicture(fitting), {
      first: 'frame',
      resize: [stageElement, canvasElement],
      mutation: {
        target: canvasElement,
        options: {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class', 'hidden'],
        },
        counts: (records) => {
          const nodesAddedOrRemoved = records.some((record) => record.type === 'childList');
          const onlySettledChangesCount = kind.tile && playingNow.current;
          if (onlySettledChangesCount && !nodesAddedOrRemoved) return false;
          return nodesAddedOrRemoved || records.some((record) => record.target !== canvasElement);
        },
      },
      events: [
        { target: canvasElement, types: ['transitionend', 'animationend', heading] },
        { target: window, types: ['resize'] },
      ],
      fonts: true,
    });
    refit.current = fits.update;
    const fitting: Fitting = {
      stage: stageElement,
      canvas: canvasElement,
      kind,
      playing: playingNow,
      readScript: read,
      update: fits.update,
      observe: fits.observe,
      kept: {
        screen: false,
        framed: null,
        follow: { count: 0, following: false },
        wholeFor: null,
        fadeAt: null,
        run: null,
      },
      view: newView(),
    };
    const { view } = fitting;
    const scrolled = ({ target }: Event) => {
      if (target instanceof Element) markRunsOn([target]);
    };
    canvasElement.addEventListener('scroll', scrolled, true);
    return () => {
      fits.stop();
      canvasElement.removeEventListener('scroll', scrolled, true);
      for (const property of [
        'inline-size',
        'block-size',
        'min-block-size',
        '--catalogue-canvas-scale',
      ])
        canvasElement.style.removeProperty(property);
      canvasElement.parentElement?.style.removeProperty('--catalogue-crop-top');
      cancelAnimationFrame(view.frame);
      refit.current = null;
    };
  }, [stage, canvas, on, kind, read, heading]);
}

function fitPicture(f: Fitting) {
  const { canvas, kind, kept } = f;
  const script = f.readScript(canvas);
  const moment: Moment = {
    playing: f.playing.current,
    shown: canvas.dataset.fitted !== undefined,
  };
  if (kept.run && !moment.playing) kept.run = null;
  const growsDown = script.fromTop;
  if (canvas.hasAttribute('data-from-top') !== growsDown)
    canvas.toggleAttribute('data-from-top', growsDown);
  const boxes = shownBoxes(canvas);
  if (!boxes.length) return;
  if (!moment.playing)
    for (const region of canvas.querySelectorAll<HTMLElement>('[data-catalogue-runs-on]'))
      delete region.dataset.catalogueRunsOn;
  const restingTileStillMoving =
    kind.tile &&
    !moment.playing &&
    moment.shown &&
    boxes.some(({ element }) => settling(element, canvas));
  if (restingTileStillMoving) {
    trim(f);
    return;
  }
  const seen: Seen = {
    boxes,
    moment,
    growsDown,
    shape: moment.playing ? null : shapeOf(f.stage, canvas, boxes),
  };
  if (seen.shape && moment.shown && kept.framed) {
    const held = holdsFrame(kept.framed.shape, seen.shape, kept.follow);
    kept.follow = held.follow;
    if (held.holds) return holdFrame(f, kept.framed, seen);
  }
  frame(f, seen, script);
}

function holdFrame(f: Fitting, framed: Framed, seen: Seen) {
  const { view } = f;
  f.kept.fadeAt = framed.fadeAt;
  drawCut(f, { cut: framed.cut ?? '', played: false });
  if (view.toX !== framed.toX || view.toY !== framed.toY || view.toScale !== framed.scale)
    settleFramed(f, framed, seen);
}

function frame(f: Fitting, seen: Seen, script: StageScript) {
  const { stage, canvas, kind, kept } = f;
  const { boxes, moment } = seen;
  const measured = measure(f, boxes, script);
  if (cropped(kind) && measured.popup && !moment.shown) canvas.dataset.popup = '';
  const fittedOnStill = !moment.playing || !moment.shown;
  const showsModalScreen =
    kind.scale === 'own' && kind.tile && fittedOnStill && canvas.querySelector(modal) !== null;
  if (showsModalScreen) kept.screen = true;
  if (!moment.playing) kept.fadeAt = null;
  const mode = fitModeOf(kind, kept.screen, moment);
  if (mode === 'screen') return fitScreen(f, seen, script, measured);
  const popups = decidePopups(stageSize(stage), kind, measured, script, {
    shown: moment.shown,
    wholeFor: kept.wholeFor,
  });
  kept.wholeFor = popups.wholeFor;
  if (mode === 'playing') return fitPlaying(f, boxes, script, measured);
  fitResting(f, seen, script, measured, popups);
}

function fitScreen(f: Fitting, seen: Seen, script: StageScript, measured: Measured) {
  const { stage, canvas, view, kept } = f;
  const { moment } = seen;
  const screen = decideScreenScale(stageSize(stage), measured, modalNeeds(canvas), {
    played: moment.playing && moment.shown ? canvas.offsetHeight : null,
    rest: view.rest,
  });
  if (!screen.plays) drawScreenSize(f, screen.scale, screen.tall);
  const placement = decideScreenPlace(f, script, seen.boxes, screen, {
    toY: view.toY,
    fadeAt: kept.fadeAt,
    playing: moment.playing,
  });
  draw(f, seen, placement);
}

function fitPlaying(f: Fitting, boxes: Shown[], script: StageScript, { scales }: Measured) {
  const { stage, canvas, kept, view } = f;
  const drawn = decideDrawOut(
    f,
    script,
    boxes,
    scales,
    kept.run ?? startRun(boxes, view, canvas.dataset.cut),
    view,
  );
  kept.run = drawn.run;
  if (drawn.run.pending) f.update();
  if (drawn.target) glideTo(f, drawn.target);
  if (!script.holdsView) {
    const headed = decideHeading(f, script, view);
    if (headed) glideTo(f, headed);
  }
  const { cut, run } = decidePlayCut(stageSize(stage), boxes, kept.run, view, script.holdsView);
  kept.run = run;
  drawCut(f, { cut, played: true });
  for (const { element } of boxes) f.observe(element);
}

function fitResting(
  f: Fitting,
  seen: Seen,
  script: StageScript,
  measured: Measured,
  popups: Popups,
) {
  const { stage, canvas, kind, view, kept } = f;
  const held = measureHeld(f, measured, script);
  const scale = decideRestingScale(stageSize(stage), kind, measured, popups, held, script, {
    playing: seen.moment.playing,
    rest: view.rest,
    laidOut: canvas.dataset.popup !== undefined,
  });
  drawLayoutScale(canvas, scale);
  const placement = decideRestingPlace(f, script, seen, measured, popups, held, scale, {
    view,
    fadeAt: kept.fadeAt,
    played: kept.run !== null,
  });
  draw(f, seen, placement);
}

function draw(f: Fitting, seen: Seen, placement: Placement) {
  f.kept.fadeAt = placement.fadeAt;
  drawCut(f, placement);
  settleFramed(f, placement, seen);
}

function settleFramed(
  f: Fitting,
  at: { scale: number; toX: number; toY: number },
  { boxes, shape }: Seen,
) {
  const { playing, canvas, kept } = f;
  const { scale, toX, toY } = at;
  settle(f, at, { boxes });
  if (playing.current || !shape) return;
  kept.follow = { count: kept.follow.following ? kept.follow.count : 0, following: false };
  kept.framed = { shape, scale, toX, toY, cut: canvas.dataset.cut, fadeAt: kept.fadeAt };
}
