import { ThemePreferenceProvider, ToastProvider } from '@envsemble/envui';
import { ProjectsScreen } from './AppScreenProjects.fixture.js';
import { AgentScreen } from './AppScreenAgent.fixture.js';

export const mount = 'root';

/**
 * Two product screens built only from envUI's public components, for reviewing how the library
 * holds up in an application rather than for a spec: mounted with
 * ?fixture=app-screen&screen=projects|agent, &theme=light|dark (light by default) and &scale=
 * compact|comfortable|system (system by default). The agent screen takes &overlay=dialog|palette|
 * none, the settings dialog by default.
 */
export default function AppScreenFixture() {
  const query = new URLSearchParams(location.search);
  const theme = query.get('theme') === 'dark' ? 'dark' : 'light';
  const requested = query.get('scale');
  const scale = requested === 'compact' || requested === 'comfortable' ? requested : 'system';
  const overlay = query.get('overlay');
  return (
    // An application themes the document root through its provider, so the page background and
    // the portals follow; the fixture's own key keeps a stored choice out of the other fixtures.
    <ThemePreferenceProvider
      storageKey="fixture-app-screen"
      defaultPreference={theme}
      scale={scale}
    >
      <ToastProvider>
        {query.get('screen') === 'agent' ? (
          <AgentScreen overlay={overlay === 'palette' || overlay === 'none' ? overlay : 'dialog'} />
        ) : (
          <ProjectsScreen />
        )}
      </ToastProvider>
    </ThemePreferenceProvider>
  );
}
