import { Button, Column, Row, type RowProps } from '@envsemble/envui';

// 1.0 layout code: Row is the layout primitive beside Column, not 0.x's list row.
export function Actions(props: RowProps) {
  return (
    <Column gap={4}>
      <Row {...props}>
        <Button>Save</Button>
      </Row>
    </Column>
  );
}
