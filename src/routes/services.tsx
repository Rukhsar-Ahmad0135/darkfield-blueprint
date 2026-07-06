import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { DistantGargantuaScene } from "@/components/three/InterstellarScenes";
import { SERVICES } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Embedded, AI, R&D & Manufacturing | Dark Field Tech Labs" },
      { name: "description", content: "Custom embedded systems, AI software, contract R&D, and additive manufacturing for defense, enterprise, and research clients. Engineered for high-stakes environments." },
      { name: "keywords", content: "embedded systems development, AI engineering, R&D as a service, contract research, additive manufacturing, custom firmware, edge AI" },
      { property: "og:title", content: "Services — Dark Field Tech Labs" },
      { property: "og:description", content: "Embedded systems, AI, contract R&D, and additive manufacturing — built to ship and survive in the field." },
      { property: "og:url", content: "https://darkfield-blueprint.lovable.app/services" },
    ],
    links: [{ rel: "canonical", href: "https://darkfield-blueprint.lovable.app/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <SiteShell backdrop={<DistantGargantuaScene className="h-full w-full" />}>
      <Section className="border-b border-hairline">
        <Eyebrow>Services</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Engineering services built for the hardest problems.
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
          Four specialized service lines — embedded systems, AI software, contract R&D, and
          additive manufacturing — backed by the same research practice that powers our internal
          platforms. From prototype to production, we ship what we promise.
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
