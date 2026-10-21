import { Row } from '@envsemble/envui';
import { Table } from './table';

export const Header = () => (
  <Row gap={3}>
    <Row gap={1}>
      <Table.Row />
    </Row>
  </Row>
);
