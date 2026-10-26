import { DescriptionList, Row } from '@envsemble/envui';

export default function Sizes() {
  return (
    <Row gap={8} wrap align="start">
      <DescriptionList.Root aria-label="Contact, in smaller text" style={{ inlineSize: '16rem' }}>
        <DescriptionList.Item label="Email">priya.shah@example.com</DescriptionList.Item>
        <DescriptionList.Item label="Phone">+1 555 0142</DescriptionList.Item>
      </DescriptionList.Root>
      <DescriptionList.Root
        size="md"
        aria-label="Contact, in body text"
        style={{ inlineSize: '18rem' }}
      >
        <DescriptionList.Item label="Email">priya.shah@example.com</DescriptionList.Item>
        <DescriptionList.Item label="Phone">+1 555 0142</DescriptionList.Item>
      </DescriptionList.Root>
    </Row>
  );
}
