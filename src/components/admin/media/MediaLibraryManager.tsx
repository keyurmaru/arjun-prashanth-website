"use client";

import { useCallback, useEffect, useState } from "react";
import UploadZone from "./UploadZone";
import MediaGrid from "./MediaGrid";
import MediaDetailPanel from "./MediaDetailPanel";
import BulkEditPanel from "./BulkEditPanel";
import type { MediaRecord } from "./types";

export default function MediaLibraryManager() {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"" | "image" | "video">("");
  const [status, setStatus] = useState<"" | "DRAFT" | "APPROVED" | "ARCHIVED">("");
  const [page, setPage] = useState(1);

  const [detailId, setDetailId] = useState<number | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const load = useCallback(
    async (opts?: { append?: boolean }) => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setItems((prev) => (opts?.append ? [...prev, ...data.items] : data.items));
        setTotal(data.total);
      }
      setLoading(false);
    },
    [page, search, type, status],
  );

  // Filters/search changing resets to page 1 and replaces the list; paging
  // forward (via "Load more") appends instead.
  useEffect(() => {
    // `load` sets loading/items state while fetching — a legitimate
    // fetch-on-param-change effect, not a derivable value. Deliberately
    // excludes `load` itself from deps (it's recreated every render).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load({ append: page > 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, type, status]);

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-6">
        <UploadZone
          onUploaded={() => {
            if (page === 1) load();
            else setPage(1);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search filename, title, alt text, tag, project…"
          className="border border-black/20 px-3 py-2 text-[13px] outline-none focus:border-black min-w-[220px]"
        />
        <select
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value as typeof type);
          }}
          className="border border-black/20 px-3 py-2 text-[13px] outline-none"
        >
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as typeof status);
          }}
          className="border border-black/20 px-3 py-2 text-[13px] outline-none"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="APPROVED">Approved</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setBulkMode((v) => !v);
            setSelected(new Set());
          }}
          className={`text-[12px] px-3 py-2 border ${bulkMode ? "bg-black text-white border-black" : "border-black/20"}`}
        >
          {bulkMode ? "Cancel selection" : "Select multiple"}
        </button>
        <span className="text-[12px] text-black/40 ml-auto">{total} items</span>
      </div>

      {bulkMode && selected.size > 0 && (
        <div className="mb-4">
          <BulkEditPanel
            ids={Array.from(selected)}
            onDone={() => {
              setSelected(new Set());
              setBulkMode(false);
              load();
            }}
            onCancel={() => setSelected(new Set())}
          />
        </div>
      )}

      {loading ? (
        <p className="text-[13px] text-black/40">Loading…</p>
      ) : (
        <MediaGrid
          items={items}
          selectedIds={bulkMode ? selected : undefined}
          onSelect={(media) => (bulkMode ? toggleSelect(media.id) : setDetailId(media.id))}
        />
      )}

      {total > items.length + (page - 1) * 40 && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setPage((p) => p + 1)} className="text-[12px] underline text-black/60">
            Load more
          </button>
        </div>
      )}

      {detailId !== null && (
        <MediaDetailPanel
          id={detailId}
          onClose={() => setDetailId(null)}
          onChanged={() => {
            load();
          }}
          onDeleted={() => {
            setDetailId(null);
            load();
          }}
        />
      )}
    </div>
  );
}
