"use client";

import { useRef, useState } from "react";
import { Clock, Upload, BellRing, AlertCircle, Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ownerNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { Field } from "@/components/ui/FormField";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { getMyKycDocuments, submitKycDocument } from "@/lib/api/users";
import { uploadImage } from "@/lib/api/storage";
import { projectsApi } from "@/lib/api/projects";
import { useAuth } from "@/lib/auth/AuthProvider";

const docTypes = ["PAN", "AADHAAR", "GST", "COMPANY_REGISTRATION", "AUTHORIZED_SIGNATORY_ID", "RERA_CERTIFICATE"];
const docLabels: Record<string, string> = {
  PAN: "PAN Card",
  AADHAAR: "Aadhaar",
  GST: "GST Registration",
  COMPANY_REGISTRATION: "Company Registration Certificate",
  AUTHORIZED_SIGNATORY_ID: "Authorized Signatory ID Proof",
  RERA_CERTIFICATE: "RERA Certificate",
};

async function loadVerification() {
  const [docsRes, projectsRes] = await Promise.all([getMyKycDocuments(), projectsApi.mine()]);
  return { documents: docsRes.documents, projects: projectsRes.projects };
}

export default function OwnerVerificationPage() {
  const { user, refreshUser } = useAuth();
  const { data, loading, error, reload } = useApiData(loadVerification);
  const [docType, setDocType] = useState(docTypes[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents = data?.documents ?? [];
  const projects = data?.projects ?? [];

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setFormError("File is larger than 8MB.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const uploaded = await uploadImage(file);
      await submitKycDocument(docType, uploaded.url);
      reload();
      refreshUser();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not submit this document. Please try again.");
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <DashboardShell
      groups={ownerNav}
      roleColor="brass"
      pageTitle="Verification & RERA"
      pageSubtitle="Upload your documents and track RERA status"
    >
      {loading && <LoadingRow label="Loading verification status…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5">
            <div>
              <p className="text-sm font-medium text-ink-900">Overall KYC status</p>
              <p className="text-xs text-text-500">Listing and bulk-inventory tools unlock once this is verified.</p>
            </div>
            <Badge variant={user?.kycStatus === "VERIFIED" ? "verified" : user?.kycStatus === "REJECTED" ? "danger" : "warning"}>
              {user?.kycStatus === "VERIFIED" ? "Verified" : user?.kycStatus === "REJECTED" ? "Rejected" : user?.kycStatus === "ON_HOLD" ? "On hold" : "Pending review"}
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader eyebrow="Business KYC" title="Documents submitted" />
              {documents.length ? (
                <ul className="space-y-2.5">
                  {documents.map((d) => (
                    <li key={d.id} className="flex items-center justify-between rounded-xl border border-stone-200 p-3">
                      <span className="text-sm text-text-700">{docLabels[d.docType] ?? d.docType}</span>
                      {d.status === "VERIFIED" ? (
                        <Badge variant="verified">Verified</Badge>
                      ) : d.status === "REJECTED" ? (
                        <Badge variant="danger">Rejected</Badge>
                      ) : (
                        <Badge variant="warning"><Clock size={11} /> Pending</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-sm text-text-400">No documents submitted yet.</p>
              )}

              <div className="mt-4 space-y-2.5 rounded-xl border border-dashed border-stone-300 p-3.5">
                {formError && (
                  <div className="flex items-start gap-2 rounded-lg bg-danger-50 p-2.5 text-xs text-danger-700">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" /> {formError}
                  </div>
                )}
                <Field label="Document type">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brass-400"
                  >
                    {docTypes.map((t) => (
                      <option key={t} value={t}>{docLabels[t]}</option>
                    ))}
                  </select>
                </Field>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelected(e.target.files?.[0])}
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={submitting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                >
                  {submitting ? "Uploading…" : "Upload document"}
                </Button>
                <p className="text-center text-[11px] text-text-400">JPEG, PNG, WebP or PDF, up to 8MB</p>
              </div>
            </Card>

            <Card>
              <CardHeader eyebrow="Per-project" title="RERA registration status" />
              {projects.length ? (
                <ul className="space-y-3">
                  {projects.map((p) => (
                    <li key={p.id} className="rounded-xl border border-stone-200 p-3.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink-900">{p.name}</p>
                        <Badge variant={p.reraVerified ? "verified" : "warning"}>
                          {p.reraVerified ? "Verified" : <><BellRing size={11} /> Pending</>}
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-text-400">{p.rera ?? "No RERA number added"}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No projects yet" description="RERA status for your projects will show up here once you add one." />
              )}
            </Card>
          </div>

          <Card className="mt-6 flex items-start gap-4">
            <SealMark size={28} className="mt-0.5 shrink-0 text-brass-600" />
            <div>
              <p className="font-medium text-ink-900">What &quot;Verified&quot; unlocks</p>
              <p className="mt-1 text-sm text-text-600">
                Once KYC and RERA checks clear, your listings and project microsites carry the
                Verified seal platform-wide — shown to seekers the same way on search, locality
                pages, and shortlists.
              </p>
            </div>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
