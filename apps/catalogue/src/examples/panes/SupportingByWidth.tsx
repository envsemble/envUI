import { useState } from 'react';
import { Column, DescriptionList, Panes, Text } from '@envsemble/envui';
import { Info } from '@envsemble/envui/icons/Info';

export default function SupportingByWidth() {
  const [open, setOpen] = useState(false);
  return (
    // Side by side from 52.5 rem; narrower, Details opens the pane as a sheet: at the end in a
    // medium width, from the bottom in a compact one.
    <Panes.Root
      behavior="supporting"
      open={open}
      onOpenChange={setOpen}
      style={{ blockSize: '18rem' }}
    >
      <Panes.Main label="Document">
        <Column gap={3} padding={4} align="start">
          <Text variant="title" render={<h3 />}>
            Quarterly report
          </Text>
          <Text>Revenue grew in every region.</Text>
          <Panes.Trigger variant="secondary" startIcon={<Info />}>
            Details
          </Panes.Trigger>
        </Column>
      </Panes.Main>
      <Panes.Supporting label="Details">
        <Column padding={4}>
          <DescriptionList.Root aria-label="About the report">
            <DescriptionList.Item label="Owner">Sam Lee</DescriptionList.Item>
            <DescriptionList.Item label="Due">31 March 2026</DescriptionList.Item>
          </DescriptionList.Root>
        </Column>
      </Panes.Supporting>
    </Panes.Root>
  );
}
