import type { Reference } from './Types';

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
    related: ['empty-state', 'cards', 'motion'],
  },
  {
    id: 'toasts',
    title: 'Toasts',
    group: 'Feedback & overlays',
    summary: 'Brief feedback; errors and notices with actions stay until dismissed.',
    example: `import { Theme, Button, ToastProvider, useToast } from '@envsemble/envui';

function SaveButton() {
  const toast = useToast();
  return <Button onClick={() => toast.show({
    variant: 'success', message: 'Changes saved',
  })}>Save</Button>;
}

<Theme theme="light">
  <ToastProvider defaultPlacement="bottom-right"><SaveButton /></ToastProvider>
</Theme>`,
    props: [
      [
        'Toast',
        'variant: neutral, success, info, error; message; action {label,onClick}; onDismiss',
      ],
      ['ToastProvider defaultPlacement', 'bottom-right (upward) or top-center (downward)'],
      [
        'ToastProvider visibleLimit',
        'Three visible notices per placement by default; FIFO overflow',
      ],
      ['useToast()', 'show(options) returns ID; dismiss(id) removes a notice; clear() removes all'],
      [
        'Notification options',
        'placement override, dismissible and duration; errors/actions persist',
      ],
      ['Manual Toast announce', 'true by default; false for static specimens'],
    ],
    guidelines: [
      'Neutral, success and info notices without actions expire after five seconds. Errors and notices with actions persist until dismissed.',
      'Timers pause during hover, keyboard focus or an inactive window. Each placement shows three notices; queued lifetimes start on display.',
      'Keep messages and actions short. Messages stay single-line and truncate to available space. Manual Toast shares the presentation; the consumer owns its lifetime.',
    ],
    related: ['dialogs', 'buttons', 'colors', 'motion'],
  },
  {
    id: 'dialogs',
    title: 'Dialogs',
    group: 'Feedback & overlays',
    summary: 'Use for a focused confirmation or a short form.',
    example: `import { Dialog, Button, Input } from '@envsemble/envui';

<Dialog trigger={<Button>Create project</Button>} title="Create project"
  description="Choose a name your team will recognize."
  closeLabel="Cancel" actions={<Button onClick={save}>Create</Button>}>
  <Input label="Project name" value={name} onChange={e => setName(e.target.value)} />
</Dialog>`,
    props: [
      ['trigger / title / description', 'Launch control and accessible modal labeling'],
      ['children / actions', 'General content and shared controls'],
      ['closeLabel', 'Built-in dismissal label; defaults to Close'],
      ['open / defaultOpen / onOpenChange', 'Controlled or uncontrolled visibility'],
      ['DialogClose', 'Additional dismissal action; shared button props'],
      ['initialFocus / finalFocus', 'Optional focus refs'],
    ],
    guidelines: [
      'Use a modal for a focused confirmation or a short form. The footer always provides a dismissal action.',
      'The dialog traps focus, handles Escape and returns focus to the trigger. Portals preserve the originating theme.',
      'The application owns validation, saving, async work and whether completion closes the dialog.',
    ],
    related: ['toasts', 'input', 'layout', 'motion'],
  },
];
