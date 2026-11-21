import type { ComponentType, CSSProperties } from 'react';
import { Column, Kbd, Row, Text, type TextVariant } from '@envsemble/envui';
import { IconCalendarMonth } from '@envsemble/envui/icons/CalendarMonth';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconMail } from '@envsemble/envui/icons/Mail';
import { IconPerson } from '@envsemble/envui/icons/Person';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconShare } from '@envsemble/envui/icons/Share';
import { IconStar } from '@envsemble/envui/icons/Star';
import { edges, gap, Item, Mark } from '../../tiles/LayoutDrawing';

const tones = [
  { id: 'primary', name: 'Primary' },
  { id: 'accent', name: 'Accent' },
  { id: 'success', name: 'Success' },
  { id: 'warning', name: 'Warning' },
  { id: 'danger', name: 'Danger' },
  { id: 'done', name: 'Done' },
  { id: 'neutral', name: 'Neutral' },
] as const;

const toneStyle = (tone: string): CSSProperties => ({
  '--catalogue-tone-muted': `var(--env-color-bg-${tone}-muted)`,
  '--catalogue-tone-emphasis': `var(--env-color-bg-${tone}-${tone === 'primary' || tone === 'accent' ? 'solid' : 'emphasis'})`,
  '--catalogue-tone-strong':
    tone === 'neutral' ? 'var(--env-color-fg-default)' : `var(--env-color-fg-${tone})`,
});

function ColorsPicture() {
  return (
    <div className="catalogue-glance catalogue-glance-palette" aria-hidden="true">
      {tones.map((tone) => (
        <span key={tone.id} className="catalogue-glance-tone" style={toneStyle(tone.id)}>
          <Text variant="caption" emphasis="muted">
            {tone.name}
          </Text>
          <span className="catalogue-glance-tone-chips">
            <span />
            <span />
            <span />
          </span>
        </span>
      ))}
    </div>
  );
}

const styles: readonly { variant: TextVariant; name: string }[] = [
  { variant: 'display', name: 'Display' },
  { variant: 'headline', name: 'Headline' },
  { variant: 'title', name: 'Title' },
  { variant: 'body', name: 'Body' },
  { variant: 'body-sm', name: 'Small body' },
  { variant: 'caption', name: 'Caption' },
];

function TypographyPicture() {
  return (
    <div className="catalogue-glance catalogue-glance-type" aria-hidden="true">
      <span className="catalogue-glance-type-letters">Aa</span>
      <span className="catalogue-glance-type-styles">
        {styles.map(({ variant, name }) => (
          <Text key={variant} render={<span />} variant={variant}>
            {name}
          </Text>
        ))}
      </span>
    </div>
  );
}

const frameInset = 'var(--env-space-4)';
const spaceWithinGroup = 'var(--env-space-3)';
const spaceBetweenGroups = 'var(--env-space-7)';

const markOffsetInInset = `calc((${frameInset} - var(--env-space-1)) / 2)`;

const headingHeight = '1.25rem';

function SpacingPicture() {
  return (
    <div className="catalogue-glance catalogue-glance-drawing" aria-hidden="true">
      <div style={{ position: 'relative', padding: frameInset }}>
        {edges()}
        <Mark
          {...gap('block', {
            from: `calc(${frameInset} + ${headingHeight})`,
            across: spaceWithinGroup,
            off: markOffsetInInset,
          })}
        />
        <Mark
          {...gap('block', {
            from: `calc(${frameInset} + ${headingHeight} + 2 * ${spaceWithinGroup} + 1.75rem)`,
            across: spaceBetweenGroups,
            off: markOffsetInInset,
          })}
        />
        <Column gap={7} style={{ position: 'relative' }}>
          <Column gap={3}>
            <Item width="6rem" height={headingHeight} />
            <Item width="10rem" height="0.875rem" />
            <Item width="8rem" height="0.875rem" />
          </Column>
          <Row gap={3} align="center">
            <Item width="5rem" height="2rem" radius="var(--env-radius-sm)" />
            <Item width="3.5rem" height="2rem" radius="1rem" />
            <Item width="2rem" height="2rem" radius="1rem" />
          </Row>
        </Column>
      </div>
    </div>
  );
}

const windows = [
  { id: 'compact', name: 'Compact', panes: 1 },
  { id: 'medium', name: 'Medium', panes: 1 },
  { id: 'expanded', name: 'Expanded', panes: 2 },
  { id: 'large', name: 'Large', panes: 3 },
] as const;

function ResponsivePicture() {
  return (
    <div className="catalogue-glance catalogue-glance-windows" aria-hidden="true">
      {windows.map((window) => (
        <span key={window.id} className="catalogue-glance-window-class">
          <span className="catalogue-glance-window" data-window={window.id}>
            {edges('var(--env-radius-xs)')}
            {Array.from({ length: window.panes }, (_, index) => (
              <span key={index} className="catalogue-glance-pane">
                {edges()}
              </span>
            ))}
          </span>
          <Text variant="caption" emphasis="muted">
            {window.name}
          </Text>
        </span>
      ))}
    </div>
  );
}

const icons = [
  IconHome,
  IconSearch,
  IconInbox,
  IconStar,
  IconPerson,
  IconSettings,
  IconFolder,
  IconMail,
  IconCalendarMonth,
  IconEdit,
  IconShare,
  IconDelete,
];

function IconsPicture() {
  return (
    <div className="catalogue-glance catalogue-glance-icons" aria-hidden="true">
      {icons.map((Icon, index) => (
        <span key={index} data-selected={Icon === IconStar || undefined}>
          <Icon filled={Icon === IconStar} />
        </span>
      ))}
    </div>
  );
}

function AccessibilityPicture() {
  return (
    <div className="catalogue-glance catalogue-glance-drawing" aria-hidden="true">
      <div style={{ position: 'relative', padding: frameInset }}>
        {edges()}
        <Column gap={3} align="start" style={{ position: 'relative' }}>
          <Item width="8rem" height="1.75rem" radius="var(--env-radius-sm)" />
          <Row gap={2} align="center">
            <Item width="1rem" height="1rem" radius="var(--env-radius-xs)" />
            <Item width="5rem" height="0.625rem" />
          </Row>
          <span className="catalogue-glance-focus">
            <Item width="4.5rem" height="1.75rem" radius="0.875rem" />
          </span>
        </Column>
      </div>
      <Kbd keys={['Tab']} />
    </div>
  );
}

export const glancePictures: Record<string, ComponentType> = {
  colors: ColorsPicture,
  typography: TypographyPicture,
  spacing: SpacingPicture,
  responsive: ResponsivePicture,
  icons: IconsPicture,
  accessibility: AccessibilityPicture,
};
