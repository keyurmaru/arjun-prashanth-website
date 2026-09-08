"use client";

import { useState } from "react";
import MediaPickerModal from "./MediaPickerModal";
import { isVideoUrl } from "@/lib/media/isVideoUrl";

// Drop-in replacement for a plain text/URL input, for forms that read their
// values via `new FormData(form)` at submit time (Film/Book forms) rather
// than fully-controlled React state — a hidden input carries the value so
// nothing else about those forms has to change.
export default function MediaField({
  name,
  label,
  defaultValue,
  accept,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  accept: "image" | "video" | "any";
}) {
  const [value, setValue] = useState(defaultValue || "");
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <label className="block text-[12px] text-black/60 mb-1">{label}</label>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-3">
        {value ? (
          isVideoUrl(value) ? (
            <video src={value} muted playsInline preload="metadata" className="w-16 h-16 object-cover border border-black/10 bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.startsWith("/media-files/") ? `${value}?w=160` : value} alt="" className="w-16 h-16 object-cover border border-black/10" />
          )
        ) : (
          <div className="w-16 h-16 border border-dashed border-black/20 flex items-center justify-center text-[9px] text-black/30">
            None
          </div>
        )}
        <div className="flex flex-col gap-1 items-start">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="text-[12px] border border-black/20 px-3 py-1.5 hover:border-black"
          >
            Select / Upload
          </button>
          {value && (
            <button type="button" onClick={() => setValue("")} className="text-[11px] text-red-600">
              Remove
            </button>
          )}
        </div>
      </div>
      {pickerOpen && (
        <MediaPickerModal
          accept={accept}
          onSelect={(media) => {
            setValue(media.url);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
