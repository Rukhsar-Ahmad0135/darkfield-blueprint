import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { JOBS } from "@/lib/site-data";

const searchSchema = z.object({ role: z.string().optional() });

export const Route = createFileRoute("/apply")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Apply — Dark Field Tech Labs" },
      { name: "description", content: "Apply for a role at DFTL." },
    ],
  }),
  component: ApplyPage,
});

function ApplyPage() {
  const { role } = Route.useSearch();
  const initial = JOBS.find((j) => j.slug === role)?.title ?? "";
  const [submitted, setSubmitted] = useState(false);

  return (
    <SiteShell>
      <Section className="border-b border-hairline">
        <Eyebrow>Application</Eyebrow>
        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
          Tell us about your work.
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Concise and specific applications outperform polished and generic ones. Link the work
          you're proudest of.
        </p>
      </Section>

      <Section>
        {submitted ? (
          <div className="border border-hairline p-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Application received.</h2>
            <p className="mt-4 text-muted-foreground">
              We'll be in touch within 5 business days.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="grid gap-8 lg:grid-cols-2"
          >
            <Field label="Full Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" type="tel" />
            <Field label="Role of Interest" name="role" defaultValue={initial} />
            <Field
              label="Portfolio / Links"
              name="links"
              placeholder="GitHub, paper, website…"
              className="lg:col-span-2"
            />
            <Field
              label="Resume / CV"
              name="resume"
              type="file"
              className="lg:col-span-2"
            />
            <TextArea
              label="Cover Letter"
              name="cover"
              placeholder="What problems do you want to work on, and why DFTL?"
            />
            <div className="flex items-end lg:col-span-2 lg:justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-foreground px-8 py-4 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90"
              >
                Submit Application →
              </button>
            </div>
          </form>
        )}
      </Section>
    </SiteShell>
  );
}

function Field({
  label,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="eyebrow">{label}</span>
      <input
        {...rest}
        className="border-0 border-b border-hairline bg-transparent py-3 text-base text-foreground placeholder:text-text-muted focus:border-foreground focus:outline-none"
      />
    </label>
  );
}

function TextArea({
  label,
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className={`flex flex-col gap-2 lg:col-span-2 ${className}`}>
      <span className="eyebrow">{label}</span>
      <textarea
        {...rest}
        rows={6}
        className="border border-hairline bg-transparent p-4 text-base text-foreground placeholder:text-text-muted focus:border-foreground focus:outline-none"
      />
    </label>
  );
}
