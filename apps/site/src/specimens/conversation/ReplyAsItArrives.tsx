import { Column, Composer, Message, MessageList } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';
import { Example } from '../../previews/Example';
import { useTimeline } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const reply =
  'Priya Shah. She expects the photos from the studio on Thursday and sends the kit on Friday.';
const words = reply.split(' ');

/** A beat before the reply starts, a word at a time as it is written, and a while to read it. */
const steps = [1100, ...words.map(() => 140), 2600];

const stop = () => undefined;

function Replying() {
  const step = useTimeline(steps);
  // Step 0 is the question alone; then the reply grows a word a step until it is whole.
  const shown = Math.min(step, words.length);
  const running = step > 0 && step <= words.length;
  return (
    // As tall as the whole conversation from the start, so the page around the figure keeps still
    // as the reply grows.
    <Column
      gap={4}
      justify="between"
      style={{ inlineSize: 'min(100%, 26rem)', minBlockSize: '13rem' }}
    >
      <MessageList aria-label="Conversation with the assistant" busy={running}>
        <Message from="self">Who owns the press kit?</Message>
        {shown > 0 && (
          <Message from="other" author="Assistant">
            <Markdown>{words.slice(0, shown).join(' ')}</Markdown>
          </Message>
        )}
      </MessageList>
      <Composer
        aria-label="Message the assistant"
        placeholder="Ask anything"
        running={running}
        onStop={stop}
      />
    </Column>
  );
}

/** An assistant's reply as it arrives: it shows at once and grows; meanwhile, send is Stop. */
export default function ReplyAsItArrives() {
  return (
    <Example size="content">
      <MotionStage label="the reply as it arrives">
        <Replying />
      </MotionStage>
    </Example>
  );
}
