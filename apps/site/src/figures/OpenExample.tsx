import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { PortalContainer } from '@envsemble/envui';
import { makeRoom, overlays, reserveStage } from '../fit/standalone/OverlayRoom';
import { recordedSize } from '../loading/RecordedSizes';
import { remeasure } from '../shared/Remeasure';
import { sitePopupOpen } from '../motion/SitePopup';
import { press, triggerOf } from './PressTrigger';
import { flag } from '../shared/Attributes';
import { useBrowserStandIns } from '../motion/BrowserStandIns';

const placeWaitMs = 600;

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
      const alreadyOpen = layer.childElementCount && overlays(layer).length;
      if (alreadyOpen) return finish();
      const trigger = triggerOf(room);
      if (!trigger) return;
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

const restDelayMs = 800;

function useRestOpen(room: HTMLElement | null, layer: HTMLElement | null, live: boolean) {
  const [round, setRound] = useState(0);
  useLayoutEffect(() => {
    if (!live || !room || !layer) return;
    let timer = 0;
    let shown = false;
    const overlayOpen = () => layer.childElementCount > 0 && overlays(layer).length > 0;
    const readerAway = () =>
      !room.matches(':hover') && !room.contains(document.activeElement) && !sitePopupOpen();
    const rest = () => {
      timer = 0;
      if (overlayOpen()) return;
      if (!readerAway()) {
        timer = window.setTimeout(rest, restDelayMs);
        return;
      }
      delete room.dataset.touched;
      shown = false;
      setRound((current) => current + 1);
    };
    const check = () => {
      if (overlayOpen()) {
        shown = true;
        window.clearTimeout(timer);
        timer = 0;
        return;
      }
      if (!shown || timer) return;
      timer = window.setTimeout(rest, restDelayMs);
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

export function OpenExample({
  name,
  live = false,
  part,
  children,
}: {
  name: string;
  live?: boolean;
  part?: string;
  children: ReactNode;
}) {
  useBrowserStandIns();
  const room = useRef<HTMLDivElement>(null);
  const [roomElement, setRoomElement] = useState<HTMLDivElement | null>(null);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const round = useRestOpen(roomElement, layer, live);
  useOpenOnce(roomElement, layer, live, round);
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
    const reserved = reserveStage(
      roomElement,
      part === undefined ? undefined : recordedSize(part)?.[1],
    );
    const place = (made: boolean) => {
      roomElement.dataset.placed = '';
      if (made) reserved.release();
      else reserved.shown();
    };
    const rooms = remeasure(
      () => {
        if (layer.querySelector('.env-command-palette')) roomElement.dataset.cataloguePalette = '';
        if (reserved.measured(() => makeRoom(roomElement, layer, live))) place(true);
        else if (!timer && !roomElement.querySelector('.site-loading'))
          timer = window.setTimeout(() => place(false), placeWaitMs);
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
