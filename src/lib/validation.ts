import { z } from "zod";

// Shared low-level constraints
const name = z.string().trim().min(2, "Please enter your full name.").max(120);
const email = z.string().trim().email("Please enter a valid email address.").max(200);
const phone = z
  .string()
  .trim()
  .min(7, "Please include a valid mobile number with country code.")
  .max(20)
  .regex(/^\+?[0-9()\-\s]+$/, "Please use digits, spaces, +, - or () only.");
const consent = z.literal(true, { errorMap: () => ({ message: "Please confirm consent to be contacted." }) });

// Honeypot + timing fields present on every form, used for spam detection
// rather than validation failure (a bot filling the honeypot, or submitting
// implausibly fast, is silently accepted and dropped server-side).
const antiSpamFields = {
  website: z.string().max(200).optional().default(""),
  formRenderedAt: z.number().optional(),
  turnstileToken: z.string().optional(),
};

export const contactFormSchema = z.object({
  name,
  email,
  phone: phone.optional().or(z.literal("")),
  enquiryType: z.enum([
    "Film / Direction",
    "Screenwriting / Story",
    "Editing",
    "Publishing / Literary",
    "Media",
    "Speaking",
    "Adaptation Rights",
    "General / Collaboration",
  ]),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10, "Please add a little more detail.").max(3000),
  consent,
  ...antiSpamFields,
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const screenwritingFormSchema = z.object({
  fullName: name,
  companyProductionHouse: z.string().trim().max(150).optional().or(z.literal("")),
  roleDesignation: z.string().trim().max(120).optional().or(z.literal("")),
  mobileNumber: phone,
  email,
  preferredContact: z.enum(["Phone", "WhatsApp", "Email"]),
  projectFormat: z.enum(["Feature Film", "Web Series", "Short Film", "Other"]),
  genre: z.string().trim().min(2).max(120),
  language: z.string().trim().max(60).optional().or(z.literal("")),
  logline: z.string().trim().min(20, "Please provide a short concept or logline (at least 20 characters).").max(600),
  expectedTimeline: z.string().trim().max(120).optional().or(z.literal("")),
  consent,
  ...antiSpamFields,
});

export type ScreenwritingFormValues = z.infer<typeof screenwritingFormSchema>;

export const checkoutSchema = z.object({
  name,
  email,
  phone: phone,
  line1: z.string().trim().min(5, "Please enter your full address.").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit PIN code."),
  country: z.string().trim().min(2).max(60).default("India"),
  items: z
    .array(
      z.object({
        bookSlug: z.string().min(1),
        format: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
        signed: z.boolean().optional().default(false),
        personalisationMessage: z.string().trim().max(500).optional(),
      }),
    )
    .min(1, "Your cart is empty."),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const dimensionsSchema = z.object({
  length: z.number().positive(),
  breadth: z.number().positive(),
  height: z.number().positive(),
});

export const bookVariantInputSchema = z.object({
  id: z.number().optional(),
  format: z.string().trim().min(1).max(60),
  sku: z.string().trim().max(80).optional().or(z.literal("")),
  priceINR: z.number().positive(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0),
  weightGrams: z.number().positive(),
  dimensionsCm: dimensionsSchema,
});

export const bookInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(1).max(200),
  genre: z.string().trim().min(1).max(100),
  status: z.enum(["DRAFT", "COMING_SOON", "PRE_ORDER", "PUBLISHED", "OUT_OF_STOCK", "ARCHIVED"]),
  cover: z.string().trim().min(1).max(300),
  gallery: z
    .array(
      z.object({
        imageUrl: z.string().trim().min(1).max(300),
        caption: z.string().trim().max(200).optional().or(z.literal("")),
      }),
    )
    .max(50)
    .optional(),
  excerpt: z.string().trim().min(1).max(1000),
  description: z.array(z.string().trim().min(1)).min(1),
  discover: z.array(z.string().trim().min(1)).optional(),
  signedCopyAvailable: z.boolean(),
  personalisationAvailable: z.boolean(),
  personalisationCharLimit: z.number().int().min(0).max(2000),
  sortOrder: z.number().int(),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  variants: z.array(bookVariantInputSchema).min(1, "At least one variant is required."),
});

export type BookInputValues = z.infer<typeof bookInputSchema>;

export const filmInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(1).max(200),
  projectType: z.enum(["Feature Film", "Short Film", "Direction", "Associate Direction", "Assistant Direction", "Editing"]),
  officialRole: z.string().trim().min(1).max(150),
  genre: z.string().trim().min(1).max(100),
  language: z.string().trim().min(1).max(60),
  year: z.string().trim().max(20).optional().or(z.literal("")),
  credits: z.string().trim().min(1).max(1000),
  synopsis: z.string().trim().max(2000).optional().or(z.literal("")),
  posterUrl: z.string().trim().max(300).optional().or(z.literal("")),
  gallery: z
    .array(
      z.object({
        imageUrl: z.string().trim().min(1).max(300),
        caption: z.string().trim().max(200).optional().or(z.literal("")),
      }),
    )
    .max(50),
  videos: z
    .array(
      z.object({
        videoUrl: z.string().trim().min(1).max(300),
        title: z.string().trim().max(200).optional().or(z.literal("")),
        videoType: z
          .enum(["Trailer", "Teaser", "Showreel", "Behind the Scenes", "Interview", "Official Video", "Clip"])
          .optional(),
        posterUrl: z.string().trim().max(300).optional().or(z.literal("")),
      }),
    )
    .max(20),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean(),
  featuredOrder: z.number().int().min(0),
  sortOrder: z.number().int(),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
});

export type FilmInputValues = z.infer<typeof filmInputSchema>;

export const adminUserInputSchema = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(10, "Password must be at least 10 characters.").max(200),
  role: z.enum(["SUPER_ADMIN", "CONTENT_MANAGER", "ORDER_MANAGER", "VIEWER"]),
});

export type AdminUserInputValues = z.infer<typeof adminUserInputSchema>;

export const mediaUpdateSchema = z.object({
  title: z.string().trim().max(200).optional().or(z.literal("")),
  altText: z.string().trim().max(300).optional().or(z.literal("")),
  caption: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  keywords: z.string().trim().max(300).optional().or(z.literal("")),
  credit: z.string().trim().max(200).optional().or(z.literal("")),
  rightsOwner: z.string().trim().max(200).optional().or(z.literal("")),
  rightsStatus: z.enum(["NOT_VERIFIED", "APPROVED_FOR_PUBLICATION", "RESTRICTED"]).optional(),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  projectTag: z.string().trim().max(120).optional().or(z.literal("")),
  tags: z.string().trim().max(300).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  featuredOrder: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "APPROVED", "ARCHIVED"]).optional(),
});

export type MediaUpdateValues = z.infer<typeof mediaUpdateSchema>;

export const mediaBulkUpdateSchema = mediaUpdateSchema.extend({
  ids: z.array(z.number().int()).min(1).max(200),
});
