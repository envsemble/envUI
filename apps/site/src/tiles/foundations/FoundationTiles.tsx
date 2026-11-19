import type { ComponentType } from 'react';
import { Avatar, Button, Card, Column, Row, Text, TextField } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconFavorite } from '@envsemble/envui/icons/Favorite';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconPerson } from '@envsemble/envui/icons/Person';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { IconSettings } from '@envsemble/envui/icons/Settings';

function IconsTile() {
  return (
    <Row gap={5} align="center" className="catalogue-foundation-tile-icons">
      <IconHome filled width="2.5rem" height="2.5rem" />
      <IconSearch width="2.5rem" height="2.5rem" />
      <IconFolder width="2.5rem" height="2.5rem" />
      <IconFavorite filled width="2.5rem" height="2.5rem" />
      <IconPerson width="2.5rem" height="2.5rem" />
      <IconSettings width="2.5rem" height="2.5rem" />
    </Row>
  );
}

function TypographyTile() {
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

function ColorsTile() {
  return (
    <Row gap={3} className="catalogue-foundation-tile-swatches">
      {['primary', 'accent', 'success', 'warning', 'danger', 'neutral'].map((role) => (
        <span key={role} data-role={role} />
      ))}
    </Row>
  );
}

function SpacingTile() {
  return (
    <Column gap={2} className="catalogue-foundation-tile-spacing">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
        <span key={step} data-step={step} />
      ))}
    </Column>
  );
}

function ScaleTile() {
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

function ResponsiveTile() {
  return (
    <Row gap={4} align="end" className="catalogue-foundation-tile-windows">
      {['compact', 'medium', 'expanded'].map((size) => (
        <span key={size} data-size={size}>
          <Text variant="caption" render={<span />}>
            {size[0].toUpperCase() + size.slice(1)}
          </Text>
        </span>
      ))}
    </Row>
  );
}

function CompositionTile() {
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

function AccessibilityTile() {
  return (
    <Column gap={4} align="start">
      <TextField label="Email" defaultValue="alex.morgan@example.com" />
      <Button start={<IconAdd />} className="catalogue-foundation-tile-focus">
        Add member
      </Button>
    </Column>
  );
}

function ContentTile() {
  return (
    <Column gap={2} align="center" className="catalogue-foundation-tile-content">
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

const tiles: Record<string, ComponentType> = {
  icons: IconsTile,
  typography: TypographyTile,
  colors: ColorsTile,
  spacing: SpacingTile,
  scale: ScaleTile,
  responsive: ResponsiveTile,
  composition: CompositionTile,
  accessibility: AccessibilityTile,
  content: ContentTile,
};

export const hasFoundationTile = (id: string) => id in tiles;

export function FoundationTile({ id }: { id: string }) {
  const Tile = tiles[id];
  return Tile ? <Tile /> : null;
}
