import { Card, Text } from '@envsemble/envui';

const projects = [
  { id: 'northwind', name: 'Northwind launch', summary: '12 open tasks · Due 14 November' },
  { id: 'pricing', name: 'Pricing research', summary: '4 open tasks · No due date' },
  { id: 'handbook', name: 'Support handbook', summary: 'Archived in March' },
];

/** As many columns of at least 14 rem as fit. */
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 14rem), 1fr))',
  gap: '1rem',
} as const;

export default function Destinations() {
  return (
    <div style={grid}>
      {projects.map(({ id, name, summary }) => (
        // The title names the link and the summary describes it, instead of the whole card's text.
        <Card
          key={id}
          href={`/projects/${id}`}
          aria-labelledby={`${id}-name`}
          aria-describedby={`${id}-summary`}
        >
          <Text render={<span />} variant="title" id={`${id}-name`}>
            {name}
          </Text>
          <Text render={<span />} emphasis="muted" id={`${id}-summary`}>
            {summary}
          </Text>
        </Card>
      ))}
    </div>
  );
}
