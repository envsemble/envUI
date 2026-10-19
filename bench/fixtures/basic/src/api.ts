import { projects, type Project } from './data/projects';

/** Mocked backend calls with network-like latency. Replace with real requests later. */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface WorkspaceSettings {
  name: string;
  description: string;
  timeZone: string;
  emailNotifications: boolean;
}

export async function fetchProjects(): Promise<Project[]> {
  await delay(1200);
  if (Math.random() < 0.2) throw new Error('Could not load projects.');
  return projects;
}

export async function saveSettings(settings: WorkspaceSettings): Promise<WorkspaceSettings> {
  await delay(600);
  return settings;
}

export async function renameProject(id: string, name: string): Promise<Project> {
  await delay(600);
  const project = projects.find((candidate) => candidate.id === id);
  if (!project) throw new Error(`Project ${id} was not found.`);
  if (Math.random() < 0.2) throw new Error('Could not save the project.');
  return { ...project, name, updatedAt: new Date().toISOString() };
}

export async function deleteProject(id: string): Promise<void> {
  await delay(500);
  if (!projects.some((project) => project.id === id))
    throw new Error(`Project ${id} was not found.`);
}

export async function uploadFiles(files: File[]): Promise<{ uploaded: number }> {
  await delay(800 + files.length * 200);
  return { uploaded: files.length };
}

export interface MilestoneInput {
  projectId: string;
  title: string;
  /** Due date as YYYY-MM-DD. */
  dueDate: string;
  description?: string;
}

export async function createMilestone(
  input: MilestoneInput,
): Promise<MilestoneInput & { id: string }> {
  await delay(500);
  return { ...input, id: `ms-${Date.now()}` };
}
