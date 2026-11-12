import type { CSSProperties, ReactNode } from 'react';
import {
  Button,
  Checkbox,
  Column,
  Row,
  Surface,
  Switch,
  TextField,
  Theme,
  useTheme,
} from '@envsemble/envui';

// A lavender scheme: the roles an area takes, with their hover and press, in each theme.
const lavender = {
  light: {
    '--env-color-bg-default': 'oklch(0.955 0.024 300)',
    '--env-color-bg-primary-emphasis': 'oklch(0.43 0.11 300)',
    '--env-color-bg-primary-emphasis-hover': 'oklch(0.395 0.11 300)',
    '--env-color-bg-primary-emphasis-pressed': 'oklch(0.36 0.11 300)',
    '--env-color-bg-primary-solid': 'oklch(0.43 0.11 300)',
    '--env-color-fg-on-emphasis': 'oklch(1 0 0)',
    '--env-color-fg-primary': 'oklch(0.43 0.11 300)',
    '--env-color-border-focus': 'oklch(0.43 0.11 300)',
  },
  dark: {
    '--env-color-bg-default': 'oklch(0.235 0.022 300)',
    '--env-color-bg-primary-emphasis': 'oklch(0.84 0.08 300)',
    '--env-color-bg-primary-emphasis-hover': 'oklch(0.805 0.08 300)',
    '--env-color-bg-primary-emphasis-pressed': 'oklch(0.77 0.08 300)',
    '--env-color-bg-primary-solid': 'oklch(0.84 0.08 300)',
    '--env-color-fg-on-emphasis': 'oklch(0.2 0.04 300)',
    '--env-color-fg-primary': 'oklch(0.84 0.08 300)',
    '--env-color-border-focus': 'oklch(0.84 0.08 300)',
  },
};

// A nested Theme recolors its area: every component inside follows, hover and press included.
function LavenderArea({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <Theme theme={theme} style={lavender[theme] as CSSProperties}>
      {children}
    </Theme>
  );
}

export default function OwnColors() {
  return (
    <LavenderArea>
      <Surface background="default" padding={5} radius="xl" render={<Column gap={4} />}>
        <TextField label="Trip name" defaultValue="Spring in Lisbon" />
        <Checkbox label="Share with travelers" defaultChecked />
        <Switch label="Save maps offline" defaultChecked />
        <Row gap={2} justify="end">
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </Row>
      </Surface>
    </LavenderArea>
  );
}
