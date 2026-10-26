import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { Draw } from '@envsemble/envui/icons/Draw';
import { PanTool } from '@envsemble/envui/icons/PanTool';
import { Rectangle } from '@envsemble/envui/icons/Rectangle';
import { TextFields } from '@envsemble/envui/icons/TextFields';

const tools = [
  { id: 'pan', label: 'Pan', icon: <PanTool />, shortcut: 'H' },
  { id: 'draw', label: 'Draw', icon: <Draw />, shortcut: 'P' },
  { id: 'shape', label: 'Rectangle', icon: <Rectangle />, shortcut: 'R' },
  { id: 'text', label: 'Text', icon: <TextFields />, shortcut: 'T' },
];

export default function DrawingTools() {
  const [tool, setTool] = useState('pan');
  return (
    <Toolbar.Root aria-label="Drawing tools" orientation="vertical">
      {tools.map((each) => (
        <Toolbar.Button
          key={each.id}
          icon={each.icon}
          label={each.label}
          shortcut={each.shortcut}
          pressed={tool === each.id}
          onClick={() => setTool(each.id)}
        />
      ))}
    </Toolbar.Root>
  );
}
