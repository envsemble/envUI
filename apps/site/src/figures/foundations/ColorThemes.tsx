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
import { FoundationFrame } from './FoundationFrame';
import type { FigureWords } from './ColorFigures';

const themes: readonly { theme: ColorScheme; contrast: ThemeContrast }[] = [
  { theme: 'light', contrast: 'standard' },
  { theme: 'light', contrast: 'high' },
  { theme: 'dark', contrast: 'standard' },
  { theme: 'dark', contrast: 'high' },
];

const themeStepMs = 1200;

function ThemeSteps({ names }: { names: readonly string[] }) {
  const step = useTimeline(themes.map(() => themeStepMs));
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

export function ThemesFigure({ legend }: FigureWords) {
  return (
    <FoundationFrame label="One screen in each theme" motion="the screen in each theme">
      <ThemeSteps names={legend.map((entry) => entry.name)} />
    </FoundationFrame>
  );
}
