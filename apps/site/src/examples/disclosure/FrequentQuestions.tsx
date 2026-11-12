import { Disclosure, Column, Text } from '@envsemble/envui';

const questions = [
  {
    question: 'Who can see a shared plan?',
    answer: 'Everyone in the workspace can read it; only its editors can change it.',
  },
  {
    question: 'Can I move a plan to another workspace?',
    answer: 'Yes. Open the plan’s menu, choose Move, and pick a workspace you belong to.',
  },
  {
    question: 'What happens to archived plans?',
    answer: 'They stay readable and searchable, and you can restore them at any time.',
  },
];

export default function FrequentQuestions() {
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 28rem)' }}>
      {questions.map(({ question, answer }, index) => (
        // A shared name lets one answer stay open at a time, where the browser supports it; the
        // first starts open.
        <Disclosure key={question} name="plan-questions" title={question} defaultOpen={index === 0}>
          <Text>{answer}</Text>
        </Disclosure>
      ))}
    </Column>
  );
}
