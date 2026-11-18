import type { DeviceKind } from '../../documentation/DocumentationTypes';
import { remPixels } from '../../shared/Lengths';
import type { Box } from '../FitGeometry';
import type { Aim, ScriptReader } from '../FitKind';
import {
  deviceNeeds,
  deviceScale,
  placeDevice,
  pointRoomPx,
  type DeviceFit,
  type DeviceRead,
  type Held,
} from './DeviceFit';

function pointBox(row: Element, scale: number, { selector, x, y }: Aim): Box | undefined {
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
    left: left - pointRoomPx / 2,
    top: top - pointRoomPx / 2,
    right: left + pointRoomPx,
    bottom: top + pointRoomPx,
  };
}

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
          left: (box.left - own.left) / scale - pointRoomPx,
          top: (box.top - own.top) / scale - pointRoomPx,
          right: (box.right - own.left) / scale + pointRoomPx,
          bottom: (box.bottom - own.top) / scale + pointRoomPx,
        };
      }),
  );
}

const mostWordsMeasured = 800;

function wordBoxes(row: Element, scale: number): Box[] {
  const own = row.getBoundingClientRect();
  const range = document.createRange();
  const words: Box[] = [];
  const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
  for (
    let node = walker.nextNode();
    node && words.length < mostWordsMeasured;
    node = walker.nextNode()
  ) {
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

export interface DeviceFitting {
  kind: DeviceKind;
  stage: HTMLElement;
  box: HTMLElement;
  row: HTMLElement;
  root: Element | null;
  readScript: ScriptReader['read'];
  view: { x: number; y: number };
  held: Held;
}

function readDevice({ kind, stage, box, row }: DeviceFitting): DeviceRead {
  const rem = remPixels();
  const small = parseFloat(getComputedStyle(row).getPropertyValue('--env-font-size-body-sm'));
  const host = stage.closest('.site-live-example');
  const hostStyle = host && getComputedStyle(host);
  return {
    kind,
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

export function deviceFit(f: DeviceFitting, fromMutation: boolean): DeviceFit | null {
  const scaled = deviceScale(readDevice(f));
  if (!scaled) return null;
  const { width, height, scale, room } = scaled;
  const { row, root } = f;
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
