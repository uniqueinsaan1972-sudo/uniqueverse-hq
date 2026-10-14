import { adminRoute } from "@/lib/admin-api";
import { overview } from "@/lib/admin-data";

export const GET = (req: Request) => adminRoute(req, overview);
