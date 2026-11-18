import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Column, Row, Surface, Text, useTheme } from '@envsemble/envui';
import { ColorSwatch } from '@envsemble/envui/color';
import { MarkedSubject } from './Marks';
import { FoundationFrame } from './FoundationFrame';
import { useHighContrast, useNarrow, type FigureWords } from './ColorFigures';

const roleColors: readonly string[] = [
  'bg-page',
  'bg-default',
  'bg-muted',
  'fg-default',
  'fg-muted',
  'bg-primary-emphasis',
];

function useTokenColors(tokens: readonly string[]) {
  const probe = useRef<HTMLSpanElement>(null);
  const { theme, contrast } = useTheme();
  const showsHighContrast = useHighContrast(contrast);
  const [colors, setColors] = useState<readonly string[]>([]);
  useLayoutEffect(() => {
    const element = probe.current;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const pixel = canvas.getContext('2d', { willReadFrequently: true });
    if (!element || !pixel) return;
    setColors(
      tokens.map((token) => {
        element.style.color = `var(--env-color-${token})`;
        pixel.clearRect(0, 0, 1, 1);
        pixel.fillStyle = getComputedStyle(element).color;
        pixel.fillRect(0, 0, 1, 1);
        const [red = 0, green = 0, blue = 0, alpha = 255] = pixel.getImageData(0, 0, 1, 1).data;
        return `rgba(${red}, ${green}, ${blue}, ${Math.round((alpha / 255) * 100) / 100})`;
      }),
    );
  }, [tokens, theme, contrast, showsHighContrast]);
  const element = <span ref={probe} hidden style={{ transition: 'none' }} />;
  return [element, colors] as const;
}

function Swatch({ color }: { color: string | undefined }) {
  return color ? <ColorSwatch color={color} aria-hidden="true" /> : null;
}

export function RolesFigure({ legend }: FigureWords) {
  const [probe, colors] = useTokenColors(roleColors);
  const [frame, narrow] = useNarrow(rolesFullPaddingMinWidthRem);
  const padding = narrow
    ? ({ page: 3, surface: 4, card: 3 } as const)
    : ({ page: 5, surface: 5, card: 4 } as const);
  return (
    <FoundationFrame
      label="The color roles of a screen"
      className="catalogue-marked-stage catalogue-roles-stage"
    >
      {probe}
      <div ref={frame} className="catalogue-roles-frame" data-narrow={narrow || undefined}>
        <MarkedSubject
          named={legend.map((entry, index) => (
            <span key={entry.name} className="catalogue-role-name">
              <Swatch color={colors[index]} />
              <Text render={<span />} variant="body-sm">
                {entry.name}
              </Text>
            </span>
          ))}
        >
          <Surface
            background="page"
            padding={padding.page}
            radius="xl"
            data-catalogue-mark="1"
            className="catalogue-roles"
          >
            <Surface
              background="default"
              padding={padding.surface}
              radius="xl"
              data-catalogue-mark="2"
              render={<Column gap={5} />}
            >
              <Text render={<p />} variant="title" data-catalogue-mark="4">
                Quarterly report
              </Text>
              <Surface
                background="muted"
                padding={padding.card}
                radius="sm"
                data-catalogue-mark="3"
                render={<Column gap={1} />}
              >
                <Text render={<p />} variant="title">
                  £34,000
                </Text>
                <Text emphasis="muted" data-catalogue-mark="5">
                  Spent of £50,000
                </Text>
              </Surface>
              <Row justify="end">
                <Button data-catalogue-mark="6">Share</Button>
              </Row>
            </Surface>
          </Surface>
        </MarkedSubject>
      </div>
    </FoundationFrame>
  );
}

const rolesFullPaddingMinWidthRem = 26;
