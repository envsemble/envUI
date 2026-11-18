import { createContext, Fragment, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { PortalContainer } from '@envsemble/envui';
import { holdView, nameMustShow } from './MustShow';
import { useSitePopupOpen } from './SitePopup';

interface PlaybackValue {
  playing: boolean;
  rest: 'start' | 'hold';
  root: HTMLElement | null;
}

export const PlaybackContext = createContext<
  PlaybackValue & {
    claimRest?: () => () => void;
    countTimeline?: () => () => void;
    countAnimation?: () => () => void;
  }
>({ playing: false, rest: 'start', root: null });

export function Playback({
  playing,
  rest,
  root,
  countTimeline,
  countAnimation,
  redraw = false,
  children,
}: PlaybackValue & {
  countTimeline?: () => () => void;
  countAnimation?: () => () => void;
  redraw?: boolean;
  children: ReactNode;
}) {
  const sitePopupOpen = useSitePopupOpen();
  return (
    <PlaybackOf
      playing={playing && !sitePopupOpen}
      rest={rest}
      root={root}
      countTimeline={countTimeline}
      countAnimation={countAnimation}
      redraw={redraw}
    >
      {children}
    </PlaybackOf>
  );
}

function PlaybackOf({
  playing,
  rest,
  root,
  countTimeline,
  countAnimation,
  redraw,
  children,
}: PlaybackValue & {
  countTimeline?: () => () => void;
  countAnimation?: () => () => void;
  redraw: boolean;
  children: ReactNode;
}) {
  const [round, setRound] = useState(0);
  const [wasPlaying, setWasPlaying] = useState(playing);
  const claims = useRef(0);
  const [claimRest] = useState(() => () => {
    claims.current++;
    return () => {
      claims.current--;
    };
  });
  if (wasPlaying !== playing) {
    setWasPlaying(playing);
    const redrawnToStill = !playing && rest === 'start' && (redraw || !claims.current);
    if (redrawnToStill) setRound(round + 1);
  }
  return (
    <PlaybackContext value={{ playing, rest, root, claimRest, countTimeline, countAnimation }}>
      <Fragment key={round}>{children}</Fragment>
    </PlaybackContext>
  );
}

export function usePlayback() {
  const { playing, rest } = use(PlaybackContext);
  return { playing, rest };
}

export function useCountedAnimation() {
  const { countAnimation } = use(PlaybackContext);
  useEffect(() => countAnimation?.(), [countAnimation]);
}

export function useStageLayer() {
  const { root } = use(PlaybackContext);
  return root?.querySelector<HTMLElement>(':scope > .catalogue-overlay-layer') ?? null;
}

export function StageOverlays({ children }: { children: ReactNode }) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  return (
    <BaseTooltip.Provider timeout={0}>
      <PortalContainer container={layer} contained>
        {children}
      </PortalContainer>
      <div ref={setLayer} className="catalogue-overlay-layer" />
    </BaseTooltip.Provider>
  );
}

export function useMustShow(...selectors: string[]) {
  const { root } = use(PlaybackContext);
  const key = selectors.join('\n');
  useEffect(() => (root ? nameMustShow(root, key.split('\n'), true) : undefined), [root, key]);
}

export function useHeldView(top = false) {
  const { root } = use(PlaybackContext);
  useEffect(() => (root ? holdView(root, top) : undefined), [root, top]);
}
