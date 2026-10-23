import { Link, Text } from '@envsemble/envui';

export default function ClickHere() {
  return (
    <Text>
      See the pricing changes for this quarter: <Link href="/pricing">click here</Link>.
    </Text>
  );
}
