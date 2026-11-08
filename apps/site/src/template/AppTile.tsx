import { useRef, type ReactNode } from 'react';
import { DeviceFrame, useFill } from '../figures/DeviceFrame';
import { appTileFrame } from '../tiles/Tiles';

/*
 * A tile of a piece of an application's frame, such as a Scaffold, a top bar or panes (`app` in
 * tiles/Tiles.ts): it fills its card's picture as the application fills its window, rather than
 * floating small in the middle of it. How it is framed is one switch, `appTileFrame`: in the
 * browser's window a page's figure is drawn in (DeviceFrame.tsx), an even margin around it, or
 * edge to edge, as a cropped screenshot of the application. Either way it is drawn at its own size,
 * and on a card too narrow for that, such as a phone's, a little smaller (AppTile.css).
 */

/**
 * What a card shows around the tile: the window, its address bar over the screen the tile fills,
 * or the screen alone. The screen is the tile's window (`env-window`), so the tile lays out for
 * its width as it would in an application.
 */
export function AppScreen({ children }: { children: ReactNode }) {
  const screen = useRef<HTMLDivElement>(null);
  useFill(screen);
  if (appTileFrame === 'window')
    return (
      <DeviceFrame kind="window" fill>
        {children}
      </DeviceFrame>
    );
  return (
    <div ref={screen} className="site-device-screen catalogue-app-screen">
      {children}
    </div>
  );
}
