import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Text } from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { IconBatteryFull } from '@envsemble/envui/icons/BatteryFull';
import { IconLock } from '@envsemble/envui/icons/Lock';
import { IconSignalCellularAlt } from '@envsemble/envui/icons/SignalCellularAlt';
import { IconWifi } from '@envsemble/envui/icons/Wifi';

/*
 * A device frame around a figure: a phone or a desktop window whose screen is a window of its own,
 * at a real width, so a frame of an application, such as a Scaffold, lays out as it does on that
 * device. The frame is the only graphic; what it shows is the figure as it is. A stage scales the
 * frames it holds, together, to fit it (DeviceStage). A demo for now (DeviceFrameBoard.tsx), not
 * used by the site's pages.
 */

/** The kinds of device: a phone, portrait, or a desktop browser's window. */
export type DeviceKind = 'phone' | 'window';

/**
 * How the frame is drawn: `outline`, a hairline around the screen; `bezel`, a band of the muted
 * surface around it; `cutaway`, the outline rising from the stage's foot, cut off by it, drawn
 * larger.
 */
export type DeviceLook = 'outline' | 'bezel' | 'cutaway';

/** The screen's size, in rem, of each kind: a phone 384 px across, a window 1024 px. */
const screens: Record<DeviceKind, { width: number; height: number }> = {
  phone: { width: 24, height: 50 },
  window: { width: 64, height: 40 },
};

/** The share of a frame's height a cutaway shows, its top, the rest cut off at the stage's foot. */
const cutawayShows = 0.62;

export interface DeviceStageProps {
  look: DeviceLook;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Data attributes for the stage, such as a site stage's `data-stage`. */
  [data: `data-${string}`]: string | undefined;
}

/**
 * A stage of one or more device frames side by side, their feet in line, scaled together to fit
 * it, inset from its edges: whole, or for a cutaway, its top share as large as fits, cut off at
 * the stage's foot. The stage's own class gives its size and fill, such as a gallery card's.
 */
export function DeviceStage({ look, children, className, style, ...data }: DeviceStageProps) {
  const stage = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  // How much of a cutaway's row shows, in its own px: down to the stage's foot, where it fades out.
  const [cut, setCut] = useState<number>();
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const rowElement = row.current;
    if (!stageElement || !rowElement) return;
    const update = () => {
      const box = getComputedStyle(stageElement);
      const inset = parseFloat(box.getPropertyValue('--site-device-inset')) || 0;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const width = stageElement.clientWidth - 2 * inset * rem;
      const height = stageElement.clientHeight - (look === 'cutaway' ? 1 : 2) * inset * rem;
      // offsetWidth and offsetHeight are the row's own, before its scale.
      const across = width / rowElement.offsetWidth;
      const down = height / (rowElement.offsetHeight * (look === 'cutaway' ? cutawayShows : 1));
      const next = Math.max(0.01, Math.min(across, down, 1));
      setScale(next);
      setCut(look === 'cutaway' ? height / next : undefined);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stageElement);
    observer.observe(rowElement);
    return () => observer.disconnect();
  }, [look]);
  return (
    <div
      ref={stage}
      className={['site-device-stage', className].filter(Boolean).join(' ')}
      data-look={look}
      {...data}
      style={{ ...style, '--site-device-scale': scale } as CSSProperties}
    >
      <div
        ref={row}
        className="site-device-row"
        data-fitted={scale ? '' : undefined}
        style={cut ? ({ '--site-device-cut': `${cut}px` } as CSSProperties) : undefined}
      >
        {children}
      </div>
    </div>
  );
}

export interface DeviceFrameProps {
  kind: DeviceKind;
  children: ReactNode;
  /** The address the window's bar shows. */
  address?: string;
  /** The screen's height, in rem, where it isn't the kind's. */
  height?: number;
  /**
   * Whether the figure fills the screen's height: a figure that stands a box in for the window,
   * such as a Scaffold 22 rem high, takes the screen's height instead, as the frame is its window.
   */
  fill?: boolean;
  /** What the frame is named for assistive technology, such as the figure's subject. */
  label?: string;
}

/** The phone's status bar: the time at its start, the signal, the Wi-Fi and the battery at its end. */
function StatusBar() {
  return (
    <div className="site-device-bar" aria-hidden>
      <Text variant="body-sm" render={<span />} className="site-device-time">
        9:41
      </Text>
      <span className="site-device-camera" />
      <span className="site-device-status">
        <IconSignalCellularAlt />
        <IconWifi />
        <IconBatteryFull />
      </span>
    </div>
  );
}

/** The window's bar: back and forward, and the address in a field-like pill. */
function AddressBar({ address }: { address: string }) {
  return (
    <div className="site-device-bar" aria-hidden>
      <span className="site-device-buttons">
        <IconArrowBack />
        <IconArrowForward />
      </span>
      <span className="site-device-address">
        <IconLock />
        <Text variant="body-sm" render={<span />} emphasis="muted">
          {address}
        </Text>
      </span>
    </div>
  );
}

/**
 * A phone or a window around a figure, at its own size: the stage around it scales it. The screen
 * is the figure's window, a size container named env-window as a width frame is (Stage.css), and
 * the containing block of its fixed overlays.
 */
export function DeviceFrame({
  kind,
  children,
  address = 'northwind.app',
  height,
  fill = false,
  label,
}: DeviceFrameProps) {
  const screen = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const figure = screen.current?.firstElementChild;
    if (fill && figure instanceof HTMLElement) figure.style.blockSize = '100%';
  }, [fill]);
  const size = screens[kind];
  return (
    <div
      className="site-device"
      data-kind={kind}
      role={label ? 'group' : undefined}
      aria-label={label}
    >
      {kind === 'phone' ? <StatusBar /> : <AddressBar address={address} />}
      <div
        ref={screen}
        className="site-device-screen"
        style={{ inlineSize: `${size.width}rem`, blockSize: `${height ?? size.height}rem` }}
      >
        {children}
      </div>
    </div>
  );
}
