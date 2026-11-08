/*
 * Files the pointer no one sees carries in from outside, as a drag from the desktop does
 * (VirtualPointer.ts): while it carries them, its moves are a drag, which the elements it enters,
 * leaves and is over hear, until it drops them.
 */
import { chainOf, hitAt, type Aimed, type Point, type PointerSpot } from './pointer/PointerTargets';

/** A file the pointer carries in, as from the desktop: its name, its type and its size in bytes. */
export interface CarriedFile {
  name: string;
  type: string;
  size?: number;
}

/**
 * A small picture for a carried image file, in its type where the browser can write it: a circle
 * in the theme's brand color on its selected fill, as a person's logo or photo would show.
 */
function pictureOf(type: string, scope: Element) {
  if (!/^image\/(png|jpeg|webp)$/.test(type)) return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const style = getComputedStyle(scope);
  const color = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  context.fillStyle = color('--env-color-bg-selected', '#dde3f0');
  context.fillRect(0, 0, 96, 96);
  context.fillStyle = color('--env-color-bg-primary-emphasis', '#3557c0');
  context.beginPath();
  context.arc(48, 48, 26, 0, 2 * Math.PI);
  context.fill();
  const [, data = ''] = canvas.toDataURL(type).split(',');
  return Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
}

export class DragControl {
  /** The files the pointer carries in from outside, as a drag from the desktop does. */
  private carried: DataTransfer | null = null;

  constructor(private readonly spot: PointerSpot) {}

  /** Whether the pointer carries files, so its moves are a drag. */
  get carrying() {
    return Boolean(this.carried);
  }

  /** The names of the files it carries, which its cursor shows, as a drag image does. */
  get names() {
    return this.carried ? [...this.carried.files].map((file) => file.name) : [];
  }

  /**
   * Picks up files, as a person drags them in from the desktop: its moves are a drag now. Each is
   * as large as its `size` in bytes; without one, an image is a real picture, a mark in the theme's
   * brand color, so a thumbnail of it shows something, and anything else a few bytes. Picked up again
   * before a drop, it carries them all together.
   */
  carry(files: readonly CarriedFile[]) {
    this.carried ??= new DataTransfer();
    for (const { name, type, size } of files)
      this.carried.items.add(
        new File(
          [size ? new Uint8Array(size) : (pictureOf(type, this.spot.scope) ?? 'envUI')],
          name,
          { type },
        ),
      );
    // Its cursor shows what it carries, as a drag image does.
    this.spot.drawCursor();
  }

  private sendDrag(target: Element, type: string) {
    const point = this.spot.at ?? { x: 0, y: 0 };
    return target.dispatchEvent(
      new DragEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: point.x,
        clientY: point.y,
        dataTransfer: this.carried,
      }),
    );
  }

  /** Drops the carried file where the pointer is. */
  drop() {
    const target = this.spot.over[0];
    if (!this.carried || !target) return;
    this.sendDrag(target, 'drop');
    this.carried = null;
    this.spot.over = [];
    this.spot.drawCursor();
  }

  /** Moves a carried file over the stage: the elements it enters, leaves and is over hear it. */
  moveTo(point: Point, aimed: Aimed | null) {
    const spot = this.spot;
    spot.at = point;
    spot.noteScope();
    const target = aimed?.point === point ? aimed.target : hitAt(spot.scope, point);
    const chain = chainOf(spot.scope, target);
    for (const element of spot.over.filter((item) => !chain.includes(item)))
      this.sendDrag(element, 'dragleave');
    for (const element of chain.filter((item) => !spot.over.includes(item)).reverse())
      this.sendDrag(element, 'dragenter');
    spot.over = chain;
    this.sendDrag(target, 'dragover');
    spot.drawCursor();
  }

  /** Takes the carried files off the stage: what they were over hears them leave. */
  leave() {
    for (const element of this.spot.over) this.sendDrag(element, 'dragleave');
    this.carried = null;
    this.spot.over = [];
    this.spot.at = null;
    this.spot.drawCursor();
  }
}
