import { Text, Button, IconButton, Stack, Kbd } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { TokenValue } from './TokenValue';
import { Example } from '../Example';

export function AccessibilityPreview() {
  return (
    <>
      <Example title="Keyboard focus">
        <Stack direction="row" wrap align="center" gap={4}>
          <Button className="docs-force-focus">Visible focus</Button>
          <IconButton icon={<ChevronRight />} aria-label="Next item" />
        </Stack>
        <Text emphasis="muted">
          Use <Kbd>Tab</Kbd> and <Kbd keys={['Shift', 'Tab']} /> to move between controls.{' '}
          <Kbd>Enter</Kbd> activates links; <Kbd>Enter</Kbd> or <Kbd>Space</Kbd> activates buttons.
          Keep focus order aligned with the visible layout.
        </Text>
      </Example>
      <Example title="Library responsibilities">
        <Text emphasis="muted">
          Controls supply semantics, keyboard interaction and connected hints or errors. Dialogs
          manage modal focus; toasts announce feedback. Component transitions respect reduced
          motion.
        </Text>
      </Example>
      <Example title="Application responsibilities">
        <Text emphasis="muted">
          Supply visible labels, meaningful icon action names, semantic headings and a sensible
          reading order. Write errors that explain how to recover. Keep the component’s focus
          indicator visible.
        </Text>
      </Example>
      <Example title="Motion defaults">
        <Stack className="docs-facts">
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
        </Stack>
        <Text variant="caption" className="docs-caption">
          Motion supports a state change. Keep it brief and respect reduced motion.
        </Text>
      </Example>
    </>
  );
}
