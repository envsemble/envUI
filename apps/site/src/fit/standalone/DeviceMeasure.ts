/*
 * Reads a device figure's stage and screen from the page for its fit (useDeviceFit.ts), boxes in
 * the device's own px from its top left corner, and decides the fit from them (DeviceFit.ts).
 */
import type { DeviceKind } from '../../documentation/DocumentationTypes';
import { remPixels } from '../../shared/Lengths';
import type { Box } from '../FitGeometry';
import type { Aim, ScriptReader } from '../FitKind';
import {
  deviceNeeds,
  deviceScale,
  placeDevice,
  pointRoom,
  type DeviceFit,
  type DeviceRead,
  type Held,
} from './DeviceFit';

/**
 * The box, in the device's own px, around a point the pointer heads to, with pointRoom around it;
 * undefined when no matching element is visible.
 */
function pointBox(row: Element, scale: number, { selector, x, y }: Aim): Box | undefined {
  // The first visible match: a closed pane may keep its parts in the page, hidden.
  const element = [...row.querySelectorAll(selector)].find(
    (candidate) =>
      candidate.getClientRects().length > 0 &&
      candidate.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
  );
  if (!element) return undefined;
  const own = row.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  const left = (box.left - own.left + x * box.width) / scale;
  const top = (box.top - own.top + y * box.height) / scale;
  return {
    left: left - pointRoom / 2,
    top: top - pointRoom / 2,
    right: left + pointRoom,
    bottom: top + pointRoom,
  };
}

/**
 * The boxes, in the device's own px, of the elements a figure names to keep in view (useMustShow).
 * Each box is around the element's content, such as a value's text rather than its whole row,
 * grown by pointRoom so it clears the fade of a cut edge.
 */
function namedBoxes(row: Element, scale: number, selectors: readonly string[]): Box[] {
  const own = row.getBoundingClientRect();
  const range = document.createRange();
  return selectors.flatMap((selector) =>
    [...row.querySelectorAll(selector)]
      .filter((element) => element.getClientRects().length > 0)
      .map((element) => {
        range.selectNodeContents(element);
        const box = range.getBoundingClientRect();
        return {
          left: (box.left - own.left) / scale - pointRoom,
          top: (box.top - own.top) / scale - pointRoom,
          right: (box.right - own.left) / scale + pointRoom,
          bottom: (box.bottom - own.top) / scale + pointRoom,
        };
      }),
  );
}

/**
 * The box of each visible word on the screen, in the device's own px, from its top left corner.
 * Stops after 800 words.
 */
function wordBoxes(row: Element, scale: number): Box[] {
  const own = row.getBoundingClientRect();
  const range = document.createRange();
  const words: Box[] = [];
  const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node && words.length < 800; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent?.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    for (const word of (node.textContent ?? '').matchAll(/\S+/g)) {
      range.setStart(node, word.index);
      range.setEnd(node, word.index + word[0].length);
      for (const box of range.getClientRects())
        if (box.width >= 1 && box.height >= 1)
          words.push({
            left: (box.left - own.left) / scale,
            top: (box.top - own.top) / scale,
            right: (box.right - own.left) / scale,
            bottom: (box.bottom - own.top) / scale,
          });
    }
  }
  return words;
}

/** A device stage's elements, read by its fit, and what the fit keeps between runs. */
export interface DeviceFitting {
  kind: DeviceKind;
  stage: HTMLElement;
  /** The box the view is drawn in, and the row inside it that holds the device at its own size. */
  box: HTMLElement;
  row: HTMLElement;
  /** The animated figure's root, whose pointer's points the view keeps in view; null if none. */
  root: Element | null;
  /** Reads the script of the figure's picture (StageScript). */
  readScript: ScriptReader['read'];
  /** Where the view starts, in the device's own px. */
  view: { x: number; y: number };
  /** What the fit keeps between runs (Held). */
  held: Held;
}

/** What a device's scale is decided from (DeviceRead), read from its stage, box and row. */
function readDevice({ kind, stage, box, row }: DeviceFitting): DeviceRead {
  const rem = remPixels();
  const small = parseFloat(getComputedStyle(row).getPropertyValue('--env-font-size-body-sm'));
  const host = stage.closest('.site-live-example');
  const hostStyle = host && getComputedStyle(host);
  return {
    kind,
    // offsetWidth and offsetHeight are the row's own size, before its scale transform.
    width: row.offsetWidth,
    height: row.offsetHeight,
    room: stage.clientWidth,
    most:
      parseFloat(getComputedStyle(stage).getPropertyValue('--site-device-most')) * rem || Infinity,
    fade: (parseFloat(getComputedStyle(box).getPropertyValue('--site-device-fade')) || 0) * rem,
    smallText: small ? small * rem : 0,
    pad: {
      start: hostStyle ? parseFloat(hostStyle.paddingLeft) || 0 : 0,
      end: hostStyle ? parseFloat(hostStyle.paddingRight) || 0 : 0,
    },
  };
}

/**
 * Decides a device's fit in its stage (DeviceFit), or null before it has a size. `fromMutation`
 * is true when only mutations or events (not a resize) caused this run. The screen's words are
 * measured again on a resize, or when a mutation changes the screen's state (deviceNeeds), not on
 * every mutation the figure's play causes.
 */
export function deviceFit(f: DeviceFitting, fromMutation: boolean): DeviceFit | null {
  const scaled = deviceScale(readDevice(f));
  if (!scaled) return null;
  const { width, height, scale, room } = scaled;
  const { row, root } = f;
  // The scale the row is drawn at now; its points are measured at this scale.
  const drawn = row.getBoundingClientRect().width / width || scale;
  const size = `${width}x${height}@${scale}@${room}`;
  if (f.held.size !== size) f.held = { size };
  const { held } = f;
  const script = root && f.readScript(root);
  const heading = script?.heading;
  const needs = deviceNeeds(
    held,
    script ? script.course.map((point) => pointBox(row, drawn, point)) : [],
    script ? namedBoxes(row, drawn, script.anywhere) : [],
    heading ? pointBox(row, drawn, heading) : undefined,
  );
  if (!held.words || !fromMutation || held.state !== needs.state)
    held.words = wordBoxes(row, drawn);
  return placeDevice(f.kind, scaled, { ...needs, words: held.words }, held, f.view);
}
