export const setupCode = `import { Theme, Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import '@envsemble/envui/styles.css';

export function App() {
  return <Theme theme="light">
    <Button startIcon={<Add />}>Create item</Button>
  </Theme>;
}`;

export const registryCode = `# Project .npmrc
@envsemble:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}`;

export const installCode = `npm install @envsemble/envui react@^19 react-dom@^19`;
