import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-dark-950 min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-inter text-[11px] tracking-[0.2em] uppercase text-bronze mb-4">404</p>
        <h1 className="font-cormorant font-medium text-ivory-100" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
          This page doesn&rsquo;t exist.
        </h1>
        <p className="font-inter text-[14px] text-muted mt-4">
          The page you&rsquo;re looking for may have moved. Try one of these instead.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-9">
          <Link
            href="/"
            className="font-inter text-[11px] tracking-[0.16em] uppercase px-7 py-3 bg-bronze text-dark-950 hover:bg-bronze-light transition-colors duration-300"
          >
            Go Home
          </Link>
          <Link
            href="/films"
            className="font-inter text-[11px] tracking-[0.16em] uppercase px-7 py-3 border border-ivory-100/30 text-ivory-100 hover:border-bronze hover:text-bronze transition-colors duration-300"
          >
            View Films
          </Link>
        </div>
      </div>
    </div>
  );
}
