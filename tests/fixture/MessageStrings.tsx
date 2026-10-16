import { memo, useEffect, useRef, useState } from 'react';
import {
  Calendar,
  CloseButton,
  ColorPicker,
  Combobox,
  Composer,
  ConfirmButton,
  CopyButton,
  DatePicker,
  Dialog,
  EnvUIProvider,
  SearchField,
  Stack,
  Textarea,
  ThemePreferenceProvider,
  ThemeToggle,
  type EnvUIMessagesInput,
} from '@envsemble/envui';
import { defaultMessages } from '@envsemble/envui/messages';
// Internal: the hook envUI's components read their strings with.
import { useMessages } from '../../packages/ui/src/internal/EnvUIContext.js';
import { common } from '../../packages/ui/src/foundations/messages/common.js';

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

/** A reader of the common messages that counts its renders in data-renders, after each one. */
const MessagesProbe = memo(function MessagesProbe() {
  const messages = useMessages('common', common);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (element) element.dataset.renders = String(Number(element.dataset.renders ?? 0) + 1);
  });
  return (
    <span ref={ref} data-testid="inline-probe">
      {messages.close}
    </span>
  );
});

/**
 * A provider whose messages are written inline, which re-renders with its parent: the reader inside
 * must not, while the messages stay the same.
 */
function InlineMessages() {
  const [renders, setRenders] = useState(0);
  return (
    <>
      <button type="button" onClick={() => setRenders((current) => current + 1)}>
        ⟦rerender⟧ {renders}
      </button>
      <EnvUIProvider messages={{ common: { close: '⟦inline.close⟧' } }}>
        <MessagesProbe />
      </EnvUIProvider>
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
          {/* Forms: the clear buttons, chip removes, the resize edge, the calendar's month
              buttons, the send button and the color picker's sliders and field. */}
          <SearchField label="Search" defaultValue="Northwind" />
          <Textarea label="Notes" />
          <Combobox
            label="Owner"
            clearable
            items={[{ value: 'alex', label: 'Alex Morgan' }]}
            defaultValue="alex"
          />
          <Combobox
            multiple
            label="Reviewers"
            items={[{ value: 'sam', label: 'Sam Lee' }]}
            defaultValue={['sam']}
          />
          <DatePicker label="Due" clearable defaultValue="2026-10-14" />
          <Calendar aria-label="Planning" defaultValue="2026-10-14" />
          <Composer aria-label="Reply" defaultValue="Hello" onSubmit={() => {}} />
          <ColorPicker label="Accent" defaultValue="#336699" />
          <InlineMessages />
        </Stack>
      </EnvUIProvider>
    </ThemePreferenceProvider>
  );
}
