// The cascade-layer test's fixture: envUI's style sheet, then an application's own CSS outside
// cascade layers (CascadeLayers.css), which must win over every rule of envUI's without !important.
import { Button, Checkbox, Link, Text } from '@envsemble/envui';
import '@envsemble/envui/styles.css';
import './CascadeLayers.css';

export const mount = 'standalone';

export default function CascadeLayersFixture() {
  return (
    <>
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
    </>
  );
}
