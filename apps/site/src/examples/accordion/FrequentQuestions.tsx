import { Accordion } from '@envsemble/envui';

const questions = [
  {
    value: 'sharing',
    question: 'Who can see a shared plan?',
    answer: 'Everyone in the workspace can read it; only its editors can change it.',
  },
  {
    value: 'moving',
    question: 'Can I move a plan to another workspace?',
    answer: 'Yes. Open the plan’s menu, choose Move, and pick a workspace you belong to.',
  },
  {
    value: 'archive',
    question: 'What happens to archived plans?',
    answer: 'They stay readable and searchable, and you can restore them at any time.',
  },
  {
    value: 'export',
    question: 'Can I export a plan?',
    answer: 'Export it as Markdown or PDF from the plan’s menu.',
  },
];

export default function FrequentQuestions() {
  return (
    // One answer open at a time; the first starts open.
    <Accordion.Root defaultValue={['moving']} style={{ inlineSize: 'min(100%, 32rem)' }}>
      {questions.map(({ value, question, answer }) => (
        <Accordion.Item key={value} value={value} title={question}>
          {answer}
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
