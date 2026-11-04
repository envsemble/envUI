import { Link, List } from '@envsemble/envui';

export default function OneTarget() {
  return (
    <List.Root aria-label="Recent plans" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <List.Item
        interactive
        label={
          <Link href="/plans/roadmap" underline={false} data-row-target draggable={false}>
            Roadmap
          </Link>
        }
        description="Updated today by Sam Lee"
      />
      <List.Item
        interactive
        label={
          <Link href="/plans/pricing" underline={false} data-row-target draggable={false}>
            Pricing research
          </Link>
        }
        description="Updated yesterday by Priya Shah"
      />
    </List.Root>
  );
}
