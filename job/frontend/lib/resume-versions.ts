"use client";

import { useAuth } from "./auth-context";
import { useLocalStorage } from "./use-local-storage";
import { useResume, hasResumeContent, resumeFileName, buildResumePdf, saveBlob, needsPrintFallback } from "./resume";
import { putFile, getFile, deleteFile } from "./file-store";

export type ResumeVersion = {
  id: string; // "built" or the upload id
  name: string;
  kind: "built" | "uploaded";
};
type UploadMeta = { id: string; name: string; size: number };

export const BUILT_ID = "built";
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

/**
 * Every resume the person can send to an employer:
 *  - the one made in the Resume builder (if they've filled it in), and
 *  - files they uploaded (kept in this browser, since there's no file server yet).
 */
export function useResumeVersions() {
  const { user } = useAuth();
  const { saved } = useResume();
  const [uploads, writeUploads] = useLocalStorage<UploadMeta[]>(`jobportal_resume_uploads_${user?.id ?? "guest"}`);
  const uploaded = uploads ?? [];

  const versions: ResumeVersion[] = [
    ...(saved && hasResumeContent(saved) ? [{ id: BUILT_ID, name: resumeFileName(saved), kind: "built" as const }] : []),
    ...uploaded.map((u) => ({ id: u.id, name: u.name, kind: "uploaded" as const })),
  ];

  async function upload(file: File): Promise<void> {
    if (!/\.(pdf|docx?)$/i.test(file.name)) throw new Error("Please upload a PDF or Word file.");
    if (file.size > MAX_RESUME_BYTES) throw new Error("Resume must be under 5 MB.");
    if (versions.some((v) => v.name === file.name)) throw new Error("A resume with this name is already added.");
    const id = `up-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    await putFile(id, file);
    writeUploads([...uploaded, { id, name: file.name, size: file.size }]);
  }

  async function remove(id: string): Promise<void> {
    if (id === BUILT_ID) throw new Error("Clear the resume in the Resume builder to remove this one.");
    await deleteFile(id).catch(() => undefined);
    writeUploads(uploaded.filter((u) => u.id !== id));
  }

  /** Downloads the real file: the uploaded one, or a freshly generated PDF of the built resume. */
  async function download(id: string): Promise<void> {
    if (id === BUILT_ID) {
      if (!saved) throw new Error("Build your resume first.");
      if (needsPrintFallback(saved)) throw new Error("This resume uses characters a PDF can't hold here. Open the Resume builder and use Print instead.");
      saveBlob(await buildResumePdf(saved), resumeFileName(saved));
      return;
    }
    const meta = uploaded.find((u) => u.id === id);
    const blob = await getFile(id);
    if (!meta || !blob) throw new Error("That file isn't stored in this browser any more. Please upload it again.");
    saveBlob(blob, meta.name);
  }

  return { versions, upload, remove, download };
}
