export const site = {
  name: "Arjun Prashanth",
  title: "Arjun Prashanth",
  role: "Film Director | Screenwriter | Editor | Author",
  tagline: "Stories that stay beyond the final frame and the last page.",
  // Verified, currently live on arjunprashanth.com — do not change without
  // re-verifying against the production Contact page.
  email: "filmmaker@arjunprashanth.com",
  legalEmail: "author@arjunprashanth.com",
  whatsapp: "+91 7353055130",
  whatsappHref: "https://wa.me/917353055130",
  instagram: "https://instagram.com/thearjunprao",
  productionUrl: "https://arjunprashanth.com",
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Director", href: "/director" },
  { label: "Films", href: "/films" },
  { label: "Screenwriting", href: "/screenwriting" },
  { label: "Editing", href: "/editing" },
  { label: "Author", href: "/author" },
  { label: "Books", href: "/books" },
  { label: "About", href: "/about" },
  { label: "Press", href: "/press" },
  { label: "Contact", href: "/contact" },
];

export const footerLegalNav: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund & Cancellation", href: "/refund-cancellation" },
  { label: "Shipping & Delivery", href: "/shipping-delivery" },
];

// Verified from the live Director/About pages — Arjun's stated primary story
// worlds / screenwriting interests. Not invented.
export const storyWorlds: string[] = [
  "Crime drama",
  "Investigative thrillers",
  "Courtroom / legal drama",
  "Action and psychological conflict",
  "Contemporary relationships",
  "Female-centric narratives",
  "Emotionally driven commercial cinema",
];

export const screenwritingAreas: string[] = [
  "Feature-film screenplays",
  "Story and screenplay development",
  "Crime / investigative thrillers",
  "Courtroom and legal drama",
  "Action crime",
  "Psychological conflict",
  "Contemporary relationships",
  "Female-centric narratives",
  "Emotionally driven commercial cinema",
  "Long-form / series development",
];

export const aboutMilestones: string[] = [
  "Formal filmmaking training — United Kingdom",
  "Professional film experience",
  "Independent filmmaking and original work",
  "Original screenwriting development",
  "Published author — The Line That Holds",
  "Continuing film and literary projects in development",
];
