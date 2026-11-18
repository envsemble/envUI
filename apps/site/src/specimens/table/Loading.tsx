import { placeholders, Table } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

interface File {
  id: string;
  name: string;
  owner: string;
  modified: string;
}

const files: File[] = [
  { id: 'brief', name: 'Project brief.pdf', owner: 'Alex Morgan', modified: 'Mar 2, 2026' },
  { id: 'budget', name: 'Budget 2026.xlsx', owner: 'Priya Shah', modified: 'Feb 18, 2026' },
  { id: 'notes', name: 'Interview notes.docx', owner: 'Sam Lee', modified: 'Jan 27, 2026' },
];

function Arriving() {
  const step = useTimeline([1560, 2040]);
  const loading = step === 0;
  return (
    <div style={{ inlineSize: '26rem', maxInlineSize: '100%' }}>
      <Table.Root aria-label="Files" skeleton={loading} style={{ inlineSize: '100%' }}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell>Modified</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {(loading ? placeholders<File>(files.length) : files).map((file) => (
            <Table.Row key={file.id}>
              <Table.Cell nowrap>{file.name}</Table.Cell>
              <Table.Cell nowrap>{file.owner}</Table.Cell>
              <Table.Cell nowrap>{file.modified}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}

export default function Loading() {
  return (
    <SpecimenFrame size="content">
      <MotionStage label="the rows arriving in the skeleton's place">
        <Arriving />
      </MotionStage>
    </SpecimenFrame>
  );
}
