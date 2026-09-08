import type { MetadataRoute } from "next";
import { films } from "@/content/films";
import { books } from "@/content/books";
import { siteUrl } from "@/lib/seo";

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

export default function sitemap(): MetadataRoute.Sitemap {
  // On staging this still enumerates every route, but robots.ts + per-page
  // noindex metadata keep it out of search engines until it points at
  // production.
  const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === "true";
  if (isStaging) return [];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
  }));

  for (const film of films) {
    entries.push({ url: `${siteUrl}/films/${film.slug}`, lastModified: now });
  }
  for (const book of books) {
    entries.push({ url: `${siteUrl}/books/${book.slug}`, lastModified: now });
  }

  return entries;
}
