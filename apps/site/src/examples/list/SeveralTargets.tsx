import { Link, List, Text } from '@envsemble/envui';

export default function SeveralTargets() {
  return (
    <List.Root aria-label="Recent plans" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <List.Item
        label={<Link href="/plans/roadmap">Roadmap</Link>}
        description={
          <Text render={<span />} variant="body-sm">
            Updated today by <Link href="/people/sam">Sam Lee</Link>
          </Text>
        }
      />
      <List.Item
        label={<Link href="/plans/pricing">Pricing research</Link>}
        description={
          <Text render={<span />} variant="body-sm">
            Updated yesterday by <Link href="/people/priya">Priya Shah</Link>
          </Text>
        }
      />
    </List.Root>
  );
}
