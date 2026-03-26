# Code Editor

A small **Next.js** app for editing a **single HTML document** with a **live preview** beside the editor. Work is stored in **`localStorage`** in the browser—no backend or database.

## Features

- **Landing** (`/`) — short intro with a circular-style entrance animation, then automatic navigation to the editor (timing matches the animation; **“Open editor now”** skips the wait).
- **Editor** (`/editor`) — CodeMirror 6 with HTML highlighting (VS Code–style dark theme), split **code** and **preview** panes (stacked on small screens).
- **One file** — the document is one HTML string; use **`<style>`** blocks or **inline `style=""`** only (external stylesheets are blocked in the preview via **Content-Security-Policy**).
- **Persistence** — debounced save to `localStorage` under the key defined in `src/lib/editorStorage.ts`.
- **Preview sandbox** — preview runs in an `iframe` with `sandbox=""` (no scripts in the host’s security model for that frame).

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [@uiw/react-codemirror](https://github.com/uiwjs/react-codemirror) + `@codemirror/lang-html`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be sent to `/editor` after the intro, or use **Open editor now** immediately.

### Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build` | Production build        |
| `npm run start` | Run production server   |
| `npm run lint`  | ESLint                   |

## Project layout (high level)

| Path | Role |
| ---- | ---- |
| `src/app/page.tsx` | Home route; mounts the landing client UI |
| `src/app/HomeLanding.tsx` | Landing animation and redirect logic |
| `src/app/editor/page.tsx` | Editor route metadata + `EditorWorkspace` |
| `src/app/editor/EditorWorkspace.tsx` | CodeMirror, preview `iframe`, save/load |
| `src/lib/editorStorage.ts` | Default HTML, `localStorage` key and helpers |
| `src/lib/previewHtml.ts` | Wraps user HTML and injects preview CSP meta |

## Deploying

Build with `npm run build`, then run `npm run start`, or deploy to any platform that supports Next.js (e.g. [Vercel](https://vercel.com/docs/frameworks/nextjs)).

## Browser notes

- Intro motion uses CSS `sin()` / `cos()` for the circular entry path; use a current browser or rely on **reduced motion** preferences for a simpler path.
- Clearing site data removes the saved document from `localStorage`.
