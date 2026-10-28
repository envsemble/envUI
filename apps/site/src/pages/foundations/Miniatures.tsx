import type { ComponentType, CSSProperties } from 'react';
import { Button, Checkbox, Kbd, Text, type TextVariant } from '@envsemble/envui';
import { CalendarMonth } from '@envsemble/envui/icons/CalendarMonth';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Mail } from '@envsemble/envui/icons/Mail';
import { Person } from '@envsemble/envui/icons/Person';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Share } from '@envsemble/envui/icons/Share';
import { Star } from '@envsemble/envui/icons/Star';

/*
 * Small pictures of each foundation, for the page of all foundations (FoundationsPage.tsx): the
 * system's own values drawn in its tokens, so they follow the reader's theme and scale. `named`
 * adds the plain names of what they show, for a picture with room for words. They are pictures:
 * hidden from assistive technology, since the foundation's name beside them says what they are.
 */

export interface MiniatureProps {
  /** Names each value, under or beside it. */
  named?: boolean;
}

/** The tones of the palette, each from its soft fill to its text, as the Colors page names them. */
const tones = [
  { id: 'accent', name: 'Accent' },
  { id: 'success', name: 'Success' },
  { id: 'warning', name: 'Warning' },
  { id: 'danger', name: 'Danger' },
  { id: 'done', name: 'Done' },
  { id: 'neutral', name: 'Neutral' },
] as const;

const toneStyle = (tone: string) =>
  ({
    '--muted': `var(--env-color-bg-${tone}-muted)`,
    '--emphasis': `var(--env-color-bg-${tone}-emphasis)`,
    '--strong': tone === 'neutral' ? 'var(--env-color-fg-default)' : `var(--env-color-fg-${tone})`,
  }) as CSSProperties;

/** A column for each tone: its soft fill, its solid fill and its text. */
export function ColorsMiniature({ named = false }: MiniatureProps) {
  return (
    <div className="catalogue-mini catalogue-mini-palette" aria-hidden="true" data-named={named}>
      {tones.map((tone) => (
        <span key={tone.id} className="catalogue-mini-tone" style={toneStyle(tone.id)}>
          <span className="catalogue-mini-tone-chips">
            <span />
            <span />
            <span />
          </span>
          {named && (
            <Text variant="caption" emphasis="muted" className="catalogue-mini-name">
              {tone.name}
            </Text>
          )}
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
export function TypographyMiniature({ named = false }: MiniatureProps) {
  return (
    <div className="catalogue-mini catalogue-mini-type" aria-hidden="true" data-named={named}>
      <span className="catalogue-mini-type-letters">Aa</span>
      <span className="catalogue-mini-type-styles">
        {styles.slice(named ? 0 : 1).map(({ variant, name }) => (
          <Text key={variant} render={<span />} variant={variant}>
            {name}
          </Text>
        ))}
      </span>
    </div>
  );
}

/** The steps of space, from the smallest, as bars of their length. */
const spaces = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** The kinds of corner, as the Spacing page names them, from a surface's to a circle. */
const corners = [
  { id: 'surface', name: 'Surface' },
  { id: 'inner', name: 'Inside' },
  { id: 'pill', name: 'Rounded' },
  { id: 'circle', name: 'Circle' },
] as const;

/** The steps of space as a stair of bars, and under it the four kinds of corner. */
export function SpacingMiniature({ named = false }: MiniatureProps) {
  return (
    <div className="catalogue-mini catalogue-mini-spacing" aria-hidden="true">
      <span className="catalogue-mini-steps">
        {spaces.map((step) => (
          <span key={step} style={{ inlineSize: `var(--env-space-${step})` }} />
        ))}
      </span>
      <span className="catalogue-mini-corners">
        {corners.map((corner) => (
          <span key={corner.id} className="catalogue-mini-corner">
            <span data-corner={corner.id} />
            {named && (
              <Text variant="caption" emphasis="muted" className="catalogue-mini-name">
                {corner.name}
              </Text>
            )}
          </span>
        ))}
      </span>
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

/** A window of each class, side by side from the narrowest, with its panes. */
export function ResponsiveMiniature({ named = false }: MiniatureProps) {
  return (
    <div className="catalogue-mini catalogue-mini-windows" aria-hidden="true">
      {windows.map((window) => (
        <span key={window.id} className="catalogue-mini-window-class">
          <span className="catalogue-mini-window" data-window={window.id}>
            {Array.from({ length: window.panes }, (_, index) => (
              <span key={index} className="catalogue-mini-pane">
                <span />
                <span />
                <span />
              </span>
            ))}
          </span>
          {named && (
            <Text variant="caption" emphasis="muted" className="catalogue-mini-name">
              {window.name}
            </Text>
          )}
        </span>
      ))}
    </div>
  );
}

const icons = [
  Home,
  Search,
  Inbox,
  Star,
  Person,
  Settings,
  Folder,
  Mail,
  CalendarMonth,
  Edit,
  Share,
  Delete,
];

/**
 * A grid of icons, outlined, with one selected and filled, as navigation fills its current place;
 * named, the grid's first row twice, outlined and then filled.
 */
export function IconsMiniature({ named = false }: MiniatureProps) {
  if (named)
    return (
      <div className="catalogue-mini catalogue-mini-icon-forms" aria-hidden="true">
        {(['Outlined', 'Filled'] as const).map((form) => (
          <span key={form} className="catalogue-mini-icon-form">
            <span className="catalogue-mini-icon-row">
              {icons.slice(0, 6).map((Icon, index) => (
                <Icon key={index} filled={form === 'Filled'} />
              ))}
            </span>
            <Text variant="caption" emphasis="muted" className="catalogue-mini-name">
              {form}
            </Text>
          </span>
        ))}
      </div>
    );
  return (
    <div className="catalogue-mini catalogue-mini-icons" aria-hidden="true">
      {icons.map((Icon, index) => (
        <span key={index} data-selected={Icon === Star || undefined}>
          <Icon filled={Icon === Star} />
        </span>
      ))}
    </div>
  );
}

/**
 * A small form the keyboard is in: a checked box, and the button after it with the focus ring
 * around it, which the key under them moved it to.
 */
export function AccessibilityMiniature({ named = false }: MiniatureProps) {
  return (
    <div className="catalogue-mini catalogue-mini-access" aria-hidden="true" inert>
      <span className="catalogue-mini-access-form">
        <Checkbox label="Email me updates" defaultChecked />
        <span className="catalogue-mini-focus">
          <Button variant="primary">Save</Button>
        </span>
      </span>
      <span className="catalogue-mini-access-keys">
        <Kbd keys={['Tab']} />
        {named && (
          <Text variant="caption" emphasis="muted" className="catalogue-mini-name">
            Moves the focus ring
          </Text>
        )}
      </span>
    </div>
  );
}

/** Each foundation's picture, by its page's id. */
export const miniatures: Record<string, ComponentType<MiniatureProps>> = {
  colors: ColorsMiniature,
  typography: TypographyMiniature,
  spacing: SpacingMiniature,
  responsive: ResponsiveMiniature,
  icons: IconsMiniature,
  accessibility: AccessibilityMiniature,
};
