import { List as Rows, Surface } from '@envsemble/envui';

export function Settings() {
  return (
    <Surface background="muted" padding={3}>
      <Rows.Root aria-label="Settings">
        <Rows.Item title="Theme" />
      </Rows.Root>
    </Surface>
  );
}
