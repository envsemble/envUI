import { Tree, type TreeItem } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolderOpen } from '@envsemble/envui/icons/FolderOpen';

const query = 'road';

function matched(name: string) {
  const at = name.toLowerCase().indexOf(query);
  if (at === -1) return name;
  return (
    <>
      {name.slice(0, at)}
      <strong>{name.slice(at, at + query.length)}</strong>
      {name.slice(at + query.length)}
    </>
  );
}

const rows: TreeItem[] = [
  { value: 'eng', depth: 0, name: 'Engineering', folder: true },
  { value: 'eng/roadmap.md', depth: 1, name: 'Roadmap.md' },
  { value: 'eng/broadcast.md', depth: 1, name: 'Broadcast notes.md' },
].map(({ name, folder, ...row }) => ({
  ...row,
  label: matched(name),
  start: folder ? <IconFolderOpen /> : <IconDescription />,
  expandable: folder,
  expanded: folder,
}));

export default function MatchedLetters() {
  return (
    <div style={{ blockSize: '7rem' }}>
      <Tree aria-label="Files" items={rows} onAction={() => {}} onExpandedChange={() => {}} />
    </div>
  );
}
