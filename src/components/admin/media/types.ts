export interface MediaRecord {
  id: number;
  type: "image" | "video";
  url: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  title: string | null;
  altText: string | null;
  caption: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string | null;
  credit: string | null;
  rightsOwner: string | null;
  rightsStatus: "NOT_VERIFIED" | "APPROVED_FOR_PUBLICATION" | "RESTRICTED";
  category: string | null;
  projectTag: string | null;
  tags: string | null;
  featured: boolean;
  featuredOrder: number;
  status: "DRAFT" | "APPROVED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}
