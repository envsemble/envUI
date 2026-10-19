import { List as Rows } from '@envsemble/envui';

export function Settings() {
  return (
    <Rows.Root contrast aria-label="Settings">
      <Rows.Item title="Theme" />
    </Rows.Root>
  );
}
