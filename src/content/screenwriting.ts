export interface ScreenwritingProject {
  title: string;
  genre: string;
  logline: string;
  status: string;
}

// Public-safe titles/loglines only, per the 2026-09 content handoff (MD
// Files/Arjun_Prashanth_Website_Content_Data_Final.md). Twists, casting,
// budgets and other confidential detail are deliberately not included here
// or anywhere on the site. Unannounced projects (Che Guevara, Orugullu,
// etc.) are intentionally excluded from this list — they stay private
// unless separately approved for public display.
export const screenwritingProjects: ScreenwritingProject[] = [
  {
    title: "Because... It's You",
    genre: "Contemporary Emotional Love Drama",
    logline:
      "Two emotionally complete people discover that lasting love is not about being needed, but about continuing to choose each other as their lives and identities evolve.",
    status: "In Development",
  },
  {
    title: "Six Hours",
    genre: "Courtroom / Crime Thriller",
    logline:
      "With only six hours left before a death-row execution, a psychologist races to expose the truth behind a deepfake-linked honour killing and save the condemned man.",
    status: "In Development",
  },
  {
    title: "Swathi",
    genre: "Investigative Serial-Killer Thriller",
    logline:
      "A CID officer hunts a killer targeting women named Swathi, until the investigation reveals that the national panic is hiding a deeply personal revenge.",
    status: "In Development",
  },
  {
    title: "Saakshyam: 404",
    genre: "Legal / Evidence Thriller Series",
    logline:
      "A court evidence archivist discovers that missing and manipulated evidence can rewrite justice itself, pulling the investigation into a system designed to erase inconvenient truth.",
    status: "In Development",
  },
  {
    title: "VIP Floor",
    genre: "Contained Crime Thriller",
    logline:
      "A couple trapped inside a luxury hotel's sealed VIP floor are drawn into a night of criminal power, betrayal and survival where every escape route is controlled by someone else.",
    status: "In Development",
  },
];
