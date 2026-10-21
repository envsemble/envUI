import { DescriptionList } from '@envsemble/envui';

export default function FactsAtWidths() {
  return (
    <DescriptionList.Root aria-label="Project details">
      <DescriptionList.Item label="Owner">Alex Morgan</DescriptionList.Item>
      <DescriptionList.Item label="Last updated">4 March 2026</DescriptionList.Item>
      <DescriptionList.Item label="Repository">example.com/northwind</DescriptionList.Item>
    </DescriptionList.Root>
  );
}
