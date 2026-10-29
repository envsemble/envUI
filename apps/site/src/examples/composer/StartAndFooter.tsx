import { useState } from 'react';
import { Composer, IconButton } from '@envsemble/envui';
import { IconAttachFile } from '@envsemble/envui/icons/AttachFile';

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
          <IconButton variant="text" icon={<IconAttachFile />} aria-label="Attach files" />
          <span>Design review</span>
        </>
      }
      description={
        comments === 0
          ? 'Files up to 10 MB.'
          : `${comments} ${comments === 1 ? 'comment' : 'comments'} added.`
      }
      onSend={() => setComments((count) => count + 1)}
      style={{ inlineSize: 'min(100%, 32rem)' }}
    />
  );
}
