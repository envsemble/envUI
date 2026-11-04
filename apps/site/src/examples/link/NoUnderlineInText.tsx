import { Link, Text } from '@envsemble/envui';

export default function NoUnderlineInText() {
  return (
    <Text>
      Read the{' '}
      <Link href="/guide" underline={false}>
        project guide
      </Link>{' '}
      before the review.
    </Text>
  );
}
