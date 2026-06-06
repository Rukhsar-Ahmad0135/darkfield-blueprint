import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { SERVICES } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Dark Field Tech Labs" },
      { name: "description", content: "Elite technical consulting and turnkey R&D for high-stakes environments." },
      { property: "og:title", content: "Services — DFTL" },
      { property: "og:description", content: "Embedded, Software & AI, RDaaS, and Additive Manufacturing." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <SiteShell>
      <Section className="border-b border-hairline">
        <Eyebrow>Services</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Elite technical consulting. Turnkey R&D.
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
          Four service lines, each grounded in the same research practice that powers our internal
          platforms.
        </p>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
          {SERVICES.map((s, i) => (
            <article
              key={s.slug}
              className="flex flex-col bg-background p-10 transition-colors hover:bg-surface-2 lg:p-14"
            >
              <span className="eyebrow">0{i + 1} / Service</span>
              <h2 className="mt-10 text-3xl font-semibold tracking-tight sm:text-4xl">{s.title}</h2>
              <p className="mt-4 text-muted-foreground">{s.summary}</p>
              <div className="mt-12 border-t border-hairline pt-4 text-[11px] uppercase tracking-[0.2em] text-text-muted">
                Engagement · Contract · Retainer
              </div>
            </article>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}
