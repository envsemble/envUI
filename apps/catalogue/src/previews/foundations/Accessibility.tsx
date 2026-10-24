import { Text, Button, IconButton, Column, Row, Kbd } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { TokenValue } from './TokenValue';
import { Example } from '../Example';

export function AccessibilityPreview() {
  return (
    <>
      <Example
        title="Keyboard focus"
        caption={
          <>
            <Kbd>Tab</Kbd> and <Kbd keys={['Shift', 'Tab']} /> move between controls in the order
            they show; <Kbd>Enter</Kbd> activates links, <Kbd>Enter</Kbd> or <Kbd>Space</Kbd>{' '}
            buttons.
          </>
        }
      >
        <Row wrap align="center" justify="center" gap={4}>
          <Button className="docs-force-focus">Visible focus</Button>
          <IconButton icon={<ChevronRight />} aria-label="Next item" />
        </Row>
      </Example>
      <Example
        title="Motion defaults"
        size="field"
        explains
        caption="Motion supports a state change: brief, and only opacity under reduced motion."
      >
        <Column gap={4} className="docs-facts">
          <Text variant="body-sm">
            Fast transitions{' '}
            <code>
              <TokenValue token="--env-motion-duration-fast" />
            </code>
          </Text>
          <Text variant="body-sm">
            Medium transitions{' '}
            <code>
              <TokenValue token="--env-motion-duration-medium" />
            </code>
          </Text>
          <Text variant="body-sm">
            Shared easing{' '}
            <code>
              <TokenValue token="--env-motion-ease" />
            </code>
          </Text>
        </Column>
      </Example>
    </>
  );
}
