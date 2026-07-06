import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { MeshDiagram } from "@/components/site/Visuals";
import { EarthHeroScene } from "@/components/three/EarthHero";
import { EnduranceViewer } from "@/components/three/EnduranceViewer";
import { VoxeloBlackHoleScene as BlackHoleScene } from "@/components/three/VoxeloBlackHole";
import { Reveal } from "@/components/site/Reveal";
import { TECHNOLOGIES, SERVICES } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dark Field Tech Labs — Wireless, Stealth & Mesh Technology R&D" },
      {
        name: "description",
        content:
          "Dark Field Tech Labs engineers wireless, stealth, mesh, and surveillance systems for defense, enterprise, and research. Resilient infrastructure where centralized networks fail.",
      },
      {
        name: "keywords",
        content:
          "dark field tech labs, wireless technology, stealth technology, mesh networks, surveillance systems, embedded systems, R&D as a service, edge AI, zero-trust architecture, defense technology",
      },
      { property: "og:title", content: "Dark Field Tech Labs — Engineering Intelligent Systems" },
      {
        property: "og:description",
        content: "Wireless, stealth, mesh, and surveillance R&D for the world's hardest environments.",
      },
      { property: "og:url", content: "https://darkfield-blueprint.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://darkfield-blueprint.lovable.app/" }],
  }),

  component: Home,
});

function Home() {
  return (
    <SiteShell>
      <Hero />
      <About />
      <GargantuaSection />
      <CollaborationsStrip />
      <TechGrid />
      <Architecture />
      <OpportunitiesPreview />
      <ServicesPreview />
      <TeamSection />
      <CareersCTA />
      <BigCTA />
    </SiteShell>
  );
}

