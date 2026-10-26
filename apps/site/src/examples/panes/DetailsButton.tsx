import { useState } from 'react';
import { Column, Panes, Text } from '@envsemble/envui';
import { Info } from '@envsemble/envui/icons/Info';

export default function DetailsButton() {
  const [open, setOpen] = useState(false);
  return (
    // A narrow window: the details are a sheet, which the button in the main pane opens.
    <Panes.Root
      behavior="supporting"
      open={open}
      onOpenChange={setOpen}
      style={{ blockSize: '12rem', inlineSize: 'min(100%, 20rem)' }}
    >
      <Panes.Main label="Budget">
        <Column gap={3} padding={4} align="start">
          <Text variant="title" render={<h3 />}>
            Budget
          </Text>
          <Panes.Trigger variant="secondary" startIcon={<Info />}>
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
