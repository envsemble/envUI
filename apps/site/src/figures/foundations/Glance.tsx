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
import { edges, gap, Item, Mark } from '../../tiles/Reflow';

/*
 * The pictures of the page of all foundations (FoundationCatalogue.tsx), one for each foundation:
 * the system's own values in its tokens, so they follow the reader's theme, contrast and scale.
 * Space, width and the keyboard are drawn in hairlines (tiles/Reflow.ts);
 * type, color and icons show themselves. They are pictures: hidden from assistive technology,
 * since the foundation's name beside them says what they are.
 */

/** The tones of the palette, as the Colors page names them. */
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

/** A row for each tone: its name, then its soft fill, its solid fill and its text. */
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

/** The text styles, largest first, each named in itself, as the Typography page names them. */
const styles: readonly { variant: TextVariant; name: string }[] = [
  { variant: 'display', name: 'Display' },
  { variant: 'headline', name: 'Headline' },
  { variant: 'title', name: 'Title' },
  { variant: 'body', name: 'Body' },
  { variant: 'body-sm', name: 'Small body' },
  { variant: 'caption', name: 'Caption' },
];

/** The typeface's letters large, and each style's name in its style. */
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

/** The frame's inset, the space within a group and the space between the groups. */
const inset = 'var(--env-space-4)';
const within = 'var(--env-space-3)';
const between = 'var(--env-space-7)';

/** Where a mark stands in the frame's inset, centred in it. */
const inInset = `calc((${inset} - var(--env-space-1)) / 2)`;

/** The first group's heading, by its height. */
const heading = '1.25rem';

/**
 * Space groups things: in a frame, a heading and its lines close together, and further below, a
 * group of a field, a button and an icon button of one height, each in its corners; the space
 * within the first group and between the two marked at the start.
 */
function SpacingPicture() {
  return (
    <div className="catalogue-glance catalogue-glance-drawing" aria-hidden="true">
      <div style={{ position: 'relative', padding: inset }}>
        {edges()}
        <Mark
          {...gap('block', { from: `calc(${inset} + ${heading})`, across: within, off: inInset })}
        />
        <Mark
          {...gap('block', {
            from: `calc(${inset} + ${heading} + 2 * ${within} + 1.75rem)`,
            across: between,
            off: inInset,
          })}
        />
        <Column gap={7} style={{ position: 'relative' }}>
          <Column gap={3}>
            <Item width="6rem" height={heading} />
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

/** The four window classes, each a window of its width with the panes a layout gives it there. */
const windows = [
  { id: 'compact', name: 'Compact', panes: 1 },
  { id: 'medium', name: 'Medium', panes: 1 },
  { id: 'expanded', name: 'Expanded', panes: 2 },
  { id: 'large', name: 'Large', panes: 3 },
] as const;

/** A window of each class, side by side from the narrowest, with its panes, and its name. */
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

/** A grid of icons, outlined, with one selected and filled, as navigation fills its current place. */
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

/**
 * A small form drawn in hairlines, a field, a checkbox with its label and a button, the focus ring
 * around the button, and beside it the key that moves the ring from one to the next.
 */
function AccessibilityPicture() {
  return (
    <div className="catalogue-glance catalogue-glance-drawing" aria-hidden="true">
      <div style={{ position: 'relative', padding: inset }}>
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

/** Each foundation's picture, by its page's id. */
export const glancePictures: Record<string, ComponentType> = {
  colors: ColorsPicture,
  typography: TypographyPicture,
  spacing: SpacingPicture,
  responsive: ResponsivePicture,
  icons: IconsPicture,
  accessibility: AccessibilityPicture,
};
