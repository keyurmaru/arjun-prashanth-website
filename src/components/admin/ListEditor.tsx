"use client";

// Shared add/remove row editor for small ordered lists (film gallery/videos,
// book variants/gallery) — sortOrder is just each item's array index, so
// dragging is out of scope but reordering by removing/re-adding is not.
export default function ListEditor<T>({
  title,
  items,
  onChange,
  renderRow,
  addLabel,
  empty,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  renderRow: (item: T, update: (next: T) => void) => React.ReactNode;
  addLabel: string;
  empty: () => T;
}) {
  return (
    <div className="border border-black/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] tracking-[0.08em] uppercase text-black/50">{title}</p>
        <button
          type="button"
          onClick={() => onChange([...items, empty()])}
          className="text-[12px] text-black/60 hover:text-black underline"
        >
          {addLabel}
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            {renderRow(item, (next) => onChange(items.map((it, j) => (j === i ? next : it))))}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-[12px] text-red-600 shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-[12px] text-black/40">None added.</p>}
      </div>
    </div>
  );
}
