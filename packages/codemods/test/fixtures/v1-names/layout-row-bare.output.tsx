import { Button, Row } from '@envsemble/envui';

// A Row rendered only without a title, which 0.x's list row required, and without a spread that
// could carry one, is 1.0's layout primitive, also without layout props or Column.
export const Actions = () => (
  <Row>
    <Button>Save</Button>
    <Row align="center">
      <Button>Cancel</Button>
    </Row>
  </Row>
);
