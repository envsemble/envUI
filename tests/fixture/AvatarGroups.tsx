import { useState } from 'react';
import {
  AvatarGroup,
  IconButton,
  LinkProvider,
  Surface,
  Theme,
  type LinkComponentProps,
  type ThemeValue,
} from '@envsemble/envui';
import { Settings } from '@envsemble/envui/icons/Settings';

const people = [
  { id: 'alex', name: 'Alex Morgan' },
  { id: 'sam', name: 'Sam Lee' },
  { id: 'priya', name: 'Priya Shah' },
  { id: 'jordan', name: 'Jordan Rivera' },
  { id: 'taylor', name: 'Taylor Kim' },
];

function RecordingLink({ href, onClick, ...props }: LinkComponentProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
        document.body.dataset.avatarNavigatedTo = href;
      }}
    />
  );
}

export function AvatarGroupsFixture({ theme }: { theme: ThemeValue }) {
  const [pressed, setPressed] = useState('');
  return (
    <Theme theme={theme} data-testid={`avatar-groups-${theme}`} className="fixture-section">
      <AvatarGroup data-testid="decorative" people={people} max={3} />
      <AvatarGroup
        data-testid="preview"
        people={people.slice(0, 3)}
        total={12}
        max={2}
        size="small"
      />
      <AvatarGroup data-testid="named" aria-label="Report editors" people={people.slice(0, 2)} />
      <AvatarGroup
        data-testid="localized"
        people={people.slice(0, 1)}
        total={4}
        formatMore={(count) => `${count} weitere`}
      />
      <AvatarGroup data-testid="empty" people={[]} />
      <AvatarGroup
        data-testid="unknown-counts"
        people={people.slice(0, 2)}
        total={Number.NaN}
        max={Number.NaN}
      />
      <AvatarGroup
        data-testid="german"
        people={people}
        max={2}
        formatMore={(count) => `${count} weitere`}
        formatLabel={(count, names) =>
          `${count} ${count === 1 ? 'Person' : 'Personen'}: ${names.join(', ')}`
        }
      />
      <AvatarGroup
        data-testid="pressable"
        aria-label={`Pressable people ${theme}`}
        people={people}
        max={4}
        onPersonClick={(person) => setPressed(person.name)}
      />
      <AvatarGroup
        data-testid="small-pressable"
        people={people}
        max={3}
        size="small"
        onPersonClick={(person) => setPressed(person.name)}
      />
      <output data-testid="pressed">{pressed}</output>
      <LinkProvider component={RecordingLink}>
        <AvatarGroup
          data-testid="linked"
          people={people.slice(0, 2).map((person) => ({ ...person, href: `/people/${person.id}` }))}
        />
      </LinkProvider>
      {(['pane', 'row'] as const).map((tone) => (
        <Surface key={tone} tone={tone} padding={4} data-surface={tone}>
          <AvatarGroup data-testid={`on-${tone}`} people={people} max={3} />
        </Surface>
      ))}
      <div className="fixture-avatar-surface" data-surface="custom">
        <AvatarGroup data-testid="on-custom" people={people} max={3} />
      </div>
      {/* A compact toolbar: 2 rem controls beside a standard and a small group. */}
      <Surface
        tone="row"
        padding={2}
        corners="standard"
        density="compact"
        className="fixture-toolbar"
        data-testid="toolbar"
      >
        <span className="fixture-shrink-label">Quarterly report</span>
        <AvatarGroup
          data-testid="toolbar-group"
          people={people}
          max={2}
          onPersonClick={() => undefined}
        />
        <AvatarGroup data-testid="toolbar-small" people={people} max={2} size="small" />
        <IconButton icon={<Settings />} aria-label="Report settings" />
      </Surface>
      <div className="fixture-shrink-row" data-testid="narrow">
        <span className="fixture-shrink-label">A long title that needs more room</span>
        <AvatarGroup data-testid="narrow-group" people={people} max={3} />
      </div>
      <div dir="rtl">
        <AvatarGroup data-testid="rtl" people={people} max={3} />
      </div>
    </Theme>
  );
}
