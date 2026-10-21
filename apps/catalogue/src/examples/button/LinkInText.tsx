import { Link, Text } from '@envsemble/envui';

export default function LinkInText() {
  return (
    <Text>
      Read the <Link href="/guide">setup guide</Link> before you invite your team.
    </Text>
  );
}
