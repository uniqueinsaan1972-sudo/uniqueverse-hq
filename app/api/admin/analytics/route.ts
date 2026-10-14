import { adminRoute } from "@/lib/admin-api";
import { analytics } from "@/lib/admin-data";

export const GET = (req: Request) => adminRoute(req, () => analytics(Number(new URL(req.url).searchParams.get("days") ?? 7)));
