import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { TECHNOLOGIES } from "@/lib/site-data";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/technologies/")({
  head: () => ({
    meta: [
      { title: "Technologies — Dark Field Tech Labs" },
      { name: "description", content: "Wireless, Stealth, Surveillance, and Core Systems." },
      { property: "og:title", content: "Technologies — DFTL" },
      { property: "og:description", content: "Four vertical pillars built for performance-critical challenges." },
    ],
  }),
  component: TechnologiesPage,
});

function TechnologiesPage() {
  return (
    <SiteShell>
      <Section className="border-b border-hairline">
        <Eyebrow>Technologies</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Four pillars built to solve adversarial problems.
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
          Each pillar operates as an independent practice and as a layer of the same operating
          philosophy — physics-first, deployment-aware, and zero-trust by default.
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
