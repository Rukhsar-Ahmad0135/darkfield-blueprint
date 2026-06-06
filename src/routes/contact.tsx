import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Dark Field Tech Labs" },
      { name: "description", content: "Get in touch with Dark Field Tech Labs." },
      { property: "og:title", content: "Contact — DFTL" },
      { property: "og:description", content: "Start a conversation with our team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteShell>
      <Section className="border-b border-hairline">
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Start a <span className="text-text-muted italic">conversation</span>.
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          Tell us what you're working on. We respond to qualified inquiries within two business
          days.
        </p>
      </Section>

      <Section>
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Channels</Eyebrow>
            <dl className="mt-8 space-y-8">
              <Channel label="General" value="hello@darkfieldtechlabs.com" />
              <Channel label="Business" value="partners@darkfieldtechlabs.com" />
              <Channel label="Careers" value="careers@darkfieldtechlabs.com" />
              <Channel label="Press" value="press@darkfieldtechlabs.com" />
            </dl>
          </div>

          <div className="lg:col-span-7">
            {sent ? (
              <div className="border border-hairline p-12 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">Message sent.</h2>
                <p className="mt-4 text-muted-foreground">We'll respond shortly.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="grid gap-6 border border-hairline p-8 lg:p-10"
              >
                <Eyebrow>Direct message</Eyebrow>
                <Field label="Name" name="name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Company" name="company" />
                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Message</span>
                  <textarea
                    name="message"
                    rows={6}
                    required
                    className="border border-hairline bg-transparent p-4 text-base focus:border-foreground focus:outline-none"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-foreground px-6 py-4 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90"
                >
                  Send →
                </button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}

function Channel({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-hairline pb-6">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 text-lg">{value}</dd>
    </div>
  );
}

function Field({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <input
        {...rest}
        className="border-0 border-b border-hairline bg-transparent py-3 text-base placeholder:text-text-muted focus:border-foreground focus:outline-none"
      />
    </label>
  );
}
