import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { IconButton, Tooltip } from '@envsemble/envui';
import { IconPause } from '@envsemble/envui/icons/Pause';
import { IconPlayArrow } from '@envsemble/envui/icons/PlayArrow';
import type { StageFill } from '../documentation/DocumentationTypes';
import { useVerdictFit } from '../fit/standalone/useVerdictFit';
import { useDisplaySettings } from '../display/useDisplaySettings';
import { Playback, StageOverlays } from '../motion/Playback';
import { useInView } from '../motion/useInView';
import { rootMotionDuration } from '../shared/RootMotionTokens';
import { pixelTolerance, remeasure } from '../shared/Remeasure';
import { FigureDevice, OnDevice } from './DeviceFrame';
import { classNames, flag } from '../shared/Attributes';
import { useBrowserStandIns } from '../motion/BrowserStandIns';
import { useReaderTakeover } from '../motion/ReaderTakeover';

export const VerdictMotion = createContext<false | 'square' | 'wide'>(false);

export function MotionStage({
  label,
  height,
  children,
  foundation = false,
  className,
  stage: fill,
  top = false,
}: {
  label: string;
  height?: string;
  children: ReactNode;
  foundation?: boolean;
  className?: string;
  stage?: StageFill;
  top?: boolean;
}) {
  useBrowserStandIns();
  const { motionPaused } = useDisplaySettings();
  const verdict = use(VerdictMotion);
  const [ownChoice, setOwnChoice] = useState<{
    paused: boolean;
    menuPausedWhenMade: boolean;
  } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [subject, setSubject] = useState<HTMLDivElement | null>(null);
  const inView = useInView(stage);
  const { live, setLive, takeable, countTimeline, held, handlers } = useReaderTakeover(
    stage,
    subject,
  );
  const square = verdict === 'square';
  const box = useRef<HTMLDivElement>(null);
  const tallest = useRef<HTMLDivElement>(null);
  useVerdictFit(stage, box, { on: square, shape: 'square' });
  useTallest(square ? tallest : stage, height);
  useThemeFade(subject);
  const ownChoiceApplies = ownChoice !== null && ownChoice.menuPausedWhenMade === motionPaused;
  const paused = live || (ownChoiceApplies ? ownChoice.paused : held || motionPaused);
  const action = paused ? `Play ${label}` : `Pause ${label}`;
  const content = live ? (
    <Playback key="live" playing={false} rest="start" root={subject}>
      {children}
    </Playback>
  ) : (
    <Playback playing={inView && !paused} rest="hold" root={subject} countTimeline={countTimeline}>
      <StageOverlays>{children}</StageOverlays>
    </Playback>
  );
  const device = use(FigureDevice);
  const shown = device && !verdict ? <OnDevice kind={device}>{content}</OnDevice> : content;
  const subjectProps = {
    inert: !live,
    'aria-hidden': live ? undefined : true,
    className: 'catalogue-motion-subject',
  };
  return (
    <div
      ref={stage}
      className={classNames(
        foundation ? 'site-foundation-stage' : verdict ? 'site-verdict-stage' : 'site-live-example',
        'catalogue-motion-stage',
        className,
      )}
      data-figure={foundation ? 'example' : undefined}
      data-stage={fill}
      data-device={device && !verdict ? device : undefined}
      data-live={flag(live)}
      data-top={flag(top)}
      style={height && !square ? { minBlockSize: height } : undefined}
      {...(takeable && !live && { tabIndex: 0, role: 'group', 'aria-label': `${label}, try it` })}
      {...handlers}
    >
      {square ? (
        <div ref={box} className="site-verdict-fit">
          <div
            ref={(element) => {
              tallest.current = element;
              setSubject(element);
            }}
            {...subjectProps}
            style={height ? { minBlockSize: height } : undefined}
          >
            {content}
          </div>
        </div>
      ) : (
        <div ref={setSubject} {...subjectProps}>
          {shown}
        </div>
      )}
      <Tooltip content={action}>
        <IconButton
          size="sm"
          className="catalogue-motion-pause"
          icon={paused ? <IconPlayArrow /> : <IconPause />}
          aria-label={action}
          onClick={() => {
            if (live) {
              setLive(false);
              setOwnChoice({ paused: false, menuPausedWhenMade: motionPaused });
            } else setOwnChoice({ paused: !paused, menuPausedWhenMade: motionPaused });
          }}
        />
      </Tooltip>
    </div>
  );
}

