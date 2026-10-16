import { LoadingState, Skeleton } from '@envsemble/envui';

export default function SettingsRows() {
  return (
    // Rows as tall as the list rows they stand for.
    <LoadingState label="Loading settings">
      <Skeleton height="3.5rem" />
      <Skeleton height="3.5rem" />
      <Skeleton height="3.5rem" />
    </LoadingState>
  );
}
