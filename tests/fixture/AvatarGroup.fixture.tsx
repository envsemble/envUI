import { useState } from 'react';
import {
  AvatarButton,
  AvatarGroup,
  IconButton,
  type LinkComponentProps,
  LinkProvider,
  List,
  Surface,
  Theme,
  type ColorScheme,
} from '@envsemble/envui';
import { IconSettings } from '@envsemble/envui/icons/Settings';

export const themes = true;

/** Person pictures, which pile closer and turn as cards do; initials, below, rest looser. */
const people = [
  { id: 'alex', name: 'Alex Morgan', fallback: 'person' as const },
  { id: 'sam', name: 'Sam Lee', fallback: 'person' as const },
  { id: 'priya', name: 'Priya Shah', fallback: 'person' as const },
  { id: 'jordan', name: 'Jordan Rivera', fallback: 'person' as const },
  { id: 'taylor', name: 'Taylor Kim', fallback: 'person' as const },
];
/** The same people with the first chosen, whose ring's gap takes the color of the surface below. */
const chosen = people.map((person, index) => ({ ...person, selected: index === 0 }));
/** Initials, which a group must leave readable, such as the wide M of AM. */
const initials = [
  { id: 'alex', name: 'Alex Morgan' },
  { id: 'sam', name: 'Sam Lee' },
  { id: 'priya', name: 'Priya Shah' },
  { id: 'jordan', name: 'Jordan Kim' },
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

export default function AvatarGroupFixture({ theme }: { theme: ColorScheme }) {
  const [pressed, setPressed] = useState('');
  return (
    <Theme theme={theme} data-testid={`avatar-groups-${theme}`} className="fixture-section">
      <AvatarGroup data-testid="decorative" people={people} max={3} />
      <AvatarGroup data-testid="preview" people={people.slice(0, 3)} total={12} max={2} size="sm" />
      <AvatarGroup data-testid="initials" people={initials} max={4} />
      <AvatarGroup data-testid="initials-small" people={initials} max={4} size="sm" />
      <AvatarGroup data-testid="named" aria-label="Report editors" people={people.slice(0, 2)} />
      <AvatarGroup
        data-testid="localized"
        people={people.slice(0, 1)}
        total={4}
        formatMore={(count) => `${count} weitere`}
      />
      <AvatarGroup data-testid="empty" people={[]} />
      {/* A chosen avatar, whose check must stay over the next one, and a large count chip. */}
      <AvatarGroup
        data-testid="selected-xl"
        size="xl"
        people={initials.map((person, index) => ({ ...person, selected: index === 0 }))}
        total={240}
        max={3}
      />
      <AvatarButton data-testid="avatar-button-small" name="Alex Morgan" size="sm" />
      <AvatarGroup
        data-testid="unknown-counts"
        people={people.slice(0, 2)}
        total={Number.NaN}
        max={Number.NaN}
      />
      {/* Numbers no group can show, as from data an application did not check. */}
      <AvatarGroup
        data-testid="endless-counts"
        people={people.slice(0, 2)}
        total={Number.POSITIVE_INFINITY}
        max={null as unknown as number}
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
        size="sm"
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
        <Surface
          key={tone}
          background={tone === 'row' ? 'muted' : 'default'}
          padding={4}
          data-surface={tone}
        >
          <AvatarGroup data-testid={`on-${tone}`} people={chosen} max={3} />
        </Surface>
      ))}
      <div className="fixture-avatar-surface" data-surface="custom">
        <AvatarGroup data-testid="on-custom" people={chosen} max={3} />
      </div>
      {/* A small toolbar: 2 rem controls beside a standard and a small group. */}
      <Surface
        background="muted"
        padding={2}
        radius="sm"
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
        <AvatarGroup data-testid="toolbar-small" people={people} max={2} size="sm" />
        <IconButton size="sm" icon={<IconSettings />} aria-label="Report settings" />
      </Surface>
      <div className="fixture-shrink-row" data-testid="narrow">
        <span className="fixture-shrink-label">A long title that needs more room</span>
        <AvatarGroup data-testid="narrow-group" people={people} max={3} />
      </div>
      <div dir="rtl">
        <AvatarGroup data-testid="rtl" people={people} max={3} />
      </div>
      {/* A group at the end of a narrow list row, which wraps the action under the label when it
          doesn't fit beside it. */}
      <div className="fixture-avatar-row">
        <List.Root aria-label={`Projects ${theme}`}>
          <List.Item
            label="Northwind launch"
            description="4 members"
            end={<AvatarGroup data-testid="in-row" people={people} max={3} align="end" />}
          />
        </List.Root>
      </div>
    </Theme>
  );
}
