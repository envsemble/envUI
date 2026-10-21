import * as ui from '@envsemble/envui';

// Through a namespace import too, a Row with a prop only the layout primitive takes is 1.0 code,
// as v1-stack writes it, and so is a file that reads ui.Column: neither Row is 0.x's list row.
export const Actions = () => (
  <ui.Row wrap gap={2}>
    <ui.Button>Save</ui.Button>
  </ui.Row>
);

export const Fields = (props: ui.RowProps) => (
  <ui.Column gap={4}>
    <ui.Row {...props} />
  </ui.Column>
);
