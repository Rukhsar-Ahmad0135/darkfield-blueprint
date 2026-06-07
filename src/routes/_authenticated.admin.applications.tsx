import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusPill } from "./_authenticated.admin.index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, X, Download, Check, Ban, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  component: AppsAdmin,
});

type App = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  years_experience: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  cover_letter: string | null;
  resume_path: string;
  resume_url: string;
  job_title: string;
  status: string;
  created_at: string;
};

function AppsAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<App | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data: apps } = useQuery({
    queryKey: ["admin-apps", filter],
    queryFn: async () => {
      let q = supabase.from("applications").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data as App[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-apps"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
  });

  const del = useMutation({
    mutationFn: async (a: App) => {
      await supabase.storage.from("resumes").remove([a.resume_path]).catch(() => null);
      const { error } = await supabase.from("applications").delete().eq("id", a.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Application deleted."); qc.invalidateQueries({ queryKey: ["admin-apps"] }); setOpen(null); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  async function downloadCV(a: App) {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(a.resume_path, 300);
    if (error || !data) { toast.error("Could not load resume."); return; }
    window.open(data.signedUrl, "_blank");
  }

  return (
    <AdminShell title="Applications">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{apps?.length ?? 0} shown</p>
        <div className="flex gap-2">
          {["all", "new", "reviewed", "shortlisted", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                filter === s ? "border-foreground bg-foreground text-background" : "border-hairline text-muted-foreground hover:border-foreground"
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="border border-hairline">
        <table className="w-full text-sm">
          <thead className="border-b border-hairline text-left text-[11px] uppercase tracking-[0.18em] text-text-muted">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Resume</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">No applications.</td></tr>
            )}
            {apps?.map((a) => (
              <tr key={a.id} className="border-b border-hairline last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3 font-medium">{a.full_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.job_title}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                <td className="px-4 py-3"><StatusPill status={a.status} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => downloadCV(a)} className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
                    <Download className="size-3" /> View CV
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setOpen(a)} className="mr-2 inline-flex items-center gap-1 border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] hover:border-foreground"><Eye className="size-3" /> Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-12">
          <div className="w-full max-w-2xl border border-hairline bg-background p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{open.full_name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Applied for {open.job_title} · {new Date(open.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setOpen(null)}><X className="size-5" /></button>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info label="Email" value={open.email} />
              <Info label="Phone" value={open.phone} />
              <Info label="Location" value={open.location} />
              <Info label="Experience" value={open.years_experience} />
              {open.linkedin_url && <Info label="LinkedIn" value={<a href={open.linkedin_url} target="_blank" rel="noreferrer" className="underline">{open.linkedin_url}</a>} />}
              {open.portfolio_url && <Info label="Portfolio" value={<a href={open.portfolio_url} target="_blank" rel="noreferrer" className="underline">{open.portfolio_url}</a>} />}
            </dl>
            {open.cover_letter && (
              <div className="mt-6">
                <span className="eyebrow">Cover Letter</span>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{open.cover_letter}</p>
              </div>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-6">
              <div className="flex items-center gap-2">
                <span className="eyebrow">Status:</span>
                <StatusPill status={open.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => downloadCV(open)} className="inline-flex items-center gap-1 border border-hairline px-3 py-2 text-[11px] uppercase tracking-[0.18em] hover:border-foreground"><Download className="size-3" /> CV</button>
                <button onClick={() => setStatus.mutate({ id: open.id, status: "shortlisted" })} className="inline-flex items-center gap-1 bg-foreground px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-background hover:opacity-90"><Check className="size-3" /> Shortlist</button>
                <button onClick={() => setStatus.mutate({ id: open.id, status: "rejected" })} className="inline-flex items-center gap-1 border border-hairline px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-foreground"><Ban className="size-3" /> Reject</button>
                <button onClick={() => confirm(`Delete application from ${open.full_name}?`) && del.mutate(open)} className="inline-flex items-center gap-1 border border-hairline px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-text-muted hover:border-destructive hover:text-destructive"><Trash2 className="size-3" /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
