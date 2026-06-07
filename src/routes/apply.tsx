import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { useQuery } from "@tanstack/react-query";

const searchSchema = z.object({ role: z.string().optional() });

export const Route = createFileRoute("/apply")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Apply — Dark Field Tech Labs" },
      { name: "description", content: "Apply for an open role at DFTL." },
    ],
  }),
  component: ApplyPage,
});

const schema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(4).max(40),
  location: z.string().trim().min(1).max(120),
  years_experience: z.string().trim().min(1).max(40),
  linkedin_url: z.string().trim().url().max(300).optional().or(z.literal("")),
  portfolio_url: z.string().trim().url().max(300).optional().or(z.literal("")),
  cover_letter: z.string().trim().max(4000).optional().or(z.literal("")),
});

function ApplyPage() {
  const { role } = Route.useSearch();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resume, setResume] = useState<File | null>(null);

  const { data: jobs } = useQuery({
    queryKey: ["public-jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("slug, title").eq("is_active", true).order("title");
      return data ?? [];
    },
  });
  const matched = jobs?.find((j) => j.slug === role);
  const [jobSlug, setJobSlug] = useState(matched?.slug ?? role ?? "");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const parsed = schema.parse({
        full_name: fd.get("full_name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        location: fd.get("location"),
        years_experience: fd.get("years_experience"),
        linkedin_url: fd.get("linkedin_url") ?? "",
        portfolio_url: fd.get("portfolio_url") ?? "",
        cover_letter: fd.get("cover_letter") ?? "",
      });
      if (!resume) throw new Error("Please upload your resume.");
      if (resume.size > 8 * 1024 * 1024) throw new Error("Resume must be under 8MB.");

      const path = `${Date.now()}-${crypto.randomUUID()}-${resume.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const up = await supabase.storage.from("resumes").upload(path, resume, { upsert: false });
      if (up.error) throw up.error;

      const selectedJob = jobs?.find((j) => j.slug === jobSlug);
      const { error } = await supabase.from("applications").insert({
        ...parsed,
        linkedin_url: parsed.linkedin_url || null,
        portfolio_url: parsed.portfolio_url || null,
        cover_letter: parsed.cover_letter || null,
        job_id: null,
        job_title: selectedJob?.title ?? jobSlug ?? "General Application",
        resume_path: path,
        resume_url: path,
      });
      if (error) throw error;

      setSubmitted(true);
      toast.success("Application received.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <Section className="border-b border-hairline">
        <Eyebrow>Application</Eyebrow>
        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">Tell us about your work.</h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Concise and specific applications outperform polished and generic ones. Link the work you're proudest of.
        </p>
      </Section>

      <Section>
        {submitted ? (
          <div className="border border-hairline p-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Application received.</h2>
            <p className="mt-4 text-muted-foreground">We'll be in touch within 5 business days.</p>
            <button onClick={() => navigate({ to: "/careers" })} className="mt-8 border border-hairline px-6 py-3 text-[12px] uppercase tracking-[0.2em] hover:border-foreground">
              Browse more roles
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
            <label className="flex flex-col gap-2 lg:col-span-2">
              <span className="eyebrow">Position *</span>
              <select name="job_slug" value={jobSlug} onChange={(e) => setJobSlug(e.target.value)} className="border-0 border-b border-hairline bg-transparent py-3 text-base focus:border-foreground focus:outline-none">
                <option value="">— General application —</option>
                {jobs?.map((j) => <option key={j.slug} value={j.slug}>{j.title}</option>)}
              </select>
            </label>
            <Field label="Full Name *" name="full_name" required />
            <Field label="Email *" name="email" type="email" required />
            <Field label="Phone Number *" name="phone" type="tel" required />
            <Field label="Location *" name="location" required />
            <Field label="Years of Experience *" name="years_experience" required placeholder="e.g. 5" />
            <Field label="LinkedIn Profile" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/…" />
            <Field label="Portfolio URL" name="portfolio_url" type="url" className="lg:col-span-2" placeholder="GitHub, paper, website…" />
            <label className="flex flex-col gap-2 lg:col-span-2">
              <span className="eyebrow">Upload Resume/CV * (PDF, DOC, DOCX · max 8MB)</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                required
                className="border border-hairline bg-transparent p-3 text-sm file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-[11px] file:uppercase file:tracking-[0.18em] file:text-background"
              />
            </label>
            <label className="flex flex-col gap-2 lg:col-span-2">
              <span className="eyebrow">Cover Letter</span>
              <textarea name="cover_letter" rows={6} placeholder="What problems do you want to work on, and why DFTL?" className="border border-hairline bg-transparent p-4 text-base placeholder:text-text-muted focus:border-foreground focus:outline-none" />
            </label>
            <div className="flex items-end lg:col-span-2 lg:justify-end">
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 bg-foreground px-8 py-4 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90 disabled:opacity-50">
                {busy ? "Submitting…" : "Submit Application →"}
              </button>
            </div>
          </form>
        )}
      </Section>
    </SiteShell>
  );
}

function Field({ label, className = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="eyebrow">{label}</span>
      <input {...rest} className="border-0 border-b border-hairline bg-transparent py-3 text-base placeholder:text-text-muted focus:border-foreground focus:outline-none" />
    </label>
  );
}
