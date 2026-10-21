import { Button, Row } from '@envsemble/envui';

// A Row with a prop only the layout primitive takes is 1.0 code, also without Column.
export const Actions = () => (
  <Row wrap gap={2}>
    <Button>Save</Button>
  </Row>
);
