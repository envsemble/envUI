import { Input, SearchField as Search, DateTimeField } from '@envsemble/envui';
import * as ui from '@envsemble/envui';

export function Fields({ props }) {
  return (
    <>
      <Input label="Name" showLabel={false} />
      <Input label="Name" showLabel />
      <Input {...props} label="Name" variant="floating" />
      <Search label="Search" />
      <DateTimeField label="Due" size="sm" showLabel={false} />
      <ui.Combobox label="Owner" items={[]} variant="floating" />
      <ui.FileDropzone label="Files" size="sm" onFilesAccepted={() => {}} />
    </>
  );
}

function Local() {
  const Input = (props) => <input {...props} />;
  return <Input compact />;
}
