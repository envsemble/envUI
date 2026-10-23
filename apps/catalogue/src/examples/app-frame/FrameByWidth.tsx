import { useState } from 'react';
import {
  Bar,
  Drawer,
  IconButton,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  Tooltip,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Search } from '@envsemble/envui/icons/Search';

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
      topBar={
        <TopBar
          title="Northwind"
          actions={
            <Tooltip content="Search" side="bottom">
              <IconButton variant="ghost" icon={<Search />} aria-label="Search" />
            </Tooltip>
          }
        />
      }
      navigation={{
        bar: <Bar aria-label="Main, by width" destinations={destinations} />,
        rail: <Rail aria-label="Main, by width" destinations={destinations} />,
        drawer: <Drawer aria-label="Main, by width" destinations={destinations} />,
      }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />} />
    </Scaffold>
  );
}
