import { useState } from 'react';
import {
  Badge,
  Button,
  Column,
  Row,
  SegmentedControl,
  Surface,
  Switch,
  Text,
  Theme,
  type ThemeValue,
} from '@envsemble/envui';

export default function Themes() {
  const [theme, setTheme] = useState<ThemeValue>('light');
  const [high, setHigh] = useState(false);
  return (
    <Column gap={5}>
      <Row wrap gap={4} align="center">
        <SegmentedControl
          aria-label="Theme"
          value={theme}
          onValueChange={(value) => setTheme(value === 'dark' ? 'dark' : 'light')}
          items={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
        <Switch label="High contrast" checked={high} onCheckedChange={setHigh} />
      </Row>
      {/* Everything inside takes the theme; "system" contrast follows the reader's setting. */}
      <Theme theme={theme} contrast={high ? 'high' : 'system'}>
        <Surface background="default" padding={5} radius="xl" render={<Column gap={4} />}>
          <Row wrap justify="between" align="start" gap={3}>
            <Column gap={1}>
              <Text render={<h3 />} variant="title">
                Quarterly report
              </Text>
              <Text emphasis="muted">Updated today by Priya Shah</Text>
            </Column>
            <Badge tone="success">On track</Badge>
          </Row>
          <Row justify="end" gap={2}>
            <Button variant="secondary">Preview</Button>
            <Button>Share</Button>
          </Row>
        </Surface>
      </Theme>
    </Column>
  );
}
