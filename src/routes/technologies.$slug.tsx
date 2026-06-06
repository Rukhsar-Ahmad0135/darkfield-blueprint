import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { TECHNOLOGIES } from "@/lib/site-data";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/technologies/$slug")({
  loader: ({ params }) => {
    const tech = TECHNOLOGIES.find((t) => t.slug === params.slug);
    if (!tech) throw notFound();
    return { tech };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.tech.title} — DFTL` },
          { name: "description", content: loaderData.tech.summary },
          { property: "og:title", content: `${loaderData.tech.title} — DFTL` },
          { property: "og:description", content: loaderData.tech.summary },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <SiteShell>
      <Section><p>Technology not found.</p></Section>
    </SiteShell>
  ),
  errorComponent: ({ error }) => (
    <SiteShell>
      <Section><p>{error.message}</p></Section>
    </SiteShell>
  ),
  component: TechDetail,
});

function TechDetail() {
  const { tech } = Route.useLoaderData();
  const idx = TECHNOLOGIES.findIndex((t) => t.slug === tech.slug);
  const next = TECHNOLOGIES[(idx + 1) % TECHNOLOGIES.length];

  return (
    <SiteShell>
      <Section className="border-b border-hairline">
        <Link to="/technologies" className="eyebrow hover:text-foreground">
          ← Technologies
        </Link>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <span className="text-mono text-4xl text-text-muted">{tech.index}</span>
          </div>
          <div className="lg:col-span-10">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">{tech.title}</h1>
            <p className="mt-6 max-w-3xl text-lg text-muted-foreground">{tech.tagline}</p>
          </div>
        </div>
      </Section>

      <Section className="border-b border-hairline">
        <div className="grid gap-16 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <Eyebrow>Capabilities</Eyebrow>
            <ul className="mt-6 space-y-3 text-sm">
              {tech.capabilities.map((c) => (
                <li key={c} className="border-b border-hairline pb-3 text-muted-foreground">
                  {c}
                </li>
              ))}
            </ul>
          </aside>
          <div className="space-y-16 lg:col-span-8 lg:col-start-5">
            {tech.sections.map((s, i) => (
              <div key={s.h} className="border-t border-hairline pt-10">
                <span className="text-mono text-xs text-text-muted">0{i + 1}</span>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{s.h}</h2>
                <p className="mt-4 max-w-2xl text-muted-foreground">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <Link
          to="/technologies/$slug"
          params={{ slug: next.slug }}
          className="group flex items-center justify-between border-t border-hairline pt-10"
        >
          <div>
            <div className="eyebrow">Next pillar</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              {next.title}
            </div>
          </div>
          <ArrowUpRight className="size-8 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </Section>
    </SiteShell>
  );
}
