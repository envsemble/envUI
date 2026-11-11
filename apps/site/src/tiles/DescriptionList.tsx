import { Badge, DescriptionList } from '@envsemble/envui';

/** A project's details: its owner, its state and its open tasks, as a details pane shows them. */
export default function DescriptionListTile() {
  return (
    <DescriptionList.Root layout="inline" aria-label="Project details">
      <DescriptionList.Item label="Owner">Sam Lee</DescriptionList.Item>
      <DescriptionList.Item label="Status">
        <Badge tone="primary">In progress</Badge>
      </DescriptionList.Item>
      <DescriptionList.Item label="Tasks">3 open</DescriptionList.Item>
    </DescriptionList.Root>
  );
}
