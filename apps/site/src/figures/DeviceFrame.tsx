import { createContext, use, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { Text } from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { IconBatteryFull } from '@envsemble/envui/icons/BatteryFull';
import { IconLock } from '@envsemble/envui/icons/Lock';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { IconSignalCellular4Bar } from '@envsemble/envui/icons/SignalCellular4Bar';
import { IconSignalWifi4Bar } from '@envsemble/envui/icons/SignalWifi4Bar';
import type { DeviceKind } from '@docs-model/DocumentationTypes';
import { useDeviceFit } from '../fit/standalone/useDeviceFit';
import { flag } from '@envui-internal/internal/flag';

/*
 * A device drawn around a page's figure: a phone or a browser's window whose screen is a window of
 * its own, at a real width, so a frame of an application, such as a Scaffold, lays out as it does
 * on that device. The device is a plain drawing: one solid stroke around the whole body, a phone's
 * status bar and home indicator, a window's address bar; what its screen shows is the figure as it
 * is. A page's figure takes one with `device` on its fence (LiveExample.tsx); a gallery's or
 * Related's card takes a window filling its picture around a tile of an application's frame
 * (TileStage.tsx).
 */

/**
 * The screen's size, in rem, of each kind: a phone 384 px across; a window 864 px, as narrow as
 * keeps an application's drawer (an expanded window, from 840 px), so it shows whole at the
 * compact scale's least on a desktop's page.
 */
const screens: Record<DeviceKind, { width: number; height: number }> = {
  phone: { width: 24, height: 44 },
  window: { width: 54, height: 34 },
};

/**
 * The device a page's figure is drawn in, which an animated figure's stage (MotionStage) puts
 * around what it plays: the figure's, from its fence, never a card's.
 */
export const FigureDevice = createContext<DeviceKind | undefined>(undefined);

/**
 * Whether what renders is on a device's screen: a specimen that frames its example in a window of
 * its own width, such as a sweep's frame, shows it on the screen as it is instead.
 */
const OnScreen = createContext(false);

/** Whether what renders is on a device's screen (DeviceFrame). */
export const useOnScreen = () => use(OnScreen);

/**
 * A device at its own size, scaled to fit its stage's width and at most `--site-device-most` high,
 * never drawn larger than it is nor smaller than its kind's least scale (leastScale,
 * DeviceFit.ts): where it would need to be, it is cut off at the stage's end and foot, its top start in view, so a
 * window's bar and navigation show whole, and its cut edges fade out. A window whose page shows
 * little is cut off below it, rather than shown mostly empty. On an animated figure, each state of
 * the screen has one view across it, held while the state lasts: from the start where what the
 * state needs fits there, the points its pointer heads to that show and what it names with
 * `useMustShow` (MustShow.ts); else as near the start as keeps them whole, with its cut edges in
 * gaps between words (gapStart), or at the screen's end. The view never pans: it changes only as
 * the state does, at once. A side that is cut off runs out over the stage's padding to its edge.
 * The place it holds on the stage is its view, so the stage is as tall as what it shows.
 */
function DeviceStage({ kind, children }: { kind: DeviceKind; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const fit = useDeviceFit(stage, row, kind);
  return (
    <div
      ref={stage}
      className="site-device-stage"
      style={{ '--site-device-scale': fit?.scale ?? 1 }}
    >
      <div
        className="site-device-fit"
        data-cut={fit?.cut || undefined}
        style={
          fit && {
            inlineSize: fit.width,
            blockSize: fit.height,
            ...(fit.outset.start + fit.outset.end > 0 && {
              marginLeft: -fit.outset.start,
              marginRight: -fit.outset.end,
            }),
          }
        }
      >
        <div
          ref={row}
          className="site-device-row"
          data-fitted={flag(fit)}
          style={fit && { translate: `${-fit.x * fit.scale}px ${-fit.y * fit.scale}px` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** The phone's status bar: the time at its start, the signal, the Wi-Fi and the battery at its end. */
function StatusBar() {
  return (
    <div className="site-device-bar" aria-hidden>
      <Text variant="caption" render={<span />} className="site-device-time">
        9:30
      </Text>
      <span className="site-device-glyphs">
        <IconSignalWifi4Bar />
        <IconSignalCellular4Bar />
        <IconBatteryFull />
      </span>
    </div>
  );
}

/** The window's address bar: back, forward and reload, and the address in a pill. */
function AddressBar({ address }: { address: string }) {
  return (
    <div className="site-device-bar" aria-hidden>
      <span className="site-device-glyphs">
        <IconArrowBack />
        <IconArrowForward />
        <IconRefresh />
      </span>
      <span className="site-device-address">
        <IconLock />
        <Text variant="caption" render={<span />}>
          {address}
        </Text>
      </span>
    </div>
  );
}

/**
 * Makes the figure on a screen as tall as the screen, which stands in for its window: the first
 * element on it, and through the wrappers that hold it, down to the example's own root, an envUI
 * part or the box that set its height, such as a Scaffold standing a 22 rem box in for the window.
 * It holds as the figure loads, goes live and comes back.
 */
function useFill(screen: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const element = screen.current;
    if (!element) return;
    // Whether each element filled is where the figure's own height was, read before filling it.
    const filled = new WeakMap<HTMLElement, boolean>();
    const fill = () => {
      let next = [...element.children].find(
        (child) => !child.classList.contains('catalogue-overlay-layer'),
      );
      for (let depth = 0; next instanceof HTMLElement && depth < 4; depth++) {
        const own =
          filled.get(next) ??
          (Boolean(next.style.blockSize) || [...next.classList].some((name) => /^env-/.test(name)));
        filled.set(next, own);
        next.style.blockSize = '100%';
        if (own) break;
        next = next.firstElementChild ?? undefined;
      }
    };
    fill();
    const observer = new MutationObserver(fill);
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [screen]);
}

export interface DeviceFrameProps {
  kind: DeviceKind;
  children: ReactNode;
  /** The address the window's bar shows. */
  address?: string;
  /** What the device is named for assistive technology, such as the figure's subject. */
  label?: string;
  /**
   * Whether it fills the box it is in, its screen taking what its bar leaves, rather than being
   * drawn at its kind's own size: a card's window around an application's frame (TileStage.tsx).
   */
  fill?: boolean;
}

/**
 * A phone or a window around a figure, at its own size: the stage around it scales it. The screen
 * is the figure's window, a size container named env-window as a width frame is (Stage.css), and
 * the containing block of its fixed overlays; the figure fills it.
 */
export function DeviceFrame({
  kind,
  children,
  address = 'example.com',
  label,
  fill = false,
}: DeviceFrameProps) {
  const screen = useRef<HTMLDivElement>(null);
  useFill(screen);
  const size = screens[kind];
  return (
    <div
      className="site-device"
      data-kind={kind}
      data-fill={flag(fill)}
      role={label ? 'group' : undefined}
      aria-label={label}
    >
      {kind === 'phone' ? <StatusBar /> : <AddressBar address={address} />}
      <div
        ref={screen}
        className="site-device-screen"
        style={
          fill ? undefined : { inlineSize: `${size.width}rem`, blockSize: `${size.height}rem` }
        }
      >
        <OnScreen value>{children}</OnScreen>
      </div>
      {kind === 'phone' && <span className="site-device-home" aria-hidden />}
    </div>
  );
}

/** A figure on a device of its kind, fitted to its stage. */
export function OnDevice({
  kind,
  label,
  children,
}: {
  kind: DeviceKind;
  label?: string;
  children: ReactNode;
}) {
  return (
    <DeviceStage kind={kind}>
      <DeviceFrame kind={kind} label={label}>
        {children}
      </DeviceFrame>
    </DeviceStage>
  );
}
