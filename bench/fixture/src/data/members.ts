export type MemberRole = 'owner' | 'editor' | 'viewer';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
}

export const members: Member[] = [
  { id: 'm-1', name: 'Ada Park', email: 'ada.park@example.com', role: 'owner' },
  { id: 'm-2', name: 'Sam Rivera', email: 'sam.rivera@example.com', role: 'editor' },
  { id: 'm-3', name: 'Noor Hassan', email: 'noor.hassan@example.com', role: 'editor' },
  { id: 'm-4', name: 'Lee Chen', email: 'lee.chen@example.com', role: 'viewer' },
  { id: 'm-5', name: 'Mia Novak', email: 'mia.novak@example.com', role: 'viewer' },
];

/** The signed-in person. */
export const currentUser: Member = members[0];
