import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/jobs")({
  component: JobsAdmin,
});

type Job = {
  id: string;
  slug: string;
  title: string;
  team: string;
  type: string;
  location: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  is_active: boolean;
};

const empty: Omit<Job, "id"> = {
  slug: "", title: "", team: "", type: "Full Time", location: "Remote",
  summary: "", responsibilities: [], requirements: [], is_active: true,
};

function JobsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Job | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: jobs } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Job[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job deleted.");
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("jobs").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-jobs"] }),
  });

  return (
    <AdminShell title="Jobs">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{jobs?.length ?? 0} total · manage open positions.</p>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90"
        >
          <Plus className="size-4" /> New Job
        </button>
      </div>

      <div className="border border-hairline">
        <table className="w-full text-sm">
          <thead className="border-b border-hairline text-left text-[11px] uppercase tracking-[0.18em] text-text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">No jobs yet.</td></tr>
            )}
            {jobs?.map((j) => (
              <tr key={j.id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3 font-medium">{j.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{j.team}</td>
                <td className="px-4 py-3 text-muted-foreground">{j.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{j.location}</td>
                <td className="px-4 py-3">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={j.is_active}
                      onChange={(e) => toggleActive.mutate({ id: j.id, is_active: e.target.checked })}
                      className="accent-white"
                    />
                    <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{j.is_active ? "Live" : "Hidden"}</span>
                  </label>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(j)} className="mr-2 inline-flex items-center gap-1 border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] hover:border-foreground">
                    <Pencil className="size-3" /> Edit
                  </button>
                  <button
                    onClick={() => confirm(`Delete "${j.title}"?`) && del.mutate(j.id)}
                    className="inline-flex items-center gap-1 border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-text-muted hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing || creating) && (
        <JobModal
          initial={editing ?? { ...empty, id: "" }}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["admin-jobs"] }); }}
        />
      )}
    </AdminShell>
  );
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function JobModal({ initial, isNew, onClose, onSaved }: {
  initial: Job; isNew: boolean; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    ...initial,
    responsibilities: initial.responsibilities.join("\n"),
    requirements: initial.requirements.join("\n"),
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        slug: form.slug || slugify(form.title),
        title: form.title,
        team: form.team,
        type: form.type,
        location: form.location,
        summary: form.summary,
        responsibilities: form.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean),
        requirements: form.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
        is_active: form.is_active,
      };
      if (isNew) {
        const { error } = await supabase.from("jobs").insert(payload);
        if (error) throw error;
        toast.success("Job created.");
      } else {
        const { error } = await supabase.from("jobs").update(payload).eq("id", initial.id);
        if (error) throw error;
        toast.success("Job updated.");
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-16">
      <form onSubmit={save} className="w-full max-w-2xl border border-hairline bg-background p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">{isNew ? "New Job" : "Edit Job"}</h2>
          <button type="button" onClick={onClose}><X className="size-5" /></button>
        </div>
        <div className="grid gap-4">
          <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: form.slug || slugify(v) })} required />
          <Field label="Slug (URL)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Team" value={form.team} onChange={(v) => setForm({ ...form, team: v })} required />
            <Select label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={["Full Time", "Part Time", "Contract", "Internship"]} />
            <Select label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} options={["Remote", "On-site", "Hybrid"]} />
          </div>
          <TextArea label="Summary" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} rows={3} required />
          <TextArea label="Responsibilities (one per line)" value={form.responsibilities} onChange={(v) => setForm({ ...form, responsibilities: v })} rows={5} />
          <TextArea label="Requirements (one per line)" value={form.requirements} onChange={(v) => setForm({ ...form, requirements: v })} rows={5} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-white" />
            <span className="text-sm">Active / visible on careers page</span>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="border border-hairline px-4 py-2 text-[12px] uppercase tracking-[0.18em] hover:border-foreground">Cancel</button>
          <button type="submit" disabled={saving} className="bg-foreground px-6 py-2 text-[12px] uppercase tracking-[0.18em] text-background hover:opacity-90 disabled:opacity-50">{saving ? "…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className="border border-hairline bg-transparent px-3 py-2 text-foreground focus:border-foreground focus:outline-none" />
    </label>
  );
}
function TextArea({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value">) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <textarea {...rest} value={value} onChange={(e) => onChange(e.target.value)} className="border border-hairline bg-transparent px-3 py-2 text-foreground focus:border-foreground focus:outline-none" />
    </label>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="border border-hairline bg-background px-3 py-2 text-foreground focus:border-foreground focus:outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
