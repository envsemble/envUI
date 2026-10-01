import { layoutReferences } from './Layout';
import { actionsReferences } from './Actions';
import { formsReferences } from './Forms';
import { navigationReferences } from './Navigation';
import { contentReferences } from './Content';
import { feedbackReferences } from './Feedback';

/** The topic order within each family is its documented reading order. */
export const references = [
  ...layoutReferences,
  ...actionsReferences,
  ...formsReferences,
  ...navigationReferences,
  ...contentReferences,
  ...feedbackReferences,
];
