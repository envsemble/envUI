import { useState } from 'react';
import { Button, Dialog, Radio, RadioGroup } from '@envsemble/envui';

export default function ChooseLanguage() {
  const [language, setLanguage] = useState('english');
  return (
    <Dialog
      defaultOpen
      trigger={<Button variant="secondary">Choose your language</Button>}
      title="Choose your language"
      description="You can always change this later."
      closeLabel="Cancel"
      actions={<Button>Continue</Button>}
    >
      <RadioGroup aria-label="Language" value={language} onValueChange={setLanguage}>
        <Radio value="english" label="English" />
        <Radio value="mandarin" label="Chinese (Mandarin)" />
        <Radio value="spanish" label="Spanish" />
      </RadioGroup>
    </Dialog>
  );
}
