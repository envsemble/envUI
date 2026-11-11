import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { PortalContainer } from '@envsemble/envui';
import { makeRoom, overlays, reserveStage } from '../fit/standalone/OverlayRoom';
import { recordedSize } from '../loading/RecordedSizes';
import { remeasure } from '../shared/Remeasure';
import { sitePopupOpen } from '../motion/SitePopup';
import { press, triggerOf } from './PressTrigger';
import { flag } from '@envui-internal/internal/flag';
import { useBrowserStandIns } from '../motion/BrowserStandIns';

/**
 * How long a figure's room may wait, in ms, for overlays to rest open in before it shows anyway,
 * such as for an example that opens none.
 */
const placeWait = 600;

/**
 * Opens a live example's overlay once, as it first renders, where the example doesn't open it
 * itself: pressed open, its trigger stays what it is in the code, closed until used.
 */
function useOpenOnce(
  room: HTMLElement | null,
  layer: HTMLElement | null,
  live: boolean,
  round: number,
) {
  useLayoutEffect(() => {
    if (!live || !room || !layer) return;
    let frame = 0;
    let done = false;
    const attempt = () => {
      if (done) return;
      // The example may still be loading, or open its overlay itself, such as with defaultOpen.
      if (layer.childElementCount && overlays(layer).length) return finish();
      const trigger = triggerOf(room);
      if (!trigger) return;
      // A frame later, once the example has laid out, so its popup is placed beside it.
      frame = requestAnimationFrame(() => {
        if (done) return;
        if (!overlays(layer).length) press(trigger);
        finish();
      });
    };
    const changes = new MutationObserver(attempt);
    const finish = () => {
      done = true;
      changes.disconnect();
    };
    changes.observe(room, { childList: true, subtree: true });
    attempt();
    return () => {
      cancelAnimationFrame(frame);
      finish();
    };
  }, [room, layer, live, round]);
}

/** How long, in ms, a live example's closed overlay waits, with the reader gone, to rest open. */
const restDelay = 800;

/**
 * Brings a live example back to rest, its overlay open, once the reader has closed it and left: a
 * while after the pointer has left the example and focus is outside it, the example is drawn anew,
 * as it first rendered, and opened again (useOpenOnce), without taking focus, so an overview never
 * stays a lone trigger in an empty stage. Returns the round, which keys the example.
 */
function useRestOpen(room: HTMLElement | null, layer: HTMLElement | null, live: boolean) {
  const [round, setRound] = useState(0);
  useLayoutEffect(() => {
    if (!live || !room || !layer) return;
    let timer = 0;
    let shown = false;
    const open = () => layer.childElementCount > 0 && overlays(layer).length > 0;
    // Another popup open on the page, such as the Display menu: opening the example's own would
    // close it, so the example waits until it has closed.
    const elsewhere = sitePopupOpen;
    const away = () =>
      !room.matches(':hover') && !room.contains(document.activeElement) && !elsewhere();
    const rest = () => {
      timer = 0;
      if (open()) return;
      if (!away()) {
        // Still near it, or another popup is open: look again a while later.
        timer = window.setTimeout(rest, restDelay);
        return;
      }
      // At rest again, it keeps its focus to itself until the reader reaches for it once more.
      delete room.dataset.touched;
      shown = false;
      setRound((current) => current + 1);
    };
    const check = () => {
      if (open()) {
        shown = true;
        window.clearTimeout(timer);
        timer = 0;
        return;
      }
      if (!shown || timer) return;
      timer = window.setTimeout(rest, restDelay);
    };
    const changes = new MutationObserver(check);
    changes.observe(layer, { childList: true, subtree: true });
    room.addEventListener('pointerleave', check);
    room.addEventListener('focusout', check);
    check();
    return () => {
      window.clearTimeout(timer);
      changes.disconnect();
      room.removeEventListener('pointerleave', check);
      room.removeEventListener('focusout', check);
    };
  }, [room, layer, live]);
  return round;
}

