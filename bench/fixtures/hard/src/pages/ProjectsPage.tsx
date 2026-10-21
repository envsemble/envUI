import { useState } from 'react';
import { Button, Modal, Stack, StatusPill, Text, Toolbar } from '../components';
import { projects } from '../data/projects';

const shareLink = 'https://example.com/workspace/projects';

export function ProjectsPage() {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const closeShare = () => {
    setSharing(false);
    setCopied(false);
  };
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
  };

  return (
    <Stack gap={5}>
      <Text render={<h1 />} variant="headline">
        Projects
      </Text>
      <Toolbar
        actions={[
          { id: 'refresh', label: 'Refresh', onClick: () => console.log('refresh') },
          { id: 'share', label: 'Share', primary: true, onClick: () => setSharing(true) },
        ]}
      >
        <Text emphasis="muted">{projects.length} projects</Text>
      </Toolbar>
      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.id} className="project-row">
            <Stack gap={1}>
              <span className="project-name">{project.name}</span>
              <span className="project-meta">{project.owner}</span>
            </Stack>
            <StatusPill status={project.status} />
          </li>
        ))}
      </ul>
      <Modal
        open={sharing}
        title="Share projects"
        onClose={closeShare}
        footer={
          <>
            <Button onClick={closeShare}>Close</Button>
            <Button variant="primary" onClick={copyLink}>
              {copied ? 'Copied' : 'Copy link'}
            </Button>
          </>
        }
      >
        <label className="field">
          <span className="field-label">Link</span>
          <input className="text-input" value={shareLink} readOnly />
        </label>
      </Modal>
    </Stack>
  );
}
