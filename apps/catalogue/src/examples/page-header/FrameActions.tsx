import { AvatarButton, Button, PageHeader } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

export default function FrameActions() {
  return (
    // The account and sign-out belong to the application's frame, not to one page.
    <PageHeader
      headingLevel={3}
      title="Projects"
      actions={
        <>
          <Button startIcon={<Add />}>New project</Button>
          <Button variant="ghost">Sign out</Button>
          <AvatarButton name="Alex Morgan" aria-label="Account" />
        </>
      }
    />
  );
}
