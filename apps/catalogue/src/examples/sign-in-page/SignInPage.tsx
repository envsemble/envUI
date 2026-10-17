import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  AppShell,
  Button,
  Checkbox,
  IconButton,
  Link,
  Page,
  Stack,
  Surface,
  Text,
  TextField,
} from '@envsemble/envui';
import { Visibility } from '@envsemble/envui/icons/Visibility';
import { VisibilityOff } from '@envsemble/envui/icons/VisibilityOff';

type FieldName = 'email' | 'password';

/** What each field needs, as the message that says how to fix it; undefined when it is right. */
const rules: Record<FieldName, (value: string) => string | undefined> = {
  email: (value) =>
    !value.trim()
      ? 'Enter your email address'
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ? undefined
        : 'Enter an email address like name@example.com',
  password: (value) => (value ? undefined : 'Enter your password'),
};
const fieldNames: FieldName[] = ['email', 'password'];

/**
 * A sign-in screen of its own, outside the app frame: the application's name as the heading, email
 * and password, "Keep me signed in", the primary action, the way back to a forgotten password and
 * single sign-on. Replace `signIn` with the call to your authentication service.
 */
export default function SignInPage() {
  const id = useId();
  const [values, setValues] = useState<Record<FieldName, string>>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [refused, setRefused] = useState(false);
  // The status under the actions: an error after Enter in the field it names, or the outcome.
  const [status, setStatus] = useState('');
  // A field is checked when people leave it only once they have typed in it.
  const edited = useRef(new Set<FieldName>());
  const refs = {
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };
  // The fields the last refused submit listed in the error summary, and how often it was refused.
  const [listed, setListed] = useState<FieldName[]>([]);
  const [summaryShown, setSummaryShown] = useState(0);
  const summary = useRef<HTMLDivElement>(null);
  const refusal = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // The summary and the refusal take focus as they appear, which reads them once.
  useEffect(() => {
    if (summaryShown) summary.current?.focus();
  }, [summaryShown]);
  useEffect(() => {
    if (refused) refusal.current?.focus();
  }, [refused]);

  const change = (field: FieldName, value: string) => {
    edited.current.add(field);
    setValues((current) => ({ ...current, [field]: value }));
    // While people type, an error only goes away, as soon as the value is fixed.
    if (errors[field] && !rules[field](value)) {
      setErrors((current) => ({ ...current, [field]: undefined }));
      setStatus('');
    }
  };

  const leave = (field: FieldName) => {
    if (edited.current.has(field))
      setErrors((current) => ({ ...current, [field]: rules[field](values[field]) }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (signingIn) return;
    setRefused(false);
    const found = { email: rules.email(values.email), password: rules.password(values.password) };
    setErrors(found);
    const wrong = fieldNames.filter((field) => found[field]);
    if (wrong.length > 1) {
      // Several fields: the error summary lists them at the top and takes focus.
      setListed(wrong);
      setStatus('');
      setSummaryShown((count) => count + 1);
      return;
    }
    setListed([]);
    if (wrong.length === 1) {
      // One field: focus moves to it, which reads its label and error. After Enter in that field,
      // focus is already there and focusing it again reads nothing, so the status says the error.
      const field = refs[wrong[0]].current;
      if (document.activeElement === field) setStatus(found[wrong[0]]!);
      else {
        setStatus('');
        field?.focus();
      }
      return;
    }
    setStatus('');
    setSigningIn(true);
    // The button stays enabled and pending while the service answers; a timer stands in for it.
    timer.current = window.setTimeout(() => {
      setSigningIn(false);
      if (signIn(values.password)) setStatus(`Signed in as ${values.email.trim()}.`);
      else setRefused(true);
    }, 1200);
  };

  const summaryErrors = listed.filter((field) => errors[field]);

  return (
    <AppShell.Main>
      {/* envUI has no centred full-viewport layout yet: this column centres the form. */}
      <Stack
        justify="center"
        style={{ minBlockSize: '100dvh', paddingBlock: 'var(--env-space-7)' }}
      >
        <Page width="sm">
          {/* One panel in the muted background holds the whole screen, so its edges line up. */}
          <Surface background="muted" render={<Stack gap={6} />}>
            <Stack gap={2}>
              <Text variant="headline" render={<h1 />}>
                Sign in to Northwind
              </Text>
              <Text emphasis="muted">Use the email address you were invited with.</Text>
            </Stack>
            {/* noValidate: the form checks its own fields and words its own errors. */}
            <form noValidate onSubmit={submit}>
              <Stack gap={5}>
                {summaryErrors.length > 0 && (
                  // envUI has no error summary yet: a danger Alert lists each error as a link to
                  // its field. Without `announce` it is read once, as it takes focus.
                  <Alert
                    ref={summary}
                    tabIndex={-1}
                    tone="danger"
                    title={
                      <span role="heading" aria-level={2}>
                        There is a problem
                      </span>
                    }
                  >
                    <Stack render={<ul />} gap={1}>
                      {summaryErrors.map((field) => (
                        <li key={field}>
                          <Link
                            href={`#${id}-${field}`}
                            onClick={(event) => {
                              event.preventDefault();
                              refs[field].current?.focus();
                            }}
                          >
                            {errors[field]}
                          </Link>
                        </li>
                      ))}
                    </Stack>
                  </Alert>
                )}
                {refused && (
                  // Wrong credentials: say so without saying which, and keep what was entered.
                  <Alert
                    ref={refusal}
                    tabIndex={-1}
                    tone="danger"
                    title={
                      <span role="heading" aria-level={2}>
                        Your email address or password is wrong
                      </span>
                    }
                  >
                    Check them and try again, or reset your password.
                  </Alert>
                )}
                <TextField
                  ref={refs.email}
                  id={`${id}-email`}
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="username"
                  spellCheck={false}
                  placeholder="name@example.com"
                  value={values.email}
                  error={errors.email}
                  onValueChange={(value) => change('email', value)}
                  onBlur={() => leave('email')}
                />
                <TextField
                  ref={refs.password}
                  id={`${id}-password`}
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  spellCheck={false}
                  value={values.password}
                  error={errors.password}
                  onValueChange={(value) => change('password', value)}
                  onBlur={() => leave('password')}
                  endAction={
                    // One name, pressed or not: the state says whether the password shows.
                    <IconButton
                      icon={showPassword ? <VisibilityOff /> : <Visibility />}
                      aria-label="Show password"
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((shown) => !shown)}
                    />
                  }
                />
                <Checkbox name="remember" label="Keep me signed in" />
                {/* Never disabled: a refused submit says what is wrong, and pending ignores
                      presses while the service answers. */}
                <Button type="submit" fullWidth pending={signingIn}>
                  Sign in
                </Button>
                <Stack gap={1}>
                  <Link href="/forgot-password">Forgot your password?</Link>
                  <Text role="status" emphasis="muted">
                    {status}
                  </Text>
                </Stack>
              </Stack>
            </form>
            {/* Single sign-on in words only: no provider's name or logo. */}
            <Button variant="secondary" fullWidth href="/sign-in/single-sign-on">
              Continue with single sign-on
            </Button>
            <Text variant="caption" emphasis="muted">
              Need an account? Ask an administrator at your organisation to invite you. Read the{' '}
              <Link href="/terms">terms of use</Link> and the{' '}
              <Link href="/privacy">privacy notice</Link>.
            </Text>
          </Surface>
        </Page>
      </Stack>
    </AppShell.Main>
  );
}

/**
 * Stands in for the authentication service: the sample accepts any well-formed email address with
 * the password in `demoPassword`, and refuses everything else.
 */
function signIn(password: string) {
  return password === demoPassword;
}

const demoPassword = 'northwind-demo';
