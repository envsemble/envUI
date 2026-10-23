import type { CSSProperties } from 'react';
import { Button, Column, Surface, Switch, Text, Theme, useTheme } from '@envsemble/envui';

/** The brand's roles in green, with their hover and pressed values, for each theme. */
const green = {
  light: {
    '--env-color-bg-brand-emphasis': '#176f35',
    '--env-color-bg-brand-emphasis-hover': '#115a2a',
    '--env-color-bg-brand-emphasis-pressed': '#0b4520',
    '--env-color-fg-on-emphasis': '#ffffff',
  },
  dark: {
    '--env-color-bg-brand-emphasis': '#7ad197',
    '--env-color-bg-brand-emphasis-hover': '#5fbf80',
    '--env-color-bg-brand-emphasis-pressed': '#45ad69',
    '--env-color-fg-on-emphasis': '#1e1f21',
  },
};

export default function RecolorArea() {
  const { theme } = useTheme();
  return (
    <Theme theme={theme} style={green[theme] as CSSProperties}>
      <Surface background="muted" padding={4} render={<Column gap={3} align="start" />}>
        <Text variant="title" render={<h3 />}>
          Greener commutes
        </Text>
        <Switch label="Suggest cycling routes" defaultChecked />
        <Button variant="primary">Plan a route</Button>
      </Surface>
    </Theme>
  );
}
