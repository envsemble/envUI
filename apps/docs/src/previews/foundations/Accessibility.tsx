import { Text, Button, IconButton, ActionGroup } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { TokenValue } from './TokenValue';
import { Example } from '../Example';

export function AccessibilityPreview() {
  return (
    <>
      <Example title="Keyboard focus">
        <ActionGroup>
          <Button className="docs-force-focus">Visible focus</Button>
          <IconButton icon={<ChevronRight />} aria-label="Next item" />
        </ActionGroup>
        <Text tone="muted">
          Use Tab and Shift+Tab to move between controls. Enter activates links; Enter or Space
          activates buttons. Keep focus order aligned with the visible layout.
        </Text>
      </Example>
      <Example title="Library responsibilities">
        <Text tone="muted">
          Controls supply semantics, keyboard interaction and connected hints or errors. Dialogs
          manage modal focus; toasts announce feedback. Component transitions respect reduced
          motion.
        </Text>
      </Example>
      <Example title="Application responsibilities">
        <Text tone="muted">
          Supply visible labels, meaningful icon action names, semantic headings and a sensible
          reading order. Write errors that explain how to recover. Keep the component’s focus
          indicator visible.
        </Text>
      </Example>
      <Example title="Motion defaults">
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
        <Text variant="caption" className="docs-caption">
          Motion supports a state change. Keep it brief and respect reduced motion.
        </Text>
      </Example>
    </>
  );
}
