import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Inbox, Users, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [jobs, apps, emp, newApps] = await Promise.all([
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("applications").select("*", { count: "exact", head: true }),
        supabase.from("employees").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "new"),
      ]);
      return {
        jobs: jobs.count ?? 0,
        apps: apps.count ?? 0,
        emp: emp.count ?? 0,
        newApps: newApps.count ?? 0,
      };
    },
  });

  const recent = useQuery({
    queryKey: ["admin-recent-apps"],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, full_name, job_title, email, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    },
  });

  return (
    <AdminShell title="Overview">
      <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active Jobs" value={stats.data?.jobs} icon={Briefcase} to="/admin/jobs" />
        <Stat label="Applications" value={stats.data?.apps} icon={Inbox} to="/admin/applications" />
        <Stat label="New (unread)" value={stats.data?.newApps} icon={Clock} to="/admin/applications" />
        <Stat label="Employees" value={stats.data?.emp} icon={Users} to="/admin/employees" />
      </div>

      <section className="mt-12">
        <h2 className="eyebrow mb-4">Recent Applications</h2>
        <div className="border border-hairline">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline text-left text-[11px] uppercase tracking-[0.18em] text-text-muted">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {recent.data?.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-text-muted">No applications yet.</td></tr>
              )}
              {recent.data?.map((r) => (
                <tr key={r.id} className="border-b border-hairline last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-medium">{r.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.job_title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3 text-text-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link to="/admin/applications" className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}

function Stat({
  label, value, icon: Icon, to,
}: { label: string; value?: number; icon: typeof Briefcase; to: string }) {
  return (
    <Link to={to} className="group bg-background p-6 transition-colors hover:bg-surface-2">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <Icon className="size-4 text-text-muted" />
      </div>
      <div className="mt-6 text-mono text-4xl font-medium">{value ?? "—"}</div>
    </Link>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "border-foreground text-foreground",
    shortlisted: "border-foreground bg-foreground text-background",
    rejected: "border-hairline text-text-muted line-through",
    reviewed: "border-hairline text-muted-foreground",
  };
  return (
    <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${map[status] ?? "border-hairline text-muted-foreground"}`}>
      {status}
    </span>
  );
}
