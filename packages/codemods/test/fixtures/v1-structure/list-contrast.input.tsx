import { List } from '@envsemble/envui';

export function Accounts({ shaded }) {
  return (
    <>
      <List.Root contrast={shaded} aria-label="Either">
        <List.Item label="Mail" />
      </List.Root>
      <List.Root contrast aria-label="Accounts">
        <List.Item label="Calendar" />
      </List.Root>
      <List.Root contrast={false} aria-label="Plain">
        <List.Item label="Storage" />
      </List.Root>
    </>
  );
}
