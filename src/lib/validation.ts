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
