"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Copy, Check } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { AdminCard, AdminButton } from "@/components/admin/admin-ui";

type MediaItem = {
  id: string;
  url: string;
  originalName: string;
  mimetype: string;
  size: number;
  createdAt: string;
};

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    adminApi.media
      .list()
      .then((res) => setItems(res.data))
      .catch((e) => setError(e.message || "Failed to load media"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const created = await adminApi.media.upload(file);
      setItems((prev) => [created, ...prev]);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: string) {
    try {
      await adminApi.media.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  }

  function copyUrl(item: MediaItem) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    navigator.clipboard.writeText(`${apiBase}${item.url}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Media Library</h1>
          <p className="mt-1 text-sm text-mist">
            Upload images to use as logos, avatars, or content photos. Copy a URL and paste it into any
            image field.
          </p>
        </div>
        <label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <AdminButton onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload className="h-4 w-4" /> Upload Image
          </AdminButton>
        </label>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-mist">Loading…</p>}

      {!loading && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.length === 0 && (
            <AdminCard className="col-span-full p-8 text-center text-sm text-mist">
              No files uploaded yet.
            </AdminCard>
          )}
          {items.map((item) => (
            <AdminCard key={item.id} className="overflow-hidden">
              <div className="aspect-square bg-haze">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${item.url}`}
                  alt={item.originalName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-semibold text-ink">{item.originalName}</p>
                <p className="text-[11px] text-mist">{(item.size / 1024).toFixed(0)} KB</p>
                <div className="mt-2 flex gap-1.5">
                  <AdminButton size="sm" variant="secondary" onClick={() => copyUrl(item)} className="flex-1">
                    {copiedId === item.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedId === item.id ? "Copied" : "Copy URL"}
                  </AdminButton>
                  <AdminButton size="sm" variant="ghost" onClick={() => remove(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
