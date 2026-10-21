import { useState } from 'react';
import {
  Bar,
  Drawer,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  SearchTrigger,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';

export default function FrameByWidth() {
  const [current, setCurrent] = useState('Projects');
  // One array of destinations, which every navigation form takes.
  const destinations: Destination[] = [
    { label: 'Home', icon: <Home /> },
    { label: 'Projects', icon: <Category /> },
    { label: 'Team', icon: <Group /> },
  ].map((destination) => ({
    ...destination,
    current: destination.label === current,
    onSelect: () => setCurrent(destination.label),
  }));
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '16rem' }}
      topBar={<TopBar title="Northwind" actions={<SearchTrigger iconOnly />} />}
      navigation={{
        bar: <Bar destinations={destinations} />,
        rail: <Rail destinations={destinations} />,
        drawer: <Drawer destinations={destinations} />,
      }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />} />
    </Scaffold>
  );
}
