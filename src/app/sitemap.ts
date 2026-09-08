import type { MetadataRoute } from "next";
import { films } from "@/content/films";
import { getPublishedBooksPublic } from "@/lib/booksRepo";
import { siteUrl, isStaging } from "@/lib/seo";

// Reads books from the database, which is only reachable from the live
// server (127.0.0.1), not the GitHub Actions build runner — must render
// per-request rather than being prerendered at build time.
export const dynamic = "force-dynamic";

const staticRoutes = [
  "",
  "/director",
  "/films",
  "/screenwriting",
  "/editing",
  "/author",
  "/books",
  "/about",
  "/press",
  "/gallery",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/shipping-delivery",
  "/refund-cancellation",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // On staging this still enumerates every route, but robots.ts + per-page
  // noindex metadata keep it out of search engines until it points at
  // production.
  if (isStaging) return [];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
  }));

  for (const film of films) {
    entries.push({ url: `${siteUrl}/films/${film.slug}`, lastModified: now });
  }
  const books = await getPublishedBooksPublic();
  for (const book of books) {
    entries.push({ url: `${siteUrl}/books/${book.slug}`, lastModified: now });
  }

  return entries;
}
