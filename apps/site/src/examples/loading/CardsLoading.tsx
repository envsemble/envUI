import { useEffect, useState } from 'react';
import { Card, Grid, placeholders } from '@envsemble/envui';

interface Project {
  id: string;
  name: string;
  updated: string;
  summary: string;
}

const projects: Project[] = [
  { id: 'brief', name: 'Launch brief', updated: 'Today', summary: 'Goals and dates.' },
  { id: 'budget', name: 'Budget', updated: 'Monday', summary: 'Spend by quarter.' },
  { id: 'survey', name: 'Survey', updated: 'May 4', summary: 'Answers so far.' },
];

export default function CardsLoading() {
  const [items, setItems] = useState<Project[]>();
  useEffect(() => {
    // The projects load from a server as the page opens; a timer stands in for it here.
    const timer = window.setTimeout(() => setItems(projects), 1600);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    // The same cards, over placeholder items while the projects load, so they land in place.
    <Grid columns={{ min: '12rem' }} gap={4} style={{ inlineSize: '100%' }}>
      {(items ?? placeholders<Project>(3)).map((project) => (
        <Card
          key={project.id}
          skeleton={!items}
          title={project.name}
          meta={project.updated}
          description={project.summary}
        />
      ))}
    </Grid>
  );
}
