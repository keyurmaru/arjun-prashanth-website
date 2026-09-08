"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { useCart } from "@/context/CartContext";

const primaryLinks = [
  { label: "Director", href: "/director" },
  { label: "Films", href: "/films" },
  { label: "Screenwriting", href: "/screenwriting" },
  { label: "Editing", href: "/editing" },
  { label: "Author", href: "/author" },
  { label: "Books", href: "/books" },
  { label: "About", href: "/about" },
  { label: "Press", href: "/press" },
];

const mobileExtras = [
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();

  // Close the mobile menu on navigation without an effect: derive it during
  // render by comparing against the previous pathname (React's documented
  // pattern for "adjusting state when a prop changes" — avoids the extra
  // render pass an effect-based reset would cause).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !menuOpen;
  const allLinks = [...primaryLinks, ...mobileExtras];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: transparent ? "transparent" : "rgba(13,15,16,0.97)",
          borderBottom: transparent ? "none" : "1px solid rgba(41,43,45,0.8)",
          backdropFilter: transparent ? "none" : "blur(12px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-[60px] xl:h-[72px] flex items-center justify-between gap-6">
          <Link
            href="/"
            className="font-inter font-medium tracking-[0.14em] text-[11px] uppercase text-ivory-100 hover:text-bronze transition-colors duration-300 shrink-0"
          >
            {site.name}
          </Link>

          <nav className="hidden xl:flex items-center gap-6" aria-label="Primary navigation">
            {primaryLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`font-inter text-[10px] tracking-[0.13em] uppercase transition-colors duration-300 relative group ${
                    active ? "text-ivory-100" : "text-muted hover:text-ivory-100"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-bronze transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-8 h-8 text-ivory-100 hover:text-bronze transition-colors duration-300"
              aria-label={`Cart${totalItems > 0 ? ` (${totalItems} item${totalItems === 1 ? "" : "s"})` : ""}`}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6h15l-1.5 9h-12z" />
                <path d="M6 6L4.5 3H2" />
                <circle cx="9.5" cy="19" r="1.25" fill="currentColor" stroke="none" />
                <circle cx="17.5" cy="19" r="1.25" fill="currentColor" stroke="none" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-bronze text-dark-950 text-[9px] font-inter font-medium flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <Link
              href="/contact"
              className="hidden xl:block font-inter text-[10px] tracking-[0.14em] uppercase px-5 py-2 border border-bronze/70 text-bronze hover:bg-bronze hover:text-dark-950 transition-all duration-300"
            >
              Work With Me
            </Link>

            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="xl:hidden flex flex-col justify-center gap-[5px] w-8 h-8 group"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span
                className={`block h-px bg-ivory-100 transition-all duration-400 origin-center ${menuOpen ? "rotate-45 translate-y-[6px] w-6" : "w-6"}`}
              />
              <span className={`block h-px bg-ivory-100 transition-all duration-300 ${menuOpen ? "opacity-0 w-4" : "w-4"}`} />
              <span
                className={`block h-px bg-ivory-100 transition-all duration-400 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6px] w-6" : "w-6"}`}
              />
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className="fixed inset-0 z-40 flex flex-col justify-between px-8 py-24 xl:hidden transition-all duration-500 pointer-events-none overflow-y-auto"
        style={{
          background: "#0D0F10",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col gap-5 mt-8" aria-label="Mobile navigation">
          {allLinks.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-cormorant italic text-left transition-all duration-500"
              style={{
                fontSize: "clamp(1.8rem, 8vw, 2.75rem)",
                color: pathname === link.href ? "#B58A62" : "#F3EFE7",
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(16px)",
                transitionDelay: menuOpen ? `${i * 45}ms` : "0ms",
              }}
              tabIndex={menuOpen ? 0 : -1}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div
          className="transition-all duration-500 pb-8"
          style={{
            opacity: menuOpen ? 1 : 0,
            transitionDelay: menuOpen ? "420ms" : "0ms",
          }}
        >
          <Link
            href="/contact"
            className="font-inter text-[10px] tracking-[0.16em] uppercase px-7 py-3 border border-bronze text-bronze hover:bg-bronze hover:text-dark-950 transition-all duration-300 inline-block"
            tabIndex={menuOpen ? 0 : -1}
          >
            Work With Me
          </Link>
          <p className="font-inter text-[9px] tracking-[0.12em] uppercase text-muted mt-8">{site.role}</p>
        </div>
      </div>
    </>
  );
}
