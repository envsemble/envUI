/*
 * The reply the conversation's do and don't wait for, on one timeline: a beat with the question
 * alone, the reply a word at a time as it is written, and a while to read it.
 */
const reply =
  'Priya Shah. She expects the photos from the studio on Thursday and sends the kit on Friday.';

export const replyWords = reply.split(' ');

export const replySteps = [1100, ...replyWords.map(() => 140), 2600];

/** The clock the do and the don't share, so they play side by side in step. */
export const replyClock = 'conversation-reply';
