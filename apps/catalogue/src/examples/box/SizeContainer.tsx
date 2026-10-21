import { Box, Stat } from '@envsemble/envui';

export default function SizeContainer() {
  return (
    // A container the application's own style sheet can query, such as
    // @container summary (width < 37.5rem) { … }; the box is as wide as its context gives it.
    <Box container="summary">
      <Stat.Group>
        <Stat.Root label="Open tasks" value={24} />
        <Stat.Root label="Done this week" value={9} />
        <Stat.Root label="Overdue" value={2} />
      </Stat.Group>
    </Box>
  );
}
