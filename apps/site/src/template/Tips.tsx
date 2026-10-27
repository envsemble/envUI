import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { Badge, Text, Theme, useTheme } from '@envsemble/envui';
import { Check } from '@envsemble/envui/icons/Check';
import { Close } from '@envsemble/envui/icons/Close';
import type { DocumentationBlock } from '../DocumentationTypes';
import { Documentation } from '../pages/Documentation';
import type { Documentation as Document } from '../Reference';
import { Playback, PreviewOverlays, useInView } from '../previews/Motion';
import { PauseButton, TipMotion, useFigurePause, VerdictMotion } from '../previews/MotionStage';
import { CodeSlot, ExampleCode, ExampleRender } from './LiveExample';
import { shownBoxes, useNear } from './Related';
import { SpecimenRender } from './Specimen';

type ExampleBlock = Extract<DocumentationBlock, { kind: 'example' }>;

/**
 * One tip of a page's Tips: its Markdown, a `###` title and its one line, and at most one figure,
 * its picture. A figure with no title before it, as a page not yet rewritten as tips places its do
 * and don't pairs, is a tip of its own, its caption its text.
 */
export interface Tip {
  markdown: string;
  figure?: ExampleBlock;
}

/** A line that opens or closes a fenced code block. */
const fence = /^\s{0,3}(`{3,}|~{3,})/;

/** Markdown cut before each `###` heading outside code: what comes first, then each block. */
function splitBlocks(markdown: string) {
  const parts = [''];
  let code = false;
  for (const line of markdown.split('\n')) {
    if (fence.test(line)) code = !code;
    if (!code && /^### /.test(line)) parts.push('');
    parts[parts.length - 1] += `${line}\n`;
  }
  return { before: parts[0], blocks: parts.slice(1) };
}

/**
 * A section's blocks, after its heading, as tips, and the lead before them: each `###` block a
 * tip, with the figure that follows it its picture, and a figure that follows another its own tip.
 * Undefined where something can't be a tip, such as a table, a legend, a specimen, or an example at
 * several widths or one that needs the column's width, which then show as the section's figures do.
 */
export function tipsOf(blocks: readonly DocumentationBlock[]) {
  let lead = '';
  const tips: Tip[] = [];
  for (const block of blocks) {
    const last = tips.at(-1);
    if (block.kind === 'markdown') {
      if (!block.markdown.trim()) continue;
      // A table or a numbered list is more than a tip's text.
      if (/^\s{0,3}(\||\d+[.)] )/m.test(block.markdown)) return undefined;
      const { before, blocks: parts } = splitBlocks(block.markdown);
      if (before.trim() && last) last.markdown += before;
      else lead += before;
      for (const part of parts) tips.push({ markdown: part });
    } else if (
      block.kind === 'example' &&
      (!block.role || block.role === 'do' || block.role === 'dont') &&
      !block.widths &&
      !block.wide
    ) {
      if (last && !last.figure && last.markdown.trim()) last.figure = block;
      else tips.push({ markdown: '', figure: block });
    } else return undefined;
  }
  return tips.length ? { lead, tips } : undefined;
}

/**
 * The room, in px, between a picture and its thumbnail's edges: at the sides, and above and below,
 * where a corner holds its check or cross or its pause button, clear of them.
 */
const inset = { inline: 12, block: 12, marked: 28 };

/**
 * Draws a thumbnail's picture smaller until what it paints fits the square, centred, as a tile's
 * is (Related.tsx), and never larger than it is. It follows the picture as it loads and resizes.
 * `hold` keeps the room of everything an animated picture has shown, so its view settles after its
 * first loop rather than moving with each step; a change after that eases.
 */
function useThumbnailFit(
  stage: RefObject<HTMLElement | null>,
  canvas: HTMLElement | null,
  hold: boolean,
  marked: boolean,
) {
  useLayoutEffect(() => {
    const frame = stage.current;
    if (!frame || !canvas) return;
    let request = 0;
    let timer = 0;
    let retry = 0;
    let seen: { left: number; top: number; right: number; bottom: number } | undefined;
    let size = '';
    // Before it shows, the fits in a row that held where it is, and the fits so far: it shows once
    // its place holds, as the picture loads and its pointer comes in, rather than moving as it
    // fades in.
    const first = { calm: 0, tries: 0, transform: '' };
    const fit = () => {
      request = 0;
      // What shows while the picture loads is no part of it.
      const boxes = shownBoxes(canvas).filter(({ element }) => !element.closest('.site-loading'));
      if (!boxes.length) return;
      let left = Math.min(...boxes.map(({ box }) => box.left));
      let top = Math.min(...boxes.map(({ box }) => box.top));
      let right = Math.max(...boxes.map(({ box }) => box.right));
      let bottom = Math.max(...boxes.map(({ box }) => box.bottom));
      // A thumbnail of another size, as the window changes, fits afresh.
      const now = `${frame.clientWidth}x${frame.clientHeight}`;
      if (hold && seen && now === size) {
        left = Math.min(left, seen.left);
        top = Math.min(top, seen.top);
        right = Math.max(right, seen.right);
        bottom = Math.max(bottom, seen.bottom);
      }
      seen = { left, top, right, bottom };
      size = now;
      const scale = Math.min(
        1,
        (frame.clientWidth - 2 * inset.inline) / (right - left),
        (frame.clientHeight - 2 * (marked ? inset.marked : inset.block)) / (bottom - top),
      );
      const x = frame.clientWidth / 2 - ((left + right) / 2) * scale;
      const y = frame.clientHeight / 2 - ((top + bottom) / 2) * scale;
      const transform = `translate(${x}px, ${y}px) scale(${scale})`;
      if (canvas.style.transform !== transform) canvas.style.transform = transform;
      if (canvas.dataset.fitted !== undefined) return;
      first.calm = transform === first.transform ? first.calm + 1 : 1;
      first.transform = transform;
      first.tries += 1;
      if (first.calm >= 3 || first.tries >= 40) canvas.dataset.fitted = '';
      else retry = window.setTimeout(update, 50);
    };
    const update = () => {
      if (!request) request = requestAnimationFrame(fit);
    };
    // As an animated picture plays, it is measured a few times a second, not at every step.
    const soon = () => {
      if (!hold) return update();
      if (!timer)
        timer = window.setTimeout(() => {
          timer = 0;
          update();
        }, 250);
    };
    const resize = new ResizeObserver(update);
    resize.observe(frame);
    resize.observe(canvas);
    // The canvas's own style is the fit's; what changes inside it is the picture's.
    const changes = new MutationObserver((records) => {
      if (records.some((record) => record.target !== canvas)) soon();
    });
    changes.observe(canvas, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });
    canvas.addEventListener('transitionend', soon);
    canvas.addEventListener('animationend', soon);
    void document.fonts?.ready.then(update);
    update();
    // Once shown, it eases to a new fit rather than jumping (Tips.css).
    const settle = window.setInterval(() => {
      if (canvas.dataset.fitted === undefined) return;
      canvas.dataset.settled = '';
      clearInterval(settle);
    }, 300);
    return () => {
      cancelAnimationFrame(request);
      clearTimeout(timer);
      clearTimeout(retry);
      clearInterval(settle);
      canvas.removeEventListener('transitionend', soon);
      canvas.removeEventListener('animationend', soon);
      changes.disconnect();
      resize.disconnect();
    };
  }, [stage, canvas, hold, marked]);
}

