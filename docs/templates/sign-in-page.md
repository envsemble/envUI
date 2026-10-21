---
title: Sign-in page
summary: A whole screen where people sign in with an email address and password, or with single sign-on, before the application opens.
status: beta
since: 1.0.0
frame: none
aliases:
  - sign in
  - sign-in page
  - login page
  - log in
  - login form
  - authentication
  - password
useWhen:
  - People sign in to the application with an email address and a password before they reach its pages.
  - The application also offers single sign-on through the organisation's own account service.
avoidWhen:
  - text: Asking for information once people are signed in.
    see: forms
  - text: Confirming a sensitive action again inside the application.
    use: ConfirmDialog
composes:
  - AppShell
  - Page
  - Column
  - Surface
  - Text
  - TextField
  - IconButton
  - Tooltip
  - Checkbox
  - Button
  - Link
  - Alert
related:
  - forms
  - text-field
  - alert
  - button
  - app-shell
---

# Sign-in page

## Overview

The screen people see before the application opens: the application's name, an email address and a password, "Keep me signed in", the way back to a forgotten password and single sign-on. It's a whole screen of its own, outside the app frame, with one `main` landmark and the form centred in the window. Start from it for any application that signs people in with a password; set up the providers at the application's root as [setup](../setup.md) says, since the template brings none.

```tsx template=SignInPage

```

## Anatomy

1. **Main:** [AppShell.Main](../components/app-shell.md) on its own, without a Root: the page's `main` landmark.
2. **Column:** a [Column](../components/column.md) as tall as the window that centres a [Page](../components/page.md) of `width="sm"`, which keeps the form to a readable width with the page gutter on a phone.
3. **Panel:** a [Surface](../components/surface.md) `background="muted"`, rendered as a Column, that holds everything below, so its edges line up.
4. **Heading:** a [Text](../foundations/typography.md) `variant="headline"` rendered as the page's `h1`, "Sign in to Northwind", with a muted line under it.
5. **Form:** a native `form` with `noValidate`:
   - **Error summary** (after a refused submit with several errors): an [Alert](../components/alert.md) `tone="danger"` titled "There is a problem", its title a level-2 heading, listing each error as a [Link](../components/link.md) to its field;
   - **Refusal** (after wrong credentials): an Alert `tone="danger"` that says the email address or password is wrong, without saying which;
   - **Email address:** a [TextField](../components/text-field.md) with `type="email"` and `autoComplete="username"`;
   - **Password:** a TextField with `autoComplete="current-password"` and, as its `endAction`, an [IconButton](../components/button.md) "Show password" in a [Tooltip](../components/tooltip.md) that shows its name, pressed while the password shows;
   - **Keep me signed in:** a [Checkbox](../components/checkbox.md);
   - **Sign in:** the primary [Button](../components/button.md), `type="submit"`, `fullWidth`, `pending` while the service answers;
   - **Forgot your password?:** a Link to the reset page;
   - **Status:** a Text with `role="status"` under the link.
6. **Single sign-on:** a secondary Button "Continue with single sign-on", a link to the application's single sign-on route, in words only.
7. **Caption:** a Text `variant="caption"` on how to get an account, with links to the terms of use and the privacy notice.

## States and behaviour

- **Empty submit:** both fields show their error, and the error summary appears at the top of the form and takes focus. Each link in it moves focus to its field.
- **One field wrong:** the field shows its error and focus moves to it, which reads its label and its error. After Enter in that field, focus is already there and nothing would be read, so the status says the error instead.
- **While typing:** no error appears; a field that was wrong loses its error as soon as its value is right. Once people have typed in a field, it is checked as they leave it.
- **Signing in:** the Sign in button is `pending`: it keeps its size, reports busy and ignores presses. It is never disabled, so people can always press it and find out what is wrong.
- **Wrong credentials:** the fields keep what was entered, and the refusal Alert appears and takes focus. The sample accepts any well-formed email address with the password `northwind-demo` and refuses every other password.
- **Signed in:** the sample says so in the status; an application moves on to the page people asked for.
- **Widths:** the column is 40 rem at most and centred on a desktop and a tablet; on a phone it fills the width inside the page gutter, and the screen scrolls when the window is shorter than the form.

### Connect your data

- Replace `signIn` and the timer in `submit` with the call to your authentication service, and move on to the page people asked for when it succeeds.
- Point "Forgot your password?", "Continue with single sign-on" and the caption's links at your routes. They're plain paths that route through the application's `LinkProvider` (see [setup](../setup.md)).
- Keep the error messages in the field's own terms, and keep the refusal from saying which of the two was wrong.

## Content guidelines

- Use "Sign in" for the heading, the button and the links, never "Log in" or "Login" ([Buttons and actions](../foundations/content.md#buttons-and-actions)).
- Name the application in the heading, and no product or provider anywhere else: single sign-on is "Continue with single sign-on", without a logo.
- Errors say how to fix the value: "Enter your email address", "Enter an email address like name@example.com" ([Error messages](../foundations/content.md#error-messages)). Title the summary "There is a problem".
- The refusal says what happened and what to do, without blame: "Your email address or password is wrong", then "Check them and try again, or reset your password."

## Do and don't

### Do

- Set `autoComplete="username"` and `autoComplete="current-password"`, so password managers fill the form.
- Keep the email address after a refusal, so people only fix what was wrong.
- Let people show the password they type.

### Don't

- Don't disable Sign in until both fields are filled.
- Don't say whether the email address or the password was wrong; that tells others which addresses have accounts.
- Don't put a provider's logo or name on the single sign-on button.

## Accessibility

### Landmarks and headings

- One `main` landmark, AppShell.Main, and no banner or navigation: the screen has nothing to navigate to before people sign in.
- One `h1`, "Sign in to Northwind". The error summary's and the refusal's titles are level-2 headings.
- The order of focus follows the screen: email address, password, Show password, Keep me signed in, Sign in, Forgot your password?, Continue with single sign-on and the caption's links.

### envUI provides

- Native inputs, a checkbox and a submit button, so autofill, password managers and Enter behave as the platform's.
- A label tied to each field, its error linked as its description and `aria-invalid` while the error shows.
- A pending Button that keeps its size, reports busy and ignores presses.
- Alerts without `announce` that are read once, as they take focus, rather than announced as alerts and read again.

### You provide

- `noValidate` and the checks, with a message for each field.
- Moving focus after a refused submit: to the error summary for several errors, to the field for one, and to the refusal Alert for wrong credentials.
- The status that says an error when focus is already in the field.
- `aria-pressed` on the Show password button, which keeps its name.
