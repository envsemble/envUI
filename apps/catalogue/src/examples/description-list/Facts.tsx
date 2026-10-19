import { Badge, DescriptionList, Link } from '@envsemble/envui';

export default function Facts() {
  return (
    <DescriptionList.Root aria-label="Project details">
      <DescriptionList.Item label="Owner">Alex Morgan</DescriptionList.Item>
      <DescriptionList.Item label="Status">
        <Badge tone="success">Active</Badge>
      </DescriptionList.Item>
      <DescriptionList.Item label="Repository">
        <Link href="https://example.com/northwind">example.com/northwind</Link>
      </DescriptionList.Item>
      <DescriptionList.Item label="Last updated">4 March 2026</DescriptionList.Item>
    </DescriptionList.Root>
  );
}
