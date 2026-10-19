import { memo, useEffect, useRef, useState } from 'react';
import {
  AccountMenu,
  ConfirmDialog,
  List,
  SearchTrigger,
  Calendar,
  CloseButton,
  ColorPicker,
  Combobox,
  Composer,
  Alert,
  Button,
  CommandPalette,
  Drawer,
  LoadingState,
  Progress,
  Skeleton,
  Toast,
  useToast,
  ConfirmButton,
  CopyButton,
  DatePicker,
  TimePicker,
  MonthPicker,
  Dialog,
  EnvUIProvider,
  SearchField,
  SplitPane,
  Stack,
  Textarea,
  ThemePreferenceProvider,
  ThemeToggle,
  PanelDock,
  type EnvUIMessagesInput,
} from '@envsemble/envui';
import { CodeBlock, Markdown, MarkdownEditor } from '@envsemble/envui/content';
import { defaultMessages } from '@envsemble/envui/messages';
// Content and display, whose strings and numbers follow the provider.
import {
  AvatarGroup,
  CalendarHeatmap,
  DiffStat,
  Message,
  MessageList,
  Rating,
  RelativeTime,
} from '@envsemble/envui';
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

/** Shell, dock, editors and code: a dock with a minimized panel, code, Markdown and its editor. */
function ShellAndEditorStrings() {
  return (
    <>
      <div style={{ position: 'relative', blockSize: '24rem' }}>
        <PanelDock.Root
          panels={[
            { id: 'notes', title: 'Notes', mode: 'open', active: true },
            { id: 'budget', title: 'Budget', mode: 'minimized' },
          ]}
          onModeChange={() => {}}
          onClose={() => {}}
        >
          {(panel) => <PanelDock.Header title={panel.title} />}
        </PanelDock.Root>
      </div>
      <CodeBlock copyable>npm run build</CodeBlock>
      <Markdown>
        {[
          '| Plan | Seats |',
          '| ---- | ----- |',
          '| Team | 5 |',
          '',
          '- [x] Shipped',
          '- [ ] Pending',
        ].join('\n')}
      </Markdown>
      <MarkdownEditor label="Description" defaultValue="Draft" />
    </>
  );
}

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
          {/* Content: a group's name and overflow, a rating's and a change's names, a message's
              status, a heatmap's legend and a moment just passed. */}
          {/* Only people counted in total, so the overflow chip is named by the more text alone. */}
          <AvatarGroup people={[]} total={3} />
          <Rating value={4.5} showValue />
          <DiffStat additions={12} deletions={3} />
          <MessageList aria-label="Thread">
            <Message from="self" status="sending">
              On its way
            </Message>
            <Message from="self" status="failed">
              Not delivered
            </Message>
          </MessageList>
          <CalendarHeatmap
            aria-label="Activity"
            data={[{ date: '2026-10-14', value: 2 }]}
            startDate="2026-10-12"
            endDate="2026-10-18"
          />
          <RelativeTime
            value={Date.UTC(2026, 9, 14, 9, 0, 0)}
            now={Date.UTC(2026, 9, 14, 9, 0, 10)}
          />
          <Dialog title="Settings" defaultOpen modal={false} disablePointerDismissal>
            Content
          </Dialog>
          {/* Forms: the clear buttons, chip removes, the resize edge, the calendar's month
              buttons, the send button and the color picker's sliders and field. */}
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
          <Composer aria-label="Reply" defaultValue="Hello" onSubmit={() => {}} />
          <ColorPicker label="Accent" defaultValue="#336699" />
          {/* Layout: the handle between two panes. */}
          <SplitPane.Root>
            <SplitPane.Pane>Start</SplitPane.Pane>
            <SplitPane.ResizeHandle />
            <SplitPane.Pane>End</SplitPane.Pane>
          </SplitPane.Root>
          <Toast.Provider>
            <FeedbackStrings />
          </Toast.Provider>
          <ShellAndEditorStrings />
          {/* App parts: a search trigger, a reorderable list's handle and announcements, an
              account menu with its theme and organization submenus, and a confirm dialog. */}
          <SearchTrigger listen={false} />
          <List.Root aria-label="Order" onReorder={() => {}}>
            <List.Item label="First" />
            <List.Item label="Second" />
          </List.Root>
          <AccountMenu.Root name="Alex Morgan">
            <AccountMenu.ThemeSubmenu />
            <AccountMenu.OrganizationSubmenu
              items={[{ id: 'northwind', label: 'Northwind' }]}
              value="northwind"
              onValueChange={() => {}}
            />
          </AccountMenu.Root>
          <ConfirmDialog
            trigger={<Button variant="secondary">Open confirm</Button>}
            title="Remove the draft?"
            confirmLabel="Remove draft"
            onConfirm={() => {}}
          />
          <InlineMessages />
        </Stack>
      </EnvUIProvider>
    </ThemePreferenceProvider>
  );
}
