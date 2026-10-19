import { AppShellSkeleton } from '@envsemble/envui';

export function Loading() {
  return (
    <AppShellSkeleton brand={<span>B</span>} storageKey="app-sidebar" navigationItems={4} label="Loading projects">
      <p>Fetching</p>
    </AppShellSkeleton>
  );
}
