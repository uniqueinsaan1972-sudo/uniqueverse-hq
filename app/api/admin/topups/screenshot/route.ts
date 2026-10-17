import { adminDb } from "@/lib/supabase";
import { guardApi } from "@/lib/auth";

/** Admin only: shows the payment screenshot a user uploaded. */
export async function GET(req: Request) {
  const blocked = await guardApi(req);
  if (blocked) return blocked;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[a-f0-9]{16}$/.test(id)) return new Response("Not found", { status: 404 });
  const db = adminDb();
  const { data: row } = await db.from("topups").select("screenshot").eq("id", id).maybeSingle();
  if (!row?.screenshot) return new Response("Not found", { status: 404 });
  const { data } = await db.storage.from("media").download(row.screenshot);
  if (!data) return new Response("Not found", { status: 404 });
  const type = row.screenshot.endsWith(".png") ? "image/png" : row.screenshot.endsWith(".webp") ? "image/webp" : "image/jpeg";
  return new Response(new Uint8Array(await data.arrayBuffer()), { headers: { "Content-Type": type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
