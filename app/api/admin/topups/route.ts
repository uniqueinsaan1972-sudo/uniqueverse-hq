import { adminRoute, HttpError } from "@/lib/admin-api";
import { listTopups, reviewTopup } from "@/lib/admin-data";

export const GET = (req: Request) => adminRoute(req, () => listTopups(new URL(req.url).searchParams.get("status") ?? "pending"));
export const PUT = (req: Request) =>
  adminRoute(req, async () => {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new HttpError("Invalid request.");
    return reviewTopup(body as Record<string, unknown>);
  });
