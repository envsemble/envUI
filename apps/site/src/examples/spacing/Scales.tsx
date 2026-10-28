import { Button, Column, Row, Surface, Text, TextField, Theme, useTheme } from '@envsemble/envui';

// An app takes one scale, on its root Theme; here a region keeps the theme and turns compact.
export default function Scales() {
  const theme = useTheme();
  return (
    <Theme {...theme} scale="compact">
      <Surface background="default" padding={5} radius="xl" render={<Column gap={4} />}>
        <Column gap={1}>
          <Text render={<h3 />} variant="title">
            Rename report
          </Text>
          <Text emphasis="muted">Everyone on the team sees the new name.</Text>
        </Column>
        <TextField label="Title" defaultValue="Quarterly report" />
        <Row gap={2} justify="end">
          <Button variant="secondary">Cancel</Button>
          <Button>Rename</Button>
        </Row>
      </Surface>
    </Theme>
  );
}
