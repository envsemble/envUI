import { use } from 'react';
import { Column, Composer, Message, MessageList } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import { useSharedTimeline } from '../../motion/Timeline';
import { MotionStage, VerdictMotion } from '../../figures/MotionStage';
import { replyClock, replySteps, replyWords } from './Reply';

const stop = () => undefined;

function Replying() {
  // One clock with the don't beside it, which waits for the same reply with a spinner.
  const step = useSharedTimeline(replyClock, replySteps);
  // Step 0 is the question alone; then the reply grows a word a step until it is whole.
  const shown = Math.min(step, replyWords.length);
  const running = step > 0 && step <= replyWords.length;
  return (
    // As tall as the whole conversation from the start, so the page around the figure keeps still
    // as the reply grows.
    <Column
      gap={4}
      justify="between"
      style={{ inlineSize: 'min(100%, 26rem)', minBlockSize: '14.5rem' }}
    >
      <MessageList aria-label="Conversation with the assistant" busy={running}>
        <Message from="self">Who owns the press kit?</Message>
        {shown > 0 && (
          <Message from="other" author="Assistant">
            <Markdown>{replyWords.slice(0, shown).join(' ')}</Markdown>
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

/**
 * An assistant's reply as it arrives: it shows at once and grows; meanwhile, send is Stop. It
 * plays in its section, and as the Rules' do, in step with the don't.
 */
export default function ReplyAsItArrives() {
  const stage = (
    <MotionStage label="the reply as it arrives">
      <Replying />
    </MotionStage>
  );
  return use(VerdictMotion) ? stage : <SpecimenFrame size="content">{stage}</SpecimenFrame>;
}
