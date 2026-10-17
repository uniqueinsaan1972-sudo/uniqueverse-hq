import { adminRoute, HttpError } from "@/lib/admin-api";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/admin-data";

const json = async (req: Request) => {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") throw new HttpError("Invalid request.");
  return b as Record<string, unknown>;
};
export const GET = (req: Request) => adminRoute(req, listCategories);
export const POST = (req: Request) => adminRoute(req, async () => createCategory(await json(req)));
export const PUT = (req: Request) => adminRoute(req, async () => updateCategory(await json(req)));
export const DELETE = (req: Request) => adminRoute(req, async () => deleteCategory(new URL(req.url).searchParams.get("id") ?? ""));
