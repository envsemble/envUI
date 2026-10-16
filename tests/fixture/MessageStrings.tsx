import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CloseButton,
  CommandPalette,
  Drawer,
  LoadingState,
  Progress,
  Skeleton,
  Toast,
  useToast,
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

/** Overlays and feedback: an alert, a loading state and bar, a drawer, notices and a palette. */
function FeedbackStrings() {
  const toast = useToast();
  const [palette, setPalette] = useState(false);
  useEffect(() => {
    // More notices than the visible limit, so the hidden count shows too.
    for (let index = 1; index <= 4; index++)
      toast.show({ message: `Notice ${index}`, duration: 0 });
    return () => toast.clear();
  }, [toast]);
  return (
    <>
      <Alert onDismiss={() => {}}>Saved on this device.</Alert>
      <LoadingState>
        <Skeleton />
      </LoadingState>
      <Progress label="Importing" value={null} />
      <Drawer title="Filters" defaultOpen modal={false} disablePointerDismissal>
        Filters
      </Drawer>
      <Button variant="secondary" onClick={() => setPalette(true)}>
        Open palette
      </Button>
      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        aria-label="Go to"
        inputValue=""
        onInputValueChange={() => {}}
        items={[]}
        onAction={() => {}}
      />
    </>
  );
}

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
          <Dialog title="Settings" defaultOpen modal={false} disablePointerDismissal>
            Content
          </Dialog>
          <Toast.Provider>
            <FeedbackStrings />
          </Toast.Provider>
        </Stack>
      </EnvUIProvider>
    </ThemePreferenceProvider>
  );
}
