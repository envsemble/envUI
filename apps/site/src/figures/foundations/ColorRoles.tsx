import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Column, Row, Surface, Text, useTheme } from '@envsemble/envui';
import { ColorSwatch } from '@envsemble/envui/color';
import { MarkedSubject } from './Marks';
import { Figure } from './Figure';
import { useHighContrast, useNarrow, type FigureWords } from './ColorFigures';

/**
 * The color of each role, in the legend's order: the page, a surface, a filled card, text,
 * supporting text and the primary color.
 */
const roleColors: readonly string[] = [
  'bg-page',
  'bg-default',
  'bg-muted',
  'fg-default',
  'fg-muted',
  'bg-primary-emphasis',
];

/**
 * The colors of envUI color tokens, such as `bg-page`, in the reader's theme and contrast, as CSS
 * colors a ColorSwatch takes, such as rgb(250, 249, 247): ColorSwatch takes a color, not a custom
 * property, so a hidden probe in the figure's theme takes each token as its color, and a pixel
 * painted in that color gives it in sRGB, whatever the token's color space. Measured again when
 * the theme or contrast changes, before the figure is painted; none until the probe is placed.
 */
function useTokenColors(tokens: readonly string[]) {
  const probe = useRef<HTMLSpanElement>(null);
  const { theme, contrast } = useTheme();
  const high = useHighContrast(contrast);
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
  }, [tokens, theme, contrast, high]);
  const element = <span ref={probe} hidden style={{ transition: 'none' }} />;
  return [element, colors] as const;
}

/**
 * A swatch of a color beside its name, the name saying what it is: decorative, so a screen reader
 * reads the name alone. Nothing until its color is measured.
 */
function Swatch({ color }: { color: string | undefined }) {
  return color ? <ColorSwatch color={color} aria-hidden="true" /> : null;
}

/**
 * A small screen with a callout on each part that takes a role: the page, a surface on it, a
 * filled card inside, text, supporting text and the primary color. Each callout ends in a swatch of the
 * role's color in the reader's theme and the role's name, in one column at the screen's end, so a
 * part, its color and its name read as one, with no legend below.
 */
export function RolesFigure({ legend }: FigureWords) {
  const [probe, colors] = useTokenColors(roleColors);
  const [frame, narrow] = useNarrow(rolesWidth);
  // On a phone the screen takes less padding and the names may wrap, so both fit side by side.
  const room = narrow
    ? ({ page: 3, surface: 4, card: 3 } as const)
    : ({ page: 5, surface: 5, card: 4 } as const);
  return (
    <Figure
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
            padding={room.page}
            radius="xl"
            data-catalogue-mark="1"
            className="catalogue-roles"
          >
            <Surface
              background="default"
              padding={room.surface}
              radius="xl"
              data-catalogue-mark="2"
              render={<Column gap={5} />}
            >
              <Text render={<p />} variant="title" data-catalogue-mark="4">
                Quarterly report
              </Text>
              <Surface
                background="muted"
                padding={room.card}
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
    </Figure>
  );
}

/** The narrowest the roles figure keeps its screen's full padding and its names on one line, in rem. */
const rolesWidth = 26;
