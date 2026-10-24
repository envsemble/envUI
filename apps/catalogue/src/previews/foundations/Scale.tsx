import { useState, type ReactNode } from 'react';
import {
  Button,
  IconButton,
  SegmentedControl,
  Select,
  Column,
  Table,
  TextField,
  Theme,
  useTheme,
  type ControlSize,
  type ThemeScale,
} from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Example, Specimen, SpecimenGrid } from '../Example';

const sizes: readonly ControlSize[] = ['sm', 'md', 'lg'];
const scales: readonly ThemeScale[] = ['comfortable', 'compact'];
const plans = [
  { value: 'starter', label: 'Starter' },
  { value: 'team', label: 'Team' },
];
const reports = [
  { name: 'Quarterly report', owner: 'Priya Shah' },
  { name: 'Accessibility audit', owner: 'Sam Lee' },
];

/** A row of every kind of control at one size: they line up. */
function SizeRow({ size }: { size: ControlSize }) {
  const [view, setView] = useState('list');
  return (
    <div className="docs-scale-row" data-size={size}>
      <TextField size={size} label="Title" defaultValue="Quarterly report" />
      <Select size={size} aria-label="Plan" items={plans} defaultValue="team" />
      <SegmentedControl
        size={size}
        aria-label="View"
        value={view}
        onValueChange={setView}
        items={[
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board' },
        ]}
      />
      <IconButton size={size} variant="secondary" icon={<Edit />} aria-label="Edit" />
      <Button size={size}>Save</Button>
    </div>
  );
}

/** The theme of the figure around, at another scale: the examples' theme, read inside the stage. */
function AtScale({ scale, children }: { scale: ThemeScale; children: ReactNode }) {
  const theme = useTheme();
  return (
    <Theme {...theme} scale={scale}>
      {children}
    </Theme>
  );
}

export function ScalePreview() {
  return (
    <>
      <Example
        title="Control sizes in each scale"
        size="wide"
        caption="Every control of one size has the same height in a scale: sm, md and lg are 32, 40 and 48 px in the comfortable scale and 26, 32 and 38 px in the compact one."
      >
        <SpecimenGrid size="wide">
          {scales.map((scale) => (
            <Specimen key={scale} title={scale === 'compact' ? 'Compact' : 'Comfortable'}>
              <AtScale scale={scale}>
                <Column gap={3}>
                  {sizes.map((size) => (
                    <SizeRow key={size} size={size} />
                  ))}
                </Column>
              </AtScale>
            </Specimen>
          ))}
        </SpecimenGrid>
      </Example>
      <Example
        title="Row density"
        size="wide"
        caption="Density changes only the rows' padding; the text and the small actions in the cells stay the same."
      >
        <SpecimenGrid size="wide">
          {(['sm', 'md'] as const).map((density) => (
            <Specimen key={density} title={`density="${density}"`}>
              <Table.Root aria-label={`Reports, ${density} rows`} density={density}>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>Report</Table.HeaderCell>
                    <Table.HeaderCell>Owner</Table.HeaderCell>
                    <Table.HeaderCell align="end">Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {reports.map((report) => (
                    <Table.Row key={report.name}>
                      <Table.Cell>{report.name}</Table.Cell>
                      <Table.Cell>{report.owner}</Table.Cell>
                      <Table.Cell align="end">
                        <IconButton
                          variant="ghost"
                          icon={<MoreVert />}
                          aria-label={`More for ${report.name}`}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Specimen>
          ))}
        </SpecimenGrid>
      </Example>
    </>
  );
}
