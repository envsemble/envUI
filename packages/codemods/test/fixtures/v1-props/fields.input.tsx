import { Input, SearchField as Search, DateTimeField } from '@envsemble/envui';
import * as ui from '@envsemble/envui';

export function Fields({ props }) {
  return (
    <>
      <Input label="Name" compact />
      <Input label="Name" compact showLabel />
      <Input {...props} label="Name" compact={false} />
      <Search label="Search" compact={true} />
      <DateTimeField label="Due" density="compact" />
      <ui.Combobox label="Owner" items={[]} density={'standard'} />
      <ui.FileDropzone label="Files" compact onFiles={() => {}} />
    </>
  );
}

function Local() {
  const Input = (props) => <input {...props} />;
  return <Input compact />;
}
