import { ThemePreferenceProvider, ToastProvider } from '@envsemble/envui';
import { ProjectsScreen } from './AppScreenProjects.fixture.js';
import { AgentScreen } from './AppScreenAgent.fixture.js';

export const mount = 'root';

export default function AppScreenFixture() {
  const query = new URLSearchParams(location.search);
  const theme = query.get('theme') === 'dark' ? 'dark' : 'light';
  const requested = query.get('scale');
  const scale = requested === 'compact' || requested === 'comfortable' ? requested : 'system';
  const overlay = query.get('overlay');
  return (
    <ThemePreferenceProvider theme={{ scale: scale }} defaultPreference={theme}>
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
