import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { Column, Text, Theme } from '@envsemble/envui';
import NavigationForms from '../examples/scaffold/NavigationForms';
import ListAndDetail from '../examples/panes/ListAndDetail';
import AppFrame from '../examples/app-frame/AppFrame';
import { OnDevice } from './DeviceFrame';
import type { DeviceKind } from '../shared/DocumentationTypes';
import { DisplaySettingsProvider } from '../theme/DisplaySettings';
import { PaletteCustomizationProvider } from '../theme/PaletteCustomization';
import '../styles/index.css';
import '../styles/DeviceFrameBoard.css';

/*
 * A demo board of the devices a page's figure is drawn in, not part of the site:
 * /device-frames.html on the development server. Each device frames a real figure, as the pages'
 * figures with `device` on their fence do, in the light theme and the dark one side by side.
 */

const subjects: { name: string; kind: DeviceKind; example: ComponentType }[] = [
  { name: 'Scaffold', kind: 'phone', example: NavigationForms },
  { name: 'Panes', kind: 'phone', example: ListAndDetail },
  { name: 'App frame', kind: 'window', example: AppFrame },
  { name: 'Scaffold', kind: 'window', example: NavigationForms },
];

/** A page's figure on a device: the stage, with the device fitted to it. */
function Figure({ name, kind, example: Example }: (typeof subjects)[number]) {
  return (
    <Column gap={2}>
      <div className="site-live-example" data-device={kind}>
        <OnDevice kind={kind} label={`${name} on a ${kind}`}>
          <Example />
        </OnDevice>
      </div>
      <Text variant="body-sm" emphasis="muted">
        {name} on a {kind}
      </Text>
    </Column>
  );
}

function Board() {
  return (
    <div className="site-board">
      <Column gap={2}>
        <Text render={<h1 />} variant="display">
          Device frames
        </Text>
        <Text emphasis="muted">
          A phone 384 px across and a window 1024 px across, each drawn as one hairline around the
          whole device, around a real figure at its real width, scaled to fit the page&rsquo;s
          figure.
        </Text>
      </Column>
      <div className="site-board-compare">
        {(['light', 'dark'] as const).map((theme) => (
          <Theme key={theme} theme={theme} className="site-board-compare-column">
            <Text variant="title">{theme === 'light' ? 'Light' : 'Dark'}</Text>
            <div className="site-board-phones">
              {subjects
                .filter(({ kind }) => kind === 'phone')
                .map((subject) => (
                  <Figure key={subject.name} {...subject} />
                ))}
            </div>
            {subjects
              .filter(({ kind }) => kind === 'window')
              .map((subject) => (
                <Figure key={subject.name} {...subject} />
              ))}
          </Theme>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <PaletteCustomizationProvider>
    <DisplaySettingsProvider>
      <Board />
    </DisplaySettingsProvider>
  </PaletteCustomizationProvider>,
);
