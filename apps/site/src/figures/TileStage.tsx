import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Theme, useTheme } from '@envsemble/envui';
import { IconArticle } from '@envsemble/envui/icons/Article';
import { Playback, StageOverlays } from '../motion/Playback';
import { useDisplaySettings } from '../display/useDisplaySettings';
import { ExampleRender } from './LiveExample';
import { FoundationTile } from '../tiles/foundations/FoundationTiles';
import type { TilePicture } from '../tiles/TilePictures';
import { TileSkeleton } from '../loading/Skeletons';
import { useLoaded } from '../loading/LoadOnce';
import { cropped, fitKindOf } from '../fit/FitKind';
import { useFit } from '../fit/useFit';
import { DeviceFrame } from './DeviceFrame';
import { useAppFit } from '../fit/standalone/useAppFit';
import { stageScript } from './StageScript';
import { flag } from '../shared/Attributes';
import { useBrowserStandIns } from '../motion/BrowserStandIns';

class TileBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function TileStage({
  picture,
  near,
  playing = false,
  className = 'catalogue-tile-stage',
  ownFrame = false,
}: {
  picture?: TilePicture;
  near: boolean;
  playing?: boolean;
  className?: string;
  ownFrame?: boolean;
}) {
  useBrowserStandIns();
  const theme = useTheme();
  const { motionPaused } = useDisplaySettings();
  const plays = playing && !motionPaused;
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
  const tile = useLoaded(near ? picture?.tile?.() : undefined);
  const Composition = tile?.default;
  const tileWindow = tile?.tileWindow;
  const width = tileWindow?.width;
  const nearing = Boolean(picture && near);
  const shown = nearing && (!picture?.tile || Boolean(tile));
  const [animations, setAnimations] = useState(0);
  const [countAnimation] = useState(() => () => {
    setAnimations((count) => count + 1);
    return () => setAnimations((count) => count - 1);
  });
  const subject =
    picture &&
    (Composition ? (
      <TileBoundary>
        <Suspense fallback={null}>
          <Playback
            playing={plays}
            rest="start"
            root={canvasElement}
            countAnimation={countAnimation}
            redraw
          >
            <Composition />
          </Playback>
        </Suspense>
      </TileBoundary>
    ) : picture.foundation ? (
      <FoundationTile id={picture.foundation} />
    ) : (
      <ExampleRender page={picture.page} name={picture.name} fallback={null} />
    ));
  const app = tileWindow?.app;
  const kind = fitKindOf(
    { tile: Boolean(picture?.tile), window: width === undefined ? undefined : { width } },
    !app && ownFrame,
  );
  const ownSize = kind.scale === 'own';
  useFit(stage, canvas, { on: shown && !app, kind, playing: plays, script: stageScript });
  useAppFit(stage, canvas, shown && Boolean(app), app?.least);
  useStillAtRest(canvasElement, kind.tile && !plays);
  return (
    <Theme
      {...theme}
      scale={kind.tile ? 'compact' : theme.scale}
      ref={stage}
      className={className}
      data-example={picture?.foundation || picture?.tile ? undefined : picture?.name}
      data-catalogue-specimen={picture?.foundation}
      data-stage={picture?.stage}
      data-empty={flag(!picture)}
      data-playing={flag(plays)}
      data-still={flag(!(picture?.tile && animations > 0))}
    >
      {!picture ? (
        <IconArticle className="catalogue-tile-placeholder" aria-hidden />
      ) : (
        shown &&
        crop(
          cropped(kind),
          <div
            ref={(element) => {
              canvas.current = element;
              setCanvasElement(element);
            }}
            className="catalogue-tile-canvas"
            data-tile={flag(picture.tile)}
            data-own-size={flag(ownSize)}
            data-overlay={flag(ownSize && tileWindow?.overlay)}
            data-app={flag(app)}
            style={
              tileWindow && {
                '--catalogue-tile-width': width === undefined ? undefined : `${width}rem`,
                '--catalogue-tile-height':
                  tileWindow.height === undefined ? undefined : `${tileWindow.height}rem`,
                '--catalogue-own-popup-least': tileWindow.popupLeast,
              }
            }
            inert
            aria-hidden
          >
            {picture.open ? (
              <StageOverlays>{wrapApp(Boolean(app), subject)}</StageOverlays>
            ) : (
              wrapApp(Boolean(app), subject)
            )}
          </div>,
        )
      )}
      {nearing && <TileSkeleton />}
    </Theme>
  );
}

const crop = (ownSize: boolean, canvas: ReactNode) =>
  ownSize ? <div className="catalogue-tile-crop">{canvas}</div> : canvas;

const wrapApp = (app: boolean, subject: ReactNode) =>
  app ? (
    <DeviceFrame kind="window" fill>
      {subject}
    </DeviceFrame>
  ) : (
    subject
  );

const loops = (animation: Animation) =>
  animation.effect?.getComputedTiming().iterations === Infinity;

function useStillAtRest(canvas: HTMLElement | null, resting: boolean) {
  useEffect(() => {
    if (!canvas) return;
    const looping = () => canvas.getAnimations({ subtree: true }).filter(loops);
    if (!resting) {
      for (const animation of looping()) animation.play();
      return;
    }
    const pause = () => {
      for (const animation of looping()) animation.pause();
    };
    pause();
    canvas.addEventListener('animationstart', pause);
    const changes = new MutationObserver(pause);
    changes.observe(canvas, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => {
      canvas.removeEventListener('animationstart', pause);
      changes.disconnect();
    };
  }, [canvas, resting]);
}
