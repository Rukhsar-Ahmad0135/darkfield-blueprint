import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/employees")({
  component: EmployeesAdmin,
});

type Employee = {
  id: string;
  full_name: string;
  position: string;
  department: string | null;
  bio: string | null;
  photo_url: string | null;
  photo_path: string | null;
  linkedin_url: string | null;
  email: string | null;
  display_order: number;
  is_active: boolean;
};

const emptyEmp: Omit<Employee, "id"> = {
  full_name: "", position: "", department: "", bio: "", photo_url: null, photo_path: null,
  linkedin_url: "", email: "", display_order: 0, is_active: true,
};

function EmployeesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: emps } = useQuery({
    queryKey: ["admin-employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("display_order");
      if (error) throw error;
      return data as Employee[];
    },
  });

  const del = useMutation({
    mutationFn: async (e: Employee) => {
      if (e.photo_path) await supabase.storage.from("employees").remove([e.photo_path]).catch(() => null);
      const { error } = await supabase.from("employees").delete().eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Employee removed."); qc.invalidateQueries({ queryKey: ["admin-employees"] }); },
  });

  return (
    <AdminShell title="Employees">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{emps?.length ?? 0} total · team members shown on the website.</p>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] uppercase tracking-[0.2em] text-background hover:opacity-90">
          <Plus className="size-4" /> New Employee
        </button>
      </div>

      <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
        {emps?.length === 0 && (
          <div className="col-span-full bg-background p-12 text-center text-text-muted">No employees yet.</div>
        )}
        {emps?.map((e) => (
          <div key={e.id} className="flex flex-col gap-4 bg-background p-6">
            <div className="flex items-start gap-4">
              {e.photo_url ? (
                <img src={e.photo_url} alt={e.full_name} className="size-16 border border-hairline object-cover" />
              ) : (
                <div className="flex size-16 items-center justify-center border border-hairline text-mono text-xs text-text-muted">
                  {e.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium">{e.full_name}</div>
                <div className="text-sm text-muted-foreground">{e.position}</div>
                {e.department && <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{e.department}</div>}
              </div>
            </div>
            {e.bio && <p className="text-sm text-muted-foreground line-clamp-3">{e.bio}</p>}
            <div className="flex items-center justify-between border-t border-hairline pt-3 text-[11px] uppercase tracking-[0.18em]">
              <span className={e.is_active ? "text-foreground" : "text-text-muted"}>{e.is_active ? "Active" : "Hidden"} · #{e.display_order}</span>
              <div className="flex gap-2">
                <button onClick={() => setEditing(e)} className="inline-flex items-center gap-1 hover:text-foreground"><Pencil className="size-3" /> Edit</button>
                <button onClick={() => confirm(`Remove ${e.full_name}?`) && del.mutate(e)} className="inline-flex items-center gap-1 text-text-muted hover:text-destructive"><Trash2 className="size-3" /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <EmpModal
          initial={editing ?? { ...emptyEmp, id: "" }}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["admin-employees"] }); }}
        />
      )}
    </AdminShell>
  );
}

function EmpModal({ initial, isNew, onClose, onSaved }: {
  initial: Employee; isNew: boolean; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let photo_url = form.photo_url;
      let photo_path = form.photo_path;
      if (file) {
        const path = `${crypto.randomUUID()}-${file.name}`;
        const up = await supabase.storage.from("employees").upload(path, file, { upsert: false });
        if (up.error) throw up.error;
        photo_path = path;
        const signed = await supabase.storage.from("employees").createSignedUrl(path, 60 * 60 * 24 * 3650);
        if (signed.error || !signed.data) throw signed.error ?? new Error("Could not sign URL");
        photo_url = signed.data.signedUrl;
      }
      const payload = {
        full_name: form.full_name,
        position: form.position,
        department: form.department || null,
        bio: form.bio || null,
        linkedin_url: form.linkedin_url || null,
        email: form.email || null,
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
        photo_url, photo_path,
      };
      if (isNew) {
        const { error } = await supabase.from("employees").insert(payload);
        if (error) throw error;
        toast.success("Employee created.");
      } else {
        const { error } = await supabase.from("employees").update(payload).eq("id", initial.id);
        if (error) throw error;
        toast.success("Employee updated.");
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-12">
      <form onSubmit={save} className="w-full max-w-2xl border border-hairline bg-background p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">{isNew ? "New Employee" : "Edit Employee"}</h2>
          <button type="button" onClick={onClose}><X className="size-5" /></button>
        </div>
        <div className="grid gap-4">
          <div>
            <span className="eyebrow">Profile Picture</span>
            <div className="mt-2 flex items-center gap-4">
              {form.photo_url && <img src={form.photo_url} alt="" className="size-16 border border-hairline object-cover" />}
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
            <Field label="Position" value={form.position} onChange={(v) => setForm({ ...form, position: v })} required />
            <Field label="Department" value={form.department ?? ""} onChange={(v) => setForm({ ...form, department: v })} />
            <Field label="Email (optional)" type="email" value={form.email ?? ""} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="LinkedIn URL" value={form.linkedin_url ?? ""} onChange={(v) => setForm({ ...form, linkedin_url: v })} />
            <Field label="Display Order" type="number" value={String(form.display_order)} onChange={(v) => setForm({ ...form, display_order: Number(v) || 0 })} />
          </div>
          <TextArea label="Short Bio" value={form.bio ?? ""} onChange={(v) => setForm({ ...form, bio: v })} rows={4} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-white" />
            <span className="text-sm">Active / visible on website</span>
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
