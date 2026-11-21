import { PointerSelection } from './VirtualSelection';
import { PointerCursor } from './PointerCursor';
import { mirrorPointerStates } from './PointerStates';
import { hitAt, type Aimed, type Point, type PointerSpot } from './PointerTargets';
import { holdReaderMoves, PointerControl } from './PointerControl';
import { KeyboardControl } from '../KeyboardControl';
import { DragControl, type CarriedFile } from '../DragControl';
import { WheelControl } from '../WheelControl';
import { captures, keyboardFocused } from '../BrowserStandIns';
import { pixelTolerance } from '../../shared/Remeasure';

const idsClearOfRealPointers = 9000;
let nextId = idsClearOfRealPointers;

export class VirtualPointer {
  readonly id = nextId++;
  private readonly spot: PointerSpot;
  private readonly selection: PointerSelection;
  private readonly pointer: PointerControl;
  private readonly keyboard: KeyboardControl;
  private readonly drag: DragControl;
  private readonly wheel: WheelControl;

  private scopeAt: Point | null = null;

  private readonly followScroll = () => {
    const at = this.spot.at;
    const from = this.scopeAt;
    if (!at || !from) return;
    const box = this.scope.getBoundingClientRect();
    const [dx, dy] = [box.left - from.x, box.top - from.y];
    if (Math.abs(dx) < pixelTolerance && Math.abs(dy) < pixelTolerance) return;
    this.moveTo({ x: at.x + dx, y: at.y + dy });
  };

  private readonly cursor: PointerCursor;
  private cursorShown = false;

  constructor(private readonly scope: Element) {
    document.addEventListener('scroll', this.followScroll, { capture: true, passive: true });
    holdReaderMoves();
    captures.set(this.id, null);
    mirrorPointerStates();
    this.selection = new PointerSelection(scope);
    this.cursor = new PointerCursor(scope);
    const keyboard = new KeyboardControl(scope, this.selection);
    this.spot = {
      scope,
      at: null,
      over: [],
      get modifiers() {
        return keyboard.modifiers;
      },
      moveTo: (point) => this.moveTo(point),
      noteScope: () => {
        const box = this.scope.getBoundingClientRect();
        this.scopeAt = { x: box.left, y: box.top };
        if (this.cursorShown) this.cursor.note();
      },
      drawCursor: () => this.drawCursor(),
    };
    this.keyboard = keyboard;
    this.pointer = new PointerControl(this.id, this.spot, keyboard, this.selection);
    this.drag = new DragControl(this.spot);
    this.wheel = new WheelControl(this.spot);
  }

  showCursor(on: boolean) {
    this.cursorShown = on;
    this.drawCursor();
  }

  private drawCursor() {
    if (this.cursorShown)
      this.cursor.place(this.spot.at, this.pointer.buttons > 0, this.drag.names);
    else this.cursor.remove();
  }

  carry(files: readonly CarriedFile[]) {
    if (!this.drag.carrying) this.pointer.unhover();
    this.drag.carry(files);
  }

  drop() {
    this.drag.drop();
  }

  aim(point: Point): Aimed | null {
    if (!this.drag.carrying && this.pointer.rests(point)) return null;
    return { point, target: hitAt(this.scope, point) };
  }

  moveTo(point: Point, aimed: Aimed | null = null) {
    if (this.drag.carrying) this.drag.moveTo(point, aimed);
    else this.pointer.moveTo(point, aimed);
  }

  suspend() {
    this.pointer.suspend();
  }

  resume() {
    return this.pointer.resume();
  }

  get canPress() {
    return this.pointer.canPress;
  }

  press(button: 0 | 2 = 0) {
    this.pointer.press(button);
  }

  release() {
    this.pointer.release();
  }

  type(selector: string, text: string | null) {
    this.keyboard.type(selector, text);
  }

  keyboardFocus(selector: string | Element | null) {
    this.keyboard.keyboardFocus(selector);
  }

  key(key: string, selector?: string) {
    this.keyboard.key(key, selector);
  }

  keyDown(key: string, selector?: string) {
    this.keyboard.keyDown(key, selector);
  }

  keyUp(key: string, selector?: string) {
    this.keyboard.keyUp(key, selector);
  }

  startWheel(axis: 'x' | 'y') {
    this.wheel.start(axis);
  }

  turnWheel(distance: number) {
    this.wheel.to(distance);
  }

  endWheel() {
    this.wheel.end();
  }

  leave() {
    this.keyboard.releaseKeys();
    if (this.drag.carrying) return this.drag.leave();
    this.pointer.release();
    this.pointer.unhover();
    this.spot.at = null;
    this.drawCursor();
  }

  get present() {
    return Boolean(this.spot.at);
  }

  get down() {
    return Boolean(this.pointer.buttons);
  }

  dispose() {
    document.removeEventListener('scroll', this.followScroll, { capture: true });
    this.wheel.end();
    keyboardFocused.delete(this.scope);
    this.keyboard.focus(null);
    this.leave();
    this.selection.clear();
    this.cursor.remove();
    captures.delete(this.id);
  }
}

export const isVirtual = (event: { pointerId?: number }) =>
  event.pointerId !== undefined && captures.has(event.pointerId);
