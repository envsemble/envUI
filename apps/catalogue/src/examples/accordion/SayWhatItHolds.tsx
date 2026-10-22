import { Accordion } from '@envsemble/envui';

export default function SayWhatItHolds() {
  return (
    <Accordion.Root style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Accordion.Item title="How do refunds work?">
        Refunds go back to the card you paid with within five days.
      </Accordion.Item>
      <Accordion.Item title="Can I change my plan?">
        Yes, at any time; the difference is prorated.
      </Accordion.Item>
    </Accordion.Root>
  );
}
