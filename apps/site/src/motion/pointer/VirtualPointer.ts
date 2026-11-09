/*
 * The virtual pointer: a pointer the reader doesn't control, which a stage's animation moves over
 * its live component. It hovers, presses, drags and releases with the same events a mouse sends, so
 * the component responds as it does to a person, with its own hover, press and drag states, rather
 * than a picture of them. The stage is inert, so only these events reach it.
 *
 * No event can set what a stylesheet shows under a real pointer, `:hover` and `:active`. So the
 * pointer marks what it is over and presses, and PointerStates.ts gives every such rule in the
 * site's stylesheets a copy for those marks. What the browser keeps only for a pointer it created,
 * such as a drag's capture, BrowserStandIns.ts keeps for it.
 *
 * VirtualPointer keeps track of where the pointer is and draws its cursor. Its controllers act on
 * the stage: as a mouse (PointerControl.ts), a keyboard (KeyboardControl.ts), a drag of files from
 * outside (DragControl.ts) and a wheel (WheelControl.ts).
 */

import { PointerSelection } from './VirtualSelection';
import { StageEditors } from './StageEditors';
import { PointerCursor } from './PointerCursor';
import { mirrorPointerStates } from './PointerStates';
import { hitAt, type Aimed, type Point, type PointerSpot } from './PointerTargets';
import { holdReaderMoves, PointerControl } from './PointerControl';
import { KeyboardControl } from '../KeyboardControl';
import { DragControl, type CarriedFile } from '../DragControl';
import { WheelControl } from '../WheelControl';
import { captures, keyboardFocused } from '../BrowserStandIns';
import { pixelTolerance } from '../../shared/Remeasure';

/** The ids of the virtual pointers count up from here, clear of a real pointer's. */
let nextId = 9000;

/** The virtual pointer over one stage's elements, `scope`. */
export class VirtualPointer {
  readonly id = nextId++;
  /** Where it is and what it is over, which its controllers share. */
  private readonly spot: PointerSpot;
  /** The stage's rich text editors, which it selects and types in. */
  private readonly editors = new StageEditors();
  /** What a drag across text selects. */
  private readonly selection: PointerSelection;
  private readonly pointer: PointerControl;
  private readonly keyboard: KeyboardControl;
  private readonly drag: DragControl;
  private readonly wheel: WheelControl;

  /** Where the stage was in the viewport when the pointer last moved over it. */
  private scopeAt: Point | null = null;

  /**
   * When the reader scrolls the page, the pointer moves with the stage, as a hand resting on it
   * would, rather than staying where it was in the window. So what it is over and drags stays the
   * same, also between the moves of its script and while it waits. A real mouse stays where it is
   * in the window, and components follow it there, such as a list's lifted row, which would
   * otherwise also stay in the window, away from its list.
   */
  private readonly followScroll = () => {
    const at = this.spot.at;
    const from = this.scopeAt;
    if (!at || !from) return;
    const box = this.scope.getBoundingClientRect();
    const [dx, dy] = [box.left - from.x, box.top - from.y];
    if (Math.abs(dx) < pixelTolerance && Math.abs(dy) < pixelTolerance) return;
    this.moveTo({ x: at.x + dx, y: at.y + dy });
  };

  /** Its cursor, drawn over its stage while it plays (PointerCursor.ts). */
  private readonly cursor: PointerCursor;
  /** Whether its cursor is drawn: while its stage plays. */
  private cursorShown = false;

