import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { IconDraw } from '@envsemble/envui/icons/Draw';
import { IconPanTool } from '@envsemble/envui/icons/PanTool';
import { IconRectangle } from '@envsemble/envui/icons/Rectangle';
import { IconTextFields } from '@envsemble/envui/icons/TextFields';

const tools = [
  { id: 'pan', label: 'Pan', icon: <IconPanTool />, shortcut: 'H' },
  { id: 'draw', label: 'Draw', icon: <IconDraw />, shortcut: 'P' },
  { id: 'shape', label: 'Rectangle', icon: <IconRectangle />, shortcut: 'R' },
  { id: 'text', label: 'Text', icon: <IconTextFields />, shortcut: 'T' },
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
