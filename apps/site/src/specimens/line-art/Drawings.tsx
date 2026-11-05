import {
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  LineArt,
  lineArtDrawings,
  Column,
  Surface,
  Text,
  Theme,
  Toolbar,
  useTheme,
  type LineArtDrawing,
  type LineArtMotion,
} from '@envsemble/envui';
import { IconDraw } from '@envsemble/envui/icons/Draw';
import { IconInkEraser } from '@envsemble/envui/icons/InkEraser';
import { IconPlayArrow } from '@envsemble/envui/icons/PlayArrow';
import { IconRepeat } from '@envsemble/envui/icons/Repeat';
import { SpecimenGrid, SpecimenHeadingLevel } from '../../figures/Example';

/** Each drawing's name, as people say it. */
const names: Record<LineArtDrawing, string> = {
  'golden-section': 'Golden section',
  'square-circle-triangle': 'Square, circle, triangle',
  'whirling-squares': 'Whirling squares',
  'triangle-and-circles': 'Triangle and circles',
  'ford-circles': 'Ford circles',
  'harmonic-division': 'Harmonic division',
  'pappus-chain': 'Pappus chain',
  'root-rectangles': 'Root rectangles',
  'sacred-cut': 'Sacred cut',
  'gothic-tracery': 'Gothic tracery',
  'quartered-square': 'Quartered square',
  'graded-quadtree': 'Graded quadtree',
  monochord: 'Monochord',
  'logarithmic-grid': 'Logarithmic grid',
  'pointed-arcade': 'Pointed arcade',
  'root-two-halving': 'Root-two halving',
};

/** What each drawing is, in a few quiet words under its name. */
const lines: Record<LineArtDrawing, string> = {
  'golden-section': 'A spiral of squares',
  'square-circle-triangle': 'Three shapes, one grid',
  'whirling-squares': 'Squares turning inwards',
  'triangle-and-circles': 'Inner and outer circles',
  'ford-circles': 'Circles on a base line',
  'harmonic-division': 'Halves, thirds and on',
  'pappus-chain': 'Circles between arcs',
  'root-rectangles': 'Grown from a square',
  'sacred-cut': 'Arcs from the corners',
  'gothic-tracery': 'Arches within arches',
  'quartered-square': 'A circle per quarter',
  'graded-quadtree': 'Finer towards one end',
  monochord: 'Octave, fifth, fourth',
  'logarithmic-grid': "A slide rule's scale",
  'pointed-arcade': 'Ever smaller arches',
  'root-two-halving': 'Halves of halves',
};

/**
 * Each drawing's figure on its sheet of 480 by 330, as `[x, y, width, height]` from the sheet's top
 * start corner: everything the drawing draws, its lines' ends included, so the card shows it whole.
 * Ford circles' largest circle runs far off the sheet, so its figure is the sheet.
 */
const figures: Record<LineArtDrawing, readonly [number, number, number, number]> = {
  'golden-section': [43, 60, 437, 270],
  'square-circle-triangle': [96, -2, 386, 334],
  'whirling-squares': [194, 44, 286, 286],
  'triangle-and-circles': [96, -2, 408, 408],
  'ford-circles': [0, 0, 480, 330],
  'harmonic-division': [30, -2, 452, 334],
  'pappus-chain': [26, 110, 456, 220],
  'root-rectangles': [18.8, -2, 463.2, 334],
  'sacred-cut': [201, -2, 281, 334],
  'gothic-tracery': [14, 24, 624, 308],
  'quartered-square': [198, 48, 282, 282],
  'graded-quadtree': [14, -27, 480, 384],
  monochord: [18, -2, 464, 334],
  'logarithmic-grid': [190, -2, 292, 334],
  'pointed-arcade': [14, -2, 468, 334],
  'root-two-halving': [21.9, -2, 460.1, 334],
};

/**
 * Where a drawing's sheet sits in its card: the sheet at its own proportions, scaled so the figure
 * fits the card inside its margin, and placed so the figure's middle is the card's, whatever part
 * of the sheet it takes. The sheet shows what runs past it, up to the card's edge.
 */
function sheetPlace(drawing: LineArtDrawing): CSSProperties {
  const [x, y, width, height] = figures[drawing];
  // One unit of the sheet, in the card's room (container units of the box around the sheet).
  const unit = `min(100cqi / ${width}, 100cqb / ${height})`;
  return {
    position: 'absolute',
    insetBlockStart: `calc(50cqb - ${y + height / 2} * ${unit})`,
    insetInlineStart: `calc(50cqi - ${x + width / 2} * ${unit})`,
    inlineSize: `calc(480 * ${unit})`,
    blockSize: `calc(330 * ${unit})`,
    overflow: 'visible',
  };
}

/**
 * The drawing's area at the top of its card, above the buttons, which clips what runs past the
 * figure; and its room inside a small margin, which the sheet is measured against.
 */
const area: CSSProperties = { position: 'relative', overflow: 'hidden', aspectRatio: '4 / 3' };
const room: CSSProperties = { position: 'absolute', inset: '6%', containerType: 'size' };

/** A drawing's card: its fill, a step lighter than the stage in every theme. */
const card = {
  '--env-surface-container-default':
    'light-dark(var(--env-color-bg-muted), var(--env-color-bg-default))',
} as CSSProperties;

/** A card's place in the gallery: its card, its name and its line, each a row of the gallery's. */
const row: CSSProperties = {
  display: 'grid',
  gridRow: 'span 3',
  gridTemplateRows: 'subgrid',
  rowGap: 'var(--env-space-1)',
  alignItems: 'start',
};

