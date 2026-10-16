import { ActionGroup, Avatar } from '@envsemble/envui';

export default function Sizes() {
  return (
    <ActionGroup>
      <Avatar name="Sam Lee" size="small" label />
      <Avatar name="Sam Lee" label />
      <Avatar name="Sam Lee" size="large" label />
      <Avatar name="Sam Lee" size="display" label />
    </ActionGroup>
  );
}
