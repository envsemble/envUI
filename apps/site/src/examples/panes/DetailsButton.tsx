import { useState } from 'react';
import { Column, Panes, Text } from '@envsemble/envui';
import { IconInfo } from '@envsemble/envui/icons/Info';

export default function DetailsButton() {
  const [open, setOpen] = useState(false);
  return (
    // Side by side from a medium width; narrower, the details are a sheet, which the button in
    // the main pane opens.
    <Panes.Root
      behavior="supporting"
      splitAt="medium"
      open={open}
      onOpenChange={setOpen}
      style={{ blockSize: '12rem', inlineSize: '100%' }}
    >
      <Panes.Main label="Budget">
        <Column gap={3} padding={4} align="start">
          <Text variant="title" render={<h3 />}>
            Budget
          </Text>
          <Panes.Trigger variant="secondary" startIcon={<IconInfo />}>
            Details
          </Panes.Trigger>
        </Column>
      </Panes.Main>
      <Panes.Supporting label="Budget details">
        <Column padding={4}>
          <Text>Owned by Sam Lee, due 31 March.</Text>
        </Column>
      </Panes.Supporting>
    </Panes.Root>
  );
}
