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
      <TextField label="Name" hint="As on your ID" variant="outlined" />
      <TextField label="Note" variant="plain" />
      <TextField label="Filter" variant={look} />
      <SearchField label="Search" variant="quiet" hint="Names and e-mail" />
      <Textarea label="Bio" variant="quiet" hint={<span>Short</span>} />
      <Select label="Role" options={items} variant="outlined" hint="Who can edit" />
      <Combobox label="Owner" items={items} variant="outlined" hint="One person" />
      <DatePicker label="Due" withTime variant="floating" hint="Local time" />
      <DatePicker label="Start" withTime={false} />
      <RadioGroup label="Visibility" variant="rows">
        <Radio value="private" label="Private" detail="Only you" />
      </RadioGroup>
      <RadioGroup label="Plan" variant="inline" />
      <Slider label="Volume" hint="Of alerts" onValueCommit={() => {}} />
      <DropZone label="Files" onFiles={() => {}} onReject={() => {}} />
    </>
  );
}
