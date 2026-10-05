import type { Reference } from './Types';

const managedToastUsage = {
  title: 'Managed notifications',
  example: `import { Theme, Button, ActionGroup, ToastProvider, useToast } from '@envsemble/envui';

function NotificationButtons() {
  const toast = useToast();
  return <ActionGroup>
    <Button onClick={() => toast.show({
      variant: 'success', message: 'Changes saved.', duration: 3000,
    })}>Show timed toast</Button>
    <Button variant="secondary" onClick={() => toast.show({
      variant: 'info', message: 'Export is ready.', duration: Infinity,
    })}>Show persistent toast</Button>
  </ActionGroup>;
}

<Theme theme="light">
  <ToastProvider defaultPlacement="bottom-right" visibleLimit={2}>
    <NotificationButtons />
  </ToastProvider>
</Theme>`,
  props: [
    ['defaultPlacement', 'bottom-right stacks upward; top-center stacks downward'],
    [
      'visibleLimit',
      'Positive integer, default 3 per placement; newest notices stay visible, with an older-notice count above the stack',
    ],
    ['useToast().show(options)', 'Returns the notification ID; accepts variant and message'],
    ['options.placement', 'Override the provider’s default for a particular notification'],
    ['options.action', '{label, onClick}; notices with actions persist unless duration is set'],
    ['options.dismissible', 'true by default; adds a close button'],
    [
      'options.duration',
      'Visible milliseconds; restarts after overflow. Infinity or 0 persists. Defaults to 5000, or persistent for errors/actions',
    ],
    ['useToast().dismiss(id) / clear()', 'Dismiss one notification or clear all notifications'],
  ],
} satisfies NonNullable<Reference['usage']>[number];

const inlineToastUsage = {
  title: 'Inline toast',
  example: `import { useState } from 'react';
import { Toast } from '@envsemble/envui';

function ArchiveNotice({ undoArchive }: { undoArchive: () => void }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return <Toast variant="neutral" message="Files archived."
    action={{ label: 'Undo', onClick: () => {
      undoArchive();
      setVisible(false);
    } }}
    onDismiss={() => setVisible(false)} />;
}`,
  props: [
    ['variant', 'neutral (default), success, info or error'],
    ['message', 'Single-line message; long text truncates to the available width'],
    ['action', 'Optional {label, onClick}; the application handles the result'],
    ['onDismiss / dismissLabel', 'Adds a close button and its accessible name'],
    ['announce', 'true by default; false for static examples'],
    ['Lifetime', 'No provider or timer; the application owns visibility and placement'],
  ],
} satisfies NonNullable<Reference['usage']>[number];

export const feedbackReferences: Reference[] = [
  {
    id: 'empty-state',
    title: 'Empty states',
    group: 'Feedback & overlays',
    example: `import { EmptyState, Button } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

<EmptyState icon={<Search />} title="No results"
  description="Try a different name or clear the filters."
  action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>} />`,
    props: [
      ['title / description', 'Heading and concise explanation'],
      ['icon / action', 'Optional React content'],
    ],
    guidelines: [
      'Distinguish first-use emptiness from a search with no results.',
      'Offer an action that resolves the situation. Keep the content aligned to the start.',
    ],
    related: ['loading', 'cards', 'buttons'],
  },
  {
    id: 'loading',
    title: 'Loading',
    group: 'Feedback & overlays',
    summary: 'Announces loading and reserves space for incoming content.',
    example: `import { LoadingState, Skeleton } from '@envsemble/envui';

<LoadingState label="Loading project">
  <Skeleton width="38%" height="1.25rem" />
  <Skeleton width="100%" height="0.8rem" />
  <Skeleton width="72%" height="0.8rem" />
</LoadingState>`,
    props: [
      ['Skeleton width / height', 'CSS dimensions appropriate for anticipated content'],
      ['LoadingState label / children', 'Accessible loading announcement and visual placeholders'],
    ],
    guidelines: [
      'Match placeholders to expected content without implying a precise completion time.',
      'Announce loading once per region. Respect the operating system reduced motion preference.',
    ],
    related: ['empty-state', 'cards', 'accessibility'],
  },
  {
    id: 'toasts',
    title: 'Toasts',
    group: 'Feedback & overlays',
    summary: 'Managed feedback with configurable duration, placement and stack capacity.',
    example: managedToastUsage.example,
    props: managedToastUsage.props,
    usage: [managedToastUsage, inlineToastUsage],
    guidelines: [
      'By default, neutral, success and info notices without actions expire after five seconds. Errors and notices with actions persist. Set duration in milliseconds to override either default, or Infinity to keep a notice until dismissed.',
      'New notices appear immediately at the bottom of the bottom-right stack or the top of the top-center stack. Set visibleLimit to cap each placement; older notices hide behind the count above it and reappear as newer notices close.',
      'A notice gets its full duration each time it returns from overflow. Hover or keyboard focus pauses only that notice; focusing the viewport with F6 or leaving the window pauses its visible timers. A persistent notice does not pause other notices.',
      'Keep messages and actions short. Messages stay single-line and truncate to available space. Manual Toast shares the presentation; the consumer owns its lifetime.',
    ],
    related: ['dialogs', 'buttons', 'colors', 'accessibility'],
  },
  {
    id: 'dialogs',
    title: 'Dialogs',
    group: 'Feedback & overlays',
    summary: 'Centered modals and side panels share focus and dismissal behavior.',
    example: `import { Dialog, Button, Text } from '@envsemble/envui';

<Dialog trigger={<Button variant="secondary">View project</Button>}
  title="Sample project" description="Project details" closeLabel="Close">
  <Text>Shared plans, milestones and responsibilities for the project.</Text>
</Dialog>

<Dialog trigger={<Button variant="secondary">Inspect project</Button>}
  title="Project details" placement="right" modal={false} disablePointerDismissal>
  <Text>Shared plans and people for the sample project.</Text>
</Dialog>`,
    props: [
      ['trigger / title / description', 'Launch control and accessible modal labeling'],
      ['children / actions', 'General content and shared controls'],
      ['closeLabel', 'Built-in dismissal label; defaults to Close'],
      [
        'placement',
        'center (default) or right; right is a full-height side panel with a header close button',
      ],
      [
        'modal',
        'true (default) traps focus, blocks outside interaction and locks page scroll; false permits interaction with the page',
      ],
      [
        'disablePointerDismissal',
        'false by default; true keeps an inspector open on outside presses or focus changes',
      ],
      ['open / defaultOpen / onOpenChange', 'Controlled or uncontrolled visibility'],
      ['DialogClose', 'Additional dismissal action; shared button props'],
      ['initialFocus / finalFocus', 'Optional focus refs'],
    ],
    guidelines: [
      'Use a centered modal for a focused confirmation or short form. Use a right panel to inspect content; set modal=false when its source page should remain interactive.',
      'Centered dialogs include a footer dismissal; right panels include a header close button. Escape closes either placement and focus returns to the trigger or finalFocus ref.',
      'Modal dialogs trap focus; non-modal panels do not. Portals preserve the originating theme.',
      'The application owns validation, saving, async work and whether completion closes the dialog.',
    ],
    related: ['toasts', 'fields', 'layout', 'accessibility'],
  },
];
