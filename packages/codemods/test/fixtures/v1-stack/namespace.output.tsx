import * as ui from '@envsemble/envui';

function Local({ Stack }) {
  return <Stack direction="row" />;
}

export const Actions = () => (
  <ui.Row gap={2}>
    <Local Stack="div" />
  </ui.Row>
);
