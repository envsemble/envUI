import { useState } from 'react';
import {
  Box,
  Grid,
  Theme,
  Card,
  Button,
  Badge,
  Disclosure,
  Column,
  Row,
  TextField,
  NavList,
  IconButton,
} from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

export function LayoutFixture() {
  const [cardActivations, setCardActivations] = useState(0);
  return (
    <>
      {(['light', 'dark'] as const).map((theme) => (
        <Theme
          key={theme}
          theme={theme}
          className="fixture-section"
          data-testid={`layout-${theme}`}
        >
          <Card data-testid="layout-card" style={{ maxInlineSize: '24rem' }}>
            <h3>Related content</h3>
            <p>A description with enough content to wrap on a narrow screen.</p>
            <Row wrap align="center" gap={4}>
              <Button variant="secondary">Cancel</Button>
              <Button>Save changes</Button>
            </Row>
            <Badge>Updated today</Badge>
            <Disclosure title={`Card guidance ${theme}`} open>
              <p>First detail</p>
              <p>Second detail</p>
            </Disclosure>
          </Card>
          <Column data-testid="layout-column" gap={3} style={{ maxInlineSize: '20rem' }}>
            <TextField label={`Layout field ${theme}`} />
            <Button>Fit action</Button>
            <NavList.Item selected>Destination</NavList.Item>
            <Badge>Metadata</Badge>
            <Disclosure title={`Column guidance ${theme}`} open>
              <p>Supporting detail</p>
            </Disclosure>
          </Column>
          <div className="fixture-shrink-row" data-testid="shrink-row">
            <span className="fixture-shrink-label">
              A long label that fills the row and squeezes what sits beside it
            </span>
            <span className="fixture-shrink-slot">
              <IconButton icon={<ChevronRight />} aria-label={`Squeezed next ${theme}`} />
            </span>
          </div>
          <Column gap={2} data-testid="stacked-actions" style={{ maxInlineSize: '20rem' }}>
            <Button fullWidth>Continue</Button>
            <Button variant="secondary" fullWidth>
              Cancel
            </Button>
            <IconButton icon={<ChevronRight />} aria-label={`Stacked next ${theme}`} />
          </Column>
          <Card
            render={<article />}
            title="Shared action card"
            data-testid="flush-action-card"
            actions={<Button>Continue</Button>}
          >
            <p>Keep the action rail attached.</p>
          </Card>
          <Card
            render={<article />}
            title="Quarterly report"
            meta="Updated today"
            data-testid="meta-action-card"
            actions={<Button variant="secondary">Open</Button>}
          >
            <p>Figures for the last three months.</p>
          </Card>
          <Card title="Design tokens" meta="12 changes" data-testid="meta-card">
            <p>Colors and spacing shared by every surface.</p>
          </Card>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              throw new Error('Card submitted a form');
            }}
          >
            <Card
              data-testid="clickable-action"
              onClick={() => setCardActivations((value) => value + 1)}
            >
              <span>Activate card</span>
              <span data-testid="card-activations">{cardActivations}</span>
            </Card>
          </form>
          <Card href="#destination" data-testid="clickable-link">
            Open destination
          </Card>
          <Card
            disabled
            data-testid="disabled-card"
            onClick={() => setCardActivations((value) => value + 1)}
          >
            Unavailable action
          </Card>
          <Card
            href="#blocked"
            disabled
            data-testid="disabled-card-link"
            onClick={() => setCardActivations((value) => value + 1)}
          >
            Unavailable destination
          </Card>
          <Card
            layout="feature"
            headingLevel={2}
            title="Additional content"
            description="Supporting context"
            data-testid="feature-extra"
          >
            <p>Extra detail</p>
            <p>Another detail</p>
            <Button>Explore detail</Button>
            <Disclosure title={`Feature guidance ${theme}`} open>
              <p>Available options</p>
              <ul>
                <li>First option</li>
                <li>Second option</li>
              </ul>
              <p>Choose an option</p>
            </Disclosure>
          </Card>
        </Theme>
      ))}
      <Theme theme="light" className="fixture-section" data-testid="primitives">
        <Row data-testid="row" name="actions" gap={3} align="center">
          <Button>Save</Button>
          <Badge>Draft</Badge>
        </Row>
        <Row data-testid="row-override" gap={3}>
          <span>First</span>
          <span>Second</span>
        </Row>
        <Column data-testid="column" gap={5} padding={4} render={<section />}>
          <span>First</span>
          <span>Second</span>
        </Column>
        <Grid
          data-testid="grid-min"
          columns={{ min: '10rem' }}
          gap={2}
          style={{ inlineSize: '32rem' }}
        >
          {[1, 2, 3, 4, 5].map((cell) => (
            <span key={cell}>Cell {cell}</span>
          ))}
        </Grid>
        <Grid data-testid="grid-count" columns={4}>
          <span>One</span>
        </Grid>
        <Grid
          data-testid="grid-template"
          columns="minmax(0, 2fr) minmax(0, 1fr)"
          style={{ inlineSize: '30rem' }}
        >
          <span>Main</span>
          <span>Aside</span>
        </Grid>
        <Grid data-testid="grid-nested" columns={3}>
          <Grid data-testid="grid-inner">
            <span>Inner</span>
          </Grid>
        </Grid>
        <Box data-testid="box" container="probe" padding={2} style={{ inlineSize: '20rem' }}>
          <span className="fixture-container-probe" data-testid="box-child">
            In a container
          </span>
        </Box>
      </Theme>
    </>
  );
}
