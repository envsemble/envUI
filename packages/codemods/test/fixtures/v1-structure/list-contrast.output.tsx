import { List, Surface } from '@envsemble/envui';

export function Accounts({ shaded }) {
  return (
    <>
      <List.Root contrast={shaded} aria-label="Either">
        <List.Item label="Mail" />
      </List.Root>
      <Surface background="muted" padding={3}>
        <List.Root aria-label="Accounts">
          <List.Item label="Calendar" />
        </List.Root>
      </Surface>
      <List.Root aria-label="Plain">
        <List.Item label="Storage" />
      </List.Root>
    </>
  );
}
