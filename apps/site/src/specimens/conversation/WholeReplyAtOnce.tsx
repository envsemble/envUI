import { Column, Composer, Message, MessageList, Spinner } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';
import { useSharedTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../motion/MotionStage';
import { replyClock, replySteps, replyWords } from './Reply';

const stop = () => undefined;

function Waiting() {
  // On the do's clock: a spinner while the do's reply grows, and the whole reply as it is done.
  const step = useSharedTimeline(replyClock, replySteps);
  const whole = step >= replyWords.length;
  const running = step > 0 && step <= replyWords.length;
  return (
    <Column
      gap={4}
      justify="between"
      style={{ inlineSize: 'min(100%, 26rem)', minBlockSize: '14.5rem' }}
    >
      <MessageList aria-label="Conversation with the assistant" busy={running}>
        <Message from="self">Who owns the press kit?</Message>
        {step > 0 && (
          <Message from="other" author="Assistant">
            {whole ? (
              <Markdown>{replyWords.join(' ')}</Markdown>
            ) : (
              <Spinner size="sm" label="Thinking" />
            )}
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

/** The Rules' don't: a spinner until the whole reply lands, in step with the do beside it. */
export default function WholeReplyAtOnce() {
  return (
    <MotionStage label="the whole reply arriving at once">
      <Waiting />
    </MotionStage>
  );
}
