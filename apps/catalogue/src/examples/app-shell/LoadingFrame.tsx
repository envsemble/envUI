import { AppShellSkeleton, Skeleton, Stack } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';

/** Stands in for the window, as for AppShell. */
const frame = {
  position: 'relative',
  blockSize: '18rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
  transform: 'translateZ(0)',
} as const;

export default function LoadingFrame() {
  return (
    <div style={frame}>
      {/* The same brand, and storageKey where AppShell has one, keep the frame in place. */}
      <AppShellSkeleton brand={<Apps />} label="Loading Northwind">
        <Stack gap={3} style={{ padding: '2rem' }}>
          <Skeleton width="12rem" height="2rem" />
          <Skeleton width="100%" height="5rem" />
        </Stack>
      </AppShellSkeleton>
    </div>
  );
}
