import { adminRoute, HttpError } from "@/lib/admin-api";
import { listTemplates, saveTemplate } from "@/lib/admin-data";

export const GET = (req: Request) => adminRoute(req, listTemplates);
export const PUT = (req: Request) =>
  adminRoute(req, async () => {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new HttpError("Invalid request.");
    return saveTemplate(body as Record<string, unknown>);
  });
