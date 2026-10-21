import { useState } from 'react';
import { Composer, IconButton } from '@envsemble/envui';
import { AttachFile } from '@envsemble/envui/icons/AttachFile';

export default function StartAndFooter() {
  const [comments, setComments] = useState(0);
  return (
    <Composer
      aria-label="Comment"
      placeholder="Add a comment"
      minRows={2}
      maxRows={6}
      start={
        <>
          <IconButton variant="text" icon={<AttachFile />} aria-label="Attach files" />
          <span>Design review</span>
        </>
      }
      footer={
        comments === 0
          ? 'Files up to 10 MB.'
          : `${comments} ${comments === 1 ? 'comment' : 'comments'} added.`
      }
      onSubmit={() => setComments((count) => count + 1)}
      style={{ inlineSize: 'min(100%, 32rem)' }}
    />
  );
}
