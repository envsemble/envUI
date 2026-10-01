import { Text, Button, Surface, IconButton, ActionGroup } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons';
import { TokenValue } from './TokenValue';
import { Example } from '../Example';

export function MotionPreview() {
  return (
    <>
      <Example title="Interaction timing">
        <Surface tone="row">
          <div className="docs-facts">
            <Text variant="supporting">
              Fast transitions{' '}
              <code>
                <TokenValue token="--motion-duration-fast" />
              </code>
            </Text>
            <Text variant="supporting">
              Medium transitions{' '}
              <code>
                <TokenValue token="--motion-duration-medium" />
              </code>
            </Text>
            <Text variant="supporting">
              Shared easing{' '}
              <code>
                <TokenValue token="--motion-ease" />
              </code>
            </Text>
          </div>
        </Surface>
        <Text variant="caption" className="docs-caption">
          Motion supports a state change. Keep it brief and respect reduced motion.
        </Text>
      </Example>
      <Example title="Keyboard focus">
        <ActionGroup>
          <Button className="docs-force-3">Visible focus</Button>
          <IconButton className="docs-force-3" icon={<ChevronRight />} aria-label="Next item" />
        </ActionGroup>
        <Text>
          Use the shared 0.125 rem focus ring. Keep keyboard order aligned with the visible layout.
        </Text>
      </Example>
    </>
  );
}
