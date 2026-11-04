import type { ReactNode } from 'react';
import { Theme } from '@envsemble/envui';
import './ContactSheet.css';
import { ActionsSheet } from './ContactSheetActions.js';
import { FormsSheet } from './ContactSheetForms.js';
import { NavigationSheet } from './ContactSheetNavigation.js';
import { DataDisplaySheet } from './ContactSheetDataDisplay.js';
import { ContentSheet } from './ContactSheetContent.js';
import { FeedbackSheet } from './ContactSheetFeedback.js';
import { OverlaysSheet } from './ContactSheetOverlays.js';
import { LayoutSheet } from './ContactSheetLayout.js';

/** The catalogue's component groups (docs/components/*.md `category`), by their URL name. */
export const contactSheetFamilies: Record<string, { title: string; render: () => ReactNode }> = {
  actions: { title: 'Actions', render: ActionsSheet },
  forms: { title: 'Forms & selection', render: FormsSheet },
  navigation: { title: 'Navigation', render: NavigationSheet },
  'data-display': { title: 'Data display', render: DataDisplaySheet },
  content: { title: 'Text & content', render: ContentSheet },
  feedback: { title: 'Feedback', render: FeedbackSheet },
  overlays: { title: 'Overlays', render: OverlaysSheet },
  layout: { title: 'App frame & layout', render: LayoutSheet },
};

/**
 * A family's contact sheet (ContactSheetParts.tsx says how its states are shown), in the theme
 * and scale the URL names: `?fixture=contact-sheet&family=actions&theme=dark&scale=system`.
 */
export function ContactSheetFixture() {
  const params = new URLSearchParams(location.search);
  const name = params.get('family') ?? 'actions';
  const theme = params.get('theme') === 'dark' ? 'dark' : 'light';
  const scale = params.get('scale') === 'system' ? 'system' : 'comfortable';
  const chosen = contactSheetFamilies[name];
  return (
    <Theme theme={theme} scale={scale} className="cs-root" data-cs-family={name}>
      <header className="cs-title">
        <h1>{chosen?.title ?? `No family named ${name}`}</h1>
        <span>
          {theme} theme ·{' '}
          {scale === 'system' ? 'system scale (compact under a fine pointer)' : 'comfortable scale'}
        </span>
      </header>
      {chosen && <chosen.render />}
    </Theme>
  );
}
