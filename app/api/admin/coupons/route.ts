import { adminRoute, HttpError } from "@/lib/admin-api";
import { createCoupon, deleteCoupon, listCoupons, setCouponActive } from "@/lib/admin-data";

const json = async (req: Request) => {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") throw new HttpError("Invalid request.");
  return b as Record<string, unknown>;
};
export const GET = (req: Request) => adminRoute(req, listCoupons);
export const POST = (req: Request) => adminRoute(req, async () => createCoupon(await json(req)));
export const PUT = (req: Request) => adminRoute(req, async () => { const b = await json(req); return setCouponActive(String(b.code ?? ""), b.active === true); });
export const DELETE = (req: Request) => adminRoute(req, async () => deleteCoupon(new URL(req.url).searchParams.get("code") ?? ""));
