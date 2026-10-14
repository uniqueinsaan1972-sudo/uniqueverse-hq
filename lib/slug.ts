export const RESERVED = new Set([
  "api", "admin", "new", "edit", "templates", "customize", "birthday", "website", "dashboard",
  "login", "signin", "signup", "settings", "static", "public", "_next", "app", "www", "help", "about",
]);

export function slugify(input: string) {
  return input
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 60).replace(/-+$/, "");
}

/** Returns an error message, or null when the slug is valid. */
export function checkSlug(slug: string): string | null {
  if (slug.length < 3) return "Use at least 3 characters.";
  if (slug.length > 60) return "Use at most 60 characters.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return "Use only lowercase letters, numbers and single hyphens.";
  if (RESERVED.has(slug)) return "This name is reserved. Try another.";
  return null;
}
