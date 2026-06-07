import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/careers/$slug")({
  component: JobPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Careers · DFTL` },
      { name: "description", content: `Open role at Dark Field Tech Labs: ${params.slug}.` },
    ],
  }),
});

type Job = {
  id: string; slug: string; title: string; team: string; type: string; location: string;
  summary: string; responsibilities: string[]; requirements: string[];
};

function JobPage() {
  const { slug } = Route.useParams();
  const { data: job, isLoading } = useQuery({
    queryKey: ["public-job", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as Job;
    },
  });

  if (isLoading) {
    return <SiteShell><Section><p className="text-muted-foreground">Loading…</p></Section></SiteShell>;
  }
  if (!job) return null;

  return (
    <SiteShell>
      <Section className="border-b border-hairline">
        <Link to="/careers" className="eyebrow hover:text-foreground">← All roles</Link>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">{job.title}</h1>
        <div className="mt-8 flex flex-wrap gap-3 text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="border border-hairline px-3 py-1.5">{job.team}</span>
          <span className="border border-hairline px-3 py-1.5">{job.type}</span>
          <span className="border border-hairline px-3 py-1.5">{job.location}</span>
        </div>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">{job.summary}</p>
        <Link to="/apply" search={{ role: job.slug }} className="mt-10 inline-flex items-center gap-2 bg-foreground px-6 py-3.5 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90">
          Apply for this role <ArrowUpRight className="size-4" />
        </Link>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Responsibilities</Eyebrow>
            <ul className="mt-6 space-y-3">
              {job.responsibilities.map((r: string, i: number) => (
                <li key={i} className="flex gap-3 border-b border-hairline pb-3 text-muted-foreground"><span className="text-text-muted">→</span><span>{r}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow>Requirements</Eyebrow>
            <ul className="mt-6 space-y-3">
              {job.requirements.map((r: string, i: number) => (
                <li key={i} className="flex gap-3 border-b border-hairline pb-3 text-muted-foreground"><span className="text-text-muted">→</span><span>{r}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
