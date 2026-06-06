import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { RESEARCH_PROJECTS } from "@/lib/site-data";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research — Dark Field Tech Labs" },
      { name: "description", content: "Active research projects, publications, and future roadmap." },
      { property: "og:title", content: "Research — DFTL" },
      { property: "og:description", content: "Active research and innovation programs." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <SiteShell>
      <Section className="border-b border-hairline">
        <Eyebrow>Research & Innovation</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Programs in motion.
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
          A selection of active and exploratory research efforts. Our work spans signal physics,
          distributed protocols, and applied AI.
        </p>
      </Section>

      <Section className="border-b border-hairline">
        <Eyebrow>Active Projects</Eyebrow>
        <div className="mt-10 divide-y divide-hairline border-y border-hairline">
          {RESEARCH_PROJECTS.map((p) => (
            <article key={p.code} className="grid grid-cols-12 gap-6 py-10">
              <div className="col-span-12 sm:col-span-2">
                <div className="text-mono text-sm text-text-muted">{p.code}</div>
                <div className="mt-2 inline-block border border-hairline px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {p.status}
                </div>
              </div>
              <div className="col-span-12 sm:col-span-10">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{p.title}</h2>
                <p className="mt-3 max-w-3xl text-muted-foreground">{p.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="border border-hairline p-10">
            <Eyebrow>Publications</Eyebrow>
            <h3 className="mt-6 text-2xl font-semibold tracking-tight">
              Internal technical memoranda.
            </h3>
            <p className="mt-4 text-muted-foreground">
              Selected works available on request under MNDA. Public preprints are released as
              they complete peer review.
            </p>
          </div>
          <div className="border border-hairline p-10">
            <Eyebrow>Future Roadmap</Eyebrow>
            <h3 className="mt-6 text-2xl font-semibold tracking-tight">
              Quantum-resilient mesh primitives.
            </h3>
            <p className="mt-4 text-muted-foreground">
              Forward-looking research into post-quantum key agreement, opportunistic spectrum
              allocation, and energy-aware orchestration.
            </p>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
