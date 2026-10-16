import { ActionGroup, Spinner } from '@envsemble/envui';

export default function Sizes() {
  return (
    // A row that centres the sizes on one line.
    <ActionGroup>
      <Spinner size="small" label="Loading, small" />
      <Spinner label="Loading, standard" />
      <Spinner size="large" label="Loading, large" />
    </ActionGroup>
  );
}
