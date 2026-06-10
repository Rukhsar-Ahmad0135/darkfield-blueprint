import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/opportunities")({
  component: OpportunitiesAdmin,
});

type Opportunity = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  category: string;
  location: string | null;
  deadline: string | null;
  apply_url: string | null;
  is_active: boolean;
  display_order: number;
};

const empty: Omit<Opportunity, "id"> = {
  slug: "", title: "", summary: "", description: "", category: "fellowship",
  location: "", deadline: "", apply_url: "", is_active: true, display_order: 0,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function OpportunitiesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["admin-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("opportunities").select("*").order("display_order");
      if (error) throw error;
      return data as Opportunity[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("opportunities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Opportunity deleted."); qc.invalidateQueries({ queryKey: ["admin-opportunities"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("opportunities").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-opportunities"] }),
  });

  return (
    <AdminShell title="Opportunities">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items?.length ?? 0} total · programs, fellowships, calls.</p>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90">
          <Plus className="size-4" /> New Opportunity
        </button>
      </div>

      <div className="border border-hairline">
        <table className="w-full text-sm">
          <thead className="border-b border-hairline text-left text-[11px] uppercase tracking-[0.18em] text-text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.length === 0 && (<tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">No opportunities yet.</td></tr>)}
            {items?.map((o) => (
              <tr key={o.id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3 font-medium">{o.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.location || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.deadline || "—"}</td>
                <td className="px-4 py-3">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={o.is_active} onChange={(e) => toggleActive.mutate({ id: o.id, is_active: e.target.checked })} className="accent-white" />
                    <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{o.is_active ? "Live" : "Hidden"}</span>
                  </label>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(o)} className="mr-2 inline-flex items-center gap-1 border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] hover:border-foreground">
                    <Pencil className="size-3" /> Edit
                  </button>
                  <button onClick={() => confirm(`Delete "${o.title}"?`) && del.mutate(o.id)} className="inline-flex items-center gap-1 border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-text-muted hover:border-destructive hover:text-destructive">
                    <Trash2 className="size-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing || creating) && (
        <Modal
          initial={editing ?? { ...empty, id: "" }}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["admin-opportunities"] }); }}
        />
      )}
    </AdminShell>
  );
}

function Modal({ initial, isNew, onClose, onSaved }: { initial: Opportunity; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        slug: form.slug || slugify(form.title),
        title: form.title,
        summary: form.summary,
        description: form.description || null,
        category: form.category,
        location: form.location || null,
        deadline: form.deadline || null,
        apply_url: form.apply_url || null,
        is_active: form.is_active,
        display_order: Number(form.display_order) || 0,
      };
      if (isNew) {
        const { error } = await supabase.from("opportunities").insert(payload);
        if (error) throw error;
        toast.success("Opportunity created.");
      } else {
        const { error } = await supabase.from("opportunities").update(payload).eq("id", initial.id);
        if (error) throw error;
        toast.success("Opportunity updated.");
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-16">
      <form onSubmit={save} className="w-full max-w-2xl border border-hairline bg-background p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">{isNew ? "New Opportunity" : "Edit Opportunity"}</h2>
          <button type="button" onClick={onClose}><X className="size-5" /></button>
        </div>
        <div className="grid gap-4">
          <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: form.slug || slugify(v) })} required />
          <Field label="Slug (URL)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required />
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={["fellowship", "internship", "grant", "research-call", "partnership", "general"]} />
            <Field label="Location" value={form.location ?? ""} onChange={(v) => setForm({ ...form, location: v })} />
            <Field label="Deadline" type="date" value={form.deadline ?? ""} onChange={(v) => setForm({ ...form, deadline: v })} />
          </div>
          <TextArea label="Summary" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} rows={3} required />
          <TextArea label="Description" value={form.description ?? ""} onChange={(v) => setForm({ ...form, description: v })} rows={5} />
          <Field label="Apply URL" value={form.apply_url ?? ""} onChange={(v) => setForm({ ...form, apply_url: v })} placeholder="https://..." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display Order" type="number" value={String(form.display_order)} onChange={(v) => setForm({ ...form, display_order: Number(v) })} />
            <label className="flex items-end gap-2 pb-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-white" />
              <span className="text-sm">Active / visible</span>
            </label>
          </div>
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
