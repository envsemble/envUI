import * as ui from '@envsemble/envui';
import { List } from '@envsemble/envui';

// A Row with a title, or with a spread that may carry one, is 0.x's list row, and so is a Row
// without props beside it, through the same import.
export const Members = ({ owner }: { owner: { title: string } }) => (
  <ui.List.Root>
    <List.Item {...owner} />
    <ui.List.Item title="Members" />
    <ui.List.Item />
  </ui.List.Root>
);
