import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { WormholeScene } from "@/components/three/InterstellarScenes";
import { TECHNOLOGIES } from "@/lib/site-data";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/technologies/")({
  head: () => ({
    meta: [
      { title: "Technologies — Wireless, Stealth, Surveillance & Mesh | Dark Field Tech Labs" },
      { name: "description", content: "Explore Dark Field Tech Labs' four core technology pillars: wireless networks, stealth systems, surveillance & sensor fusion, and zero-trust core infrastructure." },
      { name: "keywords", content: "wireless technology, stealth technology, mesh networks, surveillance systems, sensor fusion, zero-trust infrastructure, non-line-of-sight telemetry, signature reduction" },
      { property: "og:title", content: "Technologies — Dark Field Tech Labs" },
      { property: "og:description", content: "Four engineered pillars for adversarial and performance-critical environments." },
      { property: "og:url", content: "https://darkfield-blueprint.lovable.app/technologies" },
    ],
    links: [{ rel: "canonical", href: "https://darkfield-blueprint.lovable.app/technologies" }],
  }),
  component: TechnologiesPage,
});

function TechnologiesPage() {
  return (
    <SiteShell backdrop={<WormholeScene className="h-full w-full" />}>
      <Section className="border-b border-hairline">
        <Eyebrow>Technologies</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Wireless, stealth, surveillance, and mesh — engineered to win.
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
          Four core technology pillars, each an independent practice and a layer of one operating
          philosophy: physics-first, deployment-aware, and zero-trust by default. Built for the
          environments where off-the-shelf systems fail.
        </p>
      </Section>


      <Section className="!pt-0">
        <div className="grid gap-px border border-hairline bg-hairline lg:grid-cols-2">
          {TECHNOLOGIES.map((t) => (
            <Link
              key={t.slug}
              to="/technologies/$slug"
              params={{ slug: t.slug }}
              className="group relative flex flex-col bg-background p-10 transition-colors hover:bg-surface-2 lg:p-14"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow">{t.index} / {t.title}</span>
                <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <h2 className="mt-12 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{t.summary}</p>
              <ul className="mt-10 space-y-2 border-t border-hairline pt-6 text-sm">
                {t.capabilities.map((c) => (
                  <li key={c} className="flex gap-3 text-muted-foreground">
                    <span className="text-text-muted">·</span> {c}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}
