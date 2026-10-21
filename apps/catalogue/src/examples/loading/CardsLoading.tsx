import { useEffect, useRef, useState } from 'react';
import { Button, Card, Column, Grid, placeholders } from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';

interface Project {
  id: string;
  name: string;
  updated: string;
  summary: string;
}

const projects: Project[] = [
  { id: 'brief', name: 'Launch brief', updated: 'Today', summary: 'Goals, audience and dates.' },
  { id: 'budget', name: 'Budget 2026', updated: 'Monday', summary: 'Spending by quarter.' },
  { id: 'survey', name: 'Customer survey', updated: 'May 4', summary: 'Questions and answers.' },
];

export default function CardsLoading() {
  const [items, setItems] = useState<Project[] | undefined>(projects);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const reload = () => {
    setItems(undefined);
    // The projects load from a server; a timer stands in for it here.
    timer.current = window.setTimeout(() => setItems(projects), 2000);
  };
  return (
    <Column gap={4} align="start" style={{ inlineSize: '100%' }}>
      <Button variant="secondary" startIcon={<Refresh />} onClick={reload}>
        Reload
      </Button>
      {/* The same cards, over placeholder items while the projects load. */}
      <Grid columns={{ min: '12rem' }} gap={4} style={{ inlineSize: '100%' }}>
        {(items ?? placeholders(3)).map((project) => (
          <Card
            key={project.id}
            skeleton={!items}
            title={project.name}
            meta={project.updated}
            description={project.summary}
          />
        ))}
      </Grid>
    </Column>
  );
}
