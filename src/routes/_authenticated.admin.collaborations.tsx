import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/collaborations")({
  component: CollabAdmin,
});

type Collab = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  tier: string;
  is_active: boolean;
  display_order: number;
};

const empty: Omit<Collab, "id"> = {
  slug: "", name: "", description: "", logo_url: "", website_url: "",
  tier: "partner", is_active: true, display_order: 0,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function CollabAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Collab | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["admin-collaborations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collaborations").select("*").order("display_order");
      if (error) throw error;
      return data as Collab[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collaborations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Collaboration deleted."); qc.invalidateQueries({ queryKey: ["admin-collaborations"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("collaborations").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-collaborations"] }),
  });

  return (
    <AdminShell title="Collaborations">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items?.length ?? 0} total · backers, partners, ventures.</p>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90">
          <Plus className="size-4" /> New Collaboration
        </button>
      </div>

      <div className="border border-hairline">
        <table className="w-full text-sm">
          <thead className="border-b border-hairline text-left text-[11px] uppercase tracking-[0.18em] text-text-muted">
            <tr>
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.length === 0 && (<tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">No collaborations yet.</td></tr>)}
            {items?.map((c) => (
              <tr key={c.id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3">
                  {c.logo_url ? <img src={c.logo_url} alt={c.name} className="h-8 w-8 border border-hairline object-contain p-0.5" /> : <span className="text-text-muted">—</span>}
                </td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.tier}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.website_url ? <a href={c.website_url} target="_blank" rel="noreferrer" className="hover:text-foreground">↗</a> : "—"}
                </td>
                <td className="px-4 py-3">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={c.is_active} onChange={(e) => toggleActive.mutate({ id: c.id, is_active: e.target.checked })} className="accent-white" />
                    <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{c.is_active ? "Live" : "Hidden"}</span>
                  </label>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(c)} className="mr-2 inline-flex items-center gap-1 border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] hover:border-foreground">
                    <Pencil className="size-3" /> Edit
                  </button>
                  <button onClick={() => confirm(`Delete "${c.name}"?`) && del.mutate(c.id)} className="inline-flex items-center gap-1 border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-text-muted hover:border-destructive hover:text-destructive">
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
          onSaved={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["admin-collaborations"] }); }}
        />
      )}
    </AdminShell>
  );
}

function Modal({ initial, isNew, onClose, onSaved }: { initial: Collab; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadLogo(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `collaborations/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("employees").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("employees").getPublicUrl(path);
      setForm((f) => ({ ...f, logo_url: data.publicUrl }));
      toast.success("Logo uploaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally { setUploading(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        slug: form.slug || slugify(form.name),
        name: form.name,
        description: form.description || null,
        logo_url: form.logo_url || null,
        website_url: form.website_url || null,
        tier: form.tier,
        is_active: form.is_active,
        display_order: Number(form.display_order) || 0,
      };
      if (isNew) {
        const { error } = await supabase.from("collaborations").insert(payload);
        if (error) throw error;
        toast.success("Collaboration created.");
      } else {
        const { error } = await supabase.from("collaborations").update(payload).eq("id", initial.id);
        if (error) throw error;
        toast.success("Collaboration updated.");
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
          <h2 className="text-xl font-semibold tracking-tight">{isNew ? "New Collaboration" : "Edit Collaboration"}</h2>
          <button type="button" onClick={onClose}><X className="size-5" /></button>
        </div>
        <div className="grid gap-4">
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v, slug: form.slug || slugify(v) })} required />
          <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Tier" value={form.tier} onChange={(v) => setForm({ ...form, tier: v })} options={["backer", "partner", "investor", "client", "research", "advisor"]} />
            <Field label="Website URL" value={form.website_url ?? ""} onChange={(v) => setForm({ ...form, website_url: v })} placeholder="https://..." />
          </div>
          <TextArea label="Description" value={form.description ?? ""} onChange={(v) => setForm({ ...form, description: v })} rows={3} />
          <div className="flex flex-col gap-2">
            <span className="eyebrow">Logo</span>
            <div className="flex items-center gap-4">
              {form.logo_url && <img src={form.logo_url} alt="logo" className="h-16 w-16 border border-hairline object-contain p-1" />}
              <label className="inline-flex cursor-pointer items-center gap-2 border border-hairline px-3 py-2 text-[11px] uppercase tracking-[0.18em] hover:border-foreground">
                <Upload className="size-3" /> {uploading ? "Uploading…" : "Upload Logo"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
              </label>
              <Field label="" value={form.logo_url ?? ""} onChange={(v) => setForm({ ...form, logo_url: v })} placeholder="or paste URL" />
            </div>
          </div>
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
    <label className={`flex ${label ? "flex-col" : "flex-1"} gap-2`}>
      {label && <span className="eyebrow">{label}</span>}
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
