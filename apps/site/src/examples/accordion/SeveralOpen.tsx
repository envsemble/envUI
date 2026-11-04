import { Accordion } from '@envsemble/envui';

export default function SeveralOpen() {
  return (
    // multiple lets people keep several sections open to compare them.
    <Accordion.Root
      multiple
      defaultValue={['notifications', 'privacy']}
      style={{ inlineSize: 'min(100%, 32rem)' }}
    >
      <Accordion.Item value="notifications" title="Notifications">
        Email for mentions and assignments; a daily summary for everything else.
      </Accordion.Item>
      <Accordion.Item value="privacy" title="Privacy">
        Your profile is visible to people in your workspaces.
      </Accordion.Item>
      <Accordion.Item value="sessions" title="Sessions">
        Signed in on two devices.
      </Accordion.Item>
    </Accordion.Root>
  );
}
