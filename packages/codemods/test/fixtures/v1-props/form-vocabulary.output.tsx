import {
  Combobox,
  DatePicker,
  DropZone,
  RadioGroup,
  Radio,
  SearchField,
  Select,
  Slider,
  TextField,
  Textarea,
} from '@envsemble/envui';

export function FormVocabulary({ look, items }) {
  return (
    <>
      <TextField label="Name" description="As on your ID" variant="outline" />
      <TextField label="Note" />
      <TextField label="Filter" variant={look} />
      <SearchField label="Search" variant="ghost" description="Names and e-mail" />
      <Textarea label="Bio" variant="ghost" description={<span>Short</span>} />
      <Select label="Role" items={items} variant="outline" description="Who can edit" />
      <Combobox label="Owner" items={items} variant="outline" description="One person" />
      <DatePicker label="Due" granularity="minute" variant="floating" description="Local time" />
      <DatePicker label="Start" />
      <RadioGroup label="Visibility" orientation="vertical">
        <Radio value="private" label="Private" description="Only you" />
      </RadioGroup>
      <RadioGroup label="Plan" orientation="horizontal" />
      <Slider label="Volume" description="Of alerts" onValueCommitted={() => {}} />
      <DropZone label="Files" onDropAccepted={() => {}} onDropRejected={() => {}} />
    </>
  );
}
