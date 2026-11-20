import { memo, useEffect, useRef, useState } from 'react';
import {
  ConfirmDialog,
  List,
  Calendar,
  Combobox,
  Composer,
  Alert,
  Button,
  CommandPalette,
  Sheet,
  Progress,
  ToastProvider,
  useToast,
  ConfirmButton,
  CopyButton,
  DatePicker,
  TimePicker,
  MonthPicker,
  Dialog,
  EnvUIProvider,
  SearchField,
  Panes,
  Scaffold,
  Column,
  Textarea,
  ThemePreferenceProvider,
  ThemeToggle,
  type EnvUIMessagesInput,
  Spinner,
  CodeBlock,
} from '@envsemble/envui';
import { ColorPicker, ColorPickerButton } from '@envsemble/envui/color';
import { Markdown } from '@envsemble/envui/markdown';
import { defaultMessages } from '@envsemble/envui/messages';
import { AvatarGroup, Message, MessageList, RelativeTime } from '@envsemble/envui';
import { useMessages } from '../../packages/ui/src/internal/provider/EnvUIContext.js';
import { common } from '../../packages/ui/src/foundations/messages/common.js';

export const mount = 'standalone';

const pseudoMessages = Object.fromEntries(
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

function FeedbackStrings() {
  const toast = useToast();
  const [palette, setPalette] = useState(false);
  useEffect(() => {
    for (let index = 1; index <= 4; index++)
      toast.show({ message: `Notice ${index}`, duration: 0 });
    return () => toast.clear();
  }, [toast]);
  return (
    <>
      <Alert onDismiss={() => {}}>Saved on this device.</Alert>
      <Spinner showLabel />
      <Progress label="Importing" value={null} />
      <Sheet title="Filters" defaultOpen modal={false} disablePointerDismissal>
        Filters
      </Sheet>
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

function ShellAndEditorStrings() {
  return (
    <>
      <CodeBlock copyable>npm run build</CodeBlock>
      <Markdown>
        {[
          '|      | Seats |',
          '| ---- | ----- |',
          '| Team | 5 |',
          '',
          '- [x] Shipped',
          '- [ ] Pending',
        ].join('\n')}
      </Markdown>
    </>
  );
}

const MessagesProbe = memo(function MessagesProbe() {
  const messages = useMessages('common', common);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (element) element.dataset.renders = String(Number(element.dataset.renders ?? 0) + 1);
  });
  return (
    <span ref={ref} data-testid="inline-probe">
      {messages.loading}
    </span>
  );
});

function InlineMessages() {
  const [renders, setRenders] = useState(0);
  return (
    <>
      <button type="button" onClick={() => setRenders((current) => current + 1)}>
        ⟦rerender⟧ {renders}
      </button>
      <EnvUIProvider messages={{ common: { loading: '⟦inline.loading⟧' } }}>
        <MessagesProbe />
      </EnvUIProvider>
    </>
  );
}

export default function MessagesFixture() {
  return (
    <ThemePreferenceProvider>
      <EnvUIProvider messages={pseudoMessages} locale="en-XA">
        <Column gap={4} data-testid="messages">
          <ConfirmButton confirmLabel="Remove" onConfirm={() => {}}>
            Remove
          </ConfirmButton>
          <CopyButton value="Northwind" aria-label="" />
          <ThemeToggle />
          <AvatarGroup people={[]} total={3} />
          <MessageList aria-label="Thread">
            <Message from="self" status="sending">
              On its way
            </Message>
            <Message from="self" status="failed">
              Not delivered
            </Message>
          </MessageList>
          <RelativeTime
            value={Date.UTC(2026, 9, 14, 9, 0, 0)}
            now={Date.UTC(2026, 9, 14, 9, 0, 10)}
          />
          <Dialog title="Settings" defaultOpen modal={false} disablePointerDismissal>
            Content
          </Dialog>
          <SearchField label="Find a customer" defaultValue="Northwind" />
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
          <TimePicker label="Starts" clearable defaultValue="09:30" />
          <MonthPicker label="Period" clearable defaultValue="2026-10" />
          <Calendar aria-label="Planning" defaultValue="2026-10-14" />
          <Composer aria-label="Reply" defaultValue="Hello" onSend={() => {}} />
          <ColorPicker label="Accent" defaultValue="#336699" swatches={['#336699']} />
          <ColorPickerButton label="Border" defaultValue="#336699" />
          <Panes.Root>
            <Panes.Pane label="Start">Start</Panes.Pane>
            <Panes.ResizeHandle />
            <Panes.Pane>End</Panes.Pane>
          </Panes.Root>
          <Scaffold
            scroll="body"
            bodyId="message-strings-body"
            navigation={{ rail: <nav aria-label="Rail" /> }}
            style={{ blockSize: '6rem' }}
          >
            Body
          </Scaffold>
          <ToastProvider>
            <FeedbackStrings />
          </ToastProvider>
          <ShellAndEditorStrings />
          <List.Root aria-label="Order" onReorder={() => {}}>
            <List.Item label="First" />
            <List.Item label="Second" />
          </List.Root>
          <ConfirmDialog
            trigger={<Button variant="secondary">Open confirm</Button>}
            title="Remove the draft?"
            confirmLabel="Remove draft"
            onConfirm={() => {}}
          />
          <InlineMessages />
        </Column>
      </EnvUIProvider>
    </ThemePreferenceProvider>
  );
}
