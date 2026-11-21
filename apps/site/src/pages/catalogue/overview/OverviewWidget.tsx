import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
} from 'react';
import {
  IconButton,
  SegmentedControl,
  Text,
  Theme,
  Tooltip,
  useTheme,
  type ColorScheme,
} from '@envsemble/envui';
import { HighlightedCodeBlock } from '@envsemble/envui/code';
import { IconDarkMode } from '@envsemble/envui/icons/DarkMode';
import { IconLightMode } from '@envsemble/envui/icons/LightMode';
import { useDisplaySettings } from '../../../display/useDisplaySettings';
import { useMedia } from '../../../motion/Autoplay';
import { useInView } from '../../../motion/useInView';
import { usePlaying } from '../../../motion/usePlaying';
import { reducedMotionQuery } from '../../../shared/ReducedMotion';
import { remeasure } from '../../../shared/Remeasure';
import { useHydrated } from '../../../shared/useHydrated';
import { useLatest } from '../../../shared/useLatest';
import { linesOf, samples, type Sample } from './OverviewSamples';

const tourStepMs = 2400;
const bandShown = '--catalogue-overview-band-shown';
const bandFadeFrom = 0.45;
const codeLead = '--catalogue-overview-code-lead';
const codeRows = '--catalogue-overview-code-rows';
const codeCompact = '--catalogue-overview-code-compact';

function excerptTop(pre: HTMLPreElement, source: string, first: number, last: number) {
  const style = getComputedStyle(pre);
  const lead = parseFloat(style.getPropertyValue(codeLead));
  if (Number.isNaN(lead)) return null;
  const rows = parseFloat(style.getPropertyValue(codeRows)) || Infinity;
  const { line } = lineMetrics(pre);
  const shownLead = Math.max(0, Math.min(lead, rows - (last - first + 1)));
  const lastStart = Math.max(0, source.split('\n').length - rows);
  return Math.min(Math.max(0, first - shownLead), lastStart) * line;
}

