import { Link, Stack } from '@envsemble/envui';

export default function WithoutUnderline() {
  return (
    <Stack gap={2} align="start">
      <Link href="/settings/profile" underline={false}>
        Profile
      </Link>
      <Link href="/settings/notifications" underline={false}>
        Notifications
      </Link>
    </Stack>
  );
}
