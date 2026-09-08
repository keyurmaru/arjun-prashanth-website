import Link from "next/link";
import { site, footerLegalNav } from "@/content/site";

const columns = [
  {
    heading: "Explore",
    links: [
      { label: "Director", href: "/director" },
      { label: "Films", href: "/films" },
      { label: "Screenwriting", href: "/screenwriting" },
      { label: "Editing", href: "/editing" },
    ],
  },
  {
    heading: "Author",
    links: [
      { label: "Author", href: "/author" },
      { label: "Books", href: "/books" },
      { label: "Press", href: "/press" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-800">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-12 lg:gap-8">
          <div>
            <p className="font-cormorant text-2xl text-ivory-100">{site.name}</p>
            <p className="font-inter text-[11px] tracking-[0.1em] uppercase text-muted mt-2">{site.role}</p>
            <p className="font-cormorant italic text-lg text-bronze-light mt-5 max-w-sm">&ldquo;{site.tagline}&rdquo;</p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="font-inter text-[10px] tracking-[0.12em] uppercase text-muted hover:text-bronze transition-colors"
              >
                Instagram
              </a>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-inter text-[10px] tracking-[0.12em] uppercase text-muted hover:text-bronze transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <p className="font-inter text-[10px] tracking-[0.16em] uppercase text-bronze mb-4">{col.heading}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-inter text-[13px] text-muted hover:text-ivory-100 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-dark-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <p className="font-inter text-[11px] text-muted">© {new Date().getFullYear()} Arjun Prashanth Rao. All Rights Reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLegalNav.map((l) => (
              <Link key={l.href} href={l.href} className="font-inter text-[11px] text-muted hover:text-ivory-100 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
