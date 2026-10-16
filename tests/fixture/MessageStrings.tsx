import {
  CloseButton,
  ConfirmButton,
  CopyButton,
  Dialog,
  EnvUIProvider,
  Stack,
  ThemePreferenceProvider,
  ThemeToggle,
  type EnvUIMessagesInput,
} from '@envsemble/envui';
import { defaultMessages } from '@envsemble/envui/messages';

/**
 * Every message replaced by ⟦namespace.key⟧, functions too, so a test can tell an overridable
 * string from an English default left in the markup.
 */
export const pseudoMessages = Object.fromEntries(
  Object.entries(defaultMessages).map(([namespace, keys]) => [
    namespace,
    Object.fromEntries(
      Object.entries(keys).map(([key, value]) => {
        const marked = `⟦${namespace}.${key}⟧`;
        return [key, typeof value === 'function' ? () => marked : marked];
      }),
    ),
  ]),
) as EnvUIMessagesInput;

/**
 * The components whose strings come from EnvUIProvider's messages, under the pseudo-locale,
 * mounted with ?fixture=message-strings. Each batch that moves a family's strings adds its components
 * here; tests/browser/Messages.spec.ts fails on any English default left in them.
 */
export function MessageStringsFixture() {
  return (
    <ThemePreferenceProvider storageKey="fixture-messages-theme">
      <EnvUIProvider messages={pseudoMessages} locale="en-XA">
        <Stack gap={4} data-testid="messages">
          <CloseButton />
          <ConfirmButton confirmLabel="Remove?" onConfirm={() => {}}>
            Remove
          </ConfirmButton>
          {/* A blank name leaves it named by its copy label. */}
          <CopyButton value="Northwind" aria-label="" />
          <ThemeToggle />
          <Dialog title="Settings" defaultOpen modal={false}>
            Content
          </Dialog>
        </Stack>
      </EnvUIProvider>
    </ThemePreferenceProvider>
  );
}
