"use client";

import { useEffect, useState } from "react";

type View = "loading" | "disabled" | "enrolling" | "backup-codes" | "enabled" | "disabling";

export default function SecuritySettingsPanel() {
  const [view, setView] = useState<View>("loading");
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadStatus() {
    const res = await fetch("/api/admin/security/2fa/status");
    const data = await res.json();
    if (data.ok) {
      setBackupCodesRemaining(data.backupCodesRemaining);
      setView(data.enabled ? "enabled" : "disabled");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStatus();
  }, []);

  async function startSetup() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/security/2fa/setup", { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not start setup.");
      return;
    }
    setQrDataUrl(data.qrDataUrl);
    setSecret(data.secret);
    setView("enrolling");
  }

  async function confirmSetup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/security/2fa/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: fd.get("code") }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not confirm setup.");
      return;
    }
    setNewBackupCodes(data.backupCodes);
    setView("backup-codes");
  }

  async function disable2FA(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/security/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: fd.get("password"), code: fd.get("code") }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Could not disable 2FA.");
      return;
    }
    setView("disabled");
  }

  if (view === "loading") return <p className="text-[13px] text-black/40">Loading…</p>;

  if (view === "backup-codes") {
    return (
      <div className="border border-black/10 bg-white p-6">
        <p className="text-[13px] font-medium mb-2">Two-factor authentication is now on.</p>
        <p className="text-[13px] text-black/60 mb-4">
          Save these backup codes somewhere safe — each works once, if you ever lose access to your authenticator app.
          They won&apos;t be shown again.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-5 font-mono text-[13px] bg-black/5 p-4">
          {newBackupCodes.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setNewBackupCodes([]);
            loadStatus();
          }}
          className="bg-black text-white text-[12px] px-4 py-2"
        >
          I&apos;ve saved these codes
        </button>
      </div>
    );
  }

  if (view === "enrolling") {
    return (
      <div className="border border-black/10 bg-white p-6">
        <p className="text-[13px] font-medium mb-3">Scan this QR code with your authenticator app</p>
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Two-factor authentication QR code" className="w-48 h-48 border border-black/10 mb-3" />
        )}
        <p className="text-[12px] text-black/50 mb-4">
          Can&apos;t scan? Enter this key manually: <span className="font-mono">{secret}</span>
        </p>
        <form onSubmit={confirmSetup}>
          <label className="block text-[12px] text-black/60 mb-1">Enter the 6-digit code to confirm</label>
          <input
            type="text"
            name="code"
            required
            autoFocus
            placeholder="123456"
            className="border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black mb-3 tracking-[0.1em]"
          />
          {error && <p className="text-[13px] text-red-600 mb-3">{error}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={busy} className="bg-black text-white text-[12px] px-4 py-2 disabled:opacity-60">
              {busy ? "Confirming…" : "Confirm & Enable"}
            </button>
            <button type="button" onClick={() => setView("disabled")} className="text-[12px] text-black/50 underline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === "disabling") {
    return (
      <div className="border border-black/10 bg-white p-6">
        <p className="text-[13px] font-medium mb-3">Disable two-factor authentication</p>
        <form onSubmit={disable2FA} className="space-y-3">
          <div>
            <label className="block text-[12px] text-black/60 mb-1">Password</label>
            <input type="password" name="password" required className="w-full border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-[12px] text-black/60 mb-1">Current authenticator code</label>
            <input type="text" name="code" required placeholder="123456" className="w-full border border-black/20 px-3 py-2 text-[14px] outline-none focus:border-black tracking-[0.1em]" />
          </div>
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={busy} className="text-[12px] border border-red-300 text-red-600 px-4 py-2 hover:bg-red-600 hover:text-white disabled:opacity-60">
              {busy ? "Disabling…" : "Disable 2FA"}
            </button>
            <button type="button" onClick={() => setView("enabled")} className="text-[12px] text-black/50 underline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === "enabled") {
    return (
      <div className="border border-black/10 bg-white p-6">
        <p className="text-[13px] font-medium mb-1">Two-factor authentication is enabled</p>
        <p className="text-[13px] text-black/60 mb-4">{backupCodesRemaining} backup code(s) remaining.</p>
        <button type="button" onClick={() => setView("disabling")} className="text-[12px] text-red-600 underline">
          Disable 2FA
        </button>
      </div>
    );
  }

  return (
    <div className="border border-black/10 bg-white p-6">
      <p className="text-[13px] font-medium mb-1">Two-factor authentication is off</p>
      <p className="text-[13px] text-black/60 mb-4">
        Add an authenticator app (Google Authenticator, Authy, 1Password, ...) as a second step at login.
      </p>
      {error && <p className="text-[13px] text-red-600 mb-3">{error}</p>}
      <button type="button" onClick={startSetup} disabled={busy} className="bg-black text-white text-[12px] px-4 py-2 disabled:opacity-60">
        {busy ? "Starting…" : "Enable 2FA"}
      </button>
    </div>
  );
}
