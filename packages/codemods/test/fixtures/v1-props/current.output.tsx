import { CopyButton, Pagination, SegmentedControl, Table, Tabs, Tree } from '@envsemble/envui';

export function Current({ items, options, onPageChange }) {
  return (
    <>
      <Table.Root aria-label="Reports" density="sm" />
      <Tree aria-label="Files" items={items} density="md" />
      <Tabs aria-label="Views" size="lg" items={[]} />
      <SegmentedControl aria-label="View" size="sm" options={options} />
      <Pagination page={1} pageSize={10} onPageChange={onPageChange} size="md" />
      <CopyButton value="text" size="lg" aria-label="Copy" />
    </>
  );
}
