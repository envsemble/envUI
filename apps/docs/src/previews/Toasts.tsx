import {
  Button,
  Toast,
  ToastProvider,
  useToast,
  ActionGroup,
  type ToastPlacement,
} from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

const toastVariants = [
  { variant: 'neutral', title: 'Neutral', message: 'Files archived.' },
  { variant: 'success', title: 'Success', message: 'Changes saved.' },
  { variant: 'info', title: 'Info', message: 'An update is available.' },
  { variant: 'error', title: 'Error', message: 'Changes couldn’t be saved.' },
] as const;

const toastPlacements = [
  { placement: 'bottom-right', title: 'Bottom right', caption: 'Stacks upward.' },
  { placement: 'top-center', title: 'Top center', caption: 'Stacks downward.' },
] as const;

function NotificationExamples() {
  const toast = useToast();

  function showSuccess(placement: ToastPlacement) {
    toast.show({ variant: 'success', message: 'Changes saved.', placement, duration: 3000 });
  }

  function showError(placement: ToastPlacement) {
    const id = toast.show({
      variant: 'error',
      message: 'Changes couldn’t be saved.',
      placement,
      duration: Infinity,
      action: {
        label: 'Retry',
        onClick: () => {
          toast.dismiss(id);
          showSuccess(placement);
        },
      },
    });
  }

  function queueNotifications(placement: ToastPlacement) {
    for (let index = 1; index <= 5; index++) {
      toast.show({
        variant: 'info',
        message: `Upload ${index} complete.`,
        placement,
        duration: 3000,
      });
    }
  }

  return (
    <SpecimenGrid size="wide">
      {toastPlacements.map(({ placement, title, caption }) => (
        <Specimen key={placement} title={title} caption={caption}>
          <ActionGroup>
            <Button onClick={() => showSuccess(placement)}>3-second toast</Button>
            <Button variant="secondary" onClick={() => showError(placement)}>
              Persistent error
            </Button>
            <Button variant="secondary" onClick={() => queueNotifications(placement)}>
              Queue 5
            </Button>
          </ActionGroup>
        </Specimen>
      ))}
    </SpecimenGrid>
  );
}

export function ToastsPreview() {
  return (
    <Preview>
      <Example title="Variants" size="collection">
        <SpecimenGrid size="wide">
          {toastVariants.map(({ variant, title, message }) => (
            <Specimen key={variant} title={title}>
              <Toast announce={false} variant={variant} message={message} />
            </Specimen>
          ))}
        </SpecimenGrid>
      </Example>
      <Example
        title="Try notifications"
        size="collection"
        caption="Timed messages last three seconds; hovering pauses the timer. Errors stay until closed or retried. Each stack shows at most two toasts, with the queued count above it."
      >
        <ToastProvider visibleLimit={2}>
          <NotificationExamples />
        </ToastProvider>
      </Example>
    </Preview>
  );
}