function GargantuaSection() {
  return (
    <section className="relative overflow-hidden border-b border-hairline bg-black">
      <div className="absolute inset-0">
        <BlackHoleScene className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
      <div className="relative mx-auto grid min-h-[92vh] max-w-[1400px] items-end px-6 pb-24 pt-24 lg:px-12">
        <Reveal>
          <div className="max-w-xl">
            <Eyebrow>Gargantua · Signal Physics</Eyebrow>
            <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              At the edge of what's <em className="italic text-ember ember-glow">measurable</em>.
            </h2>
            <p className="mt-6 text-base text-muted-foreground sm:text-lg">
              We operate where classical systems collapse — the deep field of RF, mesh,
              and stealth engineering. Cinematic in ambition, ruthless in execution.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
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
      <Reveal>
        <Eyebrow>The Team</Eyebrow>
        <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Operators, engineers, researchers.</h2>
      </Reveal>
      <div className="mt-16 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m, i) => (
          <Reveal key={m.id} delay={i * 0.05}>
            <div className="flex h-full flex-col gap-4 bg-background p-8">
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
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function CollaborationsStrip() {
  const { data } = useQuery({
    queryKey: ["public-collaborations"],
    queryFn: async () => {
      const { data } = await supabase.from("collaborations").select("*").eq("is_active", true).order("display_order");
      return data ?? [];
    },
  });
  if (!data || data.length === 0) return null;
  return (
    <Section className="border-b border-hairline">
      <Reveal>
        <Eyebrow>Backed by · Collaborations</Eyebrow>
        <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Building alongside <span className="text-text-muted italic">visionary ventures</span>.
        </h2>
      </Reveal>
      <div className="mt-16 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
        {data.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.06}>
            <a
              href={c.website_url ?? "#"}
              target={c.website_url ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex h-full flex-col gap-4 bg-background p-8 transition-colors hover:bg-surface-2"
            >
              <div className="flex items-center gap-4">
                {c.logo_url ? (
                  <img src={c.logo_url} alt={c.name} className="h-10 w-10 border border-hairline object-contain p-1" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center border border-hairline text-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    {c.name.slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="text-lg font-medium tracking-tight">{c.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-text-muted">{c.tier}</div>
                </div>
              </div>
              {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
              <span className="mt-auto inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground">
                Visit <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function OpportunitiesPreview() {
  const { data } = useQuery({
    queryKey: ["public-opportunities"],
    queryFn: async () => {
      const { data } = await supabase.from("opportunities").select("*").eq("is_active", true).order("display_order").limit(6);
      return data ?? [];
    },
  });
  if (!data || data.length === 0) return null;
  return (
    <Section className="border-b border-hairline">
      <Reveal>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Opportunities</Eyebrow>
            <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Programs, fellowships, and collaborations open now.
            </h2>
          </div>
        </div>
      </Reveal>
      <div className="mt-16 divide-y divide-hairline border-y border-hairline">
        {data.map((o, i) => (
          <Reveal key={o.id} delay={i * 0.04}>
            <a
              href={o.apply_url ?? "#"}
              target={o.apply_url ? "_blank" : undefined}
              rel="noreferrer"
              className="group grid grid-cols-12 items-center gap-6 py-8 transition-colors hover:bg-surface-2"
            >
              <span className="col-span-2 text-mono text-sm text-text-muted">0{i + 1}</span>
              <div className="col-span-10 sm:col-span-5">
                <h3 className="text-xl font-medium tracking-tight sm:text-2xl">{o.title}</h3>
                <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {o.category}{o.location ? ` · ${o.location}` : ""}{o.deadline ? ` · by ${o.deadline}` : ""}
                </div>
              </div>
              <p className="col-span-12 text-sm text-muted-foreground sm:col-span-4">{o.summary}</p>
              <ArrowUpRight className="col-span-12 size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:col-span-1 sm:justify-self-end" />
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Hero() {
  return (
    <EarthHeroScene>
      {() => (
        <div className="relative mx-auto grid h-full max-w-[1400px] content-center gap-16 px-6 pb-32 pt-24 lg:grid-cols-12 lg:px-12 lg:pt-32">
          {/* Vignette so text stays crisp */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="lg:col-span-7">
            <Eyebrow>Dark Field / Tech Labs · est. 2026 · UK</Eyebrow>
            <h1 className="mt-8 font-display text-[48px] leading-[1.02] tracking-[-0.02em] sm:text-[72px] lg:text-[96px]">
              Beyond the <em className="italic text-white">event horizon</em>
              <br />
              of engineering.
            </h1>
            <p className="mt-8 max-w-xl text-base text-muted-foreground sm:text-lg">
              Dark Field Tech Labs builds resilient wireless, stealth, surveillance and mesh
              systems for environments where conventional infrastructure breaks down — defense,
              critical infrastructure, autonomous fleets, and frontier research.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/technologies"
                className="group inline-flex items-center gap-2 bg-ember px-6 py-3.5 text-[12px] uppercase tracking-[0.2em] text-primary-foreground hover:opacity-90"
              >
                Explore Our Technology
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-hairline bg-black/40 px-6 py-3.5 text-[12px] uppercase tracking-[0.2em] backdrop-blur-sm hover:border-ember hover:text-ember"
              >
                Talk to an Engineer
              </Link>
            </div>
            <dl className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-hairline pt-8">
              {[["04", "Core Pillars"], ["R&D", "Mandate"], ["Global", "Architecture"]].map(([k, v]) => (
                <div key={v}>
                  <dt className="text-mono text-[22px] font-medium text-ember">{k}</dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-[0.2em] text-text-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </EarthHeroScene>
  );
}

function About() {
  return (
    <Section className="border-b border-hairline">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow>About Dark Field Tech Labs</Eyebrow>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            A deep-tech research lab building the systems others can't.
          </h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <p className="text-lg text-muted-foreground">
            We engineer next-generation intelligent systems for governments, enterprises, and
            research institutions. Our work spans signal physics, embedded silicon, distributed
            mesh protocols, and operator-grade software — synthesized into platforms that ship
            on time and survive in the field.
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
    <Section className="relative border-b border-hairline overflow-hidden">
      <div className="pointer-events-auto absolute inset-0 -z-0 opacity-70">
        <EnduranceViewer />
      </div>
      <div className="relative z-10 grid gap-12 lg:grid-cols-12">
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
            Build the technology the future depends on.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Join a small, senior team of engineers, researchers, and operators solving problems
            that matter — with the autonomy and resources to do your best work.
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
    <section className="relative overflow-hidden border-b border-hairline bg-background">
      <div className="relative mx-auto max-w-[1400px] px-6 py-32 text-center lg:px-12 lg:py-48">
        <Eyebrow>
          <span className="mx-auto block">Partner With Us</span>
        </Eyebrow>
        <h2 className="mx-auto mt-8 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Have a problem nobody else can solve? <span className="text-text-muted italic">Let's talk.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
          From contract R&D to long-term partnerships, we work with teams who need real engineering
          — not slideware. Tell us what you're up against.
        </p>
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

