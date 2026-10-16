export type ProjectStatus = 'active' | 'paused' | 'archived';

export interface Project {
  id: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  /** ISO 8601 date and time of the last change. */
  updatedAt: string;
  openTasks: number;
}

export const projects: Project[] = [
  {
    id: 'p-101',
    name: 'Quarterly report',
    owner: 'Ada Park',
    status: 'active',
    updatedAt: '2026-10-14T09:12:00Z',
    openTasks: 12,
  },
  {
    id: 'p-102',
    name: 'Website refresh',
    owner: 'Sam Rivera',
    status: 'active',
    updatedAt: '2026-10-13T16:40:00Z',
    openTasks: 7,
  },
  {
    id: 'p-103',
    name: 'Onboarding guide',
    owner: 'Noor Hassan',
    status: 'paused',
    updatedAt: '2026-09-29T11:05:00Z',
    openTasks: 3,
  },
  {
    id: 'p-104',
    name: 'Data migration',
    owner: 'Lee Chen',
    status: 'active',
    updatedAt: '2026-10-15T08:30:00Z',
    openTasks: 21,
  },
  {
    id: 'p-105',
    name: 'Mobile release',
    owner: 'Mia Novak',
    status: 'archived',
    updatedAt: '2026-06-02T14:00:00Z',
    openTasks: 0,
  },
  {
    id: 'p-106',
    name: 'Support handbook',
    owner: 'Ada Park',
    status: 'paused',
    updatedAt: '2026-08-21T10:20:00Z',
    openTasks: 5,
  },
  {
    id: 'p-107',
    name: 'Pricing research',
    owner: 'Sam Rivera',
    status: 'active',
    updatedAt: '2026-10-09T13:15:00Z',
    openTasks: 9,
  },
  {
    id: 'p-108',
    name: 'Office move',
    owner: 'Lee Chen',
    status: 'archived',
    updatedAt: '2026-03-18T09:45:00Z',
    openTasks: 0,
  },
];
