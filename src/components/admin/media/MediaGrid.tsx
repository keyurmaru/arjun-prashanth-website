"use client";

import type { MediaRecord } from "./types";

export default function MediaGrid({
  items,
  onSelect,
  selectedIds,
}: {
  items: MediaRecord[];
  onSelect: (media: MediaRecord) => void;
  selectedIds?: Set<number>;
}) {
  if (items.length === 0) {
    return <p className="text-[13px] text-black/40 py-8 text-center">No media found.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {items.map((m) => {
        const selected = selectedIds?.has(m.id);
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m)}
            className={`relative aspect-square border ${selected ? "border-black ring-2 ring-black" : "border-black/10"} bg-black/5 overflow-hidden group`}
          >
            {m.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${m.url}?w=400`} alt={m.altText || m.originalFilename} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] text-black/50 p-2 text-center">
                🎬 {m.originalFilename}
              </div>
            )}
            {m.status !== "APPROVED" && (
              <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 uppercase tracking-wide">
                {m.status}
              </span>
            )}
            {m.featured && <span className="absolute top-1 right-1 bg-yellow-400 text-black text-[9px] px-1 py-0.5">★</span>}
            <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
              {m.title || m.originalFilename}
            </span>
          </button>
        );
      })}
    </div>
  );
}
