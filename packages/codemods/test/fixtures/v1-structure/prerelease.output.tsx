import { Drawer, LoadingState, Sheet, Text, Spinner } from '@envsemble/envui';

const destinations = [{ label: 'Inbox', icon: 'inbox', href: '/inbox' }];

// 1.0.0-prerelease.0's Drawer, which takes no destinations, is a Sheet, renamed by hand; the
// navigation drawer takes destinations. LoadingState takes no children in 1.0.
export const Filters = ({ open }: { open: boolean }) => (
  <>
    <Drawer title="Filters" open={open}>
      <Text>Status</Text>
    </Drawer>
    <Drawer destinations={destinations} />
    <Sheet side="bottom" title="Share" />
    <LoadingState label="Loading projects">
      <Text>Projects</Text>
    </LoadingState>
    <Spinner showLabel label="Loading" />
  </>
);
