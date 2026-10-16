import { Text } from '@envsemble/envui';
import { ProjectsPage } from './pages/ProjectsPage';

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Text as="strong">Workspace</Text>
      </header>
      <main className="app-main">
        <ProjectsPage />
      </main>
    </div>
  );
}
