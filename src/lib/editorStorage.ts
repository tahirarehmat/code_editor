export const EDITOR_STORAGE_KEY = "code-editor:single-doc:v1";

export const DEFAULT_DOCUMENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Preview</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      padding: 1.5rem;
      line-height: 1.5;
    }
    h1 {
      color: #2563eb;
      font-size: 1.5rem;
    }
  </style>
</head>
<body>
  <h1>Hello</h1>
  <p>Edit this document on the left. Use only <code>&lt;style&gt;</code> blocks or inline <code>style</code> attributes.</p>
</body>
</html>
`;

export function loadDocument(): string {
  if (typeof window === "undefined") return DEFAULT_DOCUMENT;
  try {
    const raw = localStorage.getItem(EDITOR_STORAGE_KEY);
    if (raw == null || raw === "") return DEFAULT_DOCUMENT;
    return raw;
  } catch {
    return DEFAULT_DOCUMENT;
  }
}

export function saveDocument(content: string): void {
  try {
    localStorage.setItem(EDITOR_STORAGE_KEY, content);
  } catch {
    // Quota or private mode — ignore
  }
}