/** The motions people can play on a card, each a button of its toolbar. */
const motions: { motion: LineArtMotion; label: string; icon: ReactNode }[] = [
  { motion: 'appear', label: 'Appear', icon: <IconDraw /> },
  { motion: 'disappear', label: 'Disappear', icon: <IconInkEraser /> },
  { motion: 'loop', label: 'Loop', icon: <IconRepeat /> },
  { motion: 'play', label: 'Play', icon: <IconPlayArrow /> },
];

/**
 * One drawing on a lighter card of its own, whole and centred above the row of buttons that play its
 * motions, with its name and a few words on it under the card. Each press plays its motion from the start; the drawing ends
 * where the motion does, and a loop runs until its button is pressed again, then draws in and rests.
 */
function DrawingCard({ drawing }: { drawing: LineArtDrawing }) {
  const level = useContext(SpecimenHeadingLevel);
  const Heading = level === 2 ? 'h3' : 'h4';
  // The motion, each press's turn, which draws the drawing anew so its motion starts over, and
  // whether a loop is stopping: it runs on until its lines have drawn in, and rests there whole.
  const [played, setPlayed] = useState<{
    motion?: LineArtMotion;
    turn: number;
    stopping?: boolean;
  }>({ turn: 0 });
  const looping = played.motion === 'loop' && !played.stopping;
  const play = (motion: LineArtMotion) => {
    if (motion === 'loop' && looping) {
      // Where reduced motion is preferred, a loop is already still and whole.
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      setPlayed(({ turn }) => (reduced ? { turn: turn + 1 } : { motion, turn, stopping: true }));
    } else setPlayed(({ turn }) => ({ motion, turn: turn + 1 }));
  };
  // A stopping loop's lines have all drawn in once every line's motion of its turn in has ended.
  const rest = (event: AnimationEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    if (
      played.stopping &&
      svg.dataset.turn === 'in' &&
      svg.getAnimations({ subtree: true }).every((motion) => motion.playState === 'finished')
    )
      setPlayed(({ turn }) => ({ turn }));
  };
  return (
    // Three rows of the gallery's, so the names and their lines line up across a row.
    <li style={row}>
      {/* A lighter card on the figure's stage: a card's white in the light themes, where the
          stage is barely below the panes, and a pane's in the dark ones, where the page is barely
          lighter than the stage. The drawing is on top, the buttons in a row below it. */}
      <Surface background="page" padding={3} style={card} render={<Column gap={2} />}>
        <div style={area}>
          <div style={room}>
            <LineArt
              key={played.turn}
              drawing={drawing}
              motion={played.motion}
              onAnimationEnd={rest}
              style={sheetPlace(drawing)}
            />
          </div>
        </div>
        {/* Small round filled buttons, as a figure's pause button is. */}
        <Toolbar.Root aria-label={`${names[drawing]}, motions`} size="sm">
          {motions.map(({ motion, label, icon }) => (
            <Toolbar.Button
              key={motion}
              variant="secondary"
              icon={icon}
              label={label}
              pressed={motion === 'loop' ? looping : undefined}
              onClick={() => play(motion)}
            />
          ))}
        </Toolbar.Root>
      </Surface>
      <Text render={<Heading />} variant="body" style={{ margin: 0 }}>
        {names[drawing]}
      </Text>
      <Text variant="caption" emphasis="muted">
        {lines[drawing]}
      </Text>
    </li>
  );
}

/** The gap between the gallery's cards, across. */
const gap = 'var(--env-space-3)';

/**
 * How many cards the gallery shows across: four where four fit, else two, else one, so sixteen
 * never leave one alone on a row. A card fits where it holds its row of buttons at their full size,
 * which grows under a coarse pointer, so the count is measured rather than set at a fixed width.
 */
function useColumns(list: RefObject<HTMLUListElement | null>) {
  const [columns, setColumns] = useState<1 | 2 | 4>(4);
  useLayoutEffect(() => {
    const ul = list.current;
    const toolbar = ul?.querySelector<HTMLElement>('[role="toolbar"]');
    const card = toolbar?.parentElement;
    if (!ul || !toolbar || !card) return;
    const measure = () => {
      const buttons = [...toolbar.querySelectorAll('button')].map((button) =>
        button.getBoundingClientRect(),
      );
      if (!buttons.length) return;
      // The buttons' row at its own width, and the card's padding around it.
      const row =
        Math.max(...buttons.map(({ right }) => right)) -
        Math.min(...buttons.map(({ left }) => left));
      const need = row + card.offsetWidth - toolbar.offsetWidth;
      const space = ul.clientWidth;
      const between = Number.parseFloat(getComputedStyle(ul).columnGap) || 0;
      setColumns(space >= 4 * need + 3 * between ? 4 : space >= 2 * need + between ? 2 : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ul);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, [list]);
  return columns;
}

/**
 * Every drawing on a card of its own, whole and centred, on one stage, with its name and the
 * buttons that play its motions there: in, out, in and out by turns, or played through.
 */
export default function Drawings() {
  const theme = useTheme();
  const list = useRef<HTMLUListElement>(null);
  const columns = useColumns(list);
  return (
    <SpecimenGrid size="wide">
      {/* The compact scale, the cards' small buttons and quiet names; the stage shows through. */}
      <Theme {...theme} scale="compact" style={{ background: 'none' }}>
        <ul
          ref={list}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: `var(--env-space-5) ${gap}`,
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {lineArtDrawings.map((drawing) => (
            <DrawingCard key={drawing} drawing={drawing} />
          ))}
        </ul>
      </Theme>
    </SpecimenGrid>
  );
}
