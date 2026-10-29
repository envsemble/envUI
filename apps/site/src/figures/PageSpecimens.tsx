import type { ComponentType } from 'react';
import { Avatar, Button, Card, Column, Row, Text, TextField } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconFavorite } from '@envsemble/envui/icons/Favorite';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconPerson } from '@envsemble/envui/icons/Person';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { IconSettings } from '@envsemble/envui/icons/Settings';

/*
 * A small, characteristic specimen of each foundation, for a Related tile that points to a page
 * without an example of its own: what the page is about, drawn with envUI, so its tile reads as
 * the tiles of components do rather than as a missing picture. The tile scales it to fit its
 * stage, as it does an example (Related.tsx); its styles are in Related.css.
 */

/** A few real icons from the set, outline and filled. */
function IconsSpecimen() {
  return (
    <Row gap={5} align="center" className="catalogue-page-specimen-icons">
      <IconHome filled width="2.5rem" height="2.5rem" />
      <IconSearch width="2.5rem" height="2.5rem" />
      <IconFolder width="2.5rem" height="2.5rem" />
      <IconFavorite filled width="2.5rem" height="2.5rem" />
      <IconPerson width="2.5rem" height="2.5rem" />
      <IconSettings width="2.5rem" height="2.5rem" />
    </Row>
  );
}

/** The type scale, from display down to caption. */
function TypographySpecimen() {
  return (
    <Row gap={6} align="center">
      <Text variant="display" render={<span />}>
        Aa
      </Text>
      <Column gap={1}>
        <Text variant="headline" render={<span />}>
          Headline
        </Text>
        <Text variant="title" render={<span />}>
          Title
        </Text>
        <Text render={<span />}>Body text</Text>
        <Text variant="caption" render={<span />}>
          Caption
        </Text>
      </Column>
    </Row>
  );
}

/** The theme's roles: primary, accent and the status colors. */
function ColorsSpecimen() {
  return (
    <Row gap={3} className="catalogue-page-specimen-swatches">
      {['primary', 'accent', 'success', 'warning', 'danger', 'neutral'].map((role) => (
        <span key={role} data-role={role} />
      ))}
    </Row>
  );
}

/** The spacing steps, each a bar as long as its step. */
function SpacingSpecimen() {
  return (
    <Column gap={2} className="catalogue-page-specimen-spacing">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
        <span key={step} data-step={step} />
      ))}
    </Column>
  );
}

/** The control sizes, which follow the scale. */
function ScaleSpecimen() {
  return (
    <Row gap={3} align="center">
      <Button size="sm" variant="secondary">
        Small
      </Button>
      <Button size="md" variant="secondary">
        Medium
      </Button>
      <Button size="lg" variant="secondary">
        Large
      </Button>
    </Row>
  );
}

/** The window classes: compact, medium and expanded windows, side by side. */
function ResponsiveSpecimen() {
  return (
    <Row gap={4} align="end" className="catalogue-page-specimen-windows">
      {['compact', 'medium', 'expanded'].map((size) => (
        <span key={size} data-size={size}>
          <Text variant="caption" render={<span />}>
            {size[0]!.toUpperCase() + size.slice(1)}
          </Text>
        </span>
      ))}
    </Row>
  );
}

/** Shared parts composed into a product's own: a card of an avatar, text and a button. */
function CompositionSpecimen() {
  return (
    <Card padding={4}>
      <Row gap={3} align="center">
        <Avatar name="Alex Morgan" />
        <Column gap={0}>
          <Text emphasis="default" render={<span />}>
            Alex Morgan
          </Text>
          <Text variant="caption" render={<span />}>
            Website refresh
          </Text>
        </Column>
        <Button variant="secondary" size="sm">
          Invite
        </Button>
      </Row>
    </Card>
  );
}

/** A labelled field and a button showing the focus ring that keyboard use shows. */
function AccessibilitySpecimen() {
  return (
    <Column gap={4} align="start">
      <TextField label="Email" defaultValue="alex.morgan@example.com" />
      <Button startIcon={<IconAdd />} className="catalogue-page-specimen-focus">
        Add member
      </Button>
    </Column>
  );
}

/** Clear, short words: an empty state's title, its next step and its action. */
function ContentSpecimen() {
  return (
    <Column gap={2} align="center" className="catalogue-page-specimen-content">
      <Text variant="title" render={<span />}>
        No projects yet
      </Text>
      <Text variant="body-sm" render={<span />}>
        Create a project to start planning work.
      </Text>
      <Button size="sm">Create project</Button>
    </Column>
  );
}

const specimens: Record<string, ComponentType> = {
  icons: IconsSpecimen,
  typography: TypographySpecimen,
  colors: ColorsSpecimen,
  spacing: SpacingSpecimen,
  scale: ScaleSpecimen,
  responsive: ResponsiveSpecimen,
  composition: CompositionSpecimen,
  accessibility: AccessibilitySpecimen,
  content: ContentSpecimen,
};

/** Whether a page has a specimen for a tile. */
export const hasPageSpecimen = (id: string) => id in specimens;

/** The specimen of a page, by its id, such as icons. */
export function PageSpecimen({ id }: { id: string }) {
  const Specimen = specimens[id];
  return Specimen ? <Specimen /> : null;
}
