import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/technologies", label: "Technologies" },
  { to: "/services", label: "Services" },
  { to: "/research", label: "Research" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-hairline bg-black/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-12">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-mono text-[11px] uppercase tracking-[0.22em] text-foreground">
            Dark Field<span className="text-text-muted"> / Tech Labs</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            to="/careers"
            className="group inline-flex items-center gap-2 border border-hairline px-4 py-2 text-[12px] uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
          >
            Apply
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-hairline bg-black md:hidden">
          <nav className="flex flex-col px-6 py-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="border-b border-hairline py-3 text-sm text-muted-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/careers"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center border border-foreground px-4 py-3 text-[12px] uppercase tracking-[0.18em]"
            >
              Apply →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`size-6 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4 L4 28 L28 28 Z" strokeDasharray="2 2" />
      <path d="M16 12 L10 22 L22 22 Z" strokeDasharray="2 2" />
      <path d="M16 18 L13 24 L19 24 Z" strokeDasharray="2 2" />
    </svg>
  );
}
