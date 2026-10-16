import { Message, MessageList, Surface } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

function Thread({ label }: { label: string }) {
  return (
    <MessageList aria-label={label}>
      <Message from="other" author="Sam Lee" meta="09:40">
        Can you send me the venue address?
      </Message>
      <Message from="self" meta="09:41">
        Sure, one moment.
      </Message>
      <Message from="self" meta="09:41" status="sending">
        Northwind Hall
      </Message>
      <Message from="self" meta="09:42" status="failed">
        12 Harbour Street
      </Message>
      <Message from="self" meta="09:42" status="failed" statusLabel="Could not deliver">
        See you there.
      </Message>
    </MessageList>
  );
}

/** Own and others' messages with every status, on the page and on a pane. */
export default function Statuses() {
  return (
    <Example title="Statuses" size="collection">
      <SpecimenGrid size="card">
        <Specimen title="On the page">
          <Thread label="Statuses on the page" />
        </Specimen>
        <Specimen title="On a pane">
          <Surface padding={4}>
            <Thread label="Statuses on a pane" />
          </Surface>
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
