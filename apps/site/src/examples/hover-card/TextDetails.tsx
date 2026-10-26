import { Column, HoverCard, Text } from '@envsemble/envui';

export default function TextDetails() {
  return (
    <Text>
      <HoverCard
        trigger={
          // Text that isn't a link: focusable, so keyboard focus opens the card too.
          <span tabIndex={0}>28 h 9 min</span>
        }
      >
        <Column gap={2}>
          <Text render={<strong />} variant="title">
            Time this week
          </Text>
          <Text emphasis="muted">
            Reviews 11 h 40 min, drafting 9 h 5 min, meetings 7 h 24 min.
          </Text>
        </Column>
      </HoverCard>{' '}
      <Text render={<span />} emphasis="muted">
        logged this week
      </Text>
    </Text>
  );
}
