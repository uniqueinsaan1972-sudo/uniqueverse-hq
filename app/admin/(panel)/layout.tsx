import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Server-side gate: nobody receives any admin screen without passing this check on every request. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const a = await getAdmin();
  if (!a.ok) {
    if (a.reason === "mfa") redirect("/admin/verify");
    redirect(`/admin/login${a.reason === "forbidden" ? "?error=denied" : a.reason === "config" ? "?error=config" : ""}`);
  }
  return <AdminShell email={a.email}>{children}</AdminShell>;
}
