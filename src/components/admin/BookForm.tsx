"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookRecord, BookStatus } from "@/lib/booksRepo";
import MediaField from "@/components/admin/media/MediaField";
import MediaRowPicker from "@/components/admin/media/MediaRowPicker";
import ListEditor from "@/components/admin/ListEditor";

const STATUSES: BookStatus[] = ["DRAFT", "COMING_SOON", "PRE_ORDER", "PUBLISHED", "OUT_OF_STOCK", "ARCHIVED"];

interface GalleryDraft {
  imageUrl: string;
  caption: string;
}

interface VariantDraft {
  id?: number;
  format: string;
  sku: string;
  priceINR: string;
  stock: string;
  lowStockThreshold: string;
  weightGrams: string;
  length: string;
  breadth: string;
  height: string;
}

function toDraftVariants(book?: BookRecord): VariantDraft[] {
  if (!book || book.variants.length === 0) {
    return [{ format: "", sku: "", priceINR: "", stock: "", lowStockThreshold: "5", weightGrams: "", length: "", breadth: "", height: "" }];
  }
  return book.variants.map((v) => ({
    id: v.id,
    format: v.format,
    sku: v.sku || "",
    priceINR: String(v.priceINR),
    stock: String(v.stock),
    lowStockThreshold: String(v.lowStockThreshold),
    weightGrams: String(v.weightGrams),
    length: String(v.dimensionsCm.length),
    breadth: String(v.dimensionsCm.breadth),
    height: String(v.dimensionsCm.height),
  }));
}

