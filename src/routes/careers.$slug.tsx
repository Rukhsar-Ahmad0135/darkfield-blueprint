import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { JOBS } from "@/lib/site-data";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/careers/$slug")({
  loader: ({ params }) => {
    const job = JOBS.find((j) => j.slug === params.slug);
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.job.title} — DFTL Careers` },
          { name: "description", content: loaderData.job.summary },
          { property: "og:title", content: `${loaderData.job.title} — DFTL` },
          { property: "og:description", content: loaderData.job.summary },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <SiteShell><Section><p>Role not found.</p></Section></SiteShell>
  ),
  errorComponent: ({ error }) => (
    <SiteShell><Section><p>{error.message}</p></Section></SiteShell>
  ),
  component: JobDetail,
});

function JobDetail() {
  const { job } = Route.useLoaderData();
  return (
    <SiteShell>
      <Section className="border-b border-hairline">
        <Link to="/careers" className="eyebrow hover:text-foreground">
          ← All Roles
        </Link>
        <h1 className="mt-10 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          {job.title}
        </h1>
        <div className="mt-8 flex flex-wrap gap-2">
          {[job.team, job.type, job.location].map((t) => (
            <span
              key={t}
              className="border border-hairline px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">{job.summary}</p>

        <div className="mt-10">
          <Link
            to="/apply"
            search={{ role: job.slug }}
            className="inline-flex items-center gap-2 bg-foreground px-6 py-3.5 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90"
          >
            Apply Now
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </Section>

      <Section>
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <Eyebrow>Responsibilities</Eyebrow>
            <ul className="mt-6 space-y-4">
              {job.responsibilities.map((r) => (
                <li key={r} className="flex gap-4 border-b border-hairline pb-4 text-muted-foreground">
                  <span className="text-text-muted">→</span> {r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow>Requirements</Eyebrow>
            <ul className="mt-6 space-y-4">
              {job.requirements.map((r) => (
                <li key={r} className="flex gap-4 border-b border-hairline pb-4 text-muted-foreground">
                  <span className="text-text-muted">·</span> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
