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
import { SpecimenGrid, SpecimenHeadingLevel } from '../../figures/SpecimenFrame';
import { prefersReducedMotion } from '../../shared/ReducedMotion';
import { remeasure } from '../../shared/Remeasure';

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

const taglines: Record<LineArtDrawing, string> = {
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

const sheetWidth = 480;
const sheetHeight = 330;

type FigureBounds = readonly [x: number, y: number, width: number, height: number];

const figureBoundsOnSheet: Record<LineArtDrawing, FigureBounds> = {
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

function sheetPlaceCenteringFigure(drawing: LineArtDrawing): CSSProperties {
  const [x, y, width, height] = figureBoundsOnSheet[drawing];
  const sheetUnitInRoom = `min(100cqi / ${width}, 100cqb / ${height})`;
  return {
    position: 'absolute',
    insetBlockStart: `calc(50cqb - ${y + height / 2} * ${sheetUnitInRoom})`,
    insetInlineStart: `calc(50cqi - ${x + width / 2} * ${sheetUnitInRoom})`,
    inlineSize: `calc(${sheetWidth} * ${sheetUnitInRoom})`,
    blockSize: `calc(${sheetHeight} * ${sheetUnitInRoom})`,
    overflow: 'visible',
  };
}

const area: CSSProperties = { position: 'relative', overflow: 'hidden', aspectRatio: '4 / 3' };
const room: CSSProperties = { position: 'absolute', inset: '6%', containerType: 'size' };

const cardFillLighterThanStage: CSSProperties = {
  '--_surface-container-default':
    'light-dark(var(--env-color-bg-muted), var(--env-color-bg-default))',
};

const threeGalleryRows: CSSProperties = {
  display: 'grid',
  gridRow: 'span 3',
  gridTemplateRows: 'subgrid',
  rowGap: 'var(--env-space-1)',
  alignItems: 'start',
};

const motions: { motion: LineArtMotion; label: string; icon: ReactNode }[] = [
  { motion: 'appear', label: 'Appear', icon: <IconDraw /> },
  { motion: 'disappear', label: 'Disappear', icon: <IconInkEraser /> },
  { motion: 'loop', label: 'Loop', icon: <IconRepeat /> },
  { motion: 'play', label: 'Play', icon: <IconPlayArrow /> },
];

function DrawingCard({ drawing }: { drawing: LineArtDrawing }) {
  const level = useContext(SpecimenHeadingLevel);
  const Heading = level === 2 ? 'h3' : 'h4';
  const [played, setPlayed] = useState<{
    motion?: LineArtMotion;
    turn: number;
    stopping?: boolean;
  }>({ turn: 0 });
  const looping = played.motion === 'loop' && !played.stopping;
  const play = (motion: LineArtMotion) => {
    if (motion === 'loop' && looping) {
      const loopIsAlreadyStill = prefersReducedMotion();
      setPlayed(({ turn }) =>
        loopIsAlreadyStill ? { turn: turn + 1 } : { motion, turn, stopping: true },
      );
    } else setPlayed(({ turn }) => ({ motion, turn: turn + 1 }));
  };
  const restOnceStoppingLoopDrawsIn = (event: AnimationEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const allLinesDrawnIn =
      svg.dataset.turn === 'in' &&
      svg.getAnimations({ subtree: true }).every((motion) => motion.playState === 'finished');
    if (played.stopping && allLinesDrawnIn) setPlayed(({ turn }) => ({ turn }));
  };
  return (
    <li style={threeGalleryRows}>
      <Surface
        background="page"
        padding={3}
        style={cardFillLighterThanStage}
        render={<Column gap={2} />}
      >
        <div style={area}>
          <div style={room}>
            <LineArt
              key={played.turn}
              drawing={drawing}
              motion={played.motion}
              onAnimationEnd={restOnceStoppingLoopDrawsIn}
              style={sheetPlaceCenteringFigure(drawing)}
            />
          </div>
        </div>
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
        {taglines[drawing]}
      </Text>
    </li>
  );
}

const gapBetweenCardsAcross = 'var(--env-space-3)';

function useColumnsFittingButtonRows(list: RefObject<HTMLUListElement | null>) {
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
      const buttonRowWidth =
        Math.max(...buttons.map(({ right }) => right)) -
        Math.min(...buttons.map(({ left }) => left));
      const cardPadding = card.offsetWidth - toolbar.offsetWidth;
      const need = buttonRowWidth + cardPadding;
      const space = ul.clientWidth;
      const between = Number.parseFloat(getComputedStyle(ul).columnGap) || 0;
      setColumns(space >= 4 * need + 3 * between ? 4 : space >= 2 * need + between ? 2 : 1);
    };
    return remeasure(measure, { first: 'now', resize: [ul, toolbar] }).stop;
  }, [list]);
  return columns;
}

export default function Drawings() {
  const theme = useTheme();
  const list = useRef<HTMLUListElement>(null);
  const columns = useColumnsFittingButtonRows(list);
  return (
    <SpecimenGrid size="wide">
      <Theme {...theme} scale="compact" style={{ background: 'none' }}>
        <ul
          ref={list}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: `var(--env-space-5) ${gapBetweenCardsAcross}`,
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
