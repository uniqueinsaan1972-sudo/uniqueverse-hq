import { adminRoute, HttpError } from "@/lib/admin-api";
import { adjustTokens, listUsers } from "@/lib/admin-data";

export const GET = (req: Request) => adminRoute(req, listUsers);
export const POST = (req: Request) =>
  adminRoute(req, async () => {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new HttpError("Invalid request.");
    return adjustTokens(body as Record<string, unknown>);
  });
