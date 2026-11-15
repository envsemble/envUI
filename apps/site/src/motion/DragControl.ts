import { chainOf, hitAt, type Aimed, type Point, type PointerSpot } from './pointer/PointerTargets';

export interface CarriedFile {
  name: string;
  type: string;
  size?: number;
}

const picturePx = 96;
const markRadiusPx = 26;

function pictureOf(type: string, scope: Element) {
  if (!/^image\/(png|jpeg|webp)$/.test(type)) return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = picturePx;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const style = getComputedStyle(scope);
  const color = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  context.fillStyle = color('--env-color-bg-selected', '#dde3f0');
  context.fillRect(0, 0, picturePx, picturePx);
  context.fillStyle = color('--env-color-bg-primary-emphasis', '#3557c0');
  context.beginPath();
  context.arc(picturePx / 2, picturePx / 2, markRadiusPx, 0, 2 * Math.PI);
  context.fill();
  const [, data = ''] = canvas.toDataURL(type).split(',');
  return Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
}

export class DragControl {
  private carried: DataTransfer | null = null;

  constructor(private readonly spot: PointerSpot) {}

  get carrying() {
    return Boolean(this.carried);
  }

  get names() {
    return this.carried ? [...this.carried.files].map((file) => file.name) : [];
  }

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

  drop() {
    const target = this.spot.over[0];
    if (!this.carried || !target) return;
    this.sendDrag(target, 'drop');
    this.carried = null;
    this.spot.over = [];
    this.spot.drawCursor();
  }

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

  leave() {
    for (const element of this.spot.over) this.sendDrag(element, 'dragleave');
    this.carried = null;
    this.spot.over = [];
    this.spot.at = null;
    this.spot.drawCursor();
  }
}
