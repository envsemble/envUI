import { useState } from 'react';
import { NavigationRail, type Destination } from '@envsemble/envui';
import { IconAccountTree } from '@envsemble/envui/icons/AccountTree';
import { IconExtension } from '@envsemble/envui/icons/Extension';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconSearch } from '@envsemble/envui/icons/Search';

export default function ActivityBar() {
  const [current, setCurrent] = useState('explorer');
  const destination = (id: string) => ({
    id,
    current: current === id,
    onClick: () => setCurrent(id),
  });
  const destinations: Destination[] = [
    { label: 'Explorer', icon: <IconFolder />, ...destination('explorer') },
    { label: 'Search', icon: <IconSearch />, ...destination('search') },
    { label: 'Source control', icon: <IconAccountTree />, count: 3, ...destination('changes') },
    { label: 'Extensions', icon: <IconExtension />, count: true, ...destination('extensions') },
  ];
  return (
    <div style={{ blockSize: '16rem' }}>
      <NavigationRail aria-label="Activity bar" visibleLabel={false} destinations={destinations} />
    </div>
  );
}
