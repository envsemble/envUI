import { Row, Stack } from '@envsemble/envui';
import { Table } from './table';

export const Header = () => (
  <Stack direction="row" gap={3}>
    <Row gap={1}>
      <Table.Row />
    </Row>
  </Stack>
);
