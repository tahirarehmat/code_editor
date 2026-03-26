"use client";

import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_DOCUMENT,
  loadDocument,
  saveDocument,
} from "@/lib/editorStorage";
import { buildPreviewDocument } from "@/lib/previewHtml";
import {
  buildShareableEditorUrl,
  readSharedHtmlFromWindow,
} from "@/lib/shareUrl";

const SAVE_DEBOUNCE_MS = 450;
const PREVIEW_DEBOUNCE_MS = 120;

const DOWNLOAD_FILENAME = "index.html";

const toolbarIconBtnClass =
  "inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function EditorWorkspace() {
  const [value, setValue] = useState(DEFAULT_DOCUMENT);
  const [previewSrc, setPreviewSrc] = useState(() =>
    buildPreviewDocument(DEFAULT_DOCUMENT),
  );
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  /** Below `md`, only one pane at a time: editor first, preview after user taps Preview. */
  const [mobilePane, setMobilePane] = useState<"code" | "preview">("code");
  const copiedTimerRef = useRef<number | null>(null);
  const shareCopiedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const fromUrl = readSharedHtmlFromWindow();
    const doc = fromUrl ?? loadDocument();
    setValue(doc);
    setPreviewSrc(buildPreviewDocument(doc));
    setHydrated(true);
    if (fromUrl !== null) {
      const url = buildShareableEditorUrl(fromUrl);
      window.history.replaceState(null, "", url);
    }
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

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
      if (shareCopiedTimerRef.current)
        window.clearTimeout(shareCopiedTimerRef.current);
    };
  }, []);

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [value]);

  const downloadHtml = useCallback(() => {
    const blob = new Blob([value], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = DOWNLOAD_FILENAME;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [value]);

  const copyShareUrl = useCallback(async () => {
    const url = buildShareableEditorUrl(value);
    try {
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", url);
      setShareCopied(true);
      if (shareCopiedTimerRef.current)
        window.clearTimeout(shareCopiedTimerRef.current);
      shareCopiedTimerRef.current = window.setTimeout(
        () => setShareCopied(false),
        2500,
      );
    } catch {
      setShareCopied(false);
    }
  }, [value]);

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
          className={
            mobilePane === "preview"
              ? "hidden min-h-0 min-w-0 flex-1 flex-col border-zinc-800 md:flex md:border-r"
              : "flex min-h-0 min-w-0 flex-1 flex-col border-zinc-800 md:border-r"
          }
          aria-label="Source"
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-800 px-3 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Code
              </span>
              <button
                type="button"
                className="md:hidden shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                onClick={() => setMobilePane("preview")}
              >
                Preview
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="sr-only" aria-live="polite" aria-atomic="true">
                {copied ? "Copied to clipboard" : shareCopied ? "Share link copied" : ""}
              </span>
              {copied ? (
                <span className="text-xs font-medium text-emerald-400/90">
                  Copied
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => void copyAll()}
                className={toolbarIconBtnClass}
                title={copied ? "Copied" : "Copy all code"}
                aria-label={copied ? "Copied" : "Copy all code"}
              >
                <CopyIcon />
              </button>
              <button
                type="button"
                onClick={downloadHtml}
                className={toolbarIconBtnClass}
                title={`Download as ${DOWNLOAD_FILENAME}`}
                aria-label={`Download HTML file as ${DOWNLOAD_FILENAME}`}
              >
                <DownloadIcon />
              </button>
              <button
                type="button"
                onClick={() => void copyShareUrl()}
                className={toolbarIconBtnClass}
                title={
                  shareCopied
                    ? "Link copied"
                    : "Copy shareable link"
                }
                aria-label={
                  shareCopied
                    ? "Link copied"
                    : "Copy shareable link with compressed HTML in URL hash"
                }
              >
                <LinkIcon />
              </button>
              {shareCopied ? (
                <span className="text-xs font-medium text-emerald-400/90">
                  Link copied
                </span>
              ) : null}
            </div>
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
          className={
            mobilePane === "code"
              ? "hidden min-h-0 min-w-0 flex-1 flex-col md:flex"
              : "flex min-h-0 min-w-0 flex-1 flex-col"
          }
          aria-label="Preview"
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-800 px-3 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="md:hidden shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                onClick={() => setMobilePane("code")}
              >
                Code
              </button>
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Preview
              </span>
            </div>
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