export default function BookForm({ book }: { book?: BookRecord }) {
  const router = useRouter();
  const [variants, setVariants] = useState<VariantDraft[]>(toDraftVariants(book));
  const [gallery, setGallery] = useState<GalleryDraft[]>(
    book?.gallery.map((g) => ({ imageUrl: g.imageUrl, caption: g.caption || "" })) || [],
  );
  const [personalisationAvailable, setPersonalisationAvailable] = useState(book?.personalisationAvailable ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateVariant(index: number, field: keyof VariantDraft, value: string) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { format: "", sku: "", priceINR: "", stock: "", lowStockThreshold: "5", weightGrams: "", length: "", breadth: "", height: "" },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      slug: String(formData.get("slug") || ""),
      title: String(formData.get("title") || ""),
      genre: String(formData.get("genre") || ""),
      status: String(formData.get("status") || "DRAFT"),
      cover: String(formData.get("cover") || ""),
      gallery: gallery.filter((g) => g.imageUrl.trim()),
      excerpt: String(formData.get("excerpt") || ""),
      description: String(formData.get("description") || "")
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
      discover: String(formData.get("discover") || "")
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
      signedCopyAvailable: formData.get("signedCopyAvailable") === "on",
      personalisationAvailable: formData.get("personalisationAvailable") === "on",
      personalisationCharLimit: Number(formData.get("personalisationCharLimit") || 200),
      sortOrder: Number(formData.get("sortOrder") || 0),
      seoTitle: String(formData.get("seoTitle") || ""),
      seoDescription: String(formData.get("seoDescription") || ""),
      variants: variants.map((v) => ({
        id: v.id,
        format: v.format,
        sku: v.sku,
        priceINR: Number(v.priceINR),
        stock: Number(v.stock),
        lowStockThreshold: Number(v.lowStockThreshold),
        weightGrams: Number(v.weightGrams),
        dimensionsCm: { length: Number(v.length), breadth: Number(v.breadth), height: Number(v.height) },
      })),
    };

    try {
      const res = await fetch(book ? `/api/admin/books/${book.id}` : "/api/admin/books", {
        method: book ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not save the book.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/books");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Slug *" name="slug" defaultValue={book?.slug} required />
        <Field label="Title *" name="title" defaultValue={book?.title} required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Genre *" name="genre" defaultValue={book?.genre} required />
        <div>
          <label className="block text-[12px] text-black/60 mb-1" htmlFor="status">
            Status *
          </label>
          <select
            id="status"
            name="status"
            defaultValue={book?.status || "DRAFT"}
            className="w-full border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <MediaField name="cover" label="Cover image" defaultValue={book?.cover} accept="image" />

      <ListEditor
        title="Gallery (mockups / additional images for the detail page)"
        items={gallery}
        onChange={setGallery}
        addLabel="+ Add image"
        renderRow={(item, update) => (
          <>
            <MediaRowPicker
              accept="image"
              value={item.imageUrl}
              onChange={(url) => update({ ...item, imageUrl: url })}
              placeholder="/images/books/mockup-1.jpeg"
            />
            <input
              type="text"
              value={item.caption}
              onChange={(e) => update({ ...item, caption: e.target.value })}
              placeholder="Caption (optional)"
              className="w-40 border border-black/20 px-2 py-1.5 text-[13px] outline-none focus:border-black"
            />
          </>
        )}
        empty={() => ({ imageUrl: "", caption: "" })}
      />

      <div>
        <label className="block text-[12px] text-black/60 mb-1" htmlFor="excerpt">
          Excerpt *
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={book?.excerpt}
          required
          className="w-full border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="block text-[12px] text-black/60 mb-1" htmlFor="description">
          Description (one paragraph per line) *
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={book?.description.join("\n")}
          required
          className="w-full border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="block text-[12px] text-black/60 mb-1" htmlFor="discover">
          &quot;What you&apos;ll discover&quot; bullets (one per line, optional)
        </label>
        <textarea
          id="discover"
          name="discover"
          rows={3}
          defaultValue={book?.discover?.join("\n")}
          className="w-full border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" name="signedCopyAvailable" defaultChecked={book?.signedCopyAvailable} className="accent-black" />
          Signed copy option available
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            name="personalisationAvailable"
            defaultChecked={book?.personalisationAvailable}
            onChange={(e) => setPersonalisationAvailable(e.target.checked)}
            className="accent-black"
          />
          Personalisation option available
        </label>
      </div>
      {personalisationAvailable && (
        <Field
          label="Personalisation message character limit"
          name="personalisationCharLimit"
          type="number"
          defaultValue={String(book?.personalisationCharLimit ?? 200)}
        />
      )}

      <Field label="Sort order (lower shows first)" name="sortOrder" type="number" defaultValue={String(book?.sortOrder ?? 0)} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="SEO title" name="seoTitle" defaultValue={book?.seoTitle || undefined} />
        <Field label="SEO description" name="seoDescription" defaultValue={book?.seoDescription || undefined} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] tracking-[0.08em] uppercase text-black/50">Variants *</p>
          <button type="button" onClick={addVariant} className="text-[12px] text-black/60 hover:text-black underline">
            + Add variant
          </button>
        </div>
        <div className="space-y-4">
          {variants.map((v, i) => (
            <div key={i} className="border border-black/10 p-4 grid sm:grid-cols-4 gap-3">
              <VariantField label="Format" value={v.format} onChange={(val) => updateVariant(i, "format", val)} placeholder="Paperback" />
              <VariantField label="SKU" value={v.sku} onChange={(val) => updateVariant(i, "sku", val)} />
              <VariantField label="Price (INR)" value={v.priceINR} onChange={(val) => updateVariant(i, "priceINR", val)} type="number" />
              <VariantField label="Stock" value={v.stock} onChange={(val) => updateVariant(i, "stock", val)} type="number" />
              <VariantField
                label="Low stock alert"
                value={v.lowStockThreshold}
                onChange={(val) => updateVariant(i, "lowStockThreshold", val)}
                type="number"
              />
              <VariantField label="Weight (g)" value={v.weightGrams} onChange={(val) => updateVariant(i, "weightGrams", val)} type="number" />
              <VariantField label="Length (cm)" value={v.length} onChange={(val) => updateVariant(i, "length", val)} type="number" />
              <VariantField label="Breadth (cm)" value={v.breadth} onChange={(val) => updateVariant(i, "breadth", val)} type="number" />
              <VariantField label="Height (cm)" value={v.height} onChange={(val) => updateVariant(i, "height", val)} type="number" />
              {variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(i)} className="text-[12px] text-red-600 self-end">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-red-600">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="bg-black text-white text-[13px] tracking-[0.08em] uppercase px-6 py-3 disabled:opacity-60">
        {submitting ? "Saving…" : book ? "Save Changes" : "Create Book"}
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

function VariantField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] text-black/50 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-black/20 px-2 py-1.5 text-[13px] outline-none focus:border-black"
      />
    </div>
  );
}
