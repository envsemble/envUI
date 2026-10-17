import { DescriptionList } from '@envsemble/envui';

export default function Stacked() {
  return (
    <DescriptionList.Root layout="stacked" size="md" aria-label="Contact">
      <DescriptionList.Item label="Email">priya.shah@example.com</DescriptionList.Item>
      <DescriptionList.Item label="Phone">+1 555 0142</DescriptionList.Item>
      <DescriptionList.Item label="Address">
        12 Harbour Street, Northwind Bay, 40210
      </DescriptionList.Item>
    </DescriptionList.Root>
  );
}
