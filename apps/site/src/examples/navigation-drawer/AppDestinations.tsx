import { useState } from 'react';
import {
  List,
  NavigationDrawer,
  Page,
  PageHeader,
  Scaffold,
  Text,
  type Destination,
} from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconGroup } from '@envsemble/envui/icons/Group';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconLabel } from '@envsemble/envui/icons/Label';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconStar } from '@envsemble/envui/icons/Star';

/** The inbox's messages, which its page lists. */
const messages = [
  { label: 'Priya Shah', description: 'Launch plan for the spring release' },
  { label: 'Sam Lee', description: 'Re: Quarterly report figures' },
  { label: 'Jordan Kim', description: 'Invitation: Mobile release review' },
  { label: 'Alex Morgan', description: 'Onboarding guide, second draft' },
];

export default function AppDestinations() {
  // The router knows the current page; here a press stands in for it.
  const [current, setCurrent] = useState('/inbox');
  const destination = (href: string) => ({
    href,
    current: current === href,
    onClick: () => setCurrent(href),
  });
  const destinations: Destination[] = [
    { label: 'Home', icon: <IconHome />, ...destination('/home') },
    { label: 'Inbox', icon: <IconInbox />, count: 12, ...destination('/inbox') },
    { label: 'Starred', icon: <IconStar />, group: 'Folders', ...destination('/starred') },
    { label: 'Labels', icon: <IconLabel />, group: 'Folders', count: 3, ...destination('/labels') },
    { label: 'Archive', icon: <IconArchive />, group: 'Folders', ...destination('/archive') },
    { label: 'Members', icon: <IconGroup />, group: 'Workspace', ...destination('/members') },
    { label: 'Settings', icon: <IconSettings />, group: 'Workspace', ...destination('/settings') },
  ];
  const title = destinations.find((item) => item.current)?.label ?? 'Inbox';
  return (
    // The drawer is the Scaffold's navigation, beside the page of the destination it marks.
    <Scaffold
      scroll="body"
      landmarks={false}
      navigation={{
        drawer: (
          <NavigationDrawer
            destinations={destinations}
            header={
              <Text variant="title" render={<span />}>
                Mail
              </Text>
            }
          />
        ),
      }}
    >
      <Page header={<PageHeader title={title} headingLevel={3} />}>
        {current === '/inbox' ? (
          <List.Root aria-label="Messages">
            {messages.map((message) => (
              <List.Item
                key={message.label}
                label={message.label}
                description={message.description}
              />
            ))}
          </List.Root>
        ) : (
          <Text emphasis="muted">Nothing new since yesterday.</Text>
        )}
      </Page>
    </Scaffold>
  );
}
