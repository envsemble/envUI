import { Accordion } from '@envsemble/envui';

export default function VagueTitles() {
  return (
    <Accordion.Root style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Accordion.Item title="More information">
        Refunds go back to the card you paid with within five days.
      </Accordion.Item>
      <Accordion.Item title="Details">Yes, at any time; the difference is prorated.</Accordion.Item>
    </Accordion.Root>
  );
}
