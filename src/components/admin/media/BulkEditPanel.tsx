"use client";

import { useState } from "react";

// Shared updates for a selected batch — category/tags/rights/status only;
// per-item fields like alt text stay in MediaDetailPanel so the admin isn't
// forced to repeat identical text 20 times, but also can't accidentally
// blank out every item's unique alt text at once.
export default function BulkEditPanel({ ids, onDone, onCancel }: { ids: number[]; onDone: () => void; onCancel: () => void }) {
  const [category, setCategory] = useState("");
  const [projectTag, setProjectTag] = useState("");
  const [tags, setTags] = useState("");
  const [rightsStatus, setRightsStatus] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    setSaving(true);
    setError(null);
    const updates: Record<string, unknown> = { ids };
    if (category) updates.category = category;
    if (projectTag) updates.projectTag = projectTag;
    if (tags) updates.tags = tags;
    if (rightsStatus) updates.rightsStatus = rightsStatus;
    if (status) updates.status = status;

    const res = await fetch("/api/admin/media/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not apply bulk update.");
      return;
    }
    onDone();
  }

  return (
    <div className="border border-black/10 bg-white p-4">
      <p className="text-[12px] tracking-[0.08em] uppercase text-black/50 mb-3">
        Bulk edit — {ids.length} selected
      </p>
      <div className="grid sm:grid-cols-5 gap-2 mb-3">
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="border border-black/20 px-2 py-1.5 text-[13px] outline-none"
        />
        <input
          type="text"
          value={projectTag}
          onChange={(e) => setProjectTag(e.target.value)}
          placeholder="Project"
          className="border border-black/20 px-2 py-1.5 text-[13px] outline-none"
        />
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags"
          className="border border-black/20 px-2 py-1.5 text-[13px] outline-none"
        />
        <select value={rightsStatus} onChange={(e) => setRightsStatus(e.target.value)} className="border border-black/20 px-2 py-1.5 text-[13px] outline-none">
          <option value="">Rights (unchanged)</option>
          <option value="NOT_VERIFIED">Not verified</option>
          <option value="APPROVED_FOR_PUBLICATION">Approved for publication</option>
          <option value="RESTRICTED">Restricted</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-black/20 px-2 py-1.5 text-[13px] outline-none">
          <option value="">Status (unchanged)</option>
          <option value="DRAFT">Draft</option>
          <option value="APPROVED">Approved</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      {error && <p className="text-[12px] text-red-600 mb-2">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="button" onClick={apply} disabled={saving} className="bg-black text-white text-[12px] px-4 py-2 disabled:opacity-60">
          {saving ? "Applying…" : "Apply to selected"}
        </button>
        <button type="button" onClick={onCancel} className="text-[12px] text-black/50 underline">
          Clear selection
        </button>
      </div>
    </div>
  );
}