const compactWidth = 48;
const selfClosingTag = /^( *)(<[\w.]+)((?: +\w+=(?:"[^"]*"|\{[^}]*\}))+) *\/>$/;

const textElement = /^( *)(<[\w.]+[^<>]*>)([^<>]+)(<\/[\w.]+>)$/;
const elementProp = /^( *)(\w+=\{)(<.*>)\}$/;
const objectConstant = /^( *)(const \w+ = \{) (.+) \};$/;
const callback = /^( *)(\{.+\.map\()(\(.*\) => \()$/;

function compactParts(line: string): string[] | null {
  const tag = selfClosingTag.exec(line);
  if (tag) {
    const [, indent = '', opener = '', attributes = ''] = tag;
    const props = attributes.trim().match(/\w+=(?:"[^"]*"|\{[^}]*\})/g) ?? [];
    return [indent + opener, ...props.map((prop) => `${indent} ${prop}`), `${indent}/>`];
  }
  const text = textElement.exec(line);
  if (text) {
    const [, indent = '', opener = '', content = '', closer = ''] = text;
    return [indent + opener, `${indent} ${content}`, indent + closer];
  }
  const prop = elementProp.exec(line);
  if (prop) {
    const [, indent = '', name = '', value = ''] = prop;
    return [indent + name, `${indent} ${value}`, `${indent}}`];
  }
  const object = objectConstant.exec(line);
  if (object) {
    const [, indent = '', opener = '', entries = ''] = object;
    return [
      indent + opener,
      ...entries.split(', ').map((entry) => `${indent} ${entry},`),
      `${indent}};`,
    ];
  }
  const call = callback.exec(line);
  if (call) {
    const [, indent = '', head = '', arrow = ''] = call;
    return [indent + head, `${indent} ${arrow}`];
  }
  return null;
}

function compactLine(line: string) {
  return line.length > compactWidth ? (compactParts(line)?.join('\n') ?? line) : line;
}

const compactIndent = (source: string) =>
  source
    .replace(/^ +/gm, (indent) => ' '.repeat(Math.ceil(indent.length / 2)))
    .split('\n')
    .map(compactLine)
    .join('\n');

const lineNumbers = (source: string) =>
  `"${source
    .split('\n')
    .map((_, index) => index + 1)
    .join('\\A ')}"`;

interface Band {
  top: number;
  height: number;
}

function lineStarts(source: string) {
  const starts = [0];
  for (let index = 0; index < source.length; index++)
    if (source[index] === '\n') starts.push(index + 1);
  return starts;
}

function textPoint(root: Element, offset: number): [Node, number] | null {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let seen = 0;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const length = node.textContent?.length ?? 0;
    if (offset <= seen + length) return [node, offset - seen];
    seen += length;
  }
  return null;
}

function measureBands(pre: HTMLPreElement, source: string, ranges: [number, number][]) {
  const starts = lineStarts(source);
  const frame = pre.getBoundingClientRect();
  const lineHeight = parseFloat(getComputedStyle(pre).lineHeight) || 16;
  return ranges.flatMap(([first, last]): Band[] => {
    const from = textPoint(pre, starts[first] ?? 0);
    const to = textPoint(pre, (starts[last + 1] ?? source.length + 1) - 1);
    if (!from || !to) return [];
    const range = pre.ownerDocument.createRange();
    range.setStart(...from);
    range.setEnd(...to);
    const boxes = [...range.getClientRects()].filter((box) => box.height > 0);
    if (!boxes.length) return [];
    const leading = Math.max(0, (lineHeight - boxes[0]!.height) / 2);
    const top = Math.min(...boxes.map((box) => box.top)) - leading;
    const bottom = Math.max(...boxes.map((box) => box.bottom)) + leading;
    return [{ top: top - frame.top - pre.clientTop + pre.scrollTop, height: bottom - top }];
  });
}

function bandStyle(bands: Band[]): CSSProperties {
  const [first, second] = bands;
  return {
    '--catalogue-overview-band-top': `${first?.top ?? 0}px`,
    '--catalogue-overview-band-height': `${first?.height ?? 0}px`,
    '--catalogue-overview-band-2-top': `${second?.top ?? 0}px`,
    '--catalogue-overview-band-2-height': `${second?.height ?? 0}px`,
  };
}

const lineBand = ([first, last]: [number, number]) => ({
  top: `calc(var(--catalogue-overview-code-top) + (${first} - var(--catalogue-overview-pending-shift, 0)) * 1lh)`,
  height: `calc(${last - first + 1} * 1lh)`,
});

function pendingBandStyle(ranges: [number, number][], lines: number): CSSProperties {
  const [first, second] = ranges.map(lineBand);
  return {
    '--catalogue-overview-band-top': first?.top ?? '0px',
    '--catalogue-overview-band-height': first?.height ?? '0px',
    '--catalogue-overview-band-2-top': second?.top ?? '0px',
    '--catalogue-overview-band-2-height': second?.height ?? '0px',
    '--catalogue-overview-band-line': ranges[0]?.[0] ?? 0,
    '--catalogue-overview-code-total': lines,
  };
}

function innermostRegion(sample: Sample, stage: HTMLElement, target: Element) {
  let best: { id: string; element: Element } | null = null;
  for (const region of sample.regions) {
    const element = region.find(stage).find((found) => found.contains(target));
    if (element && (!best || best.element.contains(element))) best = { id: region.id, element };
  }
  return best?.id ?? null;
}

interface Ring {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number | null;
  text: boolean;
}

function boxOf(element: Element) {
  const box = element.getBoundingClientRect();
  if (!element.matches('.env-text')) return box;
  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  const text = range.getBoundingClientRect();
  return { top: box.top, left: text.left, width: text.width, height: box.height };
}

const codeSizes = { min: 11, max: 14 };

function fittedCodeSize(pre: HTMLPreElement, source: string) {
  const lines = source.split('\n');
  const columns = Math.max(...lines.map((line) => line.length));
  const style = getComputedStyle(pre);
  const context = pre.ownerDocument.createElement('canvas').getContext('2d');
  if (!context) return null;
  context.font = `100px ${style.fontFamily}`;
  const advance = context.measureText('0'.repeat(10)).width / 1000;
  const lineHeight = parseFloat(style.lineHeight) / parseFloat(style.fontSize);
  const width = pre.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const height = pre.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const fitted = Math.min(width / (columns * advance), height / (lines.length * lineHeight));
  const size = Math.floor(Math.max(codeSizes.min, Math.min(codeSizes.max, fitted)) * 4) / 4;
  return size;
}

function motionOf(element: Element) {
  const style = getComputedStyle(element);
  const duration = style.getPropertyValue('--env-motion-duration-medium').trim();
  return {
    duration: duration.endsWith('ms') ? parseFloat(duration) : parseFloat(duration) * 1000 || 0,
    easing: style.getPropertyValue('--env-motion-ease').trim() || 'ease',
  };
}

const ringOutset = 4;
const ringInsideCells = -2;
const touchPauseMs = 6000;
const ringRoomInCard = 6;

function spanOf(element: Element, box: { left: number; width: number }, zoom: number) {
  const body = element.parentElement;
  if (!body?.matches('.env-card-body') || element.matches('.env-text')) {
    return { left: box.left, right: box.left + box.width };
  }
  const edge = body.getBoundingClientRect();
  const style = getComputedStyle(body);
  return {
    left: edge.left + parseFloat(style.paddingLeft) * zoom,
    right: edge.right - parseFloat(style.paddingRight) * zoom,
  };
}

const scaleOf = (element: Element) => parseFloat(getComputedStyle(element).scale) || 1;

function ringAround(stage: HTMLElement, element: Element): Ring {
  const zoom = scaleOf(stage);
  const box = boxOf(element);
  const text = element.matches('.env-text');
  const outset = (element.matches('td, tr, thead') ? ringInsideCells : ringOutset) * zoom;
  const ownRadius = parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
  const span = spanOf(element, box, zoom);
  let left = span.left - outset;
  let right = span.right + outset;
  let top = box.top - outset;
  let bottom = box.top + box.height + outset;
  const card = element.parentElement?.closest('.env-card');
  if (card) {
    const edge = card.getBoundingClientRect();
    const room = ringRoomInCard * zoom;
    left = Math.max(left, edge.left + room);
    right = Math.min(right, edge.right - room);
    top = Math.max(top, edge.top + room);
    bottom = Math.min(bottom, edge.bottom - room);
  }
  const frame = stage.getBoundingClientRect();
  return {
    top: (top - frame.top) / zoom - stage.clientTop + stage.scrollTop,
    left: (left - frame.left) / zoom - stage.clientLeft + stage.scrollLeft,
    width: (right - left) / zoom,
    height: (bottom - top) / zoom,
    radius: ownRadius ? Math.min(ownRadius, box.height / zoom / 2) + outset / zoom : null,
    text,
  };
}

const miniatureShare = { width: 0.5, height: 0.4 };
const miniatureScaleMax = 0.6;

function miniatureScale(widget: HTMLElement, stage: HTMLElement) {
  return Math.min(
    miniatureScaleMax,
    (widget.clientWidth * miniatureShare.width) / stage.offsetWidth,
    (widget.offsetHeight * miniatureShare.height) / stage.offsetHeight,
  );
}

function lineMetrics(pre: HTMLPreElement) {
  const style = getComputedStyle(pre);
  return {
    top: parseFloat(style.paddingTop) || 0,
    line: parseFloat(style.lineHeight) || 20,
  };
}

export function OverviewWidget({ className }: { className?: string }) {
  const [sampleId, setSampleId] = useState(samples[0]!.id);
  const [hot, setHot] = useState<string | null>(null);
  const hotNow = useLatest(hot);
  const pageTheme = useTheme().theme;
  const [ownTheme, setOwnTheme] = useState<ColorScheme | null>(null);
  const stageTheme = ownTheme ?? pageTheme;
  const sample = samples.find((entry) => entry.id === sampleId) ?? samples[0]!;
  const root = useRef<HTMLDivElement>(null);
  const code = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(root);
  const reduced = useMedia(reducedMotionQuery);
  const { motionPaused } = useDisplaySettings();
  const [engaged, engage] = usePlaying();
  const hydrated = useHydrated();
  const [touched, setTouched] = useState(false);
  const touchTimer = useRef(0);
  const [codeFit, setCodeFit] = useState<number | null>(null);
  const [bands, setBands] = useState<{ key: string; boxes: Band[] }>({ key: '', boxes: [] });
  const [rings, setRings] = useState<{ key: string; boxes: Ring[] }>({ key: '', boxes: [] });
  const active = hot ?? sample.rest.id;
  const shownRings = rings.key === `${sample.id}:${active}` ? rings.boxes : [];
  const bandsShown = bands.key === `${sample.id}:${active}`;
  const scrolledSample = useRef('');
  const touring = hydrated && inView && !engaged && !touched && !reduced && !motionPaused;
  const [compact, setCompact] = useState(false);
  const source = compact ? compactIndent(sample.source) : sample.source;
  const [miniature, setMiniature] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = code.current;
    if (!element) return;
    const watching = remeasure(
      () => setCompact(getComputedStyle(element).getPropertyValue(codeCompact).trim() !== ''),
      { first: 'now', resize: [element] },
    );
    return () => watching.stop();
  }, []);

  useEffect(() => () => window.clearTimeout(touchTimer.current), []);

  useLayoutEffect(() => {
    const widget = root.current;
    const element = stage.current;
    if (!compact || !widget || !element) {
      setMiniature(null);
      return;
    }
    const watching = remeasure(() => setMiniature(miniatureScale(widget, element)), {
      first: 'now',
      resize: [widget, element],
      fonts: true,
    });
    return () => watching.stop();
  }, [compact, sample]);

  useEffect(() => {
    const codePane = code.current;
    const pre = codePane?.querySelector('pre');
    if (!codePane || !pre) return;
    const watching = remeasure(
      () =>
        codePane.toggleAttribute(
          'data-more',
          pre.scrollTop + pre.clientHeight < pre.scrollHeight - 1,
        ),
      { first: 'frame', resize: [pre], events: [{ target: pre, types: ['scroll'] }], fonts: true },
    );
    return () => watching.stop();
  }, [sample]);

  const ranges = useMemo(() => {
    const region = sample.regions.find((entry) => entry.id === active);
    return region ? linesOf(source, region) : [];
  }, [sample, source, active]);

  useEffect(() => {
    if (!touring) return;
    const rest = sample.regions.find((region) => region.id === sample.rest.id);
    const shown = [
      ...(rest ? [rest] : []),
      ...sample.regions.slice(1).filter((region) => region !== rest),
    ];
    const drawn = () =>
      shown.filter((region) => stage.current && region.find(stage.current).length);
    let index = drawn().findIndex((region) => region.id === hotNow.current);
    const step = () => {
      const regions = drawn();
      index = (index + 1) % Math.max(1, regions.length);
      setHot(regions[index]?.id ?? null);
    };
    if (index < 0) step();
    const timer = window.setInterval(step, tourStepMs);
    return () => window.clearInterval(timer);
  }, [touring, sample, hotNow]);

  useLayoutEffect(() => {
    const element = stage.current;
    const region = sample.regions.find((entry) => entry.id === active);
    if (!element || !region) return;
    const marked = region.find(element);
    const key = `${sample.id}:${region.id}`;
    const watching = remeasure(
      () => setRings({ key, boxes: marked.map((each) => ringAround(element, each)) }),
      { first: 'now', resize: [element, ...marked], fonts: true },
    );
    return () => watching.stop();
  }, [sample, active, stageTheme, miniature]);

  useEffect(() => {
    const pre = code.current?.querySelector('pre');
    if (!pre || reduced || !ranges.length || !hot) return;
    const fade = pre.animate([{ [bandShown]: bandFadeFrom }, { [bandShown]: 1 }], motionOf(pre));
    return () => fade.cancel();
  }, [ranges, reduced, hot]);

  useLayoutEffect(() => {
    const pre = code.current?.querySelector('pre');
    if (!pre || !ranges.length) return;
    const key = `${sample.id}:${active}`;
    const watching = remeasure(() => setBands({ key, boxes: measureBands(pre, source, ranges) }), {
      first: 'now',
      resize: [pre],
      fonts: true,
    });
    return () => watching.stop();
  }, [sample, source, active, ranges, codeFit]);

  useEffect(() => {
    const pre = code.current?.querySelector('pre');
    if (!pre || !hydrated) return;
    const watching = remeasure(() => setCodeFit(fittedCodeSize(pre, source)), {
      first: 'now',
      resize: [pre],
      fonts: true,
    });
    return () => watching.stop();
  }, [source, hydrated]);

  useLayoutEffect(() => {
    const pre = code.current?.querySelector('pre');
    if (!pre || !ranges.length) return;
    const [band] = measureBands(pre, source, ranges);
    if (!band || !band.height) return;
    const behavior = reduced || scrolledSample.current !== sample.id ? 'auto' : 'smooth';
    scrolledSample.current = sample.id;
    const [first, last] = ranges[0]!;
    if (excerptTop(pre, source, first, last) != null) {
      const watching = remeasure(
        () => {
          const top = excerptTop(pre, source, first, last);
          if (top != null) pre.scrollTo({ top });
        },
        { first: 'now', resize: [pre], fonts: true },
      );
      return () => watching.stop();
    }
    const end = band.top + band.height;
    if (band.top >= pre.scrollTop && end <= pre.scrollTop + pre.clientHeight) return;
    pre.scrollTo({
      top: Math.max(0, band.top - pre.clientHeight / 4),
      behavior,
    });
  }, [sample, source, ranges, reduced]);

  function pointAtCode(event: PointerEvent<HTMLElement>) {
    if (!engaged) return;
    const pre = code.current?.querySelector('pre');
    if (!pre) return;
    const { top, line } = lineMetrics(pre);
    const y = event.clientY - pre.getBoundingClientRect().top - top + pre.scrollTop;
    const index = Math.floor(y / line);
    let best: { id: string; size: number } | null = null;
    for (const region of sample.regions)
      for (const [start, end] of linesOf(source, region))
        if (index >= start && index <= end && (!best || end - start < best.size))
          best = { id: region.id, size: end - start };
    setHot(best?.id ?? null);
  }

  function findInStage(event: PointerEvent<HTMLElement> | FocusEvent<HTMLElement>) {
    if (!stage.current || !(event.target instanceof Element)) return;
    setHot(innermostRegion(sample, stage.current, event.target));
  }

  const Specimen = sample.Specimen;
  const otherTheme = stageTheme === 'dark' ? 'light' : 'dark';
  return (
    <div
      ref={root}
      className={['catalogue-overview-widget', className].filter(Boolean).join(' ')}
      {...engage}
      onPointerLeave={(event) => {
        engage.onPointerLeave(event);
        if (event.pointerType !== 'touch') setHot(null);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== 'touch') return;
        setTouched(true);
        window.clearTimeout(touchTimer.current);
        touchTimer.current = window.setTimeout(() => setTouched(false), touchPauseMs);
      }}
    >
      <div className="catalogue-overview-widget-bar">
        <SegmentedControl
          aria-label="Example"
          size="sm"
          value={sampleId}
          onValueChange={(value) => {
            setSampleId(value);
            setHot(null);
          }}
          items={samples.map(({ id, label, icon }) => ({ value: id, label, start: icon }))}
          className="catalogue-overview-widget-samples"
        />
      </div>
      <div className="catalogue-overview-widget-body">
        <Theme
          theme="dark"
          className="catalogue-overview-widget-code"
          ref={code}
          data-pending={!bandsShown || undefined}
          style={{
            ...(bandsShown
              ? bandStyle(bands.boxes)
              : pendingBandStyle(ranges, source.split('\n').length)),
            '--catalogue-overview-line-numbers': lineNumbers(source),
            '--catalogue-overview-code-size': hydrated && codeFit ? `${codeFit}px` : undefined,
          }}
          onPointerMove={pointAtCode}
        >
          <HighlightedCodeBlock language="tsx" label={sample.file} copyable key={sample.id}>
            {source}
          </HighlightedCodeBlock>
        </Theme>
        <Theme
          theme={stageTheme}
          className="catalogue-overview-widget-example"
          data-wide={sample.wide || undefined}
          scale={compact ? 'compact' : undefined}
          inert={compact || undefined}
          style={{ '--catalogue-overview-miniature-scale': miniature?.toString() }}
        >
          <div className="catalogue-overview-widget-example-bar">
            <Text render={<h2 />} variant="caption" emphasis="muted">
              Preview
            </Text>
            <Tooltip content={`Preview in ${otherTheme}`}>
              <IconButton
                variant="ghost"
                size="sm"
                icon={stageTheme === 'dark' ? <IconLightMode /> : <IconDarkMode />}
                aria-label={`Preview in ${otherTheme}`}
                onClick={() => setOwnTheme(otherTheme)}
              />
            </Tooltip>
          </div>
          <div
            ref={stage}
            className="catalogue-overview-widget-stage"
            onPointerOver={findInStage}
            onFocus={findInStage}
            onBlur={() => setHot(null)}
            data-pending={!shownRings.length || undefined}
            key={sample.id}
          >
            <style>{`.catalogue-overview-widget-stage[data-pending] :is(${sample.rest.css}) { outline: var(--catalogue-overview-ring-width) solid var(--catalogue-tour-accent); outline-offset: ${ringOutset}px; }`}</style>
            <Specimen />
            {shownRings.map((ring, index) => (
              <span
                key={index}
                className="catalogue-overview-widget-ring"
                data-text={ring.text || undefined}
                data-still={!hot || undefined}
                aria-hidden="true"
                style={{
                  insetBlockStart: ring.top,
                  insetInlineStart: ring.left,
                  inlineSize: ring.width,
                  blockSize: ring.height,
                  borderRadius: ring.radius ?? undefined,
                }}
              />
            ))}
          </div>
        </Theme>
      </div>
    </div>
  );
}
