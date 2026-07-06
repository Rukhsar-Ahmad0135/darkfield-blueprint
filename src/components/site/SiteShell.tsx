import { type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Starfield } from "./Cosmic";

type SiteShellProps = {
  children: ReactNode;
  /** Optional fixed cinematic backdrop (behind starfield). */
  backdrop?: ReactNode;
};

export function SiteShell({ children, backdrop }: SiteShellProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Layer 1: cinematic 3D backdrop (per page) */}
      {backdrop && (
        <div className="pointer-events-none fixed inset-0 -z-20 opacity-60">{backdrop}</div>
      )}
      {/* Layer 2: global starfield */}
      <Starfield />
      {/* Layer 3: cinematic vignette + film-grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <Navbar />
      <main className="relative pt-20">{children}</main>
      <Footer />
    </div>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative mx-auto max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32 ${className}`}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-ember/60" />
      <span className="eyebrow">{children}</span>
    </div>
  );
}
