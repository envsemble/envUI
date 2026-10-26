import { DescriptionList } from '@envsemble/envui';

export default function DescriptionListAnatomy() {
  return (
    <DescriptionList.Root aria-label="Project details" style={{ inlineSize: 'min(100%, 26rem)' }}>
      <DescriptionList.Item label="Owner">Alex Morgan</DescriptionList.Item>
      <DescriptionList.Item label="Due">4 March 2026</DescriptionList.Item>
    </DescriptionList.Root>
  );
}
