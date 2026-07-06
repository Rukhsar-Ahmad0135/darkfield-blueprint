import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { DustFieldScene } from "@/components/three/InterstellarScenes";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";

const FILTERS = ["All", "Full Time", "Internship", "Remote", "On-site", "Hybrid"] as const;

export const Route = createFileRoute("/careers/")({
  head: () => ({
    meta: [
      { title: "Careers — Engineering & Research Jobs | Dark Field Tech Labs" },
      { name: "description", content: "Open engineering and research roles at Dark Field Tech Labs. Work on wireless, stealth, mesh, and AI systems with small senior teams and real hardware." },
      { name: "keywords", content: "engineering jobs, research jobs, embedded engineer, AI engineer, deep tech careers, wireless engineering jobs, R&D careers" },
      { property: "og:title", content: "Careers — Dark Field Tech Labs" },
      { property: "og:description", content: "Build the technology the future depends on. Open roles for engineers and researchers." },
      { property: "og:url", content: "https://darkfield-blueprint.lovable.app/careers" },
    ],
    links: [{ rel: "canonical", href: "https://darkfield-blueprint.lovable.app/careers" }],
  }),
  component: CareersPage,
});

type Job = { id: string; slug: string; title: string; team: string; type: string; location: string };

function CareersPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["public-jobs-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("id, slug, title, team, type, location").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Job[];
    },
  });

  const filtered = (jobs ?? []).filter((j) => filter === "All" ? true : j.type === filter || j.location === filter);

  return (
    <SiteShell backdrop={<DustFieldScene className="h-full w-full" />}>
      <Section className="border-b border-hairline">
        <Eyebrow>Careers</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">Build technology the future depends on.</h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">Small senior teams. High autonomy. Real hardware and real-world stakes. We hire engineers and researchers who want their work to ship — and to matter.</p>
      </Section>


      <Section>
        <div className="flex flex-wrap items-center gap-2 border-b border-hairline pb-6">
          <span className="eyebrow mr-4">Filter</span>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${filter === f ? "border-foreground bg-foreground text-background" : "border-hairline text-muted-foreground hover:border-foreground"}`}>{f}</button>
          ))}
        </div>

        <div className="divide-y divide-hairline border-b border-hairline">
          {isLoading && <p className="py-10 text-muted-foreground">Loading roles…</p>}
          {!isLoading && filtered.length === 0 && <p className="py-10 text-muted-foreground">No roles match this filter.</p>}
          {filtered.map((j) => (
            <Link key={j.id} to="/careers/$slug" params={{ slug: j.slug }} className="group grid grid-cols-12 items-center gap-4 py-8 transition-colors hover:bg-surface-2">
              <div className="col-span-12 sm:col-span-6">
                <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">{j.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{j.team}</p>
              </div>
              <div className="col-span-6 sm:col-span-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">{j.type}</div>
              <div className="col-span-6 sm:col-span-3 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">{j.location}</div>
              <ArrowUpRight className="col-span-12 size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:col-span-1 sm:justify-self-end" />
            </Link>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}
