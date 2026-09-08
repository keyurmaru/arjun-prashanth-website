"use client";

import { useEffect, useState } from "react";
import MediaGrid from "./MediaGrid";
import UploadZone from "./UploadZone";
import type { MediaRecord } from "./types";

export default function MediaPickerModal({
  accept,
  onSelect,
  onClose,
}: {
  accept: "image" | "video";
  onSelect: (media: MediaRecord) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ type: accept, status: "APPROVED" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/media?${params.toString()}`);
    const data = await res.json();
    if (data.ok) setItems(data.items);
    setLoading(false);
  }

  useEffect(() => {
    // `load` sets loading/items state while fetching — a legitimate
    // fetch-on-search-change effect, not a derivable value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <p className="text-[13px] font-medium">Select {accept === "image" ? "Image" : "Video"}</p>
          <button type="button" onClick={onClose} className="text-black/50 hover:text-black text-[13px]">
            Close
          </button>
        </div>
        <div className="p-4 border-b border-black/10">
          <UploadZone
            compact
            onUploaded={(media) => {
              if (media.type === accept) {
                onSelect(media);
              } else {
                load();
              }
            }}
          />
        </div>
        <div className="p-4 border-b border-black/10">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename, title, alt text, tag…"
            className="w-full border border-black/20 px-3 py-2 text-[13px] outline-none focus:border-black"
          />
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? <p className="text-[13px] text-black/40">Loading…</p> : <MediaGrid items={items} onSelect={onSelect} />}
        </div>
      </div>
    </div>
  );
}
