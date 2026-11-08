import {
  Badge,
  Button,
  Column,
  Meter,
  Row,
  Surface,
  Text,
  Theme,
  type ThemeContrast,
  type ColorScheme,
} from '@envsemble/envui';
import { useTimeline } from '../../motion/Timeline';
import { CornerLabel } from './Steps';
import { Figure } from './Topic';
import type { FigureWords } from './ColorFigures';

/** The theme and contrast of each sample, in the legend's order. */
const themes: readonly { theme: ColorScheme; contrast: ThemeContrast }[] = [
  { theme: 'light', contrast: 'standard' },
  { theme: 'light', contrast: 'high' },
  { theme: 'dark', contrast: 'standard' },
  { theme: 'dark', contrast: 'high' },
];

/** How long the screen stays in each theme, in ms. */
const themeStep = 2000;

/**
 * One screen in each theme in turn, in the legend's order, each theme beside its high contrast,
 * named in the corner: the screen cuts to each, its page, surface, filled card, text, meter, badge
 * and buttons at once.
 */
function ThemeSteps({ names }: { names: readonly string[] }) {
  const step = useTimeline(themes.map(() => themeStep));
  const { theme, contrast } = themes[step] ?? themes[0]!;
  return (
    <>
      <CornerLabel>{names[step]}</CornerLabel>
      <Theme theme={theme} contrast={contrast} className="catalogue-theme-screen">
        <Surface background="page" padding={4} radius="xl">
          <Surface background="default" padding={5} radius="xl" render={<Column gap={4} />}>
            <Row wrap justify="between" align="start" gap={3}>
              <Column gap={1}>
                <Text render={<p />} variant="title">
                  Quarterly report
                </Text>
                <Text emphasis="muted">Updated today by Priya Shah</Text>
              </Column>
              <Badge tone="success">On track</Badge>
            </Row>
            <Surface background="muted" padding={4} radius="sm">
              <Meter label="Budget" value={34} max={50} valueText="£34,000 of £50,000" />
            </Surface>
            <Row justify="end" gap={2}>
              <Button variant="secondary">Preview</Button>
              <Button>Share</Button>
            </Row>
          </Surface>
        </Surface>
      </Theme>
    </>
  );
}

/** One screen stepping through each theme and contrast, the one shown named in the corner. */
export function ThemesFigure({ legend }: FigureWords) {
  return (
    <Figure label="One screen in each theme" motion="the screen in each theme">
      <ThemeSteps names={legend.map((entry) => entry.name)} />
    </Figure>
  );
}