/**
 * A tip's picture: its example on a small square of the recessed canvas, drawn smaller to fit as a
 * tile's is, inert, with a green check in its corner for a do and a red cross for a don't. An
 * animated one plays its specimen there while in view, with its pause button in the other corner.
 */
function TipThumbnail({ page, block }: { page: string; block: ExampleBlock }) {
  const theme = useTheme();
  const stage = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<HTMLDivElement | null>(null);
  const near = useNear(stage);
  const inView = useInView(stage);
  const [paused, togglePause] = useFigurePause();
  const [label, setLabel] = useState('the picture');
  const motion = Boolean(block.motion);
  const verdict = block.role === 'do' || block.role === 'dont' ? block.role : undefined;
  useThumbnailFit(stage, canvas, motion, Boolean(verdict) || motion);
  const example = <ExampleRender page={page} name={block.name} fallback={null} />;
  const subject = motion ? (
    <VerdictMotion value>
      <TipMotion value={setLabel}>
        <Playback playing={inView && !paused} rest="hold" root={canvas}>
          <PreviewOverlays>
            <SpecimenRender page={page} name={block.name} />
          </PreviewOverlays>
        </Playback>
      </TipMotion>
    </VerdictMotion>
  ) : block.open ? (
    <PreviewOverlays>{example}</PreviewOverlays>
  ) : (
    example
  );
  return (
    <div className="catalogue-tip-figure">
      <Theme
        {...theme}
        ref={stage}
        className="catalogue-related-stage catalogue-tip-stage"
        data-example={block.name}
        data-stage={block.stage}
      >
        {near && (
          <div
            ref={setCanvas}
            className="catalogue-related-canvas catalogue-tip-canvas"
            inert
            aria-hidden
          >
            {subject}
          </div>
        )}
      </Theme>
      {verdict && (
        <Badge
          tone={verdict === 'do' ? 'success' : 'danger'}
          icon={verdict === 'do' ? <Check /> : <Close />}
          className="catalogue-tip-verdict"
        >
          <span className="site-visually-hidden">{verdict === 'do' ? 'Do' : 'Don’t'}</span>
        </Badge>
      )}
      {motion && (
        <PauseButton
          paused={paused}
          label={label}
          onToggle={togglePause}
          className="catalogue-motion-pause catalogue-tip-pause"
        />
      )}
    </div>
  );
}

/**
 * One tip: its picture on the start side, where it has one, and beside it its title, its line and
 * its picture's Code, whose open code shows across the list below the tip.
 */
function TipItem({ reference, tip }: { reference: Document; tip: Tip }) {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const { figure } = tip;
  const text = tip.markdown.trim();
  return (
    <li className="catalogue-tip">
      <CodeSlot value={slot}>
        <div className="catalogue-tip-row">
          {figure && <TipThumbnail page={reference.id} block={figure} />}
          <div className="catalogue-tip-text">
            {text ? (
              <Documentation markdown={text} path={reference.path} />
            ) : (
              <Text className="catalogue-tip-title">{figure?.caption}</Text>
            )}
            {text && figure?.caption && (
              <Text className="catalogue-tip-caption" emphasis="muted">
                {figure.caption}
              </Text>
            )}
            {figure && <ExampleCode page={reference.id} name={figure.name} />}
          </div>
        </div>
      </CodeSlot>
      <div ref={setSlot} className="site-code-slot" />
    </li>
  );
}

/**
 * A page's tips, a list in a centred column: each a small picture, where it has one, beside a title
 * and one line. A tip without a picture lines its text up with the others'.
 */
export function TipList({ reference, tips }: { reference: Document; tips: Tip[] }) {
  return (
    <ul
      className="catalogue-tips"
      data-pictures={tips.some((tip) => tip.figure) ? undefined : 'none'}
    >
      {tips.map((tip, index) => (
        <TipItem key={index} reference={reference} tip={tip} />
      ))}
    </ul>
  );
}