  constructor(private readonly scope: Element) {
    document.addEventListener('scroll', this.followScroll, { capture: true, passive: true });
    holdReaderMoves();
    captures.set(this.id, null);
    mirrorPointerStates();
    this.selection = new PointerSelection(scope, this.editors);
    this.cursor = new PointerCursor(scope);
    const keyboard = new KeyboardControl(scope, this.selection, this.editors);
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
        // Read with the scope, before the move's events change the page.
        if (this.cursorShown) this.cursor.note();
      },
      drawCursor: () => this.drawCursor(),
    };
    this.keyboard = keyboard;
    this.pointer = new PointerControl(this.id, this.spot, keyboard, this.selection);
    this.drag = new DragControl(this.spot);
    this.wheel = new WheelControl(this.spot);
  }

  /** Draws its cursor while its stage plays, or removes it. */
  showCursor(on: boolean) {
    this.cursorShown = on;
    this.drawCursor();
  }

  /**
   * Draws its cursor where it is, pressed or not, or removes it while the pointer is off the stage.
   */
  private drawCursor() {
    if (this.cursorShown)
      this.cursor.place(this.spot.at, this.pointer.buttons > 0, this.drag.names);
    else this.cursor.remove();
  }

  /**
   * Picks up files, as a person drags them in from the desktop, so the pointer's moves become a
   * drag (DragControl.carry).
   */
  carry(files: readonly CarriedFile[]) {
    // It leaves what it hovers as the drag comes in over it: the drag's own events take over, and
    // nothing keeps its hover after the drop.
    if (!this.drag.carrying) this.pointer.unhover();
    this.drag.carry(files);
  }

  /** Drops the carried files where the pointer is. */
  drop() {
    this.drag.drop();
  }

  /**
   * What a move to a point will be over, found before the move, while the page's layout is still
   * the one the frame starts with. Nothing where the move sends no events.
   */
  aim(point: Point): Aimed | null {
    if (!this.drag.carrying && this.pointer.rests(point)) return null;
    return { point, target: hitAt(this.scope, point) };
  }

  /**
   * Moves the pointer to a point, entering the stage there if it wasn't over it. `aimed`, what aim
   * found for the point, saves reading the layout again.
   */
  moveTo(point: Point, aimed: Aimed | null = null) {
    if (this.drag.carrying) this.drag.moveTo(point, aimed);
    else this.pointer.moveTo(point, aimed);
  }

  /** Its stage is paused: a press it holds releases the page's lock (PointerControl.suspend). */
  suspend() {
    this.pointer.suspend();
  }

  /** Its stage plays again. Returns whether the pointer may continue (PointerControl.resume). */
  resume() {
    return this.pointer.resume();
  }

  /**
   * Whether this pointer may continue now: no other pointer is holding its button down on the page.
   */
  get canPress() {
    return this.pointer.canPress;
  }

  /** Presses the pointer's button where it is (PointerControl.press). */
  press(button: 0 | 2 = 0) {
    this.pointer.press(button);
  }

  /** Releases the button: the press ends, and if it ends on what it began on, it clicks. */
  release() {
    this.pointer.release();
  }

  /** Types into a field of the stage as a keyboard does (KeyboardControl.type). */
  type(selector: string, text: string | null) {
    this.keyboard.type(selector, text);
  }

  /** Moves the keyboard's focus to an element of the stage, or away from the stage. */
  keyboardFocus(selector: string | Element | null) {
    this.keyboard.keyboardFocus(selector);
  }

  /** Presses a key on an element of the stage, or on the field being typed into or focused. */
  key(key: string, selector?: string) {
    this.keyboard.key(key, selector);
  }

  /** Holds a key down, such as Alt: every event meanwhile carries its flag. */
  keyDown(key: string, selector?: string) {
    this.keyboard.keyDown(key, selector);
  }

  /** Releases a held key. */
  keyUp(key: string, selector?: string) {
    this.keyboard.keyUp(key, selector);
  }

  /** Starts turning the wheel over the element under the pointer (WheelControl.start). */
  startWheel(axis: 'x' | 'y') {
    this.wheel.start(axis);
  }

  /** Turns the wheel to `distance` px from where the turn started. */
  turnWheel(distance: number) {
    this.wheel.to(distance);
  }

  /** Ends a turn of the wheel: a box with scroll snapping snaps again. */
  endWheel() {
    this.wheel.end();
  }

  /** Takes the pointer off the stage, first releasing its button and the keys it holds. */
  leave() {
    this.keyboard.releaseKeys();
    if (this.drag.carrying) return this.drag.leave();
    this.pointer.release();
    this.pointer.unhover();
    this.spot.at = null;
    this.drawCursor();
  }

  /** Whether the pointer is over the stage. */
  get present() {
    return Boolean(this.spot.at);
  }

  /** Whether its button is pressed. */
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
    this.editors.dispose();
    this.cursor.remove();
    captures.delete(this.id);
  }
}

/** Whether an event comes from a virtual pointer, which a tile's own hover ignores. */
export const isVirtual = (event: { pointerId?: number }) =>
  event.pointerId !== undefined && captures.has(event.pointerId);
