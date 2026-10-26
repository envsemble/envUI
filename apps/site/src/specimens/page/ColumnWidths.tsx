import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Grid, Page, PageHeader, Surface, type PageWidth } from '@envsemble/envui';
import { Example } from '../../previews/Example';
import { useTimeline } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/** The window the page sits in, in rem: wider than the large column, so Full reads as wider. */
const frame = { width: 88, height: 21 };

/** Each width in turn, the column's width in rem, and what the ruler names it. */
const widths: readonly { width: PageWidth; column: number; words: string }[] = [
  { width: 'sm', column: 40, words: 'Small · 40 rem' },
  { width: 'md', column: 60, words: 'Medium · 60 rem' },
  { width: 'lg', column: 76, words: 'Large · 76 rem' },
  // Full fills the window, inside its gutters.
  { width: 'full', column: frame.width - 3, words: 'Full' },
];

/** How long each width shows, its move in, then its hold, in ms; the last leads back to Small. */
const durations = [1500, 2000, 2000, 2000];

/** How long the column takes to move to a width, in ms, and back from Full to Small. */
const move = 900;
const moveBack = 1300;

/*
 * A page in a window drawn small, its column widening from Small through Medium and Large to Full,
 * and back to Small, with a ruler above it naming the width.
 */
function Widening() {
  const step = useTimeline(durations);
  const area = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const { width, column, words } = widths[step]!;
  const travel = `${step === 0 ? moveBack : move}ms var(--env-motion-ease)`;

  // The window is drawn at the scale that fits the stage, again as the stage resizes.
  useLayoutEffect(() => {
    const element = area.current;
    if (!element) return;
    const fit = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      // A little room on either side, so the window reads as one on the stage.
      setScale(Math.min(1, (0.92 * element.clientWidth) / (frame.width * rem)));
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(element);
    return () => resize.disconnect();
  }, []);

  const ruler: CSSProperties = {
    inlineSize: `calc(${scale} * ${column}rem)`,
    transition: `inline-size ${travel}`,
  };
  const page: CSSProperties = {
    // The column's own width, eased as it changes, Full's as wide as the window's.
    maxInlineSize: `calc(${column}rem + 2 * var(--env-page-gutter))`,
    transition: `max-inline-size ${travel}`,
  };
  return (
    <div
      ref={area}
      style={{ display: 'grid', justifyItems: 'center', rowGap: '1rem', inlineSize: '100%' }}
    >
      <div className="catalogue-width-ruler" style={ruler} aria-hidden="true">
        <span className="catalogue-width-ruler-reading">{words}</span>
      </div>
      <div
        style={{ inlineSize: `${frame.width * scale}rem`, blockSize: `${frame.height * scale}rem` }}
      >
        <div
          style={{
            inlineSize: `${frame.width}rem`,
            blockSize: `${frame.height}rem`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <Surface
            background="page"
            radius="sm"
            padding={0}
            style={{ blockSize: '100%', overflow: 'hidden', containerType: 'inline-size' }}
          >
            <Page
              width={width}
              style={page}
              header={<PageHeader title="Quarterly report" headingLevel={4} />}
            >
              <Grid columns="2fr 1fr" gap={4}>
                <Surface background="muted" radius="sm" style={{ blockSize: '7rem' }} />
                <Surface background="muted" radius="sm" style={{ blockSize: '7rem' }} />
                <Surface
                  background="muted"
                  radius="sm"
                  style={{ blockSize: '4rem', gridColumn: '1 / -1' }}
                />
              </Grid>
            </Page>
          </Surface>
        </div>
      </div>
    </div>
  );
}

/** Page's widths, one after another, in a window drawn small: the column widens to each. */
export default function ColumnWidths() {
  return (
    <Example size="wide">
      <MotionStage label="the page column widening">
        <Widening />
      </MotionStage>
    </Example>
  );
}
