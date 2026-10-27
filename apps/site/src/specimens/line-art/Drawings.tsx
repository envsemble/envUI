import {
  useContext,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  Column,
  LineArt,
  lineArtDrawings,
  Text,
  Toolbar,
  type LineArtDrawing,
  type LineArtMotion,
} from '@envsemble/envui';
import { Draw } from '@envsemble/envui/icons/Draw';
import { InkEraser } from '@envsemble/envui/icons/InkEraser';
import { PlayArrow } from '@envsemble/envui/icons/PlayArrow';
import { Repeat } from '@envsemble/envui/icons/Repeat';
import { SpecimenHeadingLevel } from '../../previews/Example';

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

/** The card's room for the figure, inside its margin, which the sheet is measured against. */
const room: CSSProperties = { position: 'absolute', inset: '12%', containerType: 'size' };

/** The motions people can play on a card, each a button of its toolbar. */
const motions: { motion: LineArtMotion; label: string; icon: ReactNode }[] = [
  { motion: 'appear', label: 'Appear', icon: <Draw /> },
  { motion: 'disappear', label: 'Disappear', icon: <InkEraser /> },
  { motion: 'loop', label: 'Loop', icon: <Repeat /> },
  { motion: 'play', label: 'Play', icon: <PlayArrow /> },
];

/**
 * One drawing, whole and centred on the recessed canvas of a gallery's card, its name under it and
 * a toolbar that plays its motions. Each press plays its motion from the start; the drawing ends
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
    <Column render={<li />} gap={3}>
      <div
        className="catalogue-related-stage catalogue-gallery-stage"
        style={{ display: 'block', maxBlockSize: 'none' }}
      >
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
      <Column gap={1} align="start">
        <Text render={<Heading />} variant="body-sm" emphasis="muted" style={{ margin: 0 }}>
          {names[drawing]}
        </Text>
        <Toolbar.Root
          aria-label={`${names[drawing]}, motions`}
          size="sm"
          // The first button's icon in line with the name, past the ghost button's own inset.
          style={{
            marginInlineStart:
              'calc((var(--env-control-height-sm) - var(--env-control-icon-size)) / -2)',
          }}
        >
          {motions.map(({ motion, label, icon }) => (
            <Toolbar.Button
              key={motion}
              icon={icon}
              label={label}
              pressed={motion === 'loop' ? looping : undefined}
              onClick={() => play(motion)}
            />
          ))}
        </Toolbar.Root>
      </Column>
    </Column>
  );
}

/**
 * The columns of the gallery: four across where four cards fit with room for their toolbars, else
 * two, so sixteen never leave one alone on a row.
 */
const gap = 'var(--env-space-5)';
const columns = `repeat(auto-fill, minmax(clamp(calc(25% - 0.75 * ${gap} - 0.01rem), (40rem - 100%) * 999, calc(50% - 0.5 * ${gap} - 0.01rem)), 1fr))`;

/**
 * Every drawing as a card of a gallery, whole and centred on its canvas, with its name and a
 * toolbar that plays its motions there: in, out, in and out by turns, or played through.
 */
export default function Drawings() {
  return (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: columns,
        gap: `var(--env-space-7) ${gap}`,
        margin: 0,
        padding: 0,
        listStyle: 'none',
      }}
    >
      {lineArtDrawings.map((drawing) => (
        <DrawingCard key={drawing} drawing={drawing} />
      ))}
    </ul>
  );
}
