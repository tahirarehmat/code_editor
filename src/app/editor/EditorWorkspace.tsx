"use client";

import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_DOCUMENT,
  loadDocument,
  saveDocument,
} from "@/lib/editorStorage";
import { buildPreviewDocument } from "@/lib/previewHtml";

const SAVE_DEBOUNCE_MS = 450;
const PREVIEW_DEBOUNCE_MS = 120;

export default function EditorWorkspace() {
  const [value, setValue] = useState(DEFAULT_DOCUMENT);
  const [previewSrc, setPreviewSrc] = useState(() =>
    buildPreviewDocument(DEFAULT_DOCUMENT),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const doc = loadDocument();
    setValue(doc);
    setPreviewSrc(buildPreviewDocument(doc));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => saveDocument(value), SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [value, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(
      () => setPreviewSrc(buildPreviewDocument(value)),
      PREVIEW_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(t);
  }, [value, hydrated]);

  const extensions = useMemo(() => [html()], []);

  const onChange = useCallback((v: string) => setValue(v), []);

  if (!hydrated) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-zinc-950 text-sm text-zinc-400">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-zinc-950 text-zinc-100">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <h1 className="text-sm font-medium tracking-tight text-zinc-200">
          HTML editor
        </h1>
        <p className="max-w-md text-right text-xs text-zinc-500">
          internal or inline CSS only
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section
          className="flex min-h-[40vh] min-w-0 flex-1 flex-col border-zinc-800 md:min-h-0 md:border-r"
          aria-label="Source"
        >
          <div className="shrink-0 border-b border-zinc-800 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Code
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <CodeMirror
              value={value}
              height="100%"
              className="h-full min-h-[200px] text-sm [&_.cm-editor]:h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:font-mono"
              theme={vscodeDark}
              extensions={extensions}
              onChange={onChange}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: false,
              }}
            />
          </div>
        </section>

        <section
          className="flex min-h-[40vh] min-w-0 flex-1 flex-col md:min-h-0"
          aria-label="Preview"
        >
          <div className="shrink-0 border-b border-zinc-800 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Preview
          </div>
          <iframe
            title="Live preview"
            className="min-h-0 w-full flex-1 border-0 bg-white"
            sandbox=""
            srcDoc={previewSrc}
          />
        </section>
      </div>
    </div>
  );
}
