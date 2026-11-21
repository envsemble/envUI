import { Avatar, Select } from '@envsemble/envui';

const people = [
  {
    label: 'Website refresh',
    items: [
      { value: 'alex', label: 'Alex Morgan', start: <Avatar name="Alex Morgan" size="sm" /> },
      { value: 'priya', label: 'Priya Shah', start: <Avatar name="Priya Shah" size="sm" /> },
    ],
  },
  {
    label: 'Northwind',
    items: [
      { value: 'sam', label: 'Sam Lee', start: <Avatar name="Sam Lee" size="sm" /> },
      { value: 'chen', label: 'Chen Wei', start: <Avatar name="Chen Wei" size="sm" /> },
    ],
  },
];

export default function Assignee() {
  return (
    <Select
      label="Assignee"
      items={people}
      defaultValue="priya"
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
