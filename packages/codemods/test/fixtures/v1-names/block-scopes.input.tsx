import { Input, MenuItem } from '@envsemble/envui';

// Locals in blocks, loop heads, cases and catch clauses hide the imports only inside them.
{
  const Input = 'local';
  console.log(Input);
}

for (const Input of ['a']) console.log(Input);

for (let Input = 0; Input < 1; Input += 1) console.log(Input);

export function Form({ flag }: { flag: boolean }) {
  if (flag) {
    const Input = 'local';
    console.log(Input);
  }
  return <Input label="Name" />;
}

export function Choice({ kind }: { kind: number }) {
  switch (kind) {
    case 1: {
      const MenuItem = 'label';
      return MenuItem;
    }
    case 2:
      class Input {}
      return new Input();
  }
  return <MenuItem>Profile</MenuItem>;
}

export function Recover() {
  try {
    return <Input label="Name" />;
  } catch (Input) {
    return Input;
  }
}

export function Destructured() {
  try {
    return 1;
  } catch ({ MenuItem }) {
    return <MenuItem />;
  }
}

export function Nested() {
  {
    function Input() {
      return 'local';
    }
    console.log(Input());
  }
  return <Input label="Name" />;
}

declare namespace Local {
  const Input: string;
  type Value = typeof Input;
}

export const Named = class MenuItem {
  render() {
    return MenuItem;
  }
};

export const Item = () => <MenuItem>Members</MenuItem>;
