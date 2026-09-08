"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUserRecord } from "@/lib/adminUsers";
import type { AdminRole } from "@/lib/auth";

const ROLES: AdminRole[] = ["SUPER_ADMIN", "CONTENT_MANAGER", "ORDER_MANAGER", "VIEWER"];

export default function UsersPanel({ users }: { users: AdminUserRecord[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        name: formData.get("name"),
        password: formData.get("password"),
        role: formData.get("role"),
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not create user.");
      return;
    }
    setShowForm(false);
    router.refresh();
  }

  async function toggleActive(id: number, active: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Users</h1>
        <button type="button" onClick={() => setShowForm((s) => !s)} className="bg-black text-white text-[13px] px-4 py-2">
          {showForm ? "Cancel" : "New User"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border border-black/10 bg-white p-6 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          <div>
            <label className="block text-[12px] text-black/60 mb-1">Role</label>
            <select name="role" defaultValue="VIEWER" className="w-full border border-black/20 px-3 py-2 text-[14px]">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p role="alert" className="text-[13px] text-red-600 sm:col-span-2">
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} className="bg-black text-white text-[13px] px-5 py-2.5 sm:col-span-2 w-fit disabled:opacity-60">
            {submitting ? "Creating…" : "Create User"}
          </button>
        </form>
      )}

      <table className="w-full text-[14px] bg-white border border-black/10">
        <thead>
          <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.08em] text-black/50">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-black/5">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role.replace("_", " ")}</td>
              <td className="p-3">{u.active ? "Active" : "Disabled"}</td>
              <td className="p-3 text-right">
                <button type="button" onClick={() => toggleActive(u.id, u.active)} className="text-[12px] text-black/50 hover:text-black">
                  {u.active ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[12px] text-black/60 mb-1">{label}</label>
      <input name={name} type={type} required={required} className="w-full border border-black/20 px-3 py-2 text-[14px]" />
    </div>
  );
}
