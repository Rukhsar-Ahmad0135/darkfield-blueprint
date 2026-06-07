import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SiteShell, Section, Eyebrow } from "@/components/site/SiteShell";
import { SierpinskiLogo } from "@/components/site/Visuals";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Dark Field Tech Labs" },
      { name: "description", content: "Admin sign in for Dark Field Tech Labs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/admin",
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/admin",
      });
      if (result.error) throw result.error;
      if (!result.redirected) navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <Section>
        <div className="mx-auto grid max-w-md gap-8">
          <div className="flex flex-col items-center gap-4">
            <SierpinskiLogo className="size-16 text-foreground" rows={4} animate />
            <Eyebrow>Dark Field / Tech Labs</Eyebrow>
            <h1 className="text-3xl font-semibold tracking-tight">
              {mode === "signin" ? "Sign in" : "Create an account"}
            </h1>
          </div>

          <button
            onClick={google}
            disabled={busy}
            className="flex items-center justify-center gap-3 border border-hairline px-4 py-3 text-sm transition-colors hover:border-foreground disabled:opacity-50"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-hairline" />
            <span className="eyebrow">or</span>
            <span className="h-px flex-1 bg-hairline" />
          </div>

          <form onSubmit={onSubmit} className="grid gap-4">
            {mode === "signup" && (
              <Field label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            )}
            <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <button
              type="submit"
              disabled={busy}
              className="bg-foreground px-4 py-3 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>

          <Link to="/" className="text-center text-xs text-text-muted hover:text-foreground">
            ← back to site
          </Link>
        </div>
      </Section>
    </SiteShell>
  );
}

function Field({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <input
        {...rest}
        className="border-0 border-b border-hairline bg-transparent py-2 text-base text-foreground placeholder:text-text-muted focus:border-foreground focus:outline-none"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden>
      <path fill="#fff" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.8-6.8C35.7 2.4 30.1 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.3 17.7 9.5 24 9.5z"/>
      <path fill="#fff" opacity=".85" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.5 2.9-2.2 5.3-4.7 7l7.6 5.9c4.4-4.1 7-10.1 7-17.2z"/>
      <path fill="#fff" opacity=".55" d="M10.6 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.7 0 20.2 0 24s1 7.3 2.7 10.7l7.9-6.1z"/>
      <path fill="#fff" opacity=".75" d="M24 48c6.1 0 11.3-2 15-5.5l-7.6-5.9c-2.1 1.4-4.8 2.3-7.4 2.3-6.3 0-11.5-3.8-13.4-9.1l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/>
    </svg>
  );
}
