import type { Metadata } from "next";
import EditorWorkspace from "./EditorWorkspace";

export const metadata: Metadata = {
  title: "Editor",
};

export default function EditorPage() {
  return <EditorWorkspace />;
}
