"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/account/logout", { method: "POST" });
    router.push("/account/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="font-inter text-[11px] tracking-[0.14em] uppercase text-near-black/60 hover:text-bronze underline transition-colors"
    >
      Sign Out
    </button>
  );
}
