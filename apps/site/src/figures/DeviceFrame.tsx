import { createContext, use, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { Text } from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { IconBatteryFull } from '@envsemble/envui/icons/BatteryFull';
import { IconLock } from '@envsemble/envui/icons/Lock';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { IconSignalCellular4Bar } from '@envsemble/envui/icons/SignalCellular4Bar';
import { IconSignalWifi4Bar } from '@envsemble/envui/icons/SignalWifi4Bar';
import type { DeviceKind } from '../documentation/DocumentationTypes';
import { useDeviceFit } from '../fit/standalone/useDeviceFit';
import { stageScript } from './StageScript';
import { flag } from '../shared/Attributes';

const screenSizeRem: Record<DeviceKind, { width: number; height: number }> = {
  phone: { width: 24, height: 44 },
  window: { width: 54, height: 34 },
};

export const FigureDevice = createContext<DeviceKind | undefined>(undefined);

const OnScreen = createContext(false);

export const useOnScreen = () => use(OnScreen);

function DeviceStage({ kind, children }: { kind: DeviceKind; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const fit = useDeviceFit(stage, row, kind, stageScript);
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

const mostWrapperDepth = 4;

function useFill(screen: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const element = screen.current;
    if (!element) return;
    const heldOwnHeightBeforeFill = new WeakMap<HTMLElement, boolean>();
    const fill = () => {
      let next = [...element.children].find(
        (child) => !child.classList.contains('catalogue-overlay-layer'),
      );
      for (let depth = 0; next instanceof HTMLElement && depth < mostWrapperDepth; depth++) {
        const isEnvUIPart = [...next.classList].some((name) => /^env-/.test(name));
        const heldOwnHeight =
          heldOwnHeightBeforeFill.get(next) ?? (Boolean(next.style.blockSize) || isEnvUIPart);
        heldOwnHeightBeforeFill.set(next, heldOwnHeight);
        next.style.blockSize = '100%';
        if (heldOwnHeight) break;
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
  address?: string;
  label?: string;
  fill?: boolean;
}

export function DeviceFrame({
  kind,
  children,
  address = 'example.com',
  label,
  fill = false,
}: DeviceFrameProps) {
  const screen = useRef<HTMLDivElement>(null);
  useFill(screen);
  const size = screenSizeRem[kind];
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
