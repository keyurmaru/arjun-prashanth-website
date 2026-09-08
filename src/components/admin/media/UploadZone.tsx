"use client";

import { useRef, useState } from "react";
import type { MediaRecord } from "./types";

type FileTask = {
  id: string;
  file: File;
  name: string;
  progress: number;
  status: "Queued" | "Uploading" | "Complete" | "Failed" | "Cancelled";
  error?: string;
};

// One request per file, so a single failure never blocks the rest of the
// batch — each row tracks its own progress/status/retry independently.
function uploadOne(file: File, onProgress: (pct: number) => void): { promise: Promise<MediaRecord>; xhr: XMLHttpRequest } {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<MediaRecord>((resolve, reject) => {
    xhr.open("POST", "/api/admin/media/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.ok) {
          resolve(data.media);
        } else {
          reject(new Error(data.error || `Upload failed (${xhr.status}).`));
        }
      } catch {
        reject(new Error("Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.onabort = () => reject(new Error("Cancelled."));
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
  return { promise, xhr };
}

export default function UploadZone({ onUploaded, compact = false }: { onUploaded: (media: MediaRecord) => void; compact?: boolean }) {
  const [tasks, setTasks] = useState<Record<string, FileTask>>({});
  const xhrRef = useRef<Record<string, XMLHttpRequest>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function startUpload(file: File) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setTasks((prev) => ({ ...prev, [id]: { id, file, name: file.name, progress: 0, status: "Uploading" } }));
    const { promise, xhr } = uploadOne(file, (pct) => {
      setTasks((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], progress: pct } } : prev));
    });
    xhrRef.current[id] = xhr;
    promise
      .then((media) => {
        setTasks((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], status: "Complete", progress: 100 } } : prev));
        onUploaded(media);
      })
      .catch((err: Error) => {
        setTasks((prev) =>
          prev[id] ? { ...prev, [id]: { ...prev[id], status: err.message === "Cancelled." ? "Cancelled" : "Failed", error: err.message } } : prev,
        );
      });
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(startUpload);
  }

  function retry(taskId: string, file: File) {
    setTasks((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    startUpload(file);
  }

  const taskList = Object.values(tasks);

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed ${dragOver ? "border-black bg-black/5" : "border-black/20"} ${
          compact ? "p-4" : "p-8"
        } text-center cursor-pointer transition-colors`}
      >
        <p className="text-[13px] text-black/60">
          Drag &amp; drop images or videos here, or <span className="underline">click to select</span>
        </p>
        <p className="text-[11px] text-black/40 mt-1">JPEG/PNG/GIF/WebP up to 15MB · MP4/WebM up to 300MB</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {taskList.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[11px] text-black/40">
            {taskList.filter((t) => t.status === "Complete").length} of {taskList.length} uploaded
          </p>
          {taskList.map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-[12px]">
              <span className="truncate max-w-[160px] text-black/70">{t.name}</span>
              <div className="flex-1 h-1.5 bg-black/10 relative overflow-hidden">
                <div
                  className={`h-full ${t.status === "Failed" ? "bg-red-500" : "bg-black"} transition-all`}
                  style={{ width: `${t.progress}%` }}
                />
              </div>
              <span
                className={
                  t.status === "Complete"
                    ? "text-green-700"
                    : t.status === "Failed"
                      ? "text-red-600"
                      : "text-black/50"
                }
              >
                {t.status === "Uploading" ? `${t.progress}%` : t.status}
              </span>
              {t.status === "Uploading" && (
                <button
                  type="button"
                  onClick={() => xhrRef.current[t.id]?.abort()}
                  className="text-black/40 hover:text-black"
                >
                  Cancel
                </button>
              )}
              {t.status === "Failed" && (
                <>
                  <span className="text-red-600 text-[11px]">{t.error}</span>
                  <button type="button" onClick={() => retry(t.id, t.file)} className="text-black/60 underline">
                    Retry
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
