import { adminRoute } from "@/lib/admin-api";
import { deleteWebsite, listWebsites } from "@/lib/admin-data";

export const GET = (req: Request) => adminRoute(req, () => listWebsites(new URL(req.url).searchParams.get("q") ?? ""));
export const DELETE = (req: Request) => adminRoute(req, () => deleteWebsite(new URL(req.url).searchParams.get("id") ?? ""));
