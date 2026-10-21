import { Alert, Button, Column } from '@envsemble/envui';
import { Example } from '../../previews/Example';

const tones = [
  { tone: 'info', title: 'Sync paused' },
  { tone: 'success', title: 'Plan shared' },
  { tone: 'warning', title: 'Storage almost full' },
  { tone: 'danger', title: 'Search is unavailable' },
] as const;

/** Every tone with every part: icon, title, message, action and dismiss button. */
export default function ToneMatrix() {
  return (
    <Example title="Tones with every part" size="wide">
      <Column gap={3}>
        {tones.map(({ tone, title }) => (
          <Alert
            key={tone}
            tone={tone}
            title={title}
            onDismiss={() => undefined}
            action={<Button variant="secondary">Review</Button>}
          >
            A message of one or two sentences that says what it means and what to do next.
          </Alert>
        ))}
      </Column>
    </Example>
  );
}
