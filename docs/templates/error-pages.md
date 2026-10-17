---
title: Error and not-found pages
summary: The pages for an address with no page, an object people may not open, and an application that failed to load, each saying what happened and what to do next.
status: beta
since: 1.0.0
frame: app
aliases:
  - error page
  - not found
  - '404'
  - page not found
  - no access
  - forbidden
  - '403'
  - something went wrong
  - error boundary
useWhen:
  - People follow a link to a page that doesn't exist or has moved.
  - People open an object they don't have access to.
  - The application, or one page of it, fails to load or render.
avoidWhen:
  - text: A list or a region of a page with nothing in it, or a search with no results.
    see: empty-states
  - text: A form whose submission failed.
    see: forms
composes:
  - AppShell
  - Page
  - EmptyState
  - Button
  - Link
  - Code
  - Stack
  - Text
related:
  - empty-states
  - empty-state
  - app-frame
  - sign-in-page
---

# Error and not-found pages

## Overview

The pages people see when what they asked for isn't there: an address with no page, an object they may not open, and an application that failed to load. Each says what happened and offers the next step. The first two show inside the [app frame](app-frame.md), so people keep its navigation; the third is a whole screen of its own, since the frame may be what failed. Start from them for the router's catch-all route, a refused request and the error boundary at the application's root.

```tsx template=NotFoundPage

```

## Anatomy

1. **Not found** (`NotFoundPage`, inside the frame): a [Page](../components/page.md) of `width="md"` with an [EmptyState](../components/empty-state.md) `align="center"` and `headingLevel={1}`, "Page not found", that shows the address in [Code](../components/code.md), with "Go to home" and, where the application has a search page, "Search" [Button](../components/button.md) links in a [Stack](../components/stack.md).
2. **No access** (`NoAccessPage`, inside the frame): the same EmptyState, "You don't have access to this project", naming the owner, with a "Request access" Button, a status [Text](../foundations/typography.md) and a [Link](../components/link.md) back to the list.
3. **Failed to load** (`ErrorPage`, a whole screen): [AppShell.Main](../components/app-shell.md) on its own, a Stack as tall as the window that centres a Page of `width="sm"`, and an EmptyState with `tone="danger"`, "Something went wrong", "Try again" and a reference in Code to quote to support.
4. **Error boundary** (the example below): a React error boundary around the page inside AppShell.Main that shows a danger EmptyState in the page's place.

## States and behaviour

- **Not found:** the router's catch-all route renders it with the path people asked for. Where the application has a search page, "Search" goes to it with the path's last part as the query; without one, set `searchPath` to `null` and only "Go to home" shows. "Go to home" goes home. The frame marks no destination.
- **No access:** "Request access" is `pending` while the request is sent, then gives way to a status that says who will hear about it, and focus moves to that status, since the button people pressed is gone. Name the owner only where people may know who it is.
- **Failed to load:** focus moves to Main as the screen mounts, so a screen reader reads the screen that replaced the application. "Try again" loads the application again. The reference ties the screen to the report your error reporting made, so support can find it.
- **A page fails to render:** the boundary keeps the frame and replaces only the page; key it by the path, so going to another page starts again.
- **Widths:** each message is centred in a column of at most 60 rem, 40 for the failed load, which fills the width inside the page's gutter on a phone; the buttons wrap.

### Connect your data

- Render `NotFoundPage` from the router's catch-all route, and replace `requestedPath` with the router's location.
- Render `NoAccessPage` when your service refuses an object with a 403, with the object's name and owner, and send the request through your service.
- Render `ErrorPage` from the error boundary at the application's root, outside the frame and its providers' failures, with the reference from your error reporting.
- Links are plain paths through the application's `LinkProvider` ([setup](../setup.md)).

## Content guidelines

- Say what happened as the title, in plain words: "Page not found", "You don't have access to this project", "Something went wrong". No codes alone, no blame and no jokes ([Error messages](../foundations/content.md#error-messages)).
- Say whether work is safe, and what to do next, in the description.
- Show the address or the reference in Code, so people can read it out or copy it.

## Do and don't

### Do

- Keep the frame around a not-found or no-access page, so people can go on.
- Offer one way forward that always works, such as "Go to home".
- Report the error with a reference people can quote.

### Don't

- Don't show a stack trace or a raw error message.
- Don't say whether a private object exists to people who may not see it; a 404 is safer than a 403 there.
- Don't send people to the sign-in page for a page that doesn't exist.

## Accessibility

### Landmarks and headings

- Not found and no access: the frame's `nav` "Primary" and one `main`, with the EmptyState's title as the page's `h1`.
- Failed to load: one `main`, AppShell.Main, without a banner or navigation, and the title as the `h1`.
- The boundary's fallback inside a page takes the level under the page's heading, here an `h2`.

### envUI provides

- An EmptyState with its title at the level you set, an icon hidden from assistive technology and a danger tone that isn't color alone.
- Buttons that are links where they go somewhere, through the application's router.
- A pending Button that keeps its size and reports busy.

### You provide

- The `h1` through `headingLevel={1}` where the EmptyState is the page.
- `document.title` for each, such as "Page not found – Northwind".
- The status that confirms a request, with `tabIndex={-1}`, and moving focus to it once the request is sent.
- Focus on Main as the failed-load screen mounts: AppShell.Main has `tabIndex={-1}`, so `focus()` on its ref works, and a screen reader reads the screen that replaced the application.
- The error boundary itself.

## Examples

### No access

An object people may not open, inside the frame, with a request they can send to its owner.

```tsx template=NoAccessPage

```

### Failed to load

The application failed to load: a whole screen of its own, with a reference for support.

```tsx template=ErrorPage frame=none

```

### Error boundary

A page that fails to render shows a danger EmptyState in its place, and the frame around it keeps working.

```tsx example=ErrorBoundary

```