/**
 * An example shown with its overlays open, as a picture: its dialogs, menus, tooltips and toasts
 * render into a layer of the figure through envUI's PortalContainer, contained, so they neither
 * lock the page's scroll, take focus nor close when the reader presses elsewhere, and sit inside
 * the stage, centred with what opens them. The example opens them itself, such as with
 * `defaultOpen`. The whole is inert: a picture people read, not a control they use. A `live` one,
 * a page's overview, is the component at rest open, which people can use: it isn't inert, and
 * where the example doesn't open its overlay itself, it is pressed open once as it first renders;
 * closed by the reader, it comes back to rest open once they leave it (useRestOpen).
 */
export function OpenExample({
  name,
  live = false,
  part,
  children,
}: {
  name: string;
  /** Whether people can use it, its overlay pressed open where the example doesn't open it. */
  live?: boolean;
  /**
   * The key its stage's height is recorded by in PartSizes.json, such as
   * open:dialog/ProjectDetails, which the stage keeps until the room is made for its overlays
   * (reserveStage).
   */
  part?: string;
  children: ReactNode;
}) {
  // First, so the stand-ins are in place before its overlays open (useRestOpen, useOpenOnce).
  useBrowserStandIns();
  const room = useRef<HTMLDivElement>(null);
  const [roomElement, setRoomElement] = useState<HTMLDivElement | null>(null);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const round = useRestOpen(roomElement, layer, live);
  useOpenOnce(roomElement, layer, live, round);
  // The reader reaching for it, by a pointer or the keyboard, lets it take focus from then on
  // (BrowserStandIns.ts).
  useLayoutEffect(() => {
    if (!live || !roomElement) return;
    const touch = (event: Event) => {
      if (event.isTrusted) roomElement.dataset.touched = '';
    };
    const kinds = ['pointerdown', 'keydown', 'focusin'] as const;
    for (const kind of kinds) roomElement.addEventListener(kind, touch, true);
    return () => {
      for (const kind of kinds) roomElement.removeEventListener(kind, touch, true);
    };
  }, [live, roomElement]);
  useLayoutEffect(() => {
    const roomElement = room.current;
    if (!roomElement || !layer) return;
    let timer = 0;
    // The figure shows once its room is made for its overlays resting open, fading in, so nothing
    // in it moves as it appears (Stage.css): or a while after its example has loaded, whatever
    // they do. While the example loads, its skeleton shows in the room.
    // Shown before its room is made, after the wait, the stage keeps its recorded height until the
    // room is made, so the room growing for its overlays then moves nothing outside it.
    const reserved = reserveStage(
      roomElement,
      part === undefined ? undefined : recordedSize(part)?.[1],
    );
    const place = (made: boolean) => {
      roomElement.dataset.placed = '';
      if (made) reserved.release();
      else reserved.shown();
    };
    // The room follows the overlays as they open, are placed, come to rest and resize, and the
    // stage's width.
    const rooms = remeasure(
      () => {
        // A palette's room keeps its framing once one has opened in it, closed too (Stage.css).
        if (layer.querySelector('.env-command-palette')) roomElement.dataset.cataloguePalette = '';
        if (reserved.measured(() => makeRoom(roomElement, layer, live))) place(true);
        else if (!timer && !roomElement.querySelector('.site-loading'))
          timer = window.setTimeout(() => place(false), placeWait);
      },
      {
        first: 'frame',
        resize: [roomElement],
        mutation: {
          target: roomElement,
          options: {
            childList: true,
            subtree: true,
            attributeFilter: [
              'class',
              'style',
              'data-side',
              'hidden',
              'data-starting-style',
              'data-ending-style',
            ],
          },
        },
        events: [{ target: roomElement, types: ['transitionend', 'animationend'] }],
        fonts: true,
      },
    );
    return () => {
      rooms.stop();
      window.clearTimeout(timer);
      reserved.release();
    };
  }, [layer, live, part]);
  return (
    <div
      ref={(element) => {
        room.current = element;
        setRoomElement(element);
      }}
      className="catalogue-open-example"
      data-open-example={name}
      data-catalogue-reserve={part}
      data-live={flag(live)}
      inert={!live}
    >
      <PortalContainer container={layer} contained>
        <Fragment key={round}>{children}</Fragment>
      </PortalContainer>
      <div ref={setLayer} className="catalogue-overlay-layer" />
    </div>
  );
}
