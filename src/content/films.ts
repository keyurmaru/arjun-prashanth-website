export interface Film {
  slug: string;
  title: string;
  role: string;
  language: string;
  year: string | null;
  credits: string;
  synopsis: string | null;
  trailerUrl: string | null;
  posterAvailable: boolean;
}

// Verified directly from the production database (apr_film custom post type
// and its custom fields). Nothing here is invented — fields left unverified
// in the source (year, synopsis, cast/crew, poster) are surfaced as null /
// posterAvailable: false rather than guessed.
export const films: Film[] = [
  {
    slug: "animal",
    title: "Animal",
    role: "Associate Director",
    language: "Hindi",
    year: "2023",
    credits: "Directed by Sandeep Reddy Vanga.",
    synopsis: null,
    trailerUrl: null,
    posterAvailable: false,
  },
  {
    slug: "gaddalakonda-ganesh",
    title: "Gaddalakonda Ganesh",
    role: "Associate Director & Screenwriting Contribution",
    language: "Telugu",
    year: "2019",
    credits: "Directed by Harish Shankar.",
    synopsis: null,
    trailerUrl: null,
    posterAvailable: false,
  },
  {
    slug: "aravinda-sametha-veera-raghava",
    title: "Aravinda Sametha Veera Raghava",
    role: "Assistant Director",
    language: "Telugu",
    year: "2018",
    credits: "Directed by Trivikram Srinivas. Starring N. T. Rama Rao Jr. and Pooja Hegde.",
    synopsis: null,
    trailerUrl: null,
    posterAvailable: false,
  },
  {
    slug: "yuddham-sharanam",
    title: "Yuddham Sharanam",
    role: "Assistant Director",
    language: "Telugu",
    year: "2017",
    credits: "Directed by Krishna Marimuthu. Starring Naga Chaitanya.",
    synopsis: null,
    trailerUrl: null,
    posterAvailable: false,
  },
  {
    slug: "ustad-bhagat-singh",
    title: "Ustad Bhagat Singh",
    role: "Associate Director & Screenwriting Contribution",
    language: "Telugu",
    year: null,
    credits: "Directed by Harish Shankar.",
    synopsis: null,
    trailerUrl: null,
    posterAvailable: false,
  },
  {
    slug: "vidhatri",
    title: "Vidhatri",
    role: "Director (Short Film)",
    language: "Telugu",
    year: null,
    credits: "Directed by Arjun Prashanth.",
    synopsis: null,
    trailerUrl: "https://www.youtube.com/watch?v=Zy66dwr74Po",
    posterAvailable: false,
  },
];

export function getFilmBySlug(slug: string): Film | undefined {
  return films.find((f) => f.slug === slug);
}
