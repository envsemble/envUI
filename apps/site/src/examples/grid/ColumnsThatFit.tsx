import { Card, Grid } from '@envsemble/envui';

const projects = [
  { name: 'Website refresh', owner: 'Priya Shah', description: 'New pages for the spring launch.' },
  { name: 'Quarterly report', owner: 'Sam Lee', description: 'Figures for the last three months.' },
  {
    name: 'Onboarding guide',
    owner: 'Alex Morgan',
    description: 'The first week for new members.',
  },
  { name: 'Data migration', owner: 'Sam Lee', description: 'Moving the archive to the new store.' },
];

export default function ColumnsThatFit() {
  return (
    // As many columns as fit, each at least 14 rem wide; one column in a narrow container.
    <Grid columns={{ min: '14rem' }} gap={4}>
      {projects.map((project) => (
        <Card
          key={project.name}
          title={project.name}
          meta={project.owner}
          description={project.description}
        />
      ))}
    </Grid>
  );
}
