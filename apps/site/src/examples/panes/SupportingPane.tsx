import { useState } from 'react';
import { Column, DescriptionList, Panes, Text } from '@envsemble/envui';
import { IconInfo } from '@envsemble/envui/icons/Info';

export default function SupportingPane() {
  const [open, setOpen] = useState(false);
  return (
    // Side by side from an expanded width of their own; narrower, the details are a sheet over
    // the document, which the button opens and Escape closes.
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
          <Text>Revenue grew in every region, led by the new subscriptions.</Text>
          <Panes.Trigger variant="secondary" startIcon={<IconInfo />}>
            Details
          </Panes.Trigger>
        </Column>
      </Panes.Main>
      <Panes.Supporting label="Details">
        <Column gap={3} padding={4}>
          <DescriptionList.Root aria-label="About the report">
            <DescriptionList.Item label="Owner">Sam Lee</DescriptionList.Item>
            <DescriptionList.Item label="Due">31 March 2026</DescriptionList.Item>
          </DescriptionList.Root>
        </Column>
      </Panes.Supporting>
    </Panes.Root>
  );
}
