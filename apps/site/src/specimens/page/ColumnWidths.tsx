import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Grid, Page, Surface, type PageWidth } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';
import { remPixels } from '../../shared/Lengths';
import { remeasure } from '../../shared/Remeasure';

const windowRem = { width: 88, height: 17 };
const windowGuttersRem = 3;
const windowShareOfStage = 0.92;

const widths: readonly { width: PageWidth; columnRem: number; words: string }[] = [
  { width: 'sm', columnRem: 40, words: 'Small · 40 rem' },
  { width: 'md', columnRem: 60, words: 'Medium · 60 rem' },
  { width: 'lg', columnRem: 76, words: 'Large · 76 rem' },
  { width: 'full', columnRem: windowRem.width - windowGuttersRem, words: 'Full' },
];

const durationsMs = [900, 1200, 1200, 1200];

function Widening() {
  const step = useTimeline(durationsMs);
  const area = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const { width, columnRem, words } = widths[step];

  useLayoutEffect(() => {
    const element = area.current;
    if (!element) return;
    const fit = () => {
      const rem = remPixels();
      setScale(Math.min(1, (windowShareOfStage * element.clientWidth) / (windowRem.width * rem)));
    };
    return remeasure(fit, { first: 'now', resize: [element] }).stop;
  }, []);

  const ruler: CSSProperties = { inlineSize: `calc(${scale} * ${columnRem}rem)` };
  const page: CSSProperties = {
    maxInlineSize: `calc(${columnRem}rem + 2 * var(--env-page-gutter))`,
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
        style={{
          inlineSize: `${windowRem.width * scale}rem`,
          blockSize: `${windowRem.height * scale}rem`,
        }}
      >
        <div
          style={{
            inlineSize: `${windowRem.width}rem`,
            blockSize: `${windowRem.height}rem`,
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
            <Page width={width} style={page}>
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

export default function ColumnWidths() {
  return (
    <SpecimenFrame size="wide">
      <MotionStage label="the page column widening">
        <Widening />
      </MotionStage>
    </SpecimenFrame>
  );
}
