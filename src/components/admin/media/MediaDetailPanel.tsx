"use client";

import { useEffect, useState } from "react";
import type { MediaRecord } from "./types";

interface Usage {
  location: string;
  editUrl: string;
}

export default function MediaDetailPanel({
  id,
  onClose,
  onChanged,
  onDeleted,
}: {
  id: number;
  onClose: () => void;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [media, setMedia] = useState<MediaRecord | null>(null);
  const [usages, setUsages] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    // Legitimate loading-flag-while-fetching effect, not a derivable value —
    // intentional despite the lint rule's general warning against it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/admin/media/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setMedia(data.media);
          setUsages(data.usages);
        }
        setLoading(false);
      });
  }, [id]);

  async function save(fields: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not save.");
      return;
    }
    setMedia(data.media);
    onChanged();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await save({
      title: String(fd.get("title") || ""),
      altText: String(fd.get("altText") || ""),
      caption: String(fd.get("caption") || ""),
      description: String(fd.get("description") || ""),
      seoTitle: String(fd.get("seoTitle") || ""),
      seoDescription: String(fd.get("seoDescription") || ""),
      keywords: String(fd.get("keywords") || ""),
      credit: String(fd.get("credit") || ""),
      rightsOwner: String(fd.get("rightsOwner") || ""),
      rightsStatus: String(fd.get("rightsStatus") || "NOT_VERIFIED"),
      category: String(fd.get("category") || ""),
      projectTag: String(fd.get("projectTag") || ""),
      tags: String(fd.get("tags") || ""),
      status: String(fd.get("status") || "APPROVED"),
    });
  }

  async function handleDelete(force: boolean) {
    const res = await fetch(`/api/admin/media/${id}${force ? "?force=1" : ""}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      if (data.usages) {
        setUsages(data.usages);
        setError("Used elsewhere — see below. Delete again to remove anyway, or archive instead.");
        return;
      }
      setError(data.error || "Could not delete.");
      return;
    }
    onDeleted();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-black/10 sticky top-0 bg-white">
          <p className="text-[13px] font-medium">Media Detail</p>
          <button type="button" onClick={onClose} className="text-black/50 hover:text-black text-[13px]">
            Close
          </button>
        </div>

        {loading || !media ? (
          <p className="p-6 text-[13px] text-black/40">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="flex gap-4">
              {media.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`${media.url}?w=400`} alt={media.altText || ""} className="w-40 h-40 object-cover border border-black/10" />
              ) : (
                <video src={media.url} controls className="w-40 h-40 object-cover border border-black/10 bg-black" />
              )}
              <div className="text-[12px] text-black/60 space-y-0.5">
                <p>{media.originalFilename}</p>
                <p>{media.mimeType}</p>
                <p>{(media.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                {media.width && media.height && (
                  <p>
                    {media.width} × {media.height}
                  </p>
                )}
                <p>Uploaded {new Date(media.createdAt).toLocaleString("en-IN")}</p>
                <a href={media.url} target="_blank" rel="noreferrer" className="underline text-black/70">
                  Open original
                </a>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <TextField label="Title" name="title" defaultValue={media.title} />
              <TextField label="Alt Text (accessibility — describe what's shown)" name="altText" defaultValue={media.altText} />
              <TextField label="Caption" name="caption" defaultValue={media.caption} />
              <TextField label="Credit" name="credit" defaultValue={media.credit} />
              <TextField label="Category" name="category" defaultValue={media.category} placeholder="Film / Book / Gallery / Press…" />
              <TextField label="Project" name="projectTag" defaultValue={media.projectTag} placeholder="e.g. Animal" />
              <TextField label="Tags (comma-separated)" name="tags" defaultValue={media.tags} />
              <TextField label="Rights Owner" name="rightsOwner" defaultValue={media.rightsOwner} />
            </div>

            <TextArea label="Description" name="description" defaultValue={media.description} />

            <div className="grid sm:grid-cols-2 gap-3">
              <TextField label="SEO Title" name="seoTitle" defaultValue={media.seoTitle} />
              <TextField label="SEO Description" name="seoDescription" defaultValue={media.seoDescription} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] text-black/60 mb-1">Rights Status</label>
                <select name="rightsStatus" defaultValue={media.rightsStatus} className="w-full border border-black/20 px-3 py-2 text-[13px] outline-none">
                  <option value="NOT_VERIFIED">Not verified</option>
                  <option value="APPROVED_FOR_PUBLICATION">Approved for publication</option>
                  <option value="RESTRICTED">Restricted</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] text-black/60 mb-1">Status</label>
                <select name="status" defaultValue={media.status} className="w-full border border-black/20 px-3 py-2 text-[13px] outline-none">
                  <option value="DRAFT">Draft</option>
                  <option value="APPROVED">Approved</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {usages.length > 0 && (
              <div className="border border-black/10 p-3 bg-black/5">
                <p className="text-[11px] tracking-[0.08em] uppercase text-black/50 mb-2">Used in {usages.length} place(s)</p>
                <ul className="space-y-1">
                  {usages.map((u, i) => (
                    <li key={i} className="text-[12px]">
                      <a href={u.editUrl} className="underline text-black/70">
                        {u.location}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <p role="alert" className="text-[13px] text-red-600">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-black/10">
              <button type="submit" disabled={saving} className="bg-black text-white text-[12px] px-4 py-2 disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
              {!confirmDelete ? (
                <button type="button" onClick={() => setConfirmDelete(true)} className="text-[12px] text-red-600 ml-auto">
                  Delete
                </button>
              ) : (
                <span className="ml-auto flex items-center gap-2 text-[12px]">
                  {usages.length > 0 ? "Still delete despite usage?" : "Delete permanently?"}
                  <button type="button" onClick={() => handleDelete(usages.length > 0)} className="text-red-600 underline">
                    Confirm
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-black/50 underline">
                    Cancel
                  </button>
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function TextField({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue: string | null; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[12px] text-black/60 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue || ""}
        placeholder={placeholder}
        className="w-full border border-black/20 px-3 py-2 text-[13px] outline-none focus:border-black"
      />
    </div>
  );
}

function TextArea({ label, name, defaultValue }: { label: string; name: string; defaultValue: string | null }) {
  return (
    <div>
      <label className="block text-[12px] text-black/60 mb-1">{label}</label>
      <textarea
        name={name}
        rows={3}
        defaultValue={defaultValue || ""}
        className="w-full border border-black/20 px-3 py-2 text-[13px] outline-none focus:border-black"
      />
    </div>
  );
}
