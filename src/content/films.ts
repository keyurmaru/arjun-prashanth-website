export interface Film {
  slug: string;
  title: string;
  role: string;
  genre: string;
  language: string;
  year: string | null;
  credits: string;
  synopsis: string | null;
  trailerUrl: string | null;
  posterAvailable: boolean;
}

// Verified against the production database plus the 2026-09 content handoff
// (MD Files/Arjun_Prashanth_Website_Content_Data_Final.md), which supplied
// genre and short public synopses that were previously left unverified.
// Fields still unverified (poster, cast/crew) stay null / posterAvailable:
// false rather than guessed.
export const films: Film[] = [
  {
    slug: "animal",
    title: "Animal",
    role: "Associate Director",
    genre: "Action Crime Drama",
    language: "Hindi",
    year: "2023",
    credits: "Directed by Sandeep Reddy Vanga.",
    synopsis:
      "A volatile father-son relationship drives a man into obsession, violence and moral collapse as loyalty to family transforms into something increasingly destructive.",
    trailerUrl: null,
    posterAvailable: false,
  },
  {
    slug: "gaddalakonda-ganesh",
    title: "Gaddalakonda Ganesh",
    role: "Associate Director & Screenwriting Contribution",
    genre: "Crime / Action Drama",
    language: "Telugu",
    year: "2019",
    credits: "Directed by Harish Shankar.",
    synopsis:
      "A filmmaker enters the world of a feared gangster while researching a story, and the encounter turns into a collision of ambition, violence, cinema and identity.",
    trailerUrl: null,
    posterAvailable: false,
  },
  {
    slug: "aravinda-sametha-veera-raghava",
    title: "Aravinda Sametha Veera Raghava",
    role: "Assistant Director",
    genre: "Action Drama",
    language: "Telugu",
    year: "2018",
    credits: "Directed by Trivikram Srinivas. Starring N. T. Rama Rao Jr. and Pooja Hegde.",
    synopsis:
      "A young heir returns to a world shaped by faction violence and inherited revenge, and begins searching for a way to end a cycle that has consumed generations.",
    trailerUrl: null,
    posterAvailable: false,
  },
  {
    slug: "yuddham-sharanam",
    title: "Yuddham Sharanam",
    role: "Assistant Director",
    genre: "Action Thriller / Drama",
    language: "Telugu",
    year: "2017",
    credits: "Directed by Krishna Marimuthu. Starring Naga Chaitanya.",
    synopsis:
      "A young man is pulled into a violent conflict that threatens his family, forcing him to confront danger, loss and the consequences of a criminal network.",
    trailerUrl: null,
    posterAvailable: false,
  },
  {
    slug: "ustad-bhagat-singh",
    title: "Ustad Bhagat Singh",
    role: "Associate Director & Screenwriting Contribution",
    genre: "Commercial Action Drama",
    language: "Telugu",
    // Upcoming — do not invent a release year or status; use only the
    // latest officially announced public information.
    year: null,
    credits: "Directed by Harish Shankar.",
    synopsis:
      "A high-energy Telugu action drama built around a strong central protagonist and mainstream commercial storytelling.",
    trailerUrl: null,
    posterAvailable: false,
  },
  {
    slug: "vidhatri",
    // Exact required spelling — do not vary case anywhere this title appears.
    title: "VIDHATRI",
    role: "Director (Short Film)",
    genre: "Short Film",
    language: "Telugu",
    year: null,
    credits: "Directed by Arjun Prashanth.",
    synopsis: "Short film directed by Arjun Prashanth.",
    trailerUrl: "https://www.youtube.com/watch?v=Zy66dwr74Po",
    posterAvailable: false,
  },
];

export function getFilmBySlug(slug: string): Film | undefined {
  return films.find((f) => f.slug === slug);
}
