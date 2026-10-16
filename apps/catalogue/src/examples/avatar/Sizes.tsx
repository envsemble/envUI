import { Avatar, Stack } from '@envsemble/envui';

export default function Sizes() {
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      <Avatar name="Sam Lee" size="small" label />
      <Avatar name="Sam Lee" label />
      <Avatar name="Sam Lee" size="large" label />
      <Avatar name="Sam Lee" size="display" label />
    </Stack>
  );
}
