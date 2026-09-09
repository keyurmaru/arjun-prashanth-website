import SecuritySettingsPanel from "@/components/admin/SecuritySettingsPanel";

export default function AdminSecurityPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-medium mb-1">Security</h1>
      <p className="text-black/50 text-[13px] mb-6">
        Manage two-factor authentication for your own account.
      </p>
      <SecuritySettingsPanel />
    </div>
  );
}