const settleDelayMs = 400;

function useTallest(stage: RefObject<HTMLDivElement | null>, height: string | undefined) {
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const leastHeight = height ?? '';
    let width = -1;
    let tallestBorderBox = 0;
    let held = leastHeight;
    const neededBorderBox = () => {
      const { alignSelf, inlineSize } = element.style;
      element.style.inlineSize = `${element.getBoundingClientRect().width}px`;
      element.style.minBlockSize = leastHeight;
      element.style.alignSelf = 'start';
      const box = element.getBoundingClientRect().height;
      element.style.alignSelf = alignSelf;
      element.style.inlineSize = inlineSize;
      element.style.minBlockSize = held;
      return box;
    };
    const hold = (border: number) => {
      tallestBorderBox = border;
      const style = getComputedStyle(element);
      const paddingAndBorder =
        style.boxSizing === 'border-box'
          ? 0
          : parseFloat(style.paddingBlockStart) +
            parseFloat(style.paddingBlockEnd) +
            parseFloat(style.borderBlockStartWidth) +
            parseFloat(style.borderBlockEndWidth);
      held = border ? `max(${height ?? '0px'}, ${border - paddingAndBorder}px)` : leastHeight;
      element.style.minBlockSize = held;
    };
    let settle: ReturnType<typeof setTimeout> | undefined;
    const subject = element.querySelector('.catalogue-motion-subject');
    const sizes = remeasure(
      () => {
        const stageWidth = element.getBoundingClientRect().width;
        if (Math.abs(stageWidth - width) > pixelTolerance) {
          width = stageWidth;
          hold(0);
          clearTimeout(settle);
          settle = setTimeout(() => {
            settle = undefined;
            hold(neededBorderBox());
          }, settleDelayMs);
          return;
        }
        if (settle !== undefined) return;
        const need = neededBorderBox();
        if (need > tallestBorderBox + pixelTolerance) hold(need);
      },
      { resize: subject ? [element, subject] : [element] },
    );
    return () => {
      sizes.stop();
      clearTimeout(settle);
      element.style.minBlockSize = leastHeight;
    };
  }, [stage, height]);
}

const themeColorAttributes = ['data-env-theme', 'data-env-contrast'];
const themeFadeSlowMotionFactor = 1.5;
const frameToStartMs = 50;

function useThemeFade(subject: HTMLElement | null) {
  useEffect(() => {
    if (!subject) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver((changes) => {
      if (!changes.some(({ target }) => target !== subject)) return;
      subject.dataset.catalogueThemeFading = '';
      clearTimeout(timer);
      const fadeMs = themeFadeSlowMotionFactor * rootMotionDuration('slow') + frameToStartMs;
      timer = setTimeout(() => delete subject.dataset.catalogueThemeFading, fadeMs);
    });
    observer.observe(subject, { subtree: true, attributeFilter: themeColorAttributes });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      delete subject.dataset.catalogueThemeFading;
    };
  }, [subject]);
}

type RemOrLength = number | string;
const lengthOf = (room: RemOrLength) => (typeof room === 'number' ? `${room}rem` : room);
const stepSteepness = 1000;

export const roomFor = (wide: RemOrLength, narrow: RemOrLength, narrowBelowRem: number) =>
  `max(${lengthOf(wide)}, min(${lengthOf(narrow)}, (${narrowBelowRem}rem - 100cqi) * ${stepSteepness}))`;

export const rowsAnd = (rows: number, extraRem: number) =>
  `calc(${rows} * var(--env-row-height) + ${extraRem}rem)`;
