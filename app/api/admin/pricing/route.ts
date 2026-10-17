import { adminRoute, HttpError } from "@/lib/admin-api";
import { getPricingAdmin, savePricing } from "@/lib/admin-data";

export const GET = (req: Request) => adminRoute(req, getPricingAdmin);
export const PUT = (req: Request) =>
  adminRoute(req, async () => {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new HttpError("Invalid request.");
    return savePricing(body as Record<string, unknown>);
  });
