import { SearchField } from '@envsemble/envui';

export default function SearchMembers() {
  return (
    <SearchField
      label="Search members"
      placeholder="Search by name or e-mail"
      defaultValue="Priya"
      style={{ inlineSize: 'min(100%, 20rem)' }}
    />
  );
}
