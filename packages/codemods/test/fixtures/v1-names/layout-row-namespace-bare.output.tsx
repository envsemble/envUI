import * as ui from '@envsemble/envui';

// Through a namespace import too, a Row rendered only without 0.x's list row props is 1.0 code.
export const Actions = () => (
  <ui.Row>
    <ui.Button>Save</ui.Button>
  </ui.Row>
);
