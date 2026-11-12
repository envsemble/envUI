import { Link, Column } from '@envsemble/envui';

export default function WithoutUnderline() {
  return (
    <Column gap={2} align="start">
      <Link href="/settings/profile" underline={false}>
        Profile
      </Link>
      <Link href="/settings/notifications" underline={false}>
        Notifications
      </Link>
    </Column>
  );
}
