import type { TemplateContent } from "@/types/content";
import type { GeneratedWebsite } from "@/types/website";

export const siteKey = (templateId: string) => `uv:site:${templateId}`;
export const tokenKey = (id: string) => `uv:token:${id}`;
export const publicPath = (slug: string) => `/birthday/${slug}`;

export function getToken(id: string) {
  try { return localStorage.getItem(tokenKey(id)) ?? ""; } catch { return ""; }
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}

async function call<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? "Something went wrong. Please try again.", res.status, body.code);
  return body as T;
}

/** Creates a new website (editId empty) or saves changes to an existing one (editId given). */
export async function publishWebsite(templateId: string, content: TemplateContent, editId?: string): Promise<{ website: GeneratedWebsite; updated: boolean }> {
  const send = (extra: object) =>
    fetch("/api/websites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templateId, content, ...extra }) })
      .then((r) => call<{ website: GeneratedWebsite; token?: string }>(r));
  if (editId) return { ...(await send({ websiteId: editId, token: getToken(editId) })), updated: true };
  const r = await send({});
  try { localStorage.setItem(tokenKey(r.website.id), r.token ?? ""); } catch { /* private mode: the account still owns it */ }
  return { website: r.website, updated: false };
}

export async function fetchOwned(id: string) {
  return call<{ website: GeneratedWebsite }>(await fetch(`/api/websites/${id}`, { headers: { "x-edit-token": getToken(id) }, cache: "no-store" }));
}

export async function patchWebsite(id: string, body: { slug?: string; qr?: unknown }) {
  return call<{ website: GeneratedWebsite }>(
    await fetch(`/api/websites/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-edit-token": getToken(id) }, body: JSON.stringify(body) }),
  );
}

export async function checkSlugRemote(slug: string, exclude: string) {
  const r = await fetch(`/api/slug?slug=${encodeURIComponent(slug)}&exclude=${exclude}`, { cache: "no-store" });
  return (await r.json()) as { valid: boolean; available: boolean; error: string | null };
}
