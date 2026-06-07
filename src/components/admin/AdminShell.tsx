import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { LogOut, LayoutDashboard, Briefcase, Inbox, Users, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SierpinskiLogo } from "@/components/site/Visuals";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/jobs", label: "Jobs", icon: Briefcase, exact: false },
  { to: "/admin/applications", label: "Applications", icon: Inbox, exact: false },
  { to: "/admin/employees", label: "Employees", icon: Users, exact: false },
] as const;

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-hairline bg-surface md:flex">
        <Link to="/admin" className="flex items-center gap-3 border-b border-hairline px-6 py-5">
          <SierpinskiLogo className="size-7 text-foreground" rows={4} />
          <div>
            <div className="text-mono text-[10px] uppercase tracking-[0.22em]">Dark Field</div>
            <div className="text-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">Admin Console</div>
          </div>
        </Link>
        <nav className="flex-1 px-3 py-6">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`mb-1 flex items-center gap-3 px-3 py-2.5 text-[12px] uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-hairline p-3">
          <Link
            to="/"
            className="mb-1 flex items-center gap-3 px-3 py-2.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-4" /> View Site
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-hairline bg-background/80 px-6 py-4 backdrop-blur lg:px-10">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <div className="text-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            DFTL · Admin
          </div>
        </header>
        <div className="px-6 py-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
