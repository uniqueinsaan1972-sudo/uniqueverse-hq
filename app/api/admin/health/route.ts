import { adminRoute } from "@/lib/admin-api";
import { runHealth } from "@/lib/health";

export const GET = (req: Request) => adminRoute(req, runHealth);
