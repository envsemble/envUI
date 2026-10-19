import { Spinner, Stack } from '@envsemble/envui';

export default function Sizes() {
  return (
    // A row that centres the sizes on one line.
    <Stack direction="row" wrap align="center" gap={4}>
      <Spinner size="sm" label="Loading, small" />
      <Spinner label="Loading, standard" />
      <Spinner size="lg" label="Loading, large" />
    </Stack>
  );
}
