import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { GridBackdrop, MeshDiagram, SierpinskiLogo, InteractiveMesh } from "@/components/site/Visuals";
import { TECHNOLOGIES, SERVICES } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dark Field Tech Labs — Engineering Intelligent Systems" },
      {
        name: "description",
        content:
          "Dark Field Tech Labs builds wireless, stealth, surveillance, and core systems for high-stakes environments.",
      },
      { property: "og:title", content: "Dark Field Tech Labs" },
      {
        property: "og:description",
        content: "Engineering intelligent systems for research and enterprise.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteShell>
      <Hero />
      <About />
      <TechGrid />
      <Architecture />
      <ServicesPreview />
      <TeamSection />
      <CareersCTA />
      <BigCTA />
    </SiteShell>
  );
}

function TeamSection() {
  const { data: team } = useQuery({
    queryKey: ["public-employees"],
    queryFn: async () => {
      const { data } = await supabase.from("employees").select("*").eq("is_active", true).order("display_order");
      return data ?? [];
    },
  });
  if (!team || team.length === 0) return null;
  return (
    <Section className="border-b border-hairline">
      <Eyebrow>The Team</Eyebrow>
      <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Operators, engineers, researchers.</h2>
      <div className="mt-16 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m) => (
          <div key={m.id} className="flex flex-col gap-4 bg-background p-8">
            <div className="flex items-start gap-4">
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.full_name} className="size-16 border border-hairline object-cover" />
              ) : (
                <div className="flex size-16 items-center justify-center border border-hairline text-mono text-xs text-text-muted">
                  {m.full_name.split(" ").map((p: string) => p[0]).join("").slice(0, 2)}
                </div>
              )}
              <div>
                <div className="font-medium">{m.full_name}</div>
                <div className="text-sm text-muted-foreground">{m.position}</div>
                {m.department && <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{m.department}</div>}
              </div>
            </div>
            {m.bio && <p className="text-sm text-muted-foreground">{m.bio}</p>}
            {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="mt-auto text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">LinkedIn →</a>}
          </div>
        ))}
      </div>
    </Section>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <GridBackdrop />
      <InteractiveMesh />
      <div className="relative mx-auto grid max-w-[1400px] gap-16 px-6 pb-32 pt-24 lg:grid-cols-12 lg:px-12 lg:pt-32">
        <div className="lg:col-span-7">
          <Eyebrow>Dark Field / Tech Labs · est. 2026</Eyebrow>
          <h1 className="mt-8 text-[44px] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-[64px] lg:text-[88px] animate-fade-up">
            Engineering<br />
            <span className="text-text-muted">intelligent</span><br />
            systems.
          </h1>
          <p className="mt-8 max-w-xl text-base text-muted-foreground sm:text-lg">
            Four vertical pillars — Wireless, Stealth, Surveillance, Systems — built to solve adversarial and performance-critical challenges where centralized infrastructure fails.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link to="/technologies" className="group inline-flex items-center gap-2 bg-foreground px-6 py-3.5 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90">
              Explore Technologies
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 border border-hairline px-6 py-3.5 text-[12px] uppercase tracking-[0.2em] hover:border-foreground">
              Contact Lab
            </Link>
          </div>
          <dl className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-hairline pt-8">
            {[["04", "Core Pillars"], ["R&D", "Mandate"], ["Global", "Architecture"]].map(([k, v]) => (
              <div key={v}>
                <dt className="text-mono text-[22px] font-medium">{k}</dt>
                <dd className="mt-1 text-[11px] uppercase tracking-[0.2em] text-text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-square border border-hairline">
            <div className="absolute inset-0 grid-bg opacity-60" />
            <SierpinskiLogo className="absolute inset-0 m-auto h-4/5 w-4/5 text-foreground/90" rows={6} animate />
            <div className="absolute left-4 top-4 eyebrow">SYS_ID / DFTL-001</div>
            <div className="absolute bottom-4 left-4 text-mono text-[10px] text-text-muted">MESH · STEALTH · SENSE</div>
            <div className="absolute right-4 top-4 size-2 animate-pulse bg-foreground" />
          </div>
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.22em] text-text-muted">
            <span>[ 00:01 ] system online</span>
            <span>v 1.0</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <Section className="border-b border-hairline">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow>About</Eyebrow>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            A research lab posing as a product company.
          </h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <p className="text-lg text-muted-foreground">
            We build next-generation intelligent systems for research and enterprise. Our mandate
            spans signal physics, embedded silicon, distributed protocols, and operator-grade
            software — synthesized into platforms that ship.
          </p>
          <div className="mt-12 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
            {[
              ["04", "Core Technologies"],
              ["R&D", "First Discipline"],
              ["∞", "Global Architecture"],
            ].map(([n, l]) => (
              <div key={l} className="bg-background p-6">
                <div className="text-mono text-3xl font-medium">{n}</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-text-muted">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function TechGrid() {
  return (
    <Section className="border-b border-hairline">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <Eyebrow>Technologies</Eyebrow>
          <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Four pillars. One operating philosophy.
          </h2>
        </div>
        <Link
          to="/technologies"
          className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          View all →
        </Link>
      </div>

      <div className="mt-16 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        {TECHNOLOGIES.map((t) => (
          <Link
            key={t.slug}
            to="/technologies/$slug"
            params={{ slug: t.slug }}
            className="group relative flex flex-col bg-background p-8 transition-colors hover:bg-surface-2"
          >
            <span className="eyebrow">{t.index}</span>
            <h3 className="mt-10 text-xl font-medium">{t.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{t.tagline}</p>
            <div className="mt-12 flex items-center justify-between border-t border-hairline pt-4 text-[11px] uppercase tracking-[0.2em] text-text-muted">
              <span>Details</span>
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function Architecture() {
  return (
    <Section className="border-b border-hairline">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow>Flagship · Dark Field Mesh</Eyebrow>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            A resilient mesh for places centralized infrastructure can't reach.
          </h2>
          <p className="mt-6 text-muted-foreground">
            Edge nodes negotiate hybrid wireless links into a self-healing mesh. A blockchain
            ledger guarantees immutable state. Native AI orchestrates routing, posture, and
            interference mitigation in real-time.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Zero-trust architecture, hardware-rooted",
              "Blockchain-verified immutable ledgering",
              "Self-healing structural interference mitigation",
            ].map((i) => (
              <li key={i} className="flex gap-3 border-b border-hairline pb-3">
                <span className="text-text-muted">→</span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-hairline p-6 lg:col-span-7 lg:col-start-6 lg:p-10">
          <MeshDiagram />
        </div>
      </div>
    </Section>
  );
}

function ServicesPreview() {
  return (
    <Section className="border-b border-hairline">
      <Eyebrow>Services</Eyebrow>
      <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        Elite technical consulting and turnkey R&D.
      </h2>

      <div className="mt-16 divide-y divide-hairline border-y border-hairline">
        {SERVICES.map((s, i) => (
          <Link
            key={s.slug}
            to="/services"
            className="group grid grid-cols-12 items-center gap-6 py-8 transition-colors hover:bg-surface-2"
          >
            <span className="col-span-2 text-mono text-sm text-text-muted">
              0{i + 1}
            </span>
            <h3 className="col-span-10 text-xl font-medium tracking-tight sm:col-span-4 sm:text-2xl">
              {s.title}
            </h3>
            <p className="col-span-12 text-sm text-muted-foreground sm:col-span-5">
              {s.summary}
            </p>
            <ArrowUpRight className="col-span-12 size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:col-span-1 sm:justify-self-end" />
          </Link>
        ))}
      </div>
    </Section>
  );
}

function CareersCTA() {
  return (
    <Section className="border-b border-hairline">
      <div className="grid gap-10 border border-hairline p-10 sm:p-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>Careers</Eyebrow>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
            We're hiring engineers and researchers.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Operators, researchers, embedded engineers, and ML practitioners who like
            consequential problems and small teams.
          </p>
        </div>
        <div className="flex items-end lg:col-span-5 lg:justify-end">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 bg-foreground px-6 py-3.5 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90"
          >
            View Open Roles
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

function BigCTA() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <GridBackdrop />
      <div className="relative mx-auto max-w-[1400px] px-6 py-32 text-center lg:px-12 lg:py-48">
        <Eyebrow>
          <span className="mx-auto block">Contact</span>
        </Eyebrow>
        <h2 className="mx-auto mt-8 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Let's build the <span className="text-text-muted italic">future</span>.
        </h2>
        <div className="mt-10 flex justify-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 border border-foreground px-8 py-4 text-[12px] uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
          >
            Start a Conversation
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
