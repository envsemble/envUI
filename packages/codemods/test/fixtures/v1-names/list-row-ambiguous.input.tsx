import * as ui from '@envsemble/envui';
import { Row } from '@envsemble/envui';

// A Row with a title, or with a spread that may carry one, is 0.x's list row, and so is a Row
// without props beside it, through the same import.
export const Members = ({ owner }: { owner: { title: string } }) => (
  <ui.GroupedRows>
    <Row {...owner} />
    <ui.Row title="Members" />
    <ui.Row />
  </ui.GroupedRows>
);
