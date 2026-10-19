// The cascade-layer spec's page: envUI's style sheet, then an application's own CSS outside cascade
// layers (layers.css), which must win over every rule of envUI's without !important.
import { createRoot } from 'react-dom/client';
import { Button, Checkbox, Link, Text, Theme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';
import './layers.css';

createRoot(document.getElementById('root')!).render(
  <Theme theme="light">
    <Button variant="primary" className="app-cta" data-testid="override">
      Save
    </Button>
    <Button variant="primary" data-testid="library">
      Save
    </Button>
    <Link href="#" className="app-quiet-link" data-testid="link">
      Details
    </Link>
    <Text data-testid="text">A paragraph.</Text>
    <div className="app-region">
      <Button variant="primary" data-testid="region">
        Save
      </Button>
      <Checkbox label="Remember me" defaultChecked data-testid="checkbox" />
    </div>
  </Theme>,
);
document.body.dataset.stylesReady = '';
