// One-time seed of the six verified film credits (previously the static
// source of truth in src/content/films.ts, now superseded by the films
// table) into the database. Safe to re-run — skips a slug that already
// exists rather than duplicating it.
//
// Run from the project root with DB_* env vars set:
//   DB_HOST=127.0.0.1 DB_NAME=... DB_USER=... DB_PASSWORD=... node scripts/seed-films.mjs

import mysql from "mysql2/promise";

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  console.error("Set DB_HOST, DB_NAME, DB_USER, DB_PASSWORD in the environment first.");
  process.exit(1);
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT ? Number(DB_PORT) : 3306,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

// Verified against the production database plus the 2026-09 content
// handoff — see src/content/films.ts (kept as historical reference; no
// longer imported by the app at runtime). featured/featuredOrder below
// reflects the "Featured Film Credits" set already shown on the homepage
// (previously the first 4 array entries — same films, now explicit).
const films = [
  {
    slug: "animal",
    title: "Animal",
    projectType: "Associate Direction",
    officialRole: "Associate Director",
    genre: "Action Crime Drama",
    language: "Hindi",
    year: "2023",
    credits: "Directed by Sandeep Reddy Vanga.",
    synopsis:
      "A volatile father-son relationship drives a man into obsession, violence and moral collapse as loyalty to family transforms into something increasingly destructive.",
    trailerUrl: null,
    featured: true,
    featuredOrder: 1,
    sortOrder: 0,
  },
  {
    slug: "gaddalakonda-ganesh",
    title: "Gaddalakonda Ganesh",
    projectType: "Associate Direction",
    officialRole: "Associate Director & Screenwriting Contribution",
    genre: "Crime / Action Drama",
    language: "Telugu",
    year: "2019",
    credits: "Directed by Harish Shankar.",
    synopsis:
      "A filmmaker enters the world of a feared gangster while researching a story, and the encounter turns into a collision of ambition, violence, cinema and identity.",
    trailerUrl: null,
    featured: true,
    featuredOrder: 2,
    sortOrder: 1,
  },
  {
    slug: "aravinda-sametha-veera-raghava",
    title: "Aravinda Sametha Veera Raghava",
    projectType: "Assistant Direction",
    officialRole: "Assistant Director",
    genre: "Action Drama",
    language: "Telugu",
    year: "2018",
    credits: "Directed by Trivikram Srinivas. Starring N. T. Rama Rao Jr. and Pooja Hegde.",
    synopsis:
      "A young heir returns to a world shaped by faction violence and inherited revenge, and begins searching for a way to end a cycle that has consumed generations.",
    trailerUrl: null,
    featured: true,
    featuredOrder: 3,
    sortOrder: 2,
  },
  {
    slug: "yuddham-sharanam",
    title: "Yuddham Sharanam",
    projectType: "Assistant Direction",
    officialRole: "Assistant Director",
    genre: "Action Thriller / Drama",
    language: "Telugu",
    year: "2017",
    credits: "Directed by Krishna Marimuthu. Starring Naga Chaitanya.",
    synopsis:
      "A young man is pulled into a violent conflict that threatens his family, forcing him to confront danger, loss and the consequences of a criminal network.",
    trailerUrl: null,
    featured: true,
    featuredOrder: 4,
    sortOrder: 3,
  },
  {
    slug: "ustad-bhagat-singh",
    title: "Ustad Bhagat Singh",
    projectType: "Associate Direction",
    officialRole: "Associate Director & Screenwriting Contribution",
    genre: "Commercial Action Drama",
    language: "Telugu",
    // Upcoming — do not invent a release year or status; use only the
    // latest officially announced public information.
    year: null,
    credits: "Directed by Harish Shankar.",
    synopsis:
      "A high-energy Telugu action drama built around a strong central protagonist and mainstream commercial storytelling.",
    trailerUrl: null,
    featured: false,
    featuredOrder: 0,
    sortOrder: 4,
  },
  {
    slug: "vidhatri",
    // Exact required spelling — do not vary case anywhere this title appears.
    title: "VIDHATRI",
    projectType: "Direction",
    officialRole: "Director (Short Film)",
    genre: "Short Film",
    language: "Telugu",
    year: null,
    credits: "Directed by Arjun Prashanth.",
    synopsis: "Short film directed by Arjun Prashanth.",
    trailerUrl: "https://www.youtube.com/watch?v=Zy66dwr74Po",
    featured: false,
    featuredOrder: 0,
    sortOrder: 5,
  },
];

for (const film of films) {
  const [existing] = await pool.execute("SELECT id FROM films WHERE slug = ?", [film.slug]);
  if (existing.length > 0) {
    console.log(`Skipping "${film.slug}" — already exists.`);
    continue;
  }

  await pool.execute(
    `INSERT INTO films
      (slug, title, project_type, official_role, genre, language, year, credits, synopsis, trailer_url,
       status, featured, featured_order, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?)`,
    [
      film.slug,
      film.title,
      film.projectType,
      film.officialRole,
      film.genre,
      film.language,
      film.year,
      film.credits,
      film.synopsis,
      film.trailerUrl,
      film.featured ? 1 : 0,
      film.featuredOrder,
      film.sortOrder,
    ],
  );
  console.log(`Inserted "${film.slug}".`);
}

await pool.end();
