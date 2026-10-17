import { useState } from 'react';
import { Page, SegmentedControl, Stack, Surface, Text, type PageWidth } from '@envsemble/envui';

const widths: readonly PageWidth[] = ['sm', 'md', 'lg', 'full'];

const uses: Record<PageWidth, string> = {
  sm: 'A form or a settings page: 40 rem at most.',
  md: 'A document or the details of one item: 60 rem at most.',
  lg: 'A dashboard or a list: 76 rem at most.',
  full: 'A board or a canvas that uses the whole width.',
};

export default function Widths() {
  const [width, setWidth] = useState<PageWidth>('sm');
  return (
    <Stack gap={4}>
      <SegmentedControl
        aria-label="Page width"
        value={width}
        onValueChange={(value) => setWidth(widths.find((each) => each === value) ?? 'lg')}
        items={widths.map((value) => ({ value, label: value }))}
      />
      <Surface background="muted">
        <Page width={width}>
          <Surface background="default" padding={4}>
            <Text>{uses[width]}</Text>
          </Surface>
        </Page>
      </Surface>
    </Stack>
  );
}
