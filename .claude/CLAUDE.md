# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adam Dev Tools is a React-based web application providing developer utility tools (Base64, JWT, QR codes, image processing, text utilities, etc.). It's a single-page application with no backend dependencies.

## Build & Development Commands

```bash
npm run dev          # Start dev server at localhost:5000
npm run build        # TypeScript check + Vite production build
npm run lint:check   # Check ESLint issues
npm run lint         # Fix ESLint issues
npm run format:check # Check Prettier formatting
npm run format       # Format code (organizes imports + sorts Tailwind classes)
npm run test:e2e     # Run Playwright tests
npm run test:e2e:ui  # Run Playwright with interactive UI
```

## Architecture

### Routing

Routes are defined in `src/App.tsx` using wouter. Each tool is a page component in `src/pages/`.

### Adding a New Tool

1. Create a new folder in `src/pages/YourTool/`
2. Add route in `src/App.tsx`
3. Add tool entry to the `tools` array in `src/pages/Home/index.tsx` with metadata (href, title, category, searchTags)

### Key Patterns

**IOwithCopy Component** (`src/components/IOwithCopy.tsx`): Wraps simple input→transform→output tools. See `src/pages/Base64/Encode.tsx` for minimal example.

**URL State Hooks** (`src/utils/useUrlState.ts`): Persist state in URL query params for shareable links.

**Storage Utility** (`src/utils/Storage.ts`): localStorage wrapper with optional TTL expiry.

### Styling

- **Theme**: Catppuccin Mocha - use `ctp-` prefixed colors (e.g., `ctp-blue`, `ctp-surface0`, `ctp-text`)
- **Tailwind CSS v4** with prettier-plugin-tailwindcss for class sorting

### Hidden Tools (Easter Egg)

Card game tools are hidden by default. Unlocked via `?bounty=cards` URL param or clicking search 5 times.

---

## Design System

### Quick Reference

| Category  | Tailwind           |
| --------- | ------------------ |
| Font      | font-['Open_Sans'] |
| Spacing   | gap-3, p-4         |
| Corners   | rounded-md         |
| Shadows   | shadow-none        |
| Animation | duration-100       |
| Container | max-w-7xl          |

### Typography Scale

| Element | Tailwind  |
| ------- | --------- |
| H1      | text-2xl  |
| H2      | text-xl   |
| H3      | text-lg   |
| Body    | text-base |

### Component Examples

**Button:**

```html
<button
  class="rounded-md bg-blue-500 p-4 text-white transition-colors duration-100 hover:bg-blue-500/90"
>
  Button Text
</button>
```

**Input:**

```html
<input class="rounded-md bg-slate-800 p-4 focus:ring-2 focus:ring-blue-500" />
```

---

## Code Style

- **Indentation**: 4 spaces
- **Quotes**: Double quotes
- **Formatting**: Prettier + prettier-plugin-tailwindcss
- **Unused variables**: Prefix with `_`

### Naming

| Type       | Convention        | Example         |
| ---------- | ----------------- | --------------- |
| Components | PascalCase        | `CardImage.tsx` |
| Functions  | camelCase         | `handleClick()` |
| Booleans   | is/has prefix     | `isLoading`     |
| Files      | Match export name | `SearchBar.tsx` |
