import { Button, Text, Toast, ToastProvider, useToast } from '@envsemble/envui';
import { Example } from './Example';
import { Preview } from './Preview';

const toastVariants = [
  {
    variant: 'neutral',
    title: 'Neutral',
    meaning: 'Routine status without urgency.',
    message: 'Files archived.',
  },
  {
    variant: 'success',
    title: 'Success',
    meaning: 'Confirms a completed action.',
    message: 'Changes saved.',
  },
  {
    variant: 'info',
    title: 'Info',
    meaning: 'Information that may need attention.',
    message: 'An update is available.',
  },
  {
    variant: 'error',
    title: 'Error',
    meaning: 'An action failed and needs recovery.',
    message:
      'Changes couldn’t be saved. All seats are assigned; choose a larger plan or remove an assignment before adding another member.',
  },
] as const;

const previewPlacements = [
  { placement: 'top-center', label: 'Top center' },
  { placement: 'bottom-right', label: 'Bottom right' },
] as const;

function NotificationExamples() {
  const toast = useToast();

  return (
    <Preview>
      <Example
        title="Meanings & placements"
        size="collection"
        caption="Errors stay until dismissed; other toasts close after three seconds."
      >
        <div className="docs-toast-table-scroll">
          <table className="docs-toast-table" aria-label="Toast meanings and placement examples">
            <thead>
              <tr>
                <th scope="col">Meaning</th>
                <th scope="col">Toast</th>
                {previewPlacements.map(({ placement, label }) => (
                  <th key={placement} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {toastVariants.map(({ variant, title, meaning, message }) => (
                <tr key={variant}>
                  <th scope="row" className="docs-toast-meaning">
                    <Text as="strong" variant="section-heading">
                      {title}
                    </Text>
                    <Text variant="supporting">{meaning}</Text>
                  </th>
                  <td>
                    <Toast announce={false} variant={variant} message={message} />
                  </td>
                  {previewPlacements.map(({ placement, label }) => (
                    <td key={placement}>
                      <Button
                        variant="text"
                        aria-label={`Try it now: ${title.toLowerCase()} toast, ${label.toLowerCase()}`}
                        onClick={() =>
                          toast.show({
                            variant,
                            message,
                            placement,
                            duration: variant === 'error' ? Infinity : 3000,
                          })
                        }
                      >
                        Try it now
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Example>
    </Preview>
  );
}

export function ToastsPreview() {
  return (
    <ToastProvider visibleLimit={2}>
      <NotificationExamples />
    </ToastProvider>
  );
}
