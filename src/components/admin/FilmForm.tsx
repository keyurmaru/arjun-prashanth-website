"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FilmRecord, ProjectType, FilmStatus } from "@/lib/filmsRepo";

const PROJECT_TYPES: ProjectType[] = ["Feature Film", "Short Film", "Direction", "Associate Direction", "Assistant Direction", "Editing"];
const STATUSES: FilmStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export default function FilmForm({ film }: { film?: FilmRecord }) {
  const router = useRouter();
  const [featured, setFeatured] = useState(film?.featured ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      slug: String(formData.get("slug") || ""),
      title: String(formData.get("title") || ""),
      projectType: String(formData.get("projectType") || ""),
      officialRole: String(formData.get("officialRole") || ""),
      genre: String(formData.get("genre") || ""),
      language: String(formData.get("language") || ""),
      year: String(formData.get("year") || ""),
      credits: String(formData.get("credits") || ""),
      synopsis: String(formData.get("synopsis") || ""),
      trailerUrl: String(formData.get("trailerUrl") || ""),
      posterUrl: String(formData.get("posterUrl") || ""),
      status: String(formData.get("status") || "DRAFT"),
      featured,
      featuredOrder: Number(formData.get("featuredOrder") || 0),
      sortOrder: Number(formData.get("sortOrder") || 0),
      seoTitle: String(formData.get("seoTitle") || ""),
      seoDescription: String(formData.get("seoDescription") || ""),
    };

    try {
      const res = await fetch(film ? `/api/admin/films/${film.id}` : "/api/admin/films", {
        method: film ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not save the film.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/films");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Slug *" name="slug" defaultValue={film?.slug} required />
        <Field label="Title *" name="title" defaultValue={film?.title} required />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] text-black/60 mb-1" htmlFor="projectType">
            Project Type *
          </label>
          <select
            id="projectType"
            name="projectType"
            defaultValue={film?.projectType || "Feature Film"}
            className="w-full border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black"
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Official Role * (exact on-screen credit)"
          name="officialRole"
          defaultValue={film?.officialRole}
          required
          placeholder="Associate Director"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Genre *" name="genre" defaultValue={film?.genre} required />
        <Field label="Language *" name="language" defaultValue={film?.language} required />
        <Field label="Year" name="year" defaultValue={film?.year || undefined} placeholder="Leave blank if unannounced" />
      </div>

      <div>
        <label className="block text-[12px] text-black/60 mb-1" htmlFor="credits">
          Credits * (e.g. &quot;Directed by ...&quot;)
        </label>
        <textarea
          id="credits"
          name="credits"
          rows={2}
          defaultValue={film?.credits}
          required
          className="w-full border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="block text-[12px] text-black/60 mb-1" htmlFor="synopsis">
          Synopsis
        </label>
        <textarea
          id="synopsis"
          name="synopsis"
          rows={3}
          defaultValue={film?.synopsis || undefined}
          className="w-full border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Poster image URL" name="posterUrl" defaultValue={film?.posterUrl || undefined} placeholder="/images/films/example.jpeg" />
        <Field label="Trailer URL (YouTube)" name="trailerUrl" defaultValue={film?.trailerUrl || undefined} />
      </div>

      <div>
        <label className="block text-[12px] text-black/60 mb-1" htmlFor="status">
          Status *
        </label>
        <select
          id="status"
          name="status"
          defaultValue={film?.status || "DRAFT"}
          className="w-full sm:w-64 border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="border border-black/10 p-4">
        <p className="text-[12px] tracking-[0.08em] uppercase text-black/50 mb-3">Featured</p>
        <label className="flex items-center gap-2 text-[13px] mb-3">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-black" />
          Featured on homepage &amp; Films page
        </label>
        {featured && (
          <Field
            label="Featured Order (lower shows first)"
            name="featuredOrder"
            type="number"
            defaultValue={String(film?.featuredOrder ?? 0)}
          />
        )}
      </div>

      <Field label="Sort order (lower shows first in listings)" name="sortOrder" type="number" defaultValue={String(film?.sortOrder ?? 0)} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="SEO title" name="seoTitle" defaultValue={film?.seoTitle || undefined} />
        <Field label="SEO description" name="seoDescription" defaultValue={film?.seoDescription || undefined} />
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-red-600">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="bg-black text-white text-[13px] tracking-[0.08em] uppercase px-6 py-3 disabled:opacity-60">
        {submitting ? "Saving…" : film ? "Save Changes" : "Create Film"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] text-black/60 mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black"
      />
    </div>
  );
}
