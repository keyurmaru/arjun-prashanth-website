"use client";

import { useState } from "react";
import MediaPickerModal from "./MediaPickerModal";

// For rows inside a controlled list (gallery images, video URLs/posters) —
// keeps the existing plain-text input (so a YouTube/Vimeo link can still be
// pasted directly) and adds a button to upload a file or pick one from the
// library instead, filling the same field.
export default function MediaRowPicker({
  value,
  onChange,
  accept,
  placeholder,
}: {
  value: string;
  onChange: (url: string) => void;
  accept: "image" | "video";
  placeholder?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      {accept === "image" && value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value.startsWith("/media-files/") ? `${value}?w=160` : value}
          alt=""
          className="w-8 h-8 object-cover border border-black/10 shrink-0"
        />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 border border-black/20 px-2 py-1.5 text-[13px] outline-none focus:border-black"
      />
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="text-[11px] border border-black/20 px-2 py-1.5 hover:border-black shrink-0 whitespace-nowrap"
      >
        {accept === "image" ? "Media" : "Upload"}
      </button>
      {pickerOpen && (
        <MediaPickerModal
          accept={accept}
          onSelect={(media) => {
            onChange(media.url);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
