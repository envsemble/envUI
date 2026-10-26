import { Accordion } from '@envsemble/envui';

export default function AccordionAnatomy() {
  return (
    <Accordion.Root defaultValue={['archive']} style={{ inlineSize: 'min(100%, 26rem)' }}>
      <Accordion.Item value="sharing" title="Who can see a shared plan?">
        Everyone in the workspace can read it.
      </Accordion.Item>
      <Accordion.Item value="archive" title="What happens to archived plans?">
        They stay readable and searchable.
      </Accordion.Item>
    </Accordion.Root>
  );
}
